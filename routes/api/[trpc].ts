import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter as router } from '@/trpc/routers/app.ts'
import { createContext } from '@/trpc/trpc.ts'

export const handler: Handler = (req, { state }) =>
  fetchRequestHandler({
    endpoint: '/api',
    req,
    router,
    createContext: (opts) => createContext({ ...opts, state }),
  })
