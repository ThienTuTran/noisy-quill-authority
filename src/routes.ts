import { Router } from "express";
import { landing, internalJWKS, profile } from "./controllers/public.js";
import { flag } from "./controllers/admin.js";
import { jwksTest } from "./controllers/debug.js";
import { requireAuth, requireAdmin } from "./middleware/auth.js";

const r = Router();

r.get("/", landing);
r.get("/internal-jwks.json", internalJWKS);

r.get("/api/profile", requireAuth, profile);
r.get("/api/admin/flag", requireAuth, requireAdmin, flag);

r.post("/api/debug/jwks-test", jwksTest);

export default r;
