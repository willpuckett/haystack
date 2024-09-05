import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@/trpc/routers/app.ts'

export const trpc = createTRPCReact<AppRouter>({
  // context: () => {},
})
