"use client";

import dynamic from "next/dynamic";

const MapShell = dynamic(() => import("./MapShell"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-muted">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
});

export default function MapShellLoader() {
  return <MapShell />;
}
