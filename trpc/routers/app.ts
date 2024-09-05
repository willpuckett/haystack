import { router } from '@/trpc/trpc.ts'
import { marketRouter } from '@/trpc/routers/market.ts'
import { propertyRouter } from '@/trpc/routers/property.ts'

export const appRouter = router({
  property: propertyRouter, // put procedures under "property" namespace
  market: marketRouter, // put procedures under "market" namespace
})

export type AppRouter = typeof appRouter

export const caller = appRouter.createCaller({
  req: new Request('https://haystack.deno.dev'),
  resHeaders: new Headers(),
  loggedIn: true,
})
