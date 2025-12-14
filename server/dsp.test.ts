import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("dsp.getPresets", () => {
  it("returns all genre presets", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const presets = await caller.dsp.getPresets();

    expect(presets).toBeDefined();
    expect(presets.regional).toBeDefined();
    expect(presets.rock).toBeDefined();
    expect(presets.pop).toBeDefined();
    expect(presets.classical).toBeDefined();
    expect(presets.custom).toBeDefined();

    // Verify preset structure
    expect(presets.regional.sweepFreq).toBeGreaterThanOrEqual(27);
    expect(presets.regional.sweepFreq).toBeLessThanOrEqual(63);
    expect(presets.regional.width).toBeGreaterThanOrEqual(0);
    expect(presets.regional.width).toBeLessThanOrEqual(100);
    expect(presets.regional.intensity).toBeGreaterThanOrEqual(0);
    expect(presets.regional.intensity).toBeLessThanOrEqual(100);
  });
});

describe("dsp.validateParams", () => {
  it("validates and normalizes DSP parameters", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Test with valid params
    const validResult = await caller.dsp.validateParams({
      sweepFreq: 45,
      width: 50,
      intensity: 75,
    });

    expect(validResult.sweepFreq).toBe(45);
    expect(validResult.width).toBe(50);
    expect(validResult.intensity).toBe(75);
  });

  it("clamps out-of-range values", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Test with out-of-range params
    const clampedResult = await caller.dsp.validateParams({
      sweepFreq: 100, // Should be clamped to 63
      width: 150,     // Should be clamped to 100
      intensity: -10, // Should be clamped to 0
    });

    expect(clampedResult.sweepFreq).toBe(63);
    expect(clampedResult.width).toBe(100);
    expect(clampedResult.intensity).toBe(0);
  });

  it("uses defaults for missing params", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const defaultResult = await caller.dsp.validateParams({});

    expect(defaultResult.sweepFreq).toBe(45);
    expect(defaultResult.width).toBe(50);
    expect(defaultResult.intensity).toBe(50);
  });
});
