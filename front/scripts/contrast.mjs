// Audit de contraste (WCAG) dans les deux thèmes, infobulle et réponse de révision ouvertes.
// Usage : node scripts/contrast.mjs (avec `npm run preview` lancé).
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// Profil Chrome jetable : évite de réutiliser une instance déjà ouverte.
const PROFILE = mkdtempSync(join(tmpdir(), 'tossefot-chrome-'))

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = 'http://127.0.0.1:4173/#/bk56b_tosafot_behahi_hanaa/'
// Port libre aléatoire : une ancienne instance de Chrome peut garder un port fixe.
const PORT = 9400 + Math.floor(Math.random() * 500)

const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-proxy-server', `--user-data-dir=${PROFILE}`, `--remote-debugging-port=${PORT}`, '--window-size=1400,1000', 'about:blank'])
await sleep(2000)
// Le premier « target » peut être une extension : on prend l'onglet.
const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()
const page = targets.find((t) => t.type === 'page')
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r))
let id = 0
const pending = new Map()
ws.addEventListener('message', ({ data }) => {
  const m = JSON.parse(data)
  if (m.id && pending.has(m.id)) pending.get(m.id)(m.result)
})
const send = (method, params = {}) =>
  new Promise((r) => {
    pending.set(++id, r)
    ws.send(JSON.stringify({ id, method, params }))
  })
const evaluate = async (expression) =>
  (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value

const AUDIT = `(() => {
  // rgb(255, 0, 0, a) ou color(srgb 1 0 0 / a) (valeurs 0-1).
  const parse = (c) => {
    const srgb = c.startsWith('color(')
    const m = c.replace(/^color\\(srgb/, '').match(/[\\d.]+/g)?.map(Number) ?? [0, 0, 0, 0]
    const k = srgb ? 255 : 1
    return { r: m[0] * k, g: m[1] * k, b: m[2] * k, a: m[3] ?? 1 }
  }
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
  const blend = (top, bottom) => ({ r: top.r * top.a + bottom.r * (1 - top.a), g: top.g * top.a + bottom.g * (1 - top.a), b: top.b * top.a + bottom.b * (1 - top.a), a: 1 })
  const background = (el) => {
    const layers = []
    for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c.a > 0) { layers.push(c); if (c.a >= 1) break } }
    let bg = { r: 255, g: 255, b: 255, a: 1 }
    for (const c of layers.reverse()) bg = blend(c, bg)
    return bg
  }
  const bad = []
  for (const el of document.querySelectorAll('body *')) {
    const own = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(' ')
    if (!own || !el.getClientRects().length) continue
    const s = getComputedStyle(el)
    if (s.visibility === 'hidden' || +s.opacity === 0) continue
    const bg = background(el)
    const fg = blend(parse(s.color), bg)
    const [l1, l2] = [lum(fg), lum(bg)].sort((a, b) => b - a)
    const ratio = (l1 + 0.05) / (l2 + 0.05)
    if (ratio < 4.5) bad.push(ratio.toFixed(2) + '  ' + el.className.toString().slice(0, 50) + '  « ' + own.slice(0, 40) + ' »')
  }
  return [...new Set(bad)]
})()`

for (const theme of ['light', 'dark']) {
  await send('Page.navigate', { url: BASE + 'synthesis' })
  await sleep(800)
  await evaluate(`localStorage.setItem('tossefot.preferences.v1', JSON.stringify({ theme: '${theme}', level: 'standard' }))`)
  // Navigation par hash = pas de rechargement : on recharge pour appliquer le thème.
  await send('Page.reload')
  await sleep(1000)
  for (const view of ['context', 'structure?open=I,I.1', 'text', 'map', 'synthesis', 'glossary']) {
    await send('Page.navigate', { url: BASE + view })
    await sleep(1500)
    if (view === 'synthesis') {
      await evaluate(`[...document.querySelectorAll('button')].filter(b => b.textContent.includes('Voir la réponse')).forEach(b => b.click())`)
      await sleep(500)
    }
    if (view.startsWith('structure')) {
      // Ouvre les panneaux Mots / Notes / Sources pour mesurer aussi les citations.
      await evaluate(`document.querySelectorAll('.v-expansion-panel-title').forEach(b => b.click())`)
      await sleep(600)
      await evaluate(`document.querySelector('.he-term')?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))`)
      await sleep(700)
      const tip = await evaluate(`(() => { const t = document.querySelector('.v-tooltip .v-overlay__content'); if (!t) return 'pas d’infobulle'; const s = getComputedStyle(t); return s.color + ' sur ' + s.backgroundColor })()`)
      console.log(`  [${theme}] infobulle : ${tip}`)
    }
    const bad = await evaluate(AUDIT)
    console.log(`[${theme}] ${view.padEnd(20)} ${bad.length ? bad.length + ' textes < 4.5:1' : 'OK'}`)
    for (const b of bad.slice(0, 8)) console.log('      ' + b)
  }
}
ws.close()
chrome.kill()
