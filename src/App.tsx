import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AppRoutes } from '@/routes/AppRoutes'
import { ScrollToTop } from '@/components/common/ScrollToTop'

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppRoutes />
      </BrowserRouter>
    </HelmetProvider>
  )
}

export default App
