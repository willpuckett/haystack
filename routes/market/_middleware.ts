export const handler: MiddlewareHandler = (req, ctx) => {
  // console.log(req.headers.get('cookie'))
  if (!ctx.state.loggedIn) {
    const headers = new Headers(req.headers)
    headers.set('Location', '/api/in')
    return new Response(null, { status: 302, headers })
  }
  return ctx.next()
}
