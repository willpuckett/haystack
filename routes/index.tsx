import {
  IconBus,
  IconChevronRight,
  IconEyeglass,
  IconMap,
} from '@/components/Icons.tsx'

export default () => (
  <>
    <Hero />
    <Features />
  </>
)

export const Features = () => {
  const featureItems = [
    {
      icon: IconEyeglass,
      description:
        'Spend Less Time Searching. Haystack scours property listings, so you don’t have to. Look only at the properties that meet your criteria.',
      link: '#',
    },
    {
      icon: IconMap,
      description:
        'Find the Perfect Place. Haystack helps you find the perfect place to live. We’ll help you find the best neighborhood for you and your people.',
    },
    {
      icon: IconBus,
      description:
        'Get Around Easily. Haystack helps you find the best places to live based on trainsit accessibility, so you can spend less time.',
      link: '#',
    },
  ]

  return (
    <div class='flex flex-col md:flex-row gap-8 bg-white p-8'>
      {featureItems.map((item) => {
        return (
          <div class='flex-1 space-y-2'>
            <div class='bg-indigo-600 inline-block p-3 rounded-xl text-white'>
              <item.icon class='w-10 h-10' />
            </div>
            <p class='text-xl'>
              {item.description}
            </p>

            {item.link &&
              (
                <a class='block' href={item.link}>
                  <p class='text-blue-500 cursor-pointer hover:underline inline-flex items-center group'>
                    Read More{' '}
                    <IconChevronRight class='inline-block w-5 h-5 transition group-hover:translate-x-0.5' />
                  </p>
                </a>
              )}
          </div>
        )
      })}
    </div>
  )
}

export const Hero = () => (
  <div
    class='w-full flex px-8 h-96 justify-center items-center flex-col gap-8 bg-cover bg-center bg-no-repeat bg-gray-100 rounded-xl text-white'
    style="background-image:linear-gradient(rgba(10, 400, 10, 0.1),rgba(800, 0, 300, 0.4)), url('/hero.svg');"
  >
    <div class='space-y-4 text-center'>
      <h1 class='text-6xl text-indigo-100 inline-block font-bold'>
        Haystack
      </h1>
      <br />
      <br />
      <p class='text-2xl max-w-lg text-indigo-100 flex'>
        Haystack scours property listings
      </p>
    </div>
  </div>
)
