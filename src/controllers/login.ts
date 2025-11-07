import type { Request, Response } from "express";
import { readFileSync } from "fs";
import { importPKCS8, SignJWT } from "jose";
import bcrypt from "bcryptjs";

const CUSTOMER_ISSUER = process.env.CUSTOMER_ISSUER!;
const CUSTOMER_AUD = process.env.CUSTOMER_AUD!;
const DEMO_CUSTOMER = process.env.DEMO_CUSTOMER!;
const DEMO_CUSTOMER_PASS_HASH = process.env.DEMO_CUSTOMER_PASS_HASH!;

async function getCustomerPrivateKey() {
  const pkcs8 = readFileSync("./keys/customer_private.pem", "utf8");
  return importPKCS8(pkcs8, "RS256");
}

export async function login(req: Request, res: Response) {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "username and password required" });

  const ok = username === DEMO_CUSTOMER && await bcrypt.compare(password, DEMO_CUSTOMER_PASS_HASH);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });

  const key = await getCustomerPrivateKey();
  const now = Math.floor(Date.now() / 1000);
  const token = await new SignJWT({ role: "user", sub: DEMO_CUSTOMER })
    .setProtectedHeader({ alg: "RS256", kid: "customer-key" }) 
    .setIssuer(CUSTOMER_ISSUER)
    .setAudience(CUSTOMER_AUD)
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);

  res.json({ token, issuer: CUSTOMER_ISSUER, aud: CUSTOMER_AUD, role: "user", sub: DEMO_CUSTOMER });
}
