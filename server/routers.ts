import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { predictPhishing, predictPasswordStrength, predictVulnerability } from "./ml-service";

// ML models are loaded on first use

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
          threatIndicators: result.threatIndicators,
          riskFactors: result.riskFactors,
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
          entropyScore: result.entropyScore,
          charsetSize: result.charsetSize,
          vulnerabilities: result.vulnerabilities,
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
          securityHeaders: result.securityHeaders,
          threatSummary: result.threatSummary,
          timestamp: new Date(),
        };
      }),
  }),

  reports: router({
    generateVulnerabilityReport: publicProcedure
      .input(z.object({
        url: z.string(),
        riskScore: z.number(),
        riskLevel: z.string(),
        vulnerabilities: z.array(z.string()),
        recommendations: z.array(z.string()),
      }))
      .mutation(({ input }) => {
        const { generateVulnerabilityPDF } = require('../server/pdf-generator');
        const htmlContent = generateVulnerabilityPDF({
          ...input,
          timestamp: new Date(),
        });
        return { html: htmlContent, filename: `vulnerability-report-${Date.now()}.pdf` };
      }),
    
    generatePhishingReport: publicProcedure
      .input(z.object({
        url: z.string(),
        phishingProbability: z.number(),
        riskLevel: z.string(),
        confidence: z.number(),
      }))
      .mutation(({ input }) => {
        const { generatePhishingPDF } = require('../server/pdf-generator');
        const htmlContent = generatePhishingPDF({
          ...input,
          timestamp: new Date(),
        });
        return { html: htmlContent, filename: `phishing-report-${Date.now()}.pdf` };
      }),
    
    generatePasswordReport: publicProcedure
      .input(z.object({
        strength: z.number(),
        level: z.string(),
        crackTime: z.string(),
        suggestions: z.array(z.string()),
      }))
      .mutation(({ input }) => {
        const { generatePasswordPDF } = require('../server/pdf-generator');
        const htmlContent = generatePasswordPDF({
          ...input,
          timestamp: new Date(),
        });
        return { html: htmlContent, filename: `password-report-${Date.now()}.pdf` };
      }),
  }),
});

export type AppRouter = typeof appRouter;
