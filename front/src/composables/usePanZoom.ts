/**
 * Zoom (molette, boutons) et déplacement (glisser) d'un contenu SVG.
 * Le contenu est transformé par `transform` (attribut d'un <g>).
 */
import { computed, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

export interface PanZoomOptions {
  min?: number
  max?: number
  /** Marge laissée autour du contenu par « Ajuster ». */
  padding?: number
}

/** Au-delà de ce déplacement, un appui devient un glissement (pas un clic). */
const DRAG_THRESHOLD = 4

export function usePanZoom(
  viewport: Ref<HTMLElement | null>,
  content: () => { width: number; height: number },
  options: PanZoomOptions = {},
) {
  const { min = 0.2, max = 2.5, padding = 16 } = options
  const scale = ref(1)
  const x = ref(0)
  const y = ref(0)
  const dragging = ref(false)

  const transform = computed(() => `translate(${x.value} ${y.value}) scale(${scale.value})`)
  const clamp = (s: number) => Math.min(max, Math.max(min, s))

  /** Zoom autour d'un point de l'écran (coordonnées relatives au viewport). */
  function zoomAt(factor: number, cx: number, cy: number) {
    const next = clamp(scale.value * factor)
    const k = next / scale.value
    x.value = cx - (cx - x.value) * k
    y.value = cy - (cy - y.value) * k
    scale.value = next
  }

  function zoomBy(factor: number) {
    const el = viewport.value
    zoomAt(factor, (el?.clientWidth ?? 0) / 2, (el?.clientHeight ?? 0) / 2)
  }

  /** Ajuste à la largeur disponible (sans dépasser 100 %), contenu en haut. */
  /** Faux si le viewport n'a pas encore de taille (onglet masqué…). */
  function fit(): boolean {
    const el = viewport.value
    const { width, height } = content()
    if (!el || !el.clientWidth || !width || !height) return false
    const s = clamp(Math.min(1, (el.clientWidth - 2 * padding) / width))
    scale.value = s
    x.value = (el.clientWidth - width * s) / 2
    y.value = padding
    return true
  }

  function onWheel(event: WheelEvent) {
    const el = viewport.value
    if (!el) return
    event.preventDefault()
    const rect = el.getBoundingClientRect()
    const factor = Math.exp(-event.deltaY * (event.deltaMode === 1 ? 0.05 : 0.0015))
    zoomAt(factor, event.clientX - rect.left, event.clientY - rect.top)
  }

  let start: { px: number; py: number; x: number; y: number; id: number } | null = null

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return
    start = { px: event.clientX, py: event.clientY, x: x.value, y: y.value, id: event.pointerId }
  }

  function onPointerMove(event: PointerEvent) {
    if (!start || event.pointerId !== start.id) return
    const dx = event.clientX - start.px
    const dy = event.clientY - start.py
    if (!dragging.value && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
    if (!dragging.value) viewport.value?.setPointerCapture(event.pointerId)
    dragging.value = true
    x.value = start.x + dx
    y.value = start.y + dy
  }

  function onPointerUp(event: PointerEvent) {
    if (!start || event.pointerId !== start.id) return
    start = null
    // Laisse passer le « click » qui suit, puis réactive les clics sur les nœuds.
    setTimeout(() => (dragging.value = false))
  }

  /** Bloque le clic qui termine un glissement (sinon il ouvrirait un nœud). */
  function onClickCapture(event: MouseEvent) {
    if (dragging.value) event.stopPropagation()
  }

  // `wheel` doit être non passif pour empêcher le défilement de la page.
  onMounted(() => viewport.value?.addEventListener('wheel', onWheel, { passive: false }))
  onBeforeUnmount(() => viewport.value?.removeEventListener('wheel', onWheel))

  return {
    scale,
    transform,
    dragging,
    zoomIn: () => zoomBy(1.2),
    zoomOut: () => zoomBy(1 / 1.2),
    fit,
    handlers: {
      pointerdown: onPointerDown,
      pointermove: onPointerMove,
      pointerup: onPointerUp,
      pointercancel: onPointerUp,
    },
    onClickCapture,
  }
}
