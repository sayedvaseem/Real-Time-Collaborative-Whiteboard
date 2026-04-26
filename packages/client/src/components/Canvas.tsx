import { useEffect, useRef, useState } from 'react'
import { useCanvasStore, Point, DrawAction } from '../store/canvasStore'
import { renderActions } from '../utils/renderActions'

let actionId = 0
const newId = () => String(++actionId)

export default function Canvas() {
  const [textInput, setTextInput] = useState<{ x: number; y: number } | null>(
    null
  )
  const [textValue, setTextValue] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { tool, color, lineWidth, past, future, addAction, undo, redo } =
    useCanvasStore()
  const [drawing, setDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const [currentPoints, setCurrentPoints] = useState<Point[]>([])

  // Redraw whenever past changes (add, undo, redo)
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    renderActions(ctx, past)
  }, [past, future])

  // Resize handler
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const ctx = canvas.getContext('2d')
      if (ctx) renderActions(ctx, past)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [past])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        undo()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

  const getPoint = (e: React.PointerEvent): Point => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const onPointerDown = (e: React.PointerEvent) => {
    const pt = getPoint(e)

    // Text tool: place an input at click position
    if (tool === 'text') {
      setTextInput(pt)
      setTextValue('')
      return
    }

    // ... rest of your existing onPointerDown code stays below
    setDrawing(true)
    setStartPoint(pt)
    setCurrentPoints([pt])
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawing) return
    const pt = getPoint(e)
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    if (tool === 'pencil') {
      const pts = [...currentPoints, pt]
      setCurrentPoints(pts)
      renderActions(ctx, past)
      // Draw live preview
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2
        const my = (pts[i].y + pts[i + 1].y) / 2
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my)
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y)
      ctx.stroke()
    } else if (tool === 'rect' && startPoint) {
      renderActions(ctx, past)
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.strokeRect(
        startPoint.x,
        startPoint.y,
        pt.x - startPoint.x,
        pt.y - startPoint.y
      )
    } else if (tool === 'ellipse' && startPoint) {
      renderActions(ctx, past)
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      const rx = Math.abs(pt.x - startPoint.x) / 2
      const ry = Math.abs(pt.y - startPoint.y) / 2
      const cx = startPoint.x + (pt.x - startPoint.x) / 2
      const cy = startPoint.y + (pt.y - startPoint.y) / 2
      ctx.beginPath()
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!drawing || !startPoint) return
    const pt = getPoint(e)
    setDrawing(false)

    let action: DrawAction | null = null

    if (tool === 'pencil') {
      action = {
        id: newId(),
        type: 'pencil',
        points: currentPoints,
        color,
        lineWidth,
      }
    } else if (tool === 'rect') {
      action = {
        id: newId(),
        type: 'rect',
        x: startPoint.x,
        y: startPoint.y,
        w: pt.x - startPoint.x,
        h: pt.y - startPoint.y,
        color,
        lineWidth,
      }
    } else if (tool === 'ellipse') {
      const rx = Math.abs(pt.x - startPoint.x) / 2
      const ry = Math.abs(pt.y - startPoint.y) / 2
      const cx = startPoint.x + (pt.x - startPoint.x) / 2
      const cy = startPoint.y + (pt.y - startPoint.y) / 2
      action = {
        id: newId(),
        type: 'ellipse',
        cx,
        cy,
        rx,
        ry,
        color,
        lineWidth,
      }
    }

    if (action) addAction(action)
    setCurrentPoints([])
    setStartPoint(null)
  }
  const onTextCommit = () => {
    if (!textValue.trim() || !textInput) {
      setTextInput(null)
      setTextValue('')
      return
    }
    const action: DrawAction = {
      id: newId(),
      type: 'text',
      x: textInput.x,
      y: textInput.y,
      text: textValue,
      color,
      fontSize: 20,
    }
    addAction(action)
    setTextInput(null)
    setTextValue('')
  }
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          cursor: tool === 'text' ? 'text' : 'crosshair',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
      {textInput && (
        <input
          autoFocus
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          onBlur={onTextCommit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onTextCommit()
            if (e.key === 'Escape') {
              setTextInput(null)
              setTextValue('')
            }
          }}
          style={{
            position: 'absolute',
            left: textInput.x,
            top: textInput.y - 20,
            background: 'transparent',
            border: 'none',
            borderBottom: '1.5px dashed #7F77DD',
            outline: 'none',
            fontSize: 20,
            color: color,
            fontFamily: 'sans-serif',
            minWidth: 120,
            zIndex: 20,
          }}
        />
      )}
    </div>
  )
}
