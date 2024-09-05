// deno-lint-ignore-file no-explicit-any
import { authProcedure, router } from '@/trpc/trpc.ts'
import { db } from '@/trpc/kvdex.ts'
import { property } from '@/trpc/schema.ts'
import { caller } from '@/trpc/routers/app.ts'
import {
  comps,
  getImages,
  getListings,
  getNearbyRoutes,
  getWalkScore,
} from '@/trpc/routers/axiod/listings.ts'
import { z } from 'zod'

export const propertyRouter = router({
  pullMarket: authProcedure.input(z.coerce.string()).mutation(
    async ({ input }) => {
      const market = await caller.market.get(input)
      if (!market) return

      const garage = await getListings(market, 0, true, 1)
      const basement = await getListings(market, 1, false, 1)

      const intersect = garage
        .filter((g: any) => basement.some((b: any) => b.zpid === g.zpid))
        .map((i: any) => ({ ...i, garage: true, basement: true }))

      const garageOnly = garage
        .filter((g: any) => !intersect.some((i: any) => i.zpid === g.zpid))
        .map((g: any) => ({ ...g, garage: true }))

      const basementOnly = basement
        .filter((b: any) => !intersect.some((i: any) => i.zpid === b.zpid))
        .map((b: any) => ({ ...b, basement: true }))

      const listings = [...garageOnly, ...basementOnly, ...intersect]
      // .filter((
      //   obj,
      //   index,
      //   arr,
      // ) => arr.findIndex((item) => item.zpid === obj.zpid) === index)

      let newCount = 0
      let usedCount = 0
      listings.map(async (l) => {
        try {
          l.walkScore = await getWalkScore(l.latitude, l.longitude)
          l.market = input
          l.comps = await comps(l.zpid)
          l.images = (await getImages(l.zpid))?.slice(0, 20)
          l.routes = await getNearbyRoutes(l.latitude, l.longitude)

          const listing = property.parse(l)
          const existing = await db.property.find(listing.zpid)
          existing ? usedCount++ : newCount++
          // This should be atomic
          existing
            ? db.property.update(listing.zpid, listing)
            : db.property.set(listing.zpid, listing)
        } catch (error) {
          console.error(error)
        }
      })
      console.log(
        `Pulled ${listings.length} unique listings for market ${market.location}\nGarage: ${garage.length} Basement: ${basement.length} Intersect: ${intersect.length}\nNew: ${newCount} Updated: ${usedCount}`,
      )
    },
  ),
  get: authProcedure.input(
    z.object({
      market_id: z.string(),
      cursor: z.string().optional(),
      limit: z.coerce.number().optional().default(12),
    }),
  ).query(async ({ input }) => {
    const { market_id, ...rest } = input
    const { result, cursor } = await db.property.findBySecondaryIndex(
      'market',
      market_id,
      rest,
    )
    return { result: result.map((r) => r.flat()), cursor }
  }),
  getAll: authProcedure
    .input(z.object({
      cursor: z.string().optional(),
      limit: z.coerce.number().optional().default(12),
    }))
    .query(async ({ input }) => {
      const { result, cursor } = await db.property.getMany(input)
      return { result: result.map((r) => r.flat()), cursor }
    }),
  delete: authProcedure.input(z.array(z.string())).mutation(async ({ input }) =>
    await db.property.delete(...input)
  ),
  deleteMany: authProcedure.input(z.string()).mutation(async ({ input }) =>
    input === 'all'
      ? await db.property.deleteMany()
      // @todo: use secondary index to delete
      : await db.property.deleteMany({
        filter: (doc) => doc.value.market === input,
      })
  ),
  count: authProcedure.input(z.string()).query(async ({ input }) =>
    await db.property.countBySecondaryIndex('market', input)
  ),
})
