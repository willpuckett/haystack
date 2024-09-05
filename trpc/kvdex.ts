import { collection, kvdex, model } from 'kvdex'

// Uncomment the following two lines to connect to deploy.
// import '@std/dotenv/load'

// const kv = await Deno.openKv("https://api.deno.com/databases/blah-blah-blah/connect");

const kv = await Deno.openKv()

export const db = kvdex(kv, {
  // user: (ctx) =>
  //   ctx.indexableCollection<User>().build({
  //     indices: {
  //       email: 'primary',
  //     },
  //   }),
  market: collection(model<Market>()),
  property: collection(model<Property>(), {
    indices: {
      market: 'secondary', // Non-Unique index
    },
  }),
})
