import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { imageRouter } from "./imageRouters";
import { projectRouter } from "./projectRouters";
import { scenarioRouter } from "./scenarioRouters";
import { inspirationRouter } from "./inspirationRouter";
import { templateRouter } from "./templateRouter";
import { attachmentRouter } from "./attachmentRouter";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  image: imageRouter,
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

  // Project management
  project: projectRouter,
  scenario: scenarioRouter,
  inspiration: inspirationRouter,
  template: templateRouter,
  attachment: attachmentRouter,
});

export type AppRouter = typeof appRouter;
