import type { Request, Response } from "express";
import { prisma } from "../utils/prisma";

// GET /api/payments — payment methods for logged-in user
export const getPaymentMethods = async (req: Request, res: Response) => {
  const methods = await prisma.paymentMethod.findMany({
    where: { userId: req.user.id },
  });

  return res.json(methods);
};

// POST /api/payments — add new payment method (ADMIN only via middleware)
export const addPaymentMethod = async (req: Request, res: Response) => {
  const { type, details, userId } = req.body as {
    type?: string;
    details?: string;
    userId?: string;
  };

  if (!type || !details) {
    return res
      .status(400)
      .json({ message: "type and details are required fields" });
  }

  // Admin can optionally create for another user; default to self
  const targetUserId = userId ?? req.user.id;

  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) {
    return res.status(404).json({ message: "Target user not found" });
  }

  const method = await prisma.paymentMethod.create({
    data: {
      type,
      details,
      userId: targetUserId,
    },
  });

  return res.status(201).json(method);
};

// PUT /api/payments/:id — update method (ADMIN only via middleware)
export const updatePaymentMethod = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { type, details } = req.body as {
    type?: string;
    details?: string;
  };

  const existing = await prisma.paymentMethod.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: "Payment method not found" });
  }

  const updated = await prisma.paymentMethod.update({
    where: { id },
    data: {
      type: type ?? existing.type,
      details: details ?? existing.details,
    },
  });

  return res.json(updated);
};

// DELETE /api/payments/:id — delete method (ADMIN only via middleware)
export const deletePaymentMethod = async (req: Request, res: Response) => {
  const id = String(req.params.id);

  const existing = await prisma.paymentMethod.findUnique({
    where: { id },
    include: { payments: true },
  });

  if (!existing) {
    return res.status(404).json({ message: "Payment method not found" });
  }

  if (existing.payments.length > 0) {
    return res.status(400).json({
      message: "Cannot delete a payment method that has associated payments",
    });
  }

  await prisma.paymentMethod.delete({ where: { id } });

  return res.status(204).send();
};

// PATCH /api/payments/:id/default — set default for current user
export const setDefaultPaymentMethod = async (req: Request, res: Response) => {
  const id = String(req.params.id);

  const existing = await prisma.paymentMethod.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.user.id) {
    return res.status(404).json({ message: "Payment method not found" });
  }

  await prisma.$transaction([
    prisma.paymentMethod.updateMany({
      where: { userId: req.user.id },
      data: { isDefault: false },
    }),
    prisma.paymentMethod.update({
      where: { id },
      data: { isDefault: true },
    }),
  ]);

  const updated = await prisma.paymentMethod.findMany({
    where: { userId: req.user.id },
  });

  return res.json(updated);
};

