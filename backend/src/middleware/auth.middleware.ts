import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user; 
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
