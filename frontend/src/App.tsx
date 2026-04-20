import { Routes, Route } from 'react-router-dom'
import { PageTransition } from './components'
import { Home } from './pages/Home'
import { Game } from './pages/Game'
import { End } from './pages/End'
import { Museum } from './pages/Museum'

function App() {
  return (
    <div className="app">
      <PageTransition>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game" element={<Game />} />
            <Route path="/end" element={<End />} />
            <Route path="/museum" element={<Museum />} />
          </Routes>
        </main>
      </PageTransition>
    </div>
  )
}

export default App
