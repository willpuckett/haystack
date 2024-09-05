// ### KVDEX ###
declare type Market = import('@/trpc/schema.ts').Market
declare type Property = import('@/trpc/schema.ts').Property

// ### tRPC ###
type FetchCreateContextFnOptions =
  import('@trpc/server/adapters/fetch').FetchCreateContextFnOptions

/** The Middleware ctx state for trpc. */
declare interface CreateContextOptions extends FetchCreateContextFnOptions {
  state: State
}

declare type AppRouter = typeof import('@/trpc/routers/app.ts').appRouter
declare type RouterInput = import('@trpc/server').inferRouterInputs<AppRouter>
declare type RouterOutput = import('@trpc/server').inferRouterOutputs<AppRouter>

// ### FRESH ###
// The remainder of types weave our state through the application

/** The Middleware ctx state for Fresh server. */
declare interface State {
  loggedIn: boolean
}

/**  With async components, we don't need to pass data via handlers, but fresh freaks out with the never type*/

declare type Handler<T = undefined, S = State> = import('$fresh/server.ts').Handler<
  T,
  S
>

declare type Handlers<T = undefined, S = State> =
  import('$fresh/src/server/types.ts').Handlers<T, S>

/**  All our middleware shares State*/
declare type MiddlewareHandler = import('$fresh/server.ts').MiddlewareHandler<State>

declare type AsyncRoute<T = never, S = State> =
  import('$fresh/src/server/types.ts').AsyncRoute<
    T,
    S
  >
