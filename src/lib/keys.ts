import { createPublicKey } from "crypto";
import { readFileSync } from "fs";
import { exportJWK } from "jose";

export function readAdminPublicPem(): string {
  return readFileSync("./keys/admin_public.pem", "utf8");
}
export function readCustomerPublicPem(): string {
  return readFileSync("./keys/customer_public.pem", "utf8");
}

export async function jwkFromPem(pem: string) {
  const pub = createPublicKey(pem);
  const jwk = await exportJWK(pub);
  return { ...jwk, kid: "admin-key", alg: "RS256", use: "sig", kty: "RSA" };
}
export async function jwkFromCustomerPem(pem: string) {
  const pub = createPublicKey(pem);
  const jwk = await exportJWK(pub);
  return { ...jwk, kid: "customer-key", alg: "RS256", use: "sig", kty: "RSA" };
}
