import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Toolbar />
      <Canvas />
    </div>
  )
}
