"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/restaurants");
  }, [router]);

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 text-sm text-gray-400">
      Redirecting...
    </div>
  );
}

