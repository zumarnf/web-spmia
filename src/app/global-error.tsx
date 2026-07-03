"use client";
import { useEffect } from "react";
import { reportError } from "@/lib/monitoring/report";

/**
 * Root error boundary. Catches errors thrown in the root layout/template that
 * the segment-level `error.tsx` cannot. Must render its own <html>/<body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, {
      source: "global-boundary",
      severity: "fatal",
      tags: { digest: error.digest },
    });
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          display: "grid",
          minHeight: "100dvh",
          placeItems: "center",
          padding: "1.5rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Terjadi kesalahan</h1>
          <p style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
            Sesuatu tidak berjalan semestinya. Silakan muat ulang halaman.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              border: "1px solid currentColor",
              cursor: "pointer",
            }}
          >
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
