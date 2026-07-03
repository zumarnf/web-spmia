import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { reportError } from "./report";

describe("reportError", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    delete process.env.MONITORING_WEBHOOK_URL;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("captures an Error with name, message and source", () => {
    const payload = reportError(new TypeError("boom"), { source: "api-route" });
    expect(payload).not.toBeNull();
    expect(payload).toMatchObject({
      name: "TypeError",
      message: "boom",
      source: "api-route",
      severity: "error",
    });
    expect(console.error).toHaveBeenCalledOnce();
  });

  it("normalizes non-Error throwables", () => {
    const payload = reportError("just a string");
    expect(payload).toMatchObject({ name: "NonError", message: "just a string" });
  });

  it("ignores control-flow auth signals", () => {
    expect(reportError(new Error("UNAUTHENTICATED"))).toBeNull();
    expect(reportError(new Error("FORBIDDEN"))).toBeNull();
    expect(console.error).not.toHaveBeenCalled();
  });

  it("applies severity and tags from context", () => {
    const payload = reportError(new Error("x"), {
      severity: "fatal",
      tags: { route: "/penelitian", userId: 7 },
    });
    expect(payload?.severity).toBe("fatal");
    expect(payload?.tags).toEqual({ route: "/penelitian", userId: 7 });
  });

  it("forwards to the webhook when MONITORING_WEBHOOK_URL is set", () => {
    process.env.MONITORING_WEBHOOK_URL = "https://sink.example/ingest";
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    reportError(new Error("ship it"), { source: "test" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://sink.example/ingest",
      expect.objectContaining({ method: "POST" }),
    );
    fetchMock.mockRestore();
  });

  it("does not call fetch when no webhook is configured", () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    reportError(new Error("local only"));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
