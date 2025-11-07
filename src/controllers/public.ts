import type { Request, Response } from "express";
import { readAdminPublicPem, jwkFromPem, readCustomerPublicPem, jwkFromCustomerPem } from "../lib/keys.js";

export async function landing(_req: Request, res: Response) {
  res.json({
    message: "NOISY_ECHIDNA Quill Authority",
    version: "1.0.0"
    });
}

// Admin JWKS (public)
export async function adminJWKS(_req: Request, res: Response) {
  const pub = readAdminPublicPem();
  const jwk = await jwkFromPem(pub);
  res.json({ keys: [jwk] });
}

// Tenant JWKS (public)
export async function tenantJWKS(_req: Request, res: Response) {
  const pub = readCustomerPublicPem();
  const jwk = await jwkFromCustomerPem(pub);
  res.json({ keys: [jwk] });
}

export function api(_req: Request, res: Response) {
  res.sendStatus(403);
} 

export function profile(req: Request, res: Response) {
  const u = (req as any).user;
  const name = (u.sub as string) || (u.username as string);
  return res.json({ message: `Welcome ${name}` });
}

export function robots(_req: Request, res: Response) {
  res.type("text/plain").send("User-agent: *\nDisallow: /api/debug/jwks-test\n");
}
