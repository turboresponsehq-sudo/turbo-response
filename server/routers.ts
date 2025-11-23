import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { chatRouter } from "./routers/chatRouter";
import { adminRouter } from "./routers/adminRouter";
import { messagingRouter } from "./routers/messagingRouter";
import { caseRouter } from "./routers/caseRouter";

export const appRouter = router({
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

  // Chat router for conversational AI
  chat: chatRouter,

  // Admin router for managing leads
  admin: adminRouter,

  // Messaging router for client-admin communication
  messaging: messagingRouter,

  // Case router for case file management
  case: caseRouter,
});

export type AppRouter = typeof appRouter;
