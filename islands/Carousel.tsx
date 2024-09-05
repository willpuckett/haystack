import { useSignal } from '@preact/signals'
// import { useRef } from 'preact/hooks'
import {
  IconCircleChevronLeft,
  IconCircleChevronRight,
} from '@/components/Icons.tsx'

type SlideProps = {
  class?: string
  key?: number
  data: {
    text: string
    url: string
  }
  onClick: () => void
}

const Slide = (props: SlideProps) => {
  const { key, data } = props
  const { text, url } = data
  if (props.class === undefined) props.class = ''
  return (
    <div
      key={key}
      class={`${props.class} w-full h-full text-center text-black p-0`}
    >
      <img
        src={url}
        loading='lazy'
        alt={text}
        class='object-cover'
        onClick={props.onClick}
      />
    </div>
  )
}

type CarouselProps = {
  showNavigation?: boolean
  interval?: number
  currentSlide?: number
  automatic?: boolean
  class?: string
  slides: string[]
  color?: string
}

export default (props: CarouselProps) => {
  const SLIDE_DATA = props.slides.map((url) => ({
    text: 'some slide',
    url,
  }))
  const NAVIGATION_COLOR = `hover:text-gray-200 text-white`
  const CHEVRON_STYLE = `absolute z-30 w-10 h-10 ${NAVIGATION_COLOR} cursor-pointer`
  const SHOW_NAVIGATION = props.showNavigation === false ? false : true
  const currentSlide = useSignal(props.currentSlide ? props.currentSlide : 0)
  const automatic = useSignal(props.automatic === false ? false : true)
  // const slideshowRef = useRef<HTMLDivElement>(null)

  const slideClasses = (idx = 0) => {
    const outgoingSlide =
      (currentSlide.value === 0 ? SLIDE_DATA.length : currentSlide.value) - 1
    const incomingSlide = currentSlide.value === SLIDE_DATA.length - 1
      ? 0
      : currentSlide.value + 1
    const TRANSITION_CLASS = () => {
      if (currentSlide.value === idx) return 'translate-x-0 z-20'
      if (incomingSlide === idx) return 'translate-x-full z-10'
      if (outgoingSlide === idx) return '-translate-x-full z-10'
      return 'translate-x-full'
    }
    return `slide absolute top-0 left-0 transition-all ease-in-out duration-700 transform ${TRANSITION_CLASS()}`
  }

  const nextSlide = () =>
    SLIDE_DATA.length === currentSlide.value + 1
      ? currentSlide.value = 0
      : currentSlide.value++

  const previousSlide = () =>
    currentSlide.value === 0
      ? currentSlide.value = SLIDE_DATA.length - 1
      : currentSlide.value--

  const chevronClick = (doCallback = () => {}) => {
    if (automatic.value) automatic.value = false
    return doCallback()
  }

  // const ArrowKeyNavigation = () => {
  //   const keydownHandler = (event: KeyboardEvent) => {
  //     if (automatic.value) automatic.value = false
  //     switch (event.code) {
  //       case 'ArrowLeft':
  //         event.preventDefault()
  //         previousSlide()
  //         break
  //       case 'ArrowRight':
  //         event.preventDefault()
  //         nextSlide()
  //         break
  //       default:
  //         break
  //     }
  //   }
  //   slideshowRef.current?.addEventListener('keydown', keydownHandler)
  //   return () => slideshowRef.current?.removeEventListener('keydown', keydownHandler)
  // }
  // useEffect(ArrowKeyNavigation, [])

  const goToSlide = (slide_index = 0) => {
    if (automatic.value) automatic.value = false
    currentSlide.value = slide_index
  }

  const DotsNavigation = () => (
    <div
      class={'slide_nav z-30 w-full absolute bottom-0 flex justify-center cursor-pointer'}
    >
      {SLIDE_DATA.map((_item, idx) => (
        <div
          class={`px-0 ${NAVIGATION_COLOR}`}
          onClick={() => {
            goToSlide(idx)
          }}
          key={idx}
        >
          {idx === currentSlide.value ? <>●</> : <>○</>}
        </div>
      ))}
    </div>
  )

  return (
    <div
      // ref={slideshowRef}
      class={`slideshow relative flex-1 flex-end p-0 overflow-hidden ${
        props.class !== undefined ? props.class : ''
      }`}
      tabIndex={0}
    >
      <IconCircleChevronLeft
        class={`left-0 ${CHEVRON_STYLE}`}
        style='top: calc(50% - 20px)'
        onClick={() => chevronClick(previousSlide)}
      />
      <IconCircleChevronRight
        class={`right-0 ${CHEVRON_STYLE}`}
        style='top: calc(50% - 20px)'
        onClick={() => chevronClick(nextSlide)}
      />
      {SLIDE_DATA.map((item, idx) => (
        <Slide
          data={item}
          key={idx}
          class={slideClasses(idx)}
          onClick={() => chevronClick(nextSlide)}
        />
      ))}
      {SHOW_NAVIGATION &&
        <DotsNavigation />}
      <Slide
        data={SLIDE_DATA[0]}
        class='opacity-0 pointer-events-none'
        onClick={() => chevronClick(nextSlide)}
      />
    </div>
  )
}
