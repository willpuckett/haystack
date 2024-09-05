import { Footer, Header } from '@/components/Nav.tsx'
import Provider from '@/islands/Provider.tsx'
import { PageProps } from '$fresh/server.ts'

export default ({ Component, url, state }: PageProps) => (
  <html>
    <head>
      <meta charset='utf-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      <title>Haystack</title>
      <link rel='stylesheet' href='/styles.css' />
    </head>
    <body>
      <div class='m-auto max-w-screen-md lg:max-w-screen-xl'>
        <Header url={url} loggedIn={!!state.loggedIn} />
        <div class='p-4 md:p-6 mt-4'>
          <Provider>
            <Component />
          </Provider>
        </div>
        <Footer />
      </div>
    </body>
  </html>
)
