import { Router } from "express";
import { landing, adminJWKS, tenantJWKS, api, profile, robots } from "./controllers/public.js";
import { flag } from "./controllers/admin.js";
import { jwksTest } from "./controllers/debug.js";
import { requireAuth, requireAdmin } from "./middleware/auth.js";
import { login } from "./controllers/login.js";

const r = Router();

r.get("/", landing);
r.get("/robots.txt", robots);
r.get("/api", api);

// Public JWKS endpoints
r.get("/admin-jwks.json", adminJWKS);
r.get("/tenant-jwks.json", tenantJWKS);

// Auth
r.post("/api/login", login);
r.get("/api/profile", requireAuth, profile);

// Admin
r.get("/api/admin", requireAuth, requireAdmin, flag);

// Debug (intended vuln)
r.post("/api/debug/jwks-test", jwksTest);

export default r;
