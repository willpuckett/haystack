import { z } from 'zod'
import startCase from 'startCase'

export const user = z.object({
  name: z.coerce.string().min(3).max(100),
  email: z.coerce.string().email().min(5).max(100),
  password: z.coerce.string().min(8),
})

export type User = z.infer<typeof user>

export const market = z.object({
  location: z.coerce.string().min(3).max(100),
  maxPrice: z.coerce.number().int().min(0),
  minPrice: z.coerce.number().int().min(0),
  bathsMin: z.coerce.number().int().min(0).max(10),
  bedsMin: z.coerce.number().int().min(0).max(10),
}).refine((obj) => obj.maxPrice > obj.minPrice, {
  message: 'maxPrice must be greater than minPrice',
})

export type Market = z.infer<typeof market>

export const property = z.object({
  propertyType: z.string().toLowerCase().transform((val, ctx) => {
    const parsed = startCase(val)
    if (typeof parsed !== 'string') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Not a string',
      })
      return z.NEVER
    }
    return parsed
  }),
  address: z.string().transform((a, ctx) => {
    const parsed = startCase(a.replace(/\d{5}\s*$/, ''))
    if (typeof parsed !== 'string') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Not a string',
      })
      return z.NEVER
    }
    return parsed
  }),
  imgSrc: z.string(),
  basement: z.boolean().optional(),
  garage: z.boolean().optional(),
  price: z.number().int(),
  bedrooms: z.number().int(),
  longitude: z.number(),
  latitude: z.number(),
  zpid: z.string(),
  bathrooms: z.number().int(),
  livingArea: z.number().int().nullish(),
  currency: z.string(),
  market: z.string(),
  walkScore: z.object({
    walk: z.number().int(),
    bike: z.number().int(),
    transit: z.number().int(),
  }).optional(),
  comps: z.number().optional(),
  images: z.array(z.string()).optional(),
  routes: z.array(z.object({
    category: z.coerce.string(),
    description: z.coerce.string(),
    agency: z.coerce.string(),
    agency_url: z.coerce.string(),
    name: z.coerce.string(),
    distance: z.coerce.number(),
  })).optional(),
})

export type Property = z.infer<typeof property>
