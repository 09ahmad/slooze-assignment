"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../../lib/api";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";

type MenuItem = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
};

type PaymentMethod = {
  id: string;
  type: string;
  details: string;
  isDefault: boolean;
};

type CartLine = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
};

function cartStorageKey(restaurantId: string) {
  return `cart:${restaurantId}`;
}

export default function RestaurantMenuPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);

  const [cart, setCart] = useState<CartLine[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(cartStorageKey(id));
    if (raw) {
      try {
        setCart(JSON.parse(raw) as CartLine[]);
      } catch {
        setCart([]);
      }
    }
  }, [id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(cartStorageKey(id), JSON.stringify(cart));
  }, [cart, id]);

  useEffect(() => {
    const load = async () => {
      setLoadingMenu(true);
      try {
        const res = await api.get<MenuItem[]>(`/restaurants/${id}/menu`);
        setMenu(res.data);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ?? "Failed to load menu items";
        toast.error(message);
      } finally {
        setLoadingMenu(false);
      }
    };
    load();
  }, [id]);

  const total = useMemo(
    () => cart.reduce((sum, l) => sum + l.price * l.quantity, 0),
    [cart],
  );

  const upsertLine = (item: MenuItem, qty: number) => {
    setCart((prev) => {
      const next = [...prev];
      const idx = next.findIndex((l) => l.menuItemId === item.id);
      if (qty <= 0) {
        if (idx >= 0) next.splice(idx, 1);
        return next;
      }
      if (idx >= 0) {
        next[idx] = { ...next[idx], quantity: qty };
        return next;
      }
      next.push({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: qty,
      });
      return next;
    });
  };

  const checkout = async () => {
    if (!user) return;
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (user.role === "MEMBER") {
      toast.error("Members cannot place orders");
      return;
    }

    setCheckingOut(true);
    try {
      const pmRes = await api.get<PaymentMethod[]>("/payments");
      const methods = pmRes.data;
      if (methods.length === 0) {
        toast.error("No payment methods found for your user.");
        return;
      }
      const paymentMethodId =
        methods.find((m) => m.isDefault)?.id ?? methods[0].id;

      const orderRes = await api.post("/orders", {
        restaurantId: id,
        items: cart.map((l) => ({
          menuItemId: l.menuItemId,
          quantity: l.quantity,
          price: l.price,
        })),
      });

      const orderId = orderRes.data?.id as string | undefined;
      if (!orderId) throw new Error("Order created but missing id");

      await api.post(`/orders/${orderId}/place`, { paymentMethodId });
      toast.success("Order placed successfully");
      setCart([]);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(cartStorageKey(id));
      }
      router.push(`/orders/${orderId}`);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? "Checkout failed";
      toast.error(message);
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Menu</h1>
            <p className="text-sm text-gray-400">
              Add items to your cart and proceed to checkout.
            </p>
          </div>
        </div>

        {loadingMenu ? (
          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 text-sm text-gray-400">
            Loading menu...
          </div>
        ) : menu.length === 0 ? (
          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 text-sm text-gray-400">
            No menu items found.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {menu.map((m) => {
              const line = cart.find((l) => l.menuItemId === m.id);
              const qty = line?.quantity ?? 0;
              return (
                <div
                  key={m.id}
                  className="rounded-xl border border-gray-800 bg-gray-900/60 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-white">
                        {m.name}
                      </div>
                      {m.description && (
                        <div className="mt-1 text-sm text-gray-400">
                          {m.description}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-sm font-semibold text-gray-100">
                      ${m.price.toFixed(2)}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => upsertLine(m, Math.max(0, qty - 1))}
                        className="h-9 w-9 rounded-lg border border-gray-700 bg-gray-950 text-gray-200 hover:border-purple-600"
                      >
                        -
                      </button>
                      <span className="w-10 text-center text-sm font-semibold text-white">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => upsertLine(m, qty + 1)}
                        className="h-9 w-9 rounded-lg border border-gray-700 bg-gray-950 text-gray-200 hover:border-purple-600"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => upsertLine(m, Math.max(1, qty || 1))}
                      className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-500"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <aside className="h-fit rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-semibold text-white">Cart</div>
          <div className="text-sm font-semibold text-gray-200">
            ${total.toFixed(2)}
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 text-sm text-gray-400">
            Your cart is empty.
          </div>
        ) : (
          <div className="space-y-2">
            {cart.map((l) => (
              <div
                key={l.menuItemId}
                className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-950 px-3 py-2"
              >
                <div>
                  <div className="text-sm font-semibold text-white">{l.name}</div>
                  <div className="text-xs text-gray-400">
                    {l.quantity} × ${l.price.toFixed(2)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCart((prev) =>
                      prev.filter((x) => x.menuItemId !== l.menuItemId),
                    )
                  }
                  className="text-xs font-semibold text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          {user?.role === "MEMBER" ? (
            <button
              type="button"
              disabled
              title="Members cannot place orders"
              className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-200 opacity-70"
            >
              Members cannot place orders
            </button>
          ) : (
            <button
              type="button"
              onClick={checkout}
              disabled={checkingOut || cart.length === 0}
              className="w-full rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checkingOut ? "Processing..." : "Proceed to Checkout"}
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

