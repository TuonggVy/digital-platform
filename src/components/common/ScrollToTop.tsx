import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * React Router doesn't reset scroll position on navigation by default. Without this,
 * navigating to a new page while scrolled down leaves the viewport at the old scroll
 * position — which can leave scroll-triggered animations (whileInView, once: true)
 * stuck outside the viewport and never firing, making content look "missing" until
 * a full page reload resets the scroll.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
  }, [pathname])

  return null
}
