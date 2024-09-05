import { authProcedure, router } from '@/trpc/trpc.ts'
import { db } from '@/trpc/kvdex.ts'
import { market } from '@/trpc/schema.ts'
import { z } from 'zod'

export const marketRouter = router({
  add: authProcedure
    .input(market)
    .mutation(({ input }) => db.market.add(input)),
  get: authProcedure.input(z.string()).query(async ({ input }) => {
    const market = await db.market.find(input)
    return market && market.flat()
  }),
  getAll: authProcedure.query(async () => {
    const { result, cursor } = await db.market.getMany()
    return { result: result.map((r) => r.flat()), cursor }
  }),
  delete: authProcedure.input(z.coerce.string())
    .mutation(async ({ input }) => {
      // This should be atomic
      const { result } = await db.property.findBySecondaryIndex('market', input)
      await db.property.delete(result.map((r) => r.id).toString())
      await db.market.delete(input)
    }),
})
