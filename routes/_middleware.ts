import { getSessionId } from 'kv_oauth'

export const handler: MiddlewareHandler = async (req, ctx) => {
  const sessionId = await getSessionId(req)
  ctx.state.loggedIn = sessionId !== undefined
  return ctx.next()
}
