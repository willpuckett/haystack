import {
  IconBrandZalando,
  IconHome,
  IconLogin,
  IconLogout,
  IconNeedle,
  IconStack,
} from '@/components/Icons.tsx'

export const Header = ({ url, loggedIn }: { url: URL; loggedIn: boolean }) => {
  const menus = {
    loggedIn: [
      { name: <IconHome class='w-6 h-6' />, path: '/' },
      { name: 'Markets', path: '/market' },
      { name: 'Properties', path: '/property/all' },
      { name: <IconLogout class='w-6 h-6' />, path: '/api/out?success_url=/' },
    ],
    loggedOut: [
      { name: <IconHome class='w-6 h-6' />, path: '/' },
      {
        name: <IconLogin class='w-6 h-6' />,
        path: '/api/in',
      },
    ],
  }
  // const menu =  menus.oggedIn
  const menu = loggedIn ? menus.loggedIn : menus.loggedOut
  return (
    <div class='bg-white w-full py-6 px-8 flex flex-col sm:flex-row gap-4'>
      <div class='flex items-center flex-1'>
        <IconStack class='w-6 h-6' />
        <div class='text-2xl  ml-1 font-bold'>
          Haystack
        </div>
      </div>
      <ul class='flex items-center gap-6'>
        {menu.map((m) => (
          <li>
            <a
              href={m.path}
              class={`text-gray-500 hover:text-gray-700 py-1 border-gray-500 ${
                url.pathname.startsWith(`/${m.path.split('/')[1]}`)
                  ? ' font-bold border-b-2'
                  : ''
              }`}
            >
              {m.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export const Footer = () => {
  const menus = [
    {
      title: 'Documentation',
      children: [
        { name: 'Getting Started', href: '#' },
        { name: 'Guide', href: '#' },
        { name: 'API', href: '#' },
        { name: 'Showcase', href: '#' },
        { name: 'Pricing', href: '#' },
      ],
    },
    {
      title: 'Community',
      children: [
        { name: 'Forum', href: '#' },
        { name: 'Discord', href: '#' },
      ],
    },
  ]

  return (
    <div class='bg-white flex flex-col md:flex-row w-full max-w-screen-xl gap-8 md:gap-16 px-8 py-8 text-sm'>
      <div class='flex-1'>
        <div class='flex items-center gap-1'>
          <IconNeedle class='inline-block' />
          <div class='font-bold text-2xl'>
            Haystack
          </div>
        </div>
        <div class='text-gray-500'>
          Pinpoint your next home.
        </div>
      </div>

      {menus.map((item) => (
        <div class='mb-4' key={item.title}>
          <div class='font-bold'>{item.title}</div>
          <ul class='mt-2'>
            {item.children.map((child) => (
              <li class='mt-2' key={child.name}>
                <a
                  class='text-gray-500 hover:text-gray-700'
                  href={child.href}
                >
                  {child.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div class='text-gray-500 space-y-2'>
        <div class='text-xs'>
          Copyright © 2023<br />
          All right reserved.
        </div>

        <a
          href='https://github.com/denoland/fresh'
          class='inline-block hover:text-black'
        >
          <IconBrandZalando />
        </a>
      </div>
    </div>
  )
}

export const BreadCrumb = ({ market }: { market: string }) => {
  return (
    <nav
      class='flex px-5 py-3 max-w-screen-xl text-gray-700 border border-gray-200 rounded-lg bg-gray-50'
      aria-label='Breadcrumb'
    >
      <ol class='inline-flex items-center space-x-1 md:space-x-3'>
        <li class='inline-flex items-center'>
          <a
            href='/'
            class='inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 '
          >
            <svg
              aria-hidden='true'
              class='w-4 h-4 mr-2'
              fill='currentColor'
              viewBox='0 0 20 20'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path d='M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z'>
              </path>
            </svg>
            Home
          </a>
        </li>
        <li>
          <div class='flex items-center'>
            <svg
              aria-hidden='true'
              class='w-6 h-6 text-gray-400'
              fill='currentColor'
              viewBox='0 0 20 20'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                fill-rule='evenodd'
                d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                clip-rule='evenodd'
              >
              </path>
            </svg>
            <a
              href='/market'
              class='ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2'
            >
              Markets
            </a>
          </div>
        </li>
        <li aria-current='page'>
          <div class='flex items-center'>
            <svg
              aria-hidden='true'
              class='w-6 h-6 text-gray-400'
              fill='currentColor'
              viewBox='0 0 20 20'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                fill-rule='evenodd'
                d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                clip-rule='evenodd'
              >
              </path>
            </svg>
            <span class='ml-1 text-sm font-medium text-gray-500 md:ml-2'>
              {market}
            </span>
          </div>
        </li>
      </ol>
    </nav>
  )
}
