import { Routes, Route } from 'react-router-dom'
import { CyberGrid, PageTransition } from './components'
import { Home } from './pages/Home'
import { Game } from './pages/Game'
import { End } from './pages/End'

function App() {
  return (
    <div className="app">
      {/* Grille cyber subtile en arrière-plan */}
      <CyberGrid color="mixed" speed="slow" opacity={0.15} />

      <PageTransition>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game" element={<Game />} />
            <Route path="/end" element={<End />} />
          </Routes>
        </main>
      </PageTransition>
    </div>
  )
}

export default App
