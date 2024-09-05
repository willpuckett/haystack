import { initTRPC, TRPCError } from '@trpc/server'

export const createContext = ({ req, resHeaders, state }: CreateContextOptions) => {
  const { loggedIn } = state
  return {
    req,
    resHeaders,
    loggedIn,
  }
}

const t = initTRPC.context<typeof createContext>().create()

export const publicProcedure = t.procedure
export const middleware = t.middleware
export const router = t.router

const authMiddleware = middleware(({ next, ctx }) => {
  const { loggedIn } = ctx
  if (loggedIn) return next()
  else throw new TRPCError({ code: 'UNAUTHORIZED' })
})

export const authProcedure = publicProcedure.use(authMiddleware)
