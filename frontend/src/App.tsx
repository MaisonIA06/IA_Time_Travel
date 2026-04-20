import { Routes, Route } from 'react-router-dom'
import { PageTransition } from './components'
import {
  InstrumentTop,
  InstrumentBottom,
  Corners,
  Overlays,
} from './components/instrument'
import { Home } from './pages/Home'
import { Game } from './pages/Game'
import { End } from './pages/End'
import { Museum } from './pages/Museum'
import './App.css'

function App() {
  return (
    <div className="stage">
      <InstrumentTop />

      <div className="viewport">
        <Overlays />
        <Corners />
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game" element={<Game />} />
            <Route path="/end" element={<End />} />
            <Route path="/museum" element={<Museum />} />
          </Routes>
        </PageTransition>
      </div>

      <InstrumentBottom />
    </div>
  )
}

export default App
