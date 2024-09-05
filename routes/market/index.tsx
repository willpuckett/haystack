import { caller } from '@/trpc/routers/app.ts'
// import { market } from '@/trpc/schema.ts'
import { pooledMap } from '@std/async/pool'

const th = 'text-sm font-medium text-gray-900 px-6 py-4 text-left'
const tb = `${th} hidden md:table-cell`
// const tg = `${th} hidden lg:table-cell`
const td = 'text-sm text-gray-900 px-6 py-4 whitespace-nowrap'

const cols = [
  { name: 'Location', class: th },
  { name: 'Price Range', class: th },
  { name: 'Min Beds', class: tb },
  { name: 'Min Baths', class: tb },
  { name: 'Listings', class: tb },
]

const items = [
  { name: 'location', label: 'Location', type: 'text', placeholder: 'Mobile, AL' },
  { name: 'minPrice', label: 'Min Price', type: 'number', placeholder: '$1' },
  { name: 'maxPrice', label: 'Max Price', type: 'number', placeholder: '$1000' },
  { name: 'bedsMin', label: 'Minimum Beds', type: 'number', placeholder: '3' },
  { name: 'bathsMin', label: 'Minimum Baths', type: 'number', placeholder: '2' },
]

export const handler: Handlers = {
  async POST(req) {
    const fd = await req.formData()
    const market = Object.fromEntries(fd.entries())

    market.marketId
      ? await caller.market.delete(market.marketId as string)
      // @ts-ignore leave it to zod!
      : await caller.market.add(market)

    const url = new URL(req.url)
    url.pathname = '/market'
    return Response.redirect(url.href)
  },
}

export default async () => {
  const { result: markets } = await caller.market.getAll()
  const counts: Map<string, number> = new Map()
  const pool = pooledMap(50, markets, async (m) => {
    counts.set(m.id as string, await caller.property.count(m.id as string))
  })
  for await (const _ of pool) {
    // noop
  }

  return (
    <>
      <div class='flex gap-2 w-full flex-wrap'>
        <div class='flex flex-col flex-1'>
          <div class='overflow-x-auto sm:-mx-6 lg:-mx-8'>
            <div class='py-2 inline-block min-w-full sm:px-6 lg:px-8'>
              <div class='overflow-hidden'>
                <table class='min-w-full'>
                  <thead class='bg-white border-b'>
                    <tr>
                      {cols.map((col) => (
                        <th scope='col' class={col.class}>
                          {col.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {markets.toSorted((a, b) => a.location < b.location ? -1 : 1)
                      .map((market) => (
                        <tr class='bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100'>
                          <td class={`font-medium ${td}`}>
                            <a href={`/property/${market.id.toString()}`}>
                              {market.location}
                            </a>
                          </td>
                          <td class={td}>
                            {market.minPrice.toLocaleString('en-US', {
                              notation: 'compact',
                            })} to {market.maxPrice.toLocaleString('en-US', {
                              notation: 'compact',
                            })}
                          </td>
                          {['bedsMin' as const, 'bathsMin' as const].map((l) => (
                            <td class={`${td} font-light hidden md:table-cell`}>
                              {market[l]}
                            </td>
                          ))}
                          <td class={`${td} font-light hidden md:table-cell`}>
                            {counts.get(market.id as string)}
                          </td>

                          <td class={td}>
                            <form method='post'>
                              <input
                                type='hidden'
                                name='marketId'
                                value={market.id as string}
                              />
                              <button type='submit'>❌</button>
                            </form>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <details class='p-4 mb-6'>
        <summary>Add Market</summary>
        <form class='w-full max-w-3xl' method='post'>
          {items.map((item) => (
            <div class='w-full px-3 md:mb-0 pt-3 flex'>
              <label for={item.name} class='text-gray-700 m-2'>
                {item.label}
              </label>
              <input
                id={item.name}
                name={item.name}
                type={item.type}
                placeholder={item?.placeholder}
                class='appearance-none block w-full text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:bg-white'
              />
            </div>
          ))}
          <div class='pl-4 pt-2 mt-1'>
            <button
              type='submit'
              class='rounded-md mt-3 border-transparent bg-purple-200 px-4 py-2'
            >
              Add Market
            </button>
          </div>
        </form>
      </details>
    </>
  )
}
