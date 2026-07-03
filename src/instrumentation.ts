import type { Instrumentation } from "next";
import { reportError } from "@/lib/monitoring/report";

/**
 * Next.js server instrumentation. `onRequestError` fires for any uncaught error
 * during a server request (RSC render, Route Handler, Server Action), giving us
 * a single server-side capture point that complements the client error boundary.
 */
export const onRequestError: Instrumentation.onRequestError = (err, request, context) => {
  reportError(err, {
    source: "request",
    severity: "fatal",
    tags: {
      path: request.path,
      method: request.method,
      routeType: context.routeType,
      routePath: context.routePath,
    },
  });
};
