import { createGoogleOAuthConfig, createHelpers } from 'kv_oauth'
import type { Plugin } from '$fresh/server.ts'

const id = Deno.env.get('DENO_DEPLOYMENT_ID')

const redirectUri = !id
  ? 'http://localhost:7300/api/oath'
  : 'https://haystack.deno.dev/api/oath'

const { signIn, handleCallback, signOut } = createHelpers(
  createGoogleOAuthConfig(
    {
      redirectUri,
      scope: 'https://www.googleapis.com/auth/userinfo.email',
    },
  ),
)

export default {
  name: 'kv-oauth',
  routes: [
    {
      path: '/api/in',
      async handler(req) {
        return await signIn(req)
      },
    },
    {
      path: '/api/oath',
      async handler(req) {
        // Return object also includes `accessToken` and `sessionId` properties.
        const { response } = await handleCallback(req)
        return response
      },
    },
    {
      path: '/api/out',
      async handler(req) {
        return await signOut(req)
      },
    },
    // {
    //   path: "/protected",
    //   async handler(req) {
    //     return await getSessionId(req) === undefined
    //       ? new Response("Unauthorized", { status: 401 })
    //       : new Response("You are allowed");
    //   },
    // },
  ],
} as Plugin
