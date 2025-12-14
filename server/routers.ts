import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  createProcessingHistory, 
  getProcessingHistoryByUser, 
  getProcessingHistoryById,
  createUserPreset,
  getUserPresets,
  deleteUserPreset
} from "./db";
import { GENRE_PRESETS, validateParams } from "./dsp/epicenterEngine";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // DSP Processing endpoints
  dsp: router({
    // Get available presets
    getPresets: publicProcedure.query(() => {
      return GENRE_PRESETS;
    }),

    // Validate and normalize DSP parameters
    validateParams: publicProcedure
      .input(z.object({
        sweepFreq: z.number().optional(),
        width: z.number().optional(),
        intensity: z.number().optional(),
      }))
      .mutation(({ input }) => {
        return validateParams(input);
      }),
  }),

  // Processing History
  history: router({
    // Get user's processing history
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return getProcessingHistoryByUser(ctx.user.id, input?.limit ?? 20);
      }),

    // Get single history entry
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getProcessingHistoryById(input.id);
      }),

    // Create history entry
    create: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileFormat: z.string(),
        sampleRate: z.number(),
        duration: z.number(),
        channels: z.number(),
        sweepFreq: z.number(),
        width: z.number(),
        intensity: z.number(),
        presetUsed: z.string().optional(),
        originalFileUrl: z.string().optional(),
        processedFileUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await createProcessingHistory({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
  }),

  // User Presets
  presets: router({
    // Get user's custom presets
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserPresets(ctx.user.id);
    }),

    // Create custom preset
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        sweepFreq: z.number().min(27).max(63),
        width: z.number().min(0).max(100),
        intensity: z.number().min(0).max(100),
        genre: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await createUserPreset({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),

    // Delete custom preset
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteUserPreset(input.id, ctx.user.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
