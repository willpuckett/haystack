import '@std/dotenv/load'
import { caller } from '@/trpc/routers/app.ts'

export const pull = async () => {
  const promises: Promise<void>[] = []
  console.log('Pulling all markets')
  try {
    const { result } = await caller.market.getAll()
    result.map((m) => promises.push(caller.property.pullMarket(m.id as string)))
  } catch (e) {
    console.error(e)
  }
  await Promise.all(promises)
}
