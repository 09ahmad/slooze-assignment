import { Router } from "express";
import { login } from "../controller/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/me — return current user from auth middleware
router.get("/me", authenticate, (req, res) => {
  return res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    country: req.user.country,
  });
});

export default router;

