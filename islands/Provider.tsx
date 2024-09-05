// routes/_app.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink, loggerLink } from '@trpc/client'
import { useSignal } from '@preact/signals'
import { trpc } from '@/trpc/query.ts'
import { ComponentChildren } from 'preact'
import { IS_BROWSER } from '$fresh/runtime.ts'

export default ({ children }: { children: ComponentChildren }) => {
  const queryClient = useSignal(new QueryClient())
  const trpcClient = useSignal(
    trpc.createClient({
      links: [
        loggerLink(),
        httpBatchLink({
          url: `${IS_BROWSER && document.location.origin}/api`,
        }),
      ],
    }),
  )

  return (
    <trpc.Provider client={trpcClient.value} queryClient={queryClient.value}>
      <QueryClientProvider client={queryClient.value}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}
