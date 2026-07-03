import { afterEach, vi } from "vitest";

// Reset mock state between tests so spies/calls do not leak across files.
afterEach(() => {
  vi.clearAllMocks();
});
