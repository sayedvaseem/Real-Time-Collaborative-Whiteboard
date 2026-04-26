import { DrawAction } from '../store/canvasStore'

export function renderActions(
  ctx: CanvasRenderingContext2D,
  actions: DrawAction[]
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  for (const action of actions) {
    ctx.strokeStyle = action.color
    ctx.fillStyle = action.color
    ctx.lineWidth = 'lineWidth' in action ? action.lineWidth : 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (action.type === 'pencil') {
      const pts = action.points
      if (pts.length < 2) continue
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2
        const my = (pts[i].y + pts[i + 1].y) / 2
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my)
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y)
      ctx.stroke()
    } else if (action.type === 'rect') {
      ctx.strokeRect(action.x, action.y, action.w, action.h)
    } else if (action.type === 'ellipse') {
      ctx.beginPath()
      ctx.ellipse(action.cx, action.cy, action.rx, action.ry, 0, 0, Math.PI * 2)
      ctx.stroke()
    } else if (action.type === 'text') {
      ctx.font = `${action.fontSize}px sans-serif`
      ctx.fillText(action.text, action.x, action.y)
    }
  }
}
