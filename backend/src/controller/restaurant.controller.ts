import type { Request, Response } from "express";
import { prisma } from "../utils/prisma";

// GET /api/restaurants — respects countryFilter set by scopeToCountry
export const getRestaurants = async (req: Request, res: Response) => {
  const where = req.countryFilter ? { country: req.countryFilter } : {};

  const restaurants = await prisma.restaurant.findMany({
    where,
  });

  return res.json(restaurants);
};

// GET /api/restaurants/:id/menu — also respects geo rules
export const getMenuItems = async (req: Request, res: Response) => {
  const id = String(req.params.id);

  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: { menuItems: true },
  });

  if (!restaurant) {
    return res.status(404).json({ message: "Restaurant not found" });
  }

  // Enforce geo rule in case this route is ever used without scopeToCountry
  if (
    req.countryFilter &&
    restaurant.country !== req.countryFilter
  ) {
    return res
      .status(403)
      .json({ message: "Cannot access restaurants from another country" });
  }

  return res.json(restaurant.menuItems);
};

