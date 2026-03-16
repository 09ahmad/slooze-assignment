import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  placeOrder,
  cancelOrder,
} from "../controller/order.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { Role } from "../../db/generated/prisma/client";

const router = Router();

// POST /api/orders — create order (all roles)
router.post("/orders", authenticate, createOrder);

// GET /api/orders — current user's orders
router.get("/orders", authenticate, getMyOrders);

// GET /api/orders/:id — single order
router.get("/orders/:id", authenticate, getOrderById);

// POST /api/orders/:id/place — ADMIN, MANAGER
router.post(
  "/orders/:id/place",
  authenticate,
  requireRole(Role.ADMIN, Role.MANAGER),
  placeOrder,
);

// PATCH /api/orders/:id/cancel — ADMIN, MANAGER
router.patch(
  "/orders/:id/cancel",
  authenticate,
  requireRole(Role.ADMIN, Role.MANAGER),
  cancelOrder,
);

export default router;

