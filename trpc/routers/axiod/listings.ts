import axiod from 'axiod'
import axiosThrottle from 'axios-request-throttle'
import { AxiosInstance } from 'https://esm.sh/axios@1.6.2'
import { z } from 'zod'
import capitalize from 'capitalize'

// Get the API_KEY
const API_KEY = Deno.env.get('RAPID_API_PRIMARY_KEY')!
// if (!API_KEY) throw new Error('No API Key')

// Instantiate axiod... Apparently this isn't necessary for axiosThrottle, but it looks nice and simplifies header inclusion...
const rapid = axiod.create({
  baseURL: 'https://zillow-com1.p.rapidapi.com',
  headers: {
    'x-rapidapi-key': API_KEY,
  },
})

// Setup rate limiting
axiosThrottle.use(rapid as unknown as AxiosInstance, { requestsPerSecond: .8 })

const getListingPage = async (
  market: Market,
  isBasementUnfinished = 0,
  hasGarage = false,
  page = 1,
) => {
  const url = '/propertyExtendedSearch'
  const params = {
    ...market,
    isBasementUnfinished,
    hasGarage,
    home_type: 'Houses',
    status_type: 'ForSale',
    sort: 'Newest',
    page: `${page}`,
    daysOn: '1',
    hoa: '0',
  }
  // const params = {
  //   ...market,
  //   home_type: "Houses",
  //   status_type: "ForSale",
  //   sort: "Newest",
  //   page: `${page}`,
  // }

  try {
    const { data } = await rapid.get(url, { params })
    return data
  } catch (error) {
    console.error(error)
  }
}

const getListings = async (
  market: Market,
  isBasementUnfinished = 0,
  hasGarage = false,
  pages: number | null = null,
) => {
  const page1 = await getListingPage(market, isBasementUnfinished, hasGarage)
  let props = []
  let page = 1
  if (page1) {
    props = page1.props

    while ((pages ?? page1.totalPages) > page) {
      const moreProps = await getListingPage(
        market,
        isBasementUnfinished,
        hasGarage,
        ++page,
      )
      if (moreProps) props.push(...moreProps.props)
    }
  }
  return props ? props : []
}

const _getDetails = async (zpid: string) => {
  const params = {
    zpid,
  }
  try {
    const { data } = await rapid.get('/property', {
      params,
    })
    return data
  } catch (error) {
    console.error(error)
  }
}

const getImages = async (zpid: string) => {
  const params = {
    zpid,
  }
  try {
    const { data } = await rapid.get('/images', {
      params,
    })
    return data.images
  } catch (error) {
    console.error(error)
  }
}

const comps = async (zpid: string) => {
  const params = {
    zpid,
  }
  try {
    const { data } = await rapid.get('/similarSales', {
      params,
    })

    const parsed = z.array(z.object({
      lastSoldPrice: z.number().nullish(),
      price: z.number().nullish(),
    })).parse(data)

    const comps = parsed.map((l) => l?.lastSoldPrice ?? l?.price ?? 0).filter((l) =>
      l !== 0
    )

    const normalized = filterOutliers(comps)
    if (normalized.length === 0) return
    const avg = normalized.reduce((a, b) => a + b) / normalized.length
    // console.log( 'comps ', comps.length, normalized.length, avg )
    return avg
  } catch (error) {
    console.error(error)
  }
}

const getWalkScore = async (
  lat: number,
  lon: number,
) => {
  const { data } = await axiod.get(
    'https://api.walkscore.com/score',
    {
      params: {
        lat,
        lon,
        format: 'json',
        transit: 1,
        bike: 1,
        wsapikey: Deno.env.get('WALK_SCORE_API_KEY')!,
      },
    },
  )

  const parsed = z.object({
    walkscore: z.number().default(0).nullish(),
    bike: z.object({
      score: z.number().default(0),
    }).nullish(),
    transit: z.object({
      score: z.number().default(0),
    }).nullish(),
  }).transform((val) => ({
    walk: val?.walkscore ?? 0,
    bike: val.bike?.score ?? 0,
    transit: val.transit?.score ?? 0,
  })).parse(data)

  return parsed
}

// https://transit.walkscore.com/transit/search/stops/?lat=40.6678248&lon=-73.8330133

const getNearbyRoutes = async (
  lat: number,
  lon: number,
) => {
  try {
    const { data } = await axiod.get(
      // axiod is scrubbing the trailing slash, so we have to use a template literal here with the full url
      `https://transit.walkscore.com/transit/search/stops/?lat=${lat}&lon=${lon}&wsapikey=${Deno
        .env.get('WALK_SCORE_API_KEY')!}`,
    )
    const parsed = z.array(z.object({
      distance: z.coerce.number(),
      name: z.coerce.string().transform((val) =>
        val.toLowerCase().replace(/ fs /g, ' ').replace(/ [nesw]b/g, '').replace(
          '&',
          '+',
        ).replace(/ at /g, ' + ').replace('@', '+').replace(/ northbound/g, '')
          .replace(/ southbound/g, '').replace(/ eastbound/g, '').replace(
            / westbound/g,
            '',
          ).replace(/\w+/g, capitalize)
      ),
      // route_summary: z.array(z.object({
      //   category: z.coerce.string(),
      //   description: z.coerce.string().optional(),
      //   agency: z.coerce.string(),
      //   agency_url: z.coerce.string(),
      // })),
      // .transform(({ route_summary, ...rest }) => {
      //   return {
      //     ...rest,
      //     ...route_summary[0],
      //   }
      // })
    })).parse(data)

    return parsed.sort((a, b) => a.distance - b.distance).slice(0, 5)
  } catch (error) {
    console.error(error)
  }
}

function filterOutliers(someArray: number[]) {
  if (someArray.length < 4) {
    return someArray
  }

  const values = someArray.slice().sort((a, b) => a - b) //copy array fast and sort

  //find quartiles
  const quartiles = (values.length / 4) % 1 === 0
  const q1 = quartiles
    ? 1 / 2 * (values[values.length / 4] + values[(values.length / 4) + 1])
    : values[Math.floor(values.length / 4 + 1)]

  const q3 = quartiles
    ? 1 / 2 *
      (values[values.length * (3 / 4)] + values[(values.length * (3 / 4)) + 1])
    : values[Math.ceil(values.length * (3 / 4) + 1)]

  const iqr = q3 - q1
  const maxValue = q3 + iqr * 1.5
  const minValue = q1 - iqr * 1.5
  // console.log('min', minValue, 'max', maxValue)

  return values.filter((x) => (x >= minValue) && (x <= maxValue))
}

export { comps, getImages, getListings, getNearbyRoutes, getWalkScore }
