import type { Request, Response, NextFunction } from "express";
import { Role } from "../../db/generated/prisma/client";

// Role check
export const requireRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied: insufficient role" });
    }
    next();
  };
};

// Geo-access: ADMIN bypasses, others only see their country
// Attach this to routes that return country-scoped data
export const scopeToCountry = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.user.role === Role.ADMIN) {
    req.countryFilter = undefined; // Admin sees everything
  } else {
    req.countryFilter = req.user.country; // Manager/Member see own country only
  }
  next();
};
