/** Géométrie des flèches de la carte d'arguments : chemins SVG et milieu. */

export interface Point {
  x: number
  y: number
}

const f = (n: number) => Math.round(n * 10) / 10

/** Courbe lisse passant près des points (B-spline uniforme, comme d3.curveBasis). */
export function smoothPath(p: Point[]): string {
  const first = p[0]
  if (!first) return ''
  if (p.length === 1) return `M${f(first.x)},${f(first.y)}`
  if (p.length === 2) return `M${f(first.x)},${f(first.y)}L${f(p[1]!.x)},${f(p[1]!.y)}`
  let d = `M${f(first.x)},${f(first.y)}`
  d += `L${f((5 * p[0]!.x + p[1]!.x) / 6)},${f((5 * p[0]!.y + p[1]!.y) / 6)}`
  for (let i = 1; i < p.length - 1; i++) {
    const [a, b, c] = [p[i - 1]!, p[i]!, p[i + 1]!]
    d +=
      `C${f((2 * a.x + b.x) / 3)},${f((2 * a.y + b.y) / 3)} ` +
      `${f((a.x + 2 * b.x) / 3)},${f((a.y + 2 * b.y) / 3)} ` +
      `${f((a.x + 4 * b.x + c.x) / 6)},${f((a.y + 4 * b.y + c.y) / 6)}`
  }
  const [a, b] = [p[p.length - 2]!, p[p.length - 1]!]
  d +=
    `C${f((2 * a.x + b.x) / 3)},${f((2 * a.y + b.y) / 3)} ` +
    `${f((a.x + 2 * b.x) / 3)},${f((a.y + 2 * b.y) / 3)} ${f(b.x)},${f(b.y)}`
  return d
}

/** Ligne brisée orthogonale aux coins arrondis (rayon `r`). */
export function roundedPath(p: Point[], r = 12): string {
  const first = p[0]
  if (!first) return ''
  let d = `M${f(first.x)},${f(first.y)}`
  for (let i = 1; i < p.length - 1; i++) {
    const [a, b, c] = [p[i - 1]!, p[i]!, p[i + 1]!]
    const r1 = Math.min(r, Math.hypot(b.x - a.x, b.y - a.y) / 2)
    const r2 = Math.min(r, Math.hypot(c.x - b.x, c.y - b.y) / 2)
    const s = toward(b, a, r1)
    const e = toward(b, c, r2)
    d += `L${f(s.x)},${f(s.y)}Q${f(b.x)},${f(b.y)} ${f(e.x)},${f(e.y)}`
  }
  const last = p[p.length - 1]!
  return p.length > 1 ? `${d}L${f(last.x)},${f(last.y)}` : d
}

function toward(from: Point, to: Point, dist: number): Point {
  const l = Math.hypot(to.x - from.x, to.y - from.y) || 1
  return { x: from.x + ((to.x - from.x) * dist) / l, y: from.y + ((to.y - from.y) * dist) / l }
}

/** Point à mi-longueur de la polyligne, avec l'angle du tronçon (degrés). */
export function midpoint(points: Point[]): { point: Point; angle: number } {
  const lengths: number[] = []
  for (let i = 1; i < points.length; i++) {
    lengths.push(Math.hypot(points[i]!.x - points[i - 1]!.x, points[i]!.y - points[i - 1]!.y))
  }
  let rest = lengths.reduce((s, l) => s + l, 0) / 2
  for (let i = 1; i < points.length; i++) {
    const [a, b, l] = [points[i - 1]!, points[i]!, lengths[i - 1]!]
    if (rest <= l && l > 0) {
      const t = rest / l
      const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
      return { point: { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }, angle }
    }
    rest -= l
  }
  return { point: points[0] ?? { x: 0, y: 0 }, angle: 90 }
}
