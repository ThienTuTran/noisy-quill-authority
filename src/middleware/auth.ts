import type { NextFunction, Request, Response } from "express";
import { jwtVerify, createLocalJWKSet } from "jose";
import { getJWKS, setJWKS, fetchJWKS } from "../lib/jwksStore.js";

const ADMIN_ISSUER = process.env.ADMIN_ISSUER!;
const ADMIN_JWKS_URL = process.env.ADMIN_JWKS_URL!;
const ADMIN_AUD = process.env.ADMIN_AUD!;

const CUSTOMER_ISSUER = process.env.CUSTOMER_ISSUER!;
const CUSTOMER_JWKS_URL = process.env.CUSTOMER_JWKS_URL!;

async function ensureJWKSPrimed(iss: string) {
  if (getJWKS(iss)) return;
  if (iss === ADMIN_ISSUER) {
    setJWKS(iss, await fetchJWKS(ADMIN_JWKS_URL));
  } else if (iss === CUSTOMER_ISSUER) {
    setJWKS(iss, await fetchJWKS(CUSTOMER_JWKS_URL));
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // 1) Pull bearer
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";
    if (!token) return res.status(401).json({ error: "missing bearer token" });
    
    // 2) Validate structure "<hdr>.<payload>.<sig>"
    const parts = token.split(".");
    if (parts.length !== 3) return res.status(401).json({ error: "invalid token format" });

    const payloadB64 = parts[1]; 

    // 3) Decode payload safely
    let claims: Record<string, unknown>;
    try {
      const buf = Buffer.from(payloadB64 as string, "base64url"); // explicit encode
      claims = JSON.parse(buf.toString("utf8"));
    } catch {
      return res.status(401).json({ error: "invalid token payload" });
    }

    // 4) Read claims with narrowing
    const iss = typeof claims.iss === "string" ? claims.iss : "";
    if (!iss) return res.status(401).json({ error: "missing iss" });

    await ensureJWKSPrimed(iss);

    const jwks = getJWKS(iss);
    if (!jwks) return res.status(401).json({ error: "unauthorised" });

    const JWKS = createLocalJWKSet(jwks as any);
    
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: iss,
      algorithms: ["RS256"],
      clockTolerance: "60s",
    });    
    
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "invalid or expired token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const u = (req as any).user;
  if (!u || u.role !== "admin" || u.iss !== ADMIN_ISSUER || u.aud !== ADMIN_AUD) {
    return res.status(403).json({ error: "admin only" });
  }
  next();
}
