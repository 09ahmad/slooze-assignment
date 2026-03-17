"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../../lib/api";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";

type OrderStatus = "DRAFT" | "PLACED" | "CANCELLED";

type Order = {
  id: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  restaurant: { id: string; name: string; country: "INDIA" | "AMERICA" };
  orderItems: {
    id: string;
    quantity: number;
    price: number;
    menuItem: { id: string; name: string };
  }[];
  payment?: {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    paymentMethod: { id: string; type: string; details: string };
  } | null;
};

type PaymentMethod = {
  id: string;
  type: string;
  details: string;
  isDefault: boolean;
};

const statusStyles: Record<OrderStatus, string> = {
  DRAFT: "bg-gray-700 text-gray-100",
  PLACED: "bg-green-600 text-white",
  CANCELLED: "bg-red-600 text-white",
};

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<Order>(`/orders/${id}`);
      setOrder(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const total = useMemo(() => {
    if (!order) return 0;
    return (order.orderItems ?? []).reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    );
  }, [order]);

  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  const cancel = async () => {
    if (!order) return;
    setActing(true);
    try {
      await api.patch(`/orders/${order.id}/cancel`);
      toast.success("Order cancelled");
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to cancel order");
    } finally {
      setActing(false);
    }
  };

  const place = async () => {
    if (!order) return;
    setActing(true);
    try {
      const pmRes = await api.get<PaymentMethod[]>("/payments");
      const methods = pmRes.data;
      if (methods.length === 0) {
        toast.error("No payment methods found for your user.");
        return;
      }
      const paymentMethodId =
        methods.find((m) => m.isDefault)?.id ?? methods[0].id;
      await api.post(`/orders/${order.id}/place`, { paymentMethodId });
      toast.success("Order placed");
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to place order");
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Order Details</h1>
          <p className="text-sm text-gray-400">
            View items, totals, and payment info.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/orders")}
          className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-200 hover:border-purple-600"
        >
          Back to Orders
        </button>
      </div>

      {loading || !order ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 text-sm text-gray-400">
          Loading order...
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">Status</div>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyles[order.status]}`}
                >
                  {order.status}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-300">
                <span className="text-gray-400">Restaurant:</span>{" "}
                <span className="font-semibold text-white">
                  {order.restaurant?.name}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
              <div className="mb-3 text-sm font-semibold text-white">Items</div>
              <div className="space-y-2">
                {order.orderItems.map((i) => (
                  <div
                    key={i.id}
                    className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-950 px-3 py-2"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {i.menuItem?.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {i.quantity} × ${i.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-100">
                      ${(i.quantity * i.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-gray-800 pt-3">
                <div className="text-sm font-semibold text-white">Total</div>
                <div className="text-sm font-semibold text-gray-100">
                  ${total.toFixed(2)}
                </div>
              </div>
            </div>

            {order.payment && (
              <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
                <div className="mb-2 text-sm font-semibold text-white">
                  Payment
                </div>
                <div className="text-sm text-gray-300">
                  <span className="text-gray-400">Status:</span>{" "}
                  <span className="font-semibold text-white">
                    {order.payment.status}
                  </span>
                </div>
                <div className="text-sm text-gray-300">
                  <span className="text-gray-400">Amount:</span>{" "}
                  <span className="font-semibold text-white">
                    ${order.payment.amount.toFixed(2)}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Method: {order.payment.paymentMethod.type} ·{" "}
                  {order.payment.paymentMethod.details}
                </div>
              </div>
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
            <div className="mb-3 text-sm font-semibold text-white">Actions</div>
            <div className="space-y-2">
              {canManage && order.status === "DRAFT" && (
                <button
                  type="button"
                  onClick={place}
                  disabled={acting}
                  className="w-full rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {acting ? "Working..." : "Place Order"}
                </button>
              )}
              {canManage &&
                (order.status === "DRAFT" || order.status === "PLACED") && (
                  <button
                    type="button"
                    onClick={cancel}
                    disabled={acting}
                    className="w-full rounded-lg border border-red-600/70 bg-red-600/10 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-600/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {acting ? "Working..." : "Cancel Order"}
                  </button>
                )}

              {(!canManage || order.status === "CANCELLED") && (
                <div className="rounded-lg border border-gray-800 bg-gray-950 p-3 text-xs text-gray-400">
                  {order.status === "CANCELLED"
                    ? "This order is cancelled."
                    : "You don't have permission to place/cancel orders."}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

