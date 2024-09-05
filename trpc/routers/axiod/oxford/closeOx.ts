import oxford from '@/trpc/routers/axiod/oxford/oxford.json' with { type: 'json' }
import { Property } from '@/trpc/schema.ts'

type House = typeof oxford.AK[0]

// Only the first true matters, so this could be a little faster than the list version in some cases
// 500 feet is 0.095 miles for default d parameter
export const closeOxBool = (
  { address, latitude: p1Lat, longitude: p1Lng }: Property,
  d = 0.095,
) => {
  const state = address.match(/([A-Za-z][A-Za-z])$/g)?.pop()?.toUpperCase()
  if (!state) return false
  // @ts-ignore silly property access
  for (const { latitude: p2Lat, longitude: p2Lng } of oxford[state]) {
    if (
      distance({ p1Lat, p1Lng, p2Lat, p2Lng }) < d
    ) return true
  }
  return false
}

// d: distance in miles within which to search. 500 feet is 0.095 miles for reference
export const closeOxList = (
  { address, latitude: p1Lat, longitude: p1Lng }: Property,
  d = 0.095,
): House[] | false => {
  const state = address.match(/([A-Za-z][A-Za-z])$/g)?.pop()?.toUpperCase()
  return state &&
    // @ts-ignore oh! Ugly any
    oxford[state].map((
      { address, name, latitude: p2Lat, longitude: p2Lng }: House,
    ) =>
      distance({ p1Lat, p1Lng, p2Lat, p2Lng }) < d &&
      { name, address, latitude: p2Lat, longitude: p2Lng }
    ).filter(Boolean)
}

// JavaScript program to calculate Distance Between
// Two Points on Earth
// https://www.geeksforgeeks.org/program-distance-two-points-earth/

type Arg = {
  p1Lat: number
  p1Lng: number
  p2Lat: number
  p2Lng: number
}
/**
 * Calculates Distance Between Two Points on Earth in miles
 * @example
 * // returns 1.2445894158220931 mi
 * distance({ p1Lat: 53.32055555555556, p1Lng: -1.7297222222222221, p2Lat: 53.31861111111111, p2Lng: -1.6997222222222223 });
 * @returns {Number} Returns the distance in miles between the two points p1 and p2.
 */
export const distance = ({
  p1Lat,
  p1Lng,
  p2Lat,
  p2Lng,
}: Arg) => {
  p1Lat = p1Lat * Math.PI / 180
  p2Lat = p2Lat * Math.PI / 180

  // Haversine formula
  const dlon = (p2Lng * Math.PI / 180) - (p1Lng * Math.PI / 180)
  const dlat = p2Lat - p1Lat
  const a = Math.pow(Math.sin(dlat / 2), 2) +
    Math.cos(p1Lat) * Math.cos(p2Lat) *
      Math.pow(Math.sin(dlon / 2), 2)

  const c = 2 * Math.asin(Math.sqrt(a))

  // Use 3956 for Radius of earth in miles.
  return (c * 3956)
}
