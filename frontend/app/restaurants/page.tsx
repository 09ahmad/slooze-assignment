"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

type Restaurant = {
  id: string;
  name: string;
  country: "INDIA" | "AMERICA";
};

const countryColors: Record<string, string> = {
  INDIA: "bg-orange-500 text-white",
  AMERICA: "bg-blue-500 text-white",
};

export default function RestaurantsPage() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<Restaurant[]>("/restaurants");
        setRestaurants(res.data);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ?? "Failed to load restaurants";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Restaurants</h1>
          <p className="text-sm text-gray-400">
            Showing restaurants available in your region. You are logged in as{" "}
            <span className="font-semibold">{user?.role}</span> in{" "}
            <span className="font-semibold">{user?.country}</span>.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 text-sm text-gray-400">
          Loading restaurants...
        </div>
      ) : restaurants.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 text-sm text-gray-400">
          No restaurants found for your country.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => (
            <div
              key={r.id}
              className="flex flex-col justify-between rounded-xl border border-gray-800 bg-gray-900/60 p-4"
            >
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">{r.name}</h2>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${countryColors[r.country]}`}
                  >
                    {r.country}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href={`/restaurants/${r.id}`}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-500"
                >
                  View Menu
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

