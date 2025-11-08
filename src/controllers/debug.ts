import type { Request, Response } from "express";
import { fetchJWKS, setJWKS } from "../lib/jwksStore.js";
import { jwtVerify, createLocalJWKSet } from "jose";

export async function debug(_req: Request, res: Response) {
  res.json({
    endpoint: "/api/debug/jwks-test",
    method: "POST",
    body: { issuer: "string", jwks_url: "url", token: "jwt" },
    behavior: "Fetches JWKS and caches it by issuer, then verifies the token against that cache.",
    warning: "Not for production use."
  });
}

export async function jwksTest(req: Request, res: Response) {
  try {
    const { issuer, jwks_url, token } = req.body || {};
    if (!issuer || !jwks_url || !token) {
      return res.status(400).json({ error: "issuer, jwks_url, token required" });
    }

    const candidate = await fetchJWKS(jwks_url);
    const verifier = createLocalJWKSet(candidate as any);

    try {
      await jwtVerify(token, verifier, { issuer, algorithms: ["RS256"] });
    } catch {
      return res.status(400).json({ error: "token did not verify with provided JWKS/issuer" });
    }

    // Vulnerability: accept arbitrary JWKS into the global cache
    setJWKS(issuer, candidate);
    res.json({ message: "Quill cache updated.", issuer, valid: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message || "debug failed" });
  }
}
