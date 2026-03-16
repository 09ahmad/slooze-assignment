import { Router } from "express";
import {
  getRestaurants,
  getMenuItems,
} from "../controller/restaurant.controller";
import { authenticate } from "../middleware/auth.middleware";
import { scopeToCountry } from "../middleware/rbac.middleware";

const router = Router();

// GET /api/restaurants
router.get("/restaurants", authenticate, scopeToCountry, getRestaurants);

// GET /api/restaurants/:id/menu
router.get(
  "/restaurants/:id/menu",
  authenticate,
  scopeToCountry,
  getMenuItems,
);

export default router;

