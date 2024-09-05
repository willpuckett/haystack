/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import { start } from '$fresh/server.ts'
import manifest from '@/fresh.gen.ts'
import config from '@/fresh.config.ts'
import { pull } from '@/pull.ts'
import { db } from '@/trpc/kvdex.ts'

// Schedule for 10:00 AM every day (UTC)/ 5:00 AM every day (EST)
Deno.cron('Pull the Hay', '0 10 * * *', pull)
// Schedule for 10:30 AM every day (UTC)/ 5:30 AM every day (EST)
Deno.cron('Purge Older Properties', '30 10 * * *', async () => {
  const count = await db.property.count()
  const limit = count - 1000
  limit > 0 && await db.property.deleteMany({ limit, reverse: true })
})

await start(manifest, config)
