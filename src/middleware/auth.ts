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
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";
    if (!token) return res.status(401).json({ error: "missing bearer token" });

    const payloadB64 = token.split(".")[1];
    const claims = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    const iss = claims?.iss;
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
