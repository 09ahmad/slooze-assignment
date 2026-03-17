"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

type PaymentMethod = {
  id: string;
  type: string;
  details: string;
  isDefault: boolean;
  userId: string;
};

type FormState = {
  id?: string;
  type: "card" | "upi" | "netbanking";
  details: string;
};

function maskDetails(type: string, details: string) {
  if (type === "card") {
    const last4 = details.slice(-4);
    return `•••• ${last4}`;
  }
  return details;
}

export default function PaymentMethodsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    type: "card",
    details: "",
  });

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (user && !isAdmin) {
      router.replace("/restaurants");
    }
  }, [isAdmin, router, user]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<PaymentMethod[]>("/payments");
      setMethods(res.data);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Failed to load payment methods",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const defaultId = useMemo(
    () => methods.find((m) => m.isDefault)?.id ?? null,
    [methods],
  );

  const openAdd = () => {
    setForm({ type: "card", details: "" });
    setOpen(true);
  };

  const openEdit = (m: PaymentMethod) => {
    setForm({
      id: m.id,
      type: (m.type as any) ?? "card",
      details: m.details,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.details.trim()) {
      toast.error("Details are required");
      return;
    }
    try {
      if (form.id) {
        await api.put(`/payments/${form.id}`, {
          type: form.type,
          details: form.details.trim(),
        });
        toast.success("Payment method updated");
      } else {
        await api.post("/payments", {
          type: form.type,
          details: form.details.trim(),
        });
        toast.success("Payment method added");
      }
      setOpen(false);
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to save payment method");
    }
  };

  const remove = async (id: string) => {
    setBusyId(id);
    try {
      await api.delete(`/payments/${id}`);
      toast.success("Payment method deleted");
      await load();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Failed to delete payment method",
      );
    } finally {
      setBusyId(null);
    }
  };

  const setDefault = async (id: string) => {
    setBusyId(id);
    try {
      await api.patch(`/payments/${id}/default`);
      toast.success("Default payment method updated");
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to set default");
    } finally {
      setBusyId(null);
    }
  };

  if (!user) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 text-sm text-gray-400">
        Loading...
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Payment Methods</h1>
          <p className="text-sm text-gray-400">
            Only admins can add, edit, or delete payment methods.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500"
        >
          Add Payment Method
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 text-sm text-gray-400">
          Loading payment methods...
        </div>
      ) : methods.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 text-sm text-gray-400">
          No payment methods yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {methods.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">
                    {m.type.toUpperCase()}
                  </div>
                  <div className="mt-1 text-sm text-gray-300">
                    {maskDetails(m.type, m.details)}
                  </div>
                </div>
                {m.id === defaultId && (
                  <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs font-semibold text-white">
                    Default
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(m)}
                  className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-1.5 text-xs font-semibold text-gray-200 hover:border-purple-600"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(m.id)}
                  disabled={busyId === m.id}
                  className="rounded-lg border border-red-600/70 bg-red-600/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-600/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setDefault(m.id)}
                  disabled={busyId === m.id || m.id === defaultId}
                  className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-1.5 text-xs font-semibold text-gray-200 hover:border-green-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Set as Default
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-lg font-semibold text-white">
                {form.id ? "Edit Payment Method" : "Add Payment Method"}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-1.5 text-xs font-semibold text-gray-200 hover:border-purple-600"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-200">
                  Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      type: e.target.value as FormState["type"],
                    }))
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100 outline-none ring-purple-500/40 focus:border-purple-500 focus:ring-2"
                >
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="netbanking">Netbanking</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-200">
                  Details
                </label>
                <input
                  value={form.details}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, details: e.target.value }))
                  }
                  placeholder={
                    form.type === "card"
                      ? "Enter last4 or full card identifier"
                      : form.type === "upi"
                        ? "Enter UPI id (e.g., name@upi)"
                        : "Enter bank reference"
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100 outline-none ring-purple-500/40 focus:border-purple-500 focus:ring-2"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Stored as plain text for the assignment; in production this
                  would be tokenized/secured.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-gray-700 bg-gray-950 px-4 py-2 text-sm font-semibold text-gray-200 hover:border-purple-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

