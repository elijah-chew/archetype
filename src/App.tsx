import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import { SessionProvider } from './lib/session'
import ArchetypeDetail from './pages/ArchetypeDetail'
import Archetypes from './pages/Archetypes'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import PathDetail from './pages/PathDetail'
import Paths from './pages/Paths'
import People from './pages/People'
import PersonDetail from './pages/PersonDetail'
import Plan from './pages/Plan'
import PresencePage from './pages/PresencePage'
import Result from './pages/Result'
import StyleCodePage from './pages/StyleCodePage'
import Test from './pages/Test'

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0 })
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <SessionProvider>
      <div className="font-helvetica-neue min-h-screen flex flex-col bg-brand-cream text-brand-dark">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-brand-dark focus:text-brand-cream focus:px-4 focus:py-2 focus:text-sm"
        >
          Skip to content
        </a>
        <ScrollManager />
        <Navbar />
        <main id="main" className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/archetypes" element={<Archetypes />} />
            <Route path="/archetypes/:id" element={<ArchetypeDetail />} />
            <Route path="/people" element={<People />} />
            <Route path="/people/:slug" element={<PersonDetail />} />
            <Route path="/paths" element={<Paths />} />
            <Route path="/paths/:id" element={<PathDetail />} />
            <Route path="/test" element={<Test />} />
            <Route path="/result" element={<Result />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/style-code" element={<StyleCodePage />} />
            <Route path="/presence" element={<PresencePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </SessionProvider>
  )
}
