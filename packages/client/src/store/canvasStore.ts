import { create } from 'zustand'

export type Point = { x: number; y: number }

export type DrawAction =
  | {
      id: string
      type: 'pencil'
      points: Point[]
      color: string
      lineWidth: number
    }
  | {
      id: string
      type: 'rect'
      x: number
      y: number
      w: number
      h: number
      color: string
      lineWidth: number
    }
  | {
      id: string
      type: 'ellipse'
      cx: number
      cy: number
      rx: number
      ry: number
      color: string
      lineWidth: number
    }
  | {
      id: string
      type: 'text'
      x: number
      y: number
      text: string
      color: string
      fontSize: number
    }

export type Tool = 'pencil' | 'rect' | 'ellipse' | 'text'

interface CanvasStore {
  tool: Tool
  color: string
  lineWidth: number
  past: DrawAction[]
  future: DrawAction[]
  setTool: (t: Tool) => void
  setColor: (c: string) => void
  setLineWidth: (w: number) => void
  addAction: (a: DrawAction) => void
  undo: () => void
  redo: () => void
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  tool: 'pencil',
  color: '#000000',
  lineWidth: 3,
  past: [],
  future: [],
  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),
  setLineWidth: (lineWidth) => set({ lineWidth }),
  addAction: (action) =>
    set((s) => ({ past: [...s.past, action], future: [] })),
  undo: () =>
    set((s) => {
      if (!s.past.length) return s
      const next = [...s.past]
      const undone = next.pop()!
      return { past: next, future: [undone, ...s.future] }
    }),
  redo: () =>
    set((s) => {
      if (!s.future.length) return s
      const next = [...s.future]
      const redone = next.shift()!
      return { past: [...s.past, redone], future: next }
    }),
}))
