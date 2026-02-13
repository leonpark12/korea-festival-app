"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-white"
    >
      ← Back
    </button>
  );
}
