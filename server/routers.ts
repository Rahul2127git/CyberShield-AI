import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { predictPhishing, predictPasswordStrength, predictVulnerability, initializeModels } from "./ml-service";

// Initialize ML models on startup
initializeModels();

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  security: router({
    analyzePhishing: publicProcedure
      .input(z.object({ url: z.string() }))
      .query(({ input }) => {
        const result = predictPhishing(input.url);
        return {
          url: input.url,
          phishingProbability: result.probability,
          riskLevel: result.risk,
          confidence: result.confidence,
          timestamp: new Date(),
        };
      }),
    
    analyzePassword: publicProcedure
      .input(z.object({ password: z.string() }))
      .query(({ input }) => {
        const result = predictPasswordStrength(input.password);
        return {
          strength: result.strength,
          level: result.level,
          crackTime: result.crackTime,
          suggestions: result.suggestions,
          timestamp: new Date(),
        };
      }),
    
    analyzeVulnerability: publicProcedure
      .input(z.object({ url: z.string() }))
      .query(({ input }) => {
        const result = predictVulnerability(input.url);
        return {
          url: input.url,
          riskScore: result.risk,
          riskLevel: result.level,
          vulnerabilities: result.vulnerabilities,
          recommendations: result.recommendations,
          timestamp: new Date(),
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
