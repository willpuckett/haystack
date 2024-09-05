import { caller } from '@/trpc/routers/app.ts'
import { BreadCrumb } from '@/components/Nav.tsx'
import { Cards } from '@/islands/Property.tsx'

const properties: AsyncRoute = async (_req, ctx) => {
  const { market_id } = ctx.params
  const market = market_id === 'all'
    ? { id: 'all', location: 'All Markets' }
    : await caller.market.get(market_id)

  return (
    <>
      <BreadCrumb market={market?.location ?? 'Not a Market'} />
      <Cards market_id={market_id} />
    </>
  )
}

export default properties
