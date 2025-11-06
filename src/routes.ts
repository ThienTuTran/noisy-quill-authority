import { Router } from "express";
import { landing, internalJWKS, tenantJWKS, profile, robots } from "./controllers/public.js";
import { flag } from "./controllers/admin.js";
import { jwksTest } from "./controllers/debug.js";
import { requireAuth, requireAdmin } from "./middleware/auth.js";
import { login } from "./controllers/auth.js";

const r = Router();

r.get("/", landing);
r.get("/robots.txt", robots);

// Public JWKS endpoints
r.get("/internal-jwks.json", internalJWKS);
r.get("/tenant/customer-issuer/jwks.json", tenantJWKS);

// Auth
r.post("/api/login", login);
r.get("/api/profile", requireAuth, profile);

// Admin
r.get("/api/admin/flag", requireAuth, requireAdmin, flag);

// Debug (intended vuln)
r.post("/api/debug/jwks-test", jwksTest);

export default r;
