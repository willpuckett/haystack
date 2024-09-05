import Carousel from '@/islands/Carousel.tsx'
import { trpc } from '@/trpc/query.ts'
import { Button, Spinner } from '@/components/Input.tsx'
import {
  IconAbacus,
  IconActivityHeartbeat,
  IconBike,
  IconBus,
  IconBusStop,
  IconFlipFlops,
  IconHomeDollar,
  IconTrain,
  IconWalk,
} from '@/components/Icons.tsx'
import { Signal, useSignal } from '@preact/signals'
// import 'masonry-layout'

const bs =
  'inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2'

const listCommon =
  ' w-full relative inline-flex grow items-center px-4 py-3 text-sm bg-white border text-gray-900 border-gray-200 font-medium focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 hover:text-blue-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg border-b cursor-default'

export const Cards = ({ market_id }: { market_id: string }) => {
  const cursor = useSignal<string[]>([])
  const { data, refetch: mutate } = market_id === 'all'
    ? trpc.property.getAll.useQuery({ limit: 12, cursor: cursor.value.at(-1) })
    : trpc.property.get.useQuery({
      market_id,
      limit: 12,
      cursor: cursor.value.at(-1),
    })
  const { mutate: trigger } = trpc.property.delete.useMutation({
    onSuccess: () => mutate(),
  })
  const Card = (
    { listing }: { listing: Property },
  ) => {
    const showRoutes = useSignal(false)
    return (
      <article class='flex-grow-1 font-bold text-xl m-auto max-w-lg lg:max-w-sm rounded overflow-hidden shadow-lg'>
        {(listing.images === undefined || listing.images.length === 1)
          ? (
            <img
              class='w-full'
              src={listing.imgSrc ?? listing.images?.[0]}
              alt={listing.propertyType}
            />
          )
          : (
            <Carousel
              automatic={false}
              slides={listing.images}
            />
          )}
        <div class='px-6 py-4'>
          <address class='font-bold text-xl mb-2'>
            <a
              href={`https://www.zillow.com/homedetails/${listing.zpid}_zpid/`}
              target='_blank'
              rel='noopener noreferrer'
              class='text-gray-600 hover:text-gray-900'
            >
              {listing.address}
            </a>
          </address>
          <p class='text-gray-700 text-base'>
            A {listing.bedrooms} Bed, {listing.bathrooms} Bath {listing.propertyType}
          </p>
        </div>
        <div class='pb-4 pl-4 flex flex-row gap-6'>
          <List listing={listing} />
          <aside class='flex flex-col grow-0 pr-4'>
            {listing.walkScore && (
              <WalkScore
                score={listing.walkScore}
                showRoutes={showRoutes}
                routes={listing.routes}
              />
            )}
            <span>
              <Button
                onClick={() => trigger([listing.zpid])}
              >
                ❌
              </Button>
            </span>
          </aside>
        </div>
        {showRoutes.value && listing.routes?.[0] && (
          <Routes routes={listing.routes} />
        )}
      </article>
    )
  }
  return (
    <>
      {data &&
        // data.cursor &&
        (
          <Pagination
            cursorSignal={cursor}
            cursor={data.cursor}
            del={() => trigger(data.result.map((p) => p.zpid))}
            listingCount={data.result.length}
          />
        )}
      <main class='flex flex-wrap p-1 pt-4 lg:p-6 gap-2 w-full'>
        {!data && <Spinner />}
        {data &&
          data.result.map((property) => (
            <Card
              key={property.id}
              listing={property}
            />
          ))}
      </main>
      {data && data?.result.length > 0 &&
        // data.cursor &&
        (
          <Pagination
            cursorSignal={cursor}
            cursor={data.cursor}
            del={() => trigger(data.result.map((p) => p.zpid))}
            listingCount={data.result.length}
          />
        )}
    </>
  )
}

