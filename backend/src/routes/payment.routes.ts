import { Router } from "express";
import {
  getPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
} from "../controller/payment.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { Role } from "../../db/generated/prisma/client";

const router = Router();

// GET /api/payments — current user's payment methods
router.get("/payments", authenticate, getPaymentMethods);

// POST /api/payments — ADMIN only
router.post(
  "/payments",
  authenticate,
  requireRole(Role.ADMIN),
  addPaymentMethod,
);

// PUT /api/payments/:id — ADMIN only
router.put(
  "/payments/:id",
  authenticate,
  requireRole(Role.ADMIN),
  updatePaymentMethod,
);

// DELETE /api/payments/:id — ADMIN only
router.delete(
  "/payments/:id",
  authenticate,
  requireRole(Role.ADMIN),
  deletePaymentMethod,
);

// PATCH /api/payments/:id/default — any authenticated user on own methods
router.patch(
  "/payments/:id/default",
  authenticate,
  setDefaultPaymentMethod,
);

export default router;

