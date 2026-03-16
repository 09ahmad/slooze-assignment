import type { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { OrderStatus, Role } from "../../db/generated/prisma/client";

type OrderItemInput = {
  menuItemId: string;
  quantity: number;
  price: number;
};

// POST /api/orders — create order (ADMIN, MANAGER, MEMBER)
export const createOrder = async (req: Request, res: Response) => {
  const { restaurantId, items } = req.body as {
    restaurantId?: string;
    items?: OrderItemInput[];
  };

  if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ message: "restaurantId and at least one item are required" });
  }

  // Verify restaurant is in user's country (non-admins)
  if (req.user.role !== Role.ADMIN) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (restaurant.country !== req.user.country) {
      return res.status(403).json({
        message: "Cannot order from restaurants outside your region",
      });
    }
  }

  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
      restaurantId,
      orderItems: {
        create: items.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          price: i.price,
        })),
      },
    },
    include: {
      orderItems: true,
      restaurant: true,
    },
  });

  return res.status(201).json(order);
};

// GET /api/orders — current user's orders
export const getMyOrders = async (req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    where: {
      userId: req.user.id,
    },
    orderBy: { createdAt: "desc" },
    include: {
      restaurant: true,
      orderItems: {
        include: { menuItem: true },
      },
      payment: {
        include: {
          paymentMethod: true,
        },
      },
    },
  });

  return res.json(orders);
};

// GET /api/orders/:id — single order, scoped to user (unless ADMIN)
export const getOrderById = async (req: Request, res: Response) => {
  const id = String(req.params.id);

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      restaurant: true,
      orderItems: {
        include: { menuItem: true },
      },
      payment: {
        include: { paymentMethod: true },
      },
    },
  });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.userId !== req.user.id && req.user.role !== Role.ADMIN) {
    return res.status(403).json({ message: "Not allowed to view this order" });
  }

  return res.json(order);
};

// POST /api/orders/:id/place — checkout (ADMIN, MANAGER only via middleware)
export const placeOrder = async (req: Request, res: Response) => {
  const { paymentMethodId } = req.body as { paymentMethodId?: string };
  const id = String(req.params.id);

  if (!paymentMethodId) {
    return res
      .status(400)
      .json({ message: "paymentMethodId is required to place an order" });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { orderItems: true },
  });

  if (!order || order.userId !== req.user.id) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.status !== OrderStatus.DRAFT) {
    return res
      .status(400)
      .json({ message: "Order already placed or cancelled" });
  }

  const paymentMethod = await prisma.paymentMethod.findUnique({
    where: { id: paymentMethodId },
  });

  if (!paymentMethod || paymentMethod.userId !== req.user.id) {
    return res
      .status(400)
      .json({ message: "Invalid payment method for this user" });
  }

  const total = order.orderItems.reduce<number>(
    (sum: number, i: { price: number; quantity: number }) =>
      sum + i.price * i.quantity,
    0,
  );

  const [updatedOrder] = await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.PLACED },
    }),
    prisma.payment.create({
      data: {
        orderId: order.id,
        paymentMethodId,
        amount: total,
      },
    }),
  ]);

  return res.json(updatedOrder);
};

// PATCH /api/orders/:id/cancel — cancel order (ADMIN, MANAGER only via middleware)
export const cancelOrder = async (req: Request, res: Response) => {
  const id = String(req.params.id);

  const order = await prisma.order.findUnique({
    where: { id },
  });

  if (!order || order.userId !== req.user.id) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.status === OrderStatus.CANCELLED) {
    return res.status(400).json({ message: "Order already cancelled" });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: OrderStatus.CANCELLED },
  });

  return res.json(updated);
};

