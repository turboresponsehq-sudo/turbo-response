import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

/**
 * Admin session procedure - validates admin_session cookie
 * This is separate from Manus OAuth and uses custom session management
 */
const requireAdminSession = t.middleware(async opts => {
  const { ctx, next } = opts;
  const token = ctx.req.cookies?.admin_session;

  if (!token) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin session required" });
  }

  // Session validation happens in the adminAuthRouter
  // Here we just check that the cookie exists
  // The actual validation is done by calling adminAuth.validateSession

  return next({ ctx });
});

export const adminSessionProcedure = t.procedure.use(requireAdminSession);