export const WalkScore = (
  { score, showRoutes, routes }: {
    score: { walk?: number; bike?: number; transit?: number }
    showRoutes: Signal<boolean>
    routes: Property['routes']
  },
) => (
  <>
    {[
      { name: 'walk' as const, icon: <IconWalk class='w-6 h-6' /> },
      { name: 'bike' as const, icon: <IconBike class='w-6 h-6' /> },
      { name: 'transit' as const, icon: <IconBus class='w-6 h-6' /> },
    ].map((s) => {
      const v = score[s.name] ?? 0
      return (
        <span
          class={`${bs} text-md font-semibold text-gray-700 ${
            v > 70
              ? 'bg-green-200'
              : v > 30
              ? 'bg-yellow-200'
              : routes?.[0]
              ? 'bg-red-200'
              : 'bg-gray-100'
          }`}
        >
          {s.name === 'transit'
            ? (
              <button
                onClick={() => showRoutes.value = !showRoutes.value}
                class={routes?.[0] ? 'cursor-pointer' : 'cursor-default'}
              >
                {s.icon}
              </button>
            )
            : (
              <button class='cursor-default'>
                {s.icon}
              </button>
            )}
        </span>
      )
    })}
  </>
)

const List = ({ listing }: { listing: Property }) => (
  <div class='w-48 text-gray-900 bg-white border border-gray-200 rounded-lg grow flex flex-col'>
    <button type='button' class={listCommon}>
      <IconActivityHeartbeat class='w-6 h-6 mr-4' />
      Asking Price ${listing.price.toLocaleString('en-US', { notation: 'compact' })}
    </button>
    {listing.comps && listing.comps > 100000 && (
      <button type='button' class={listCommon}>
        <IconAbacus class='w-6 h-6 mr-4' />
        Compare @ ${listing.comps.toLocaleString('en-US', { notation: 'compact' })}
      </button>
    )}
    {listing.livingArea && (
      <button type='button' class={listCommon}>
        <IconHomeDollar class='w-6 h-6 mr-4' />
        ${(listing.price / listing.livingArea).toFixed(0)} per ft<sup>2</sup>
      </button>
    )}
    {listing.livingArea && (
      <button type='button' class={listCommon}>
        <IconFlipFlops class='w-6 h-6 mr-4' />
        Living Area {listing.livingArea.toLocaleString('en-US')} ft<sup>2</sup>
      </button>
    )}
  </div>
)

const Routes = ({ routes }: { routes: Property['routes'] }) =>
  routes
    ? (
      <aside class='px-4 pt-2 pb-4 flex flex-col'>
        {routes.map((route) => (
          <button
            type='button'
            class={listCommon}
          >
            {route.category.toLowerCase() === 'train'
              ? <IconTrain class='w-6 h-6 mr-4' />
              : <IconBusStop class='w-6 h-6 mr-4' />}
            {route.name} {route.distance.toFixed(1)} mi
          </button>
        ))}
      </aside>
    )
    : <></>

const Pagination = (
  { cursorSignal, cursor, del, listingCount }: {
    cursorSignal: Signal<string[]>
    cursor?: string
    del: () => Promise<void> | void
    listingCount: number
  },
) => (
  <nav class='pt-3 flex-grow-0 flex flex-row justify-center gap-4'>
    <button
      type='button'
      class='inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-200'
      onClick={() => {
        globalThis.scrollTo({ top: 0, behavior: 'smooth' })
        cursorSignal.value = cursorSignal.value.slice(0, -1)
      }}
      disabled={cursorSignal.value.length === 0}
    >
      Previous
    </button>
    <button
      onClick={del}
      type='button'
      class='inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-red-100 hover:bg-red-200 disabled:bg-gray-200'
      disabled={listingCount === 0}
    >
      Clear Page
    </button>
    <button
      onClick={() => {
        globalThis.scrollTo({ top: 0, behavior: 'smooth' })
        if (cursor) {
          cursorSignal.value = [...cursorSignal.value, cursor]
        }
      }}
      type='button'
      class='inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-200'
      disabled={listingCount < 12}
    >
      Next
    </button>
  </nav>
)
