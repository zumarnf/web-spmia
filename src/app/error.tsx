"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { reportError } from "@/lib/monitoring/report";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Capture client-side render errors caught by this boundary.
    reportError(error, {
      source: "client-boundary",
      tags: { digest: error.digest },
    });
  }, [error]);

  return (
    <div className="grid min-h-dvh place-items-center p-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-xl font-semibold">Terjadi kesalahan</h1>
        <p className="text-sm text-muted">
          Sesuatu tidak berjalan semestinya. Silakan coba lagi.
        </p>
        <Button onClick={reset}>Coba lagi</Button>
      </div>
    </div>
  );
}
