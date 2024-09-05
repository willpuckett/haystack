import '@std/dotenv/load'
import axiod from 'axiod'
import { z } from 'zod'
import { pooledMap } from '@std/async/pool'

const key = Deno.env.get('GOOGLE_MAPS_API_KEY')!

export const states = [
  'AK',
  'AL',
  'AR',
  'AZ',
  'CA',
  'CO',
  'CT',
  'DC',
  'DE',
  'FL',
  'GA',
  'HI',
  'IA',
  'ID',
  'IL',
  'IN',
  'KS',
  'KY',
  'LA',
  'MA',
  'MD',
  'ME',
  'MI',
  'MN',
  'MO',
  'MS',
  'MT',
  'NC',
  'ND',
  'NE',
  'NH',
  'NJ',
  'NM',
  'NV',
  'NY',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VA',
  'VT',
  'WA',
  'WI',
  'WV',
  'WY',
]

const buildState = async (data: string) => {
  const thisState: {
    name: string
    address: string
    latitude: number
    longitude: number
  }[] = []
  for (
    const match of data.matchAll(
      /<b>(..*)<\/b> &nbsp;<\/td>\n<td .*?<\/td><\/tr>\n<tr><td>(..*) &nbsp;<\/td>\n.*?\n<tr><td>(..*) &nbsp;<\/td>/g,
    )
  ) {
    try {
      const address = `${match[2]}, ${match[3]}`
      const { data } = await axiod.get(
        'https://maps.googleapis.com/maps/api/geocode/json',
        {
          params: {
            address,
            key,
          },
        },
      )
      // console.log(data)

      const { lat, lng } = z.object({
        lat: z.number(),
        lng: z.number(),
      }).parse(data.results?.[0].geometry.location)

      const house = {
        name: match[1],
        address: `${match[2]}, ${match[3]}`,
        latitude: lat,
        longitude: lng,
      }
      //   console.log(house)
      thisState.push(house)
    } catch (error) {
      console.log(error)
    }
  }
  return thisState
}

const hugeObj: {
  state: string
  houses: {
    name: string
    address: string
    latitude: number
    longitude: number
  }[]
}[] = []

const startState = async (state: string) => {
  const params = new URLSearchParams()
  params.append('state', state)
  const { data } = await axiod.post(
    'https://www.oxfordhouse.org/directory_listing.php',
    params,
  )
  await Deno.writeTextFile(
    `./trpc/routers/axiod/oxford/states/${state}.http`,
    data,
    { create: true },
  )
  const houses = await buildState(data)
  houses && hugeObj.push({ state, houses })
  return houses
}

const _main = async () => {
  const results = pooledMap(
    5,
    states,
    startState,
  )

  for await (const value of results) {
    console.log(value)
  }

  await Deno.writeTextFile(
    `./trpc/routers/axiod/oxford/oxford.json`,
    JSON.stringify(hugeObj),
    { create: true },
  )

  console.log('😅')
}

// How many oxford houses are there?
// const o = oxford_array.map((item) => {
//     console.log(item.state, item.houses.length)
//     return item.houses.length
//     }
// ).reduce((a, b) => a + b, 0)
// console.log(o)

// const { result } = await caller.market.getAll()

// result.map(async ({ id }) => {
//   const { result: properties } = await caller.property.get({
//     market_id: id as string,
//   })
//   console.log(properties.map((p) => closeOxList(p)))
// })

// Transform array into obj for easier access
// const newford = {}

// oxford_array.forEach((item, i ) => {
//     newford[item.state] = item.houses
//     }
// )

// console.log(newford)
// await Deno.writeTextFile("./trpc/routers/axiod/oxford/oxford.json", JSON.stringify(newford, null, 2))
