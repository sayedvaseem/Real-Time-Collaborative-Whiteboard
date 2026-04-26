import { useCanvasStore, Tool } from '../store/canvasStore'

const tools: { id: Tool; label: string }[] = [
  { id: 'pencil', label: '✏️' },
  { id: 'rect', label: '⬜' },
  { id: 'ellipse', label: '⭕' },
  { id: 'text', label: '𝐓' },
]

const colors = [
  '#000000',
  '#ef4444',
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#8b5cf6',
]

export default function Toolbar() {
  const { tool, color, lineWidth, setTool, setColor, setLineWidth } =
    useCanvasStore()

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: 16,
        transform: 'translateY(-50%)',
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
        padding: '10px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 10,
      }}
    >
      {tools.map((t) => (
        <button
          key={t.id}
          onClick={() => setTool(t.id)}
          title={t.id}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: 'none',
            fontSize: 18,
            cursor: 'pointer',
            background: tool === t.id ? '#e0e7ff' : 'transparent',
            outline: tool === t.id ? '2px solid #7F77DD' : 'none',
          }}
        >
          {t.label}
        </button>
      ))}

      <div style={{ height: 1, background: '#eee', margin: '2px 0' }} />

      {colors.map((c) => (
        <button
          key={c}
          onClick={() => setColor(c)}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: c,
            border: color === c ? '3px solid #7F77DD' : '2px solid #ddd',
            cursor: 'pointer',
            alignSelf: 'center',
          }}
        />
      ))}

      <div style={{ height: 1, background: '#eee', margin: '2px 0' }} />

      <input
        type="range"
        min={1}
        max={20}
        value={lineWidth}
        onChange={(e) => setLineWidth(Number(e.target.value))}
        style={{
          width: 36,
          writingMode: 'vertical-lr',
          direction: 'rtl',
          height: 60,
        }}
      />
    </div>
  )
}
