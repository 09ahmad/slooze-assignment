"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

type OrderStatus = "DRAFT" | "PLACED" | "CANCELLED";

type Order = {
  id: string;
  status: OrderStatus;
  createdAt: string;
  restaurant: { id: string; name: string; country: "INDIA" | "AMERICA" };
  orderItems: { id: string; quantity: number; price: number }[];
};

const statusStyles: Record<OrderStatus, string> = {
  DRAFT: "bg-gray-700 text-gray-100",
  PLACED: "bg-green-600 text-white",
  CANCELLED: "bg-red-600 text-white",
};

function shortId(id: string) {
  return id.split("-")[0] ?? id;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<Order[]>("/orders");
      setOrders(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalsById = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of orders) {
      const total = (o.orderItems ?? []).reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );
      map.set(o.id, total);
    }
    return map;
  }, [orders]);

  const cancel = async (orderId: string) => {
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      toast.success("Order cancelled");
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to cancel order");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">My Orders</h1>
        <p className="text-sm text-gray-400">
          Your orders are scoped to your account.
        </p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 text-sm text-gray-400">
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 text-sm text-gray-400">
          No orders yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-800">
          <div className="grid grid-cols-[1.2fr,1.6fr,1fr,1fr,1.2fr] gap-3 bg-gray-900 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            <div>Order</div>
            <div>Restaurant</div>
            <div>Status</div>
            <div>Total</div>
            <div className="text-right">Actions</div>
          </div>
          <div className="divide-y divide-gray-800 bg-gray-950">
            {orders.map((o) => {
              const total = totalsById.get(o.id) ?? 0;
              const canCancel =
                (user?.role === "ADMIN" || user?.role === "MANAGER") &&
                (o.status === "DRAFT" || o.status === "PLACED");
              return (
                <div
                  key={o.id}
                  className="grid grid-cols-[1.2fr,1.6fr,1fr,1fr,1.2fr] items-center gap-3 px-4 py-3"
                >
                  <div className="text-sm font-semibold text-white">
                    #{shortId(o.id)}
                  </div>
                  <div className="text-sm text-gray-200">
                    {o.restaurant?.name}
                  </div>
                  <div>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyles[o.status]}`}
                    >
                      {o.status}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-gray-100">
                    ${total.toFixed(2)}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/orders/${o.id}`}
                      className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-xs font-semibold text-gray-200 hover:border-purple-600"
                    >
                      View Details
                    </Link>
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => cancel(o.id)}
                        className="rounded-lg border border-red-600/70 bg-red-600/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-600/20"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

