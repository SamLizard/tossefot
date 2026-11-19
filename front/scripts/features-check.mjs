// Vérifie citations des sources, termes du glossaire, segments des questions de révision
// et explications des flèches. Usage : node scripts/features-check.mjs (avec `npm run preview` lancé).
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
const PROFILE = mkdtempSync(join(tmpdir(), 'tossefot-chrome-'))
const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = process.env.FEATURES_URL ?? 'http://127.0.0.1:4173/#/bk56b_tosafot_behahi_hanaa/'
const PORT = 9400 + Math.floor(Math.random() * 500)
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-proxy-server', `--user-data-dir=${PROFILE}`, `--remote-debugging-port=${PORT}`, '--window-size=1400,1000', 'about:blank'])
await sleep(2000)
const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()
// Des extensions imposées peuvent ouvrir leurs propres pages : on prend l'onglet about:blank.
const page = targets.find((t) => t.type === 'page' && t.url === 'about:blank') ?? targets.find((t) => t.type === 'page')
console.log('onglet :', page.url)
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r))
let id = 0
const pending = new Map()
const errors = []
ws.addEventListener('message', ({ data }) => {
  const msg = JSON.parse(data)
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result ?? { result: { value: 'ERREUR ' + JSON.stringify(msg.error) } })
    pending.delete(msg.id)
  }
  if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description)
  if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type)) {
    errors.push(`[${msg.params.type}] ` + msg.params.args.map((a) => a.value ?? a.description).join(' '))
  }
})
const send = (method, params = {}) =>
  new Promise((r) => {
    pending.set(++id, r)
    ws.send(JSON.stringify({ id, method, params }))
  })
const evaluate = async (expression) =>
  (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value
const results = []
const check = (name, ok, detail = '') => {
  results.push(ok)
  console.log(`${ok ? 'OK   ' : 'ÉCHEC'} ${name}${detail ? ' — ' + detail : ''}`)
}
await send('Runtime.enable')
// Le premier chargement échoue parfois (chrome-error) juste après le démarrage de Chrome : on réessaie.
const go = async (url, wait) => {
  for (let i = 0; i < 4; i++) {
    await send('Page.navigate', { url })
    await sleep(wait)
    if ((await evaluate('location.href')).startsWith('http')) return
  }
  throw new Error('page inaccessible : ' + url)
}
// 1. Sources et glossaire du segment s1.
await go(BASE + 'structure?open=I', 3000)
const sources = await evaluate(`(async () => {
  const card = document.querySelector('[data-segment-id="s1"]')
  if (!card) return { error: 'pas de carte s1' }
  const title = [...card.querySelectorAll('.v-expansion-panel-title')].find((t) => t.textContent.includes('Sources'))
  title?.click()
  await new Promise((r) => setTimeout(r, 800))
  const quote = card.querySelector('.source-quote p[lang="he"]')?.textContent ?? ''
  const chip = card.querySelector('a.v-chip[href*="sefaria"]')
  const glossary = [...card.querySelectorAll('.v-chip')].filter((c) => c.getAttribute('aria-label')?.includes('glossaire'))
  return { quote: quote.slice(0, 30), href: chip?.getAttribute('href'), target: chip?.getAttribute('target'), rel: chip?.getAttribute('rel'), glossary: glossary.map((c) => c.textContent.trim()) }
})()`)
check('s1 : citation hébraïque', Boolean(sources.quote), sources.quote ?? sources.error)
check('s1 : puce de lieu', sources.href === 'https://www.sefaria.org/Bava_Kamma.56b.9-11' && sources.target === '_blank' && sources.rel === 'noopener', sources.href)
check('s1 : termes du glossaire', sources.glossary?.length > 0, sources.glossary?.join(', '))
// Clic sur un terme → vue Glossaire avec la recherche préremplie.
const glossary = await evaluate(`(async () => {
  const chip = [...document.querySelectorAll('[data-segment-id="s1"] .v-chip')].find((c) => c.getAttribute('aria-label')?.includes('glossaire'))
  chip?.click()
  await new Promise((r) => setTimeout(r, 1500))
  return { hash: decodeURIComponent(location.hash), search: document.querySelector('main input')?.value }
})()`)
check('clic terme → glossaire filtré', glossary.hash.includes('/glossary') && Boolean(glossary.search), JSON.stringify(glossary))
// 2. Questions de révision.
await go(BASE + 'synthesis', 2500)
const review = await evaluate(`(async () => {
  const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Voir la réponse'))
  btn?.click()
  await new Promise((r) => setTimeout(r, 800))
  const chips = [...document.querySelectorAll('.v-chip')].filter((c) => c.getAttribute('aria-label')?.startsWith('Ouvrir le segment'))
  chips[0]?.click()
  await new Promise((r) => setTimeout(r, 1000))
  const drawer = [...document.querySelectorAll('.v-navigation-drawer--active')].map((d) => d.innerText).join(' ')
  return { chips: chips.map((c) => c.textContent.trim()), drawer: drawer.length, hasId: drawer.includes(chips[0]?.textContent.trim() ?? '§') }
})()`)
check('révision : puces de segments', review.chips?.length > 0, review.chips?.join(', '))
check('révision : clic ouvre le panneau', review.drawer > 50, `texte du panneau=${review.drawer}, id visible=${review.hasId}`)
// 3. Carte : survol d'une flèche, puis d'un nœud.
await go(BASE + 'map', 3000)
const edge = await evaluate(`(async () => {
  const hit = document.querySelector('.map-edge__hit')
  if (!hit) return { error: 'pas de zone de survol' }
  const r = hit.getBoundingClientRect()
  const init = { bubbles: true, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2 }
  hit.dispatchEvent(new MouseEvent('mouseenter', init))
  hit.dispatchEvent(new MouseEvent('mousemove', init))
  await new Promise((r) => setTimeout(r, 800))
  const tip = document.querySelector('.v-tooltip.v-overlay--active .v-overlay__content')?.innerText ?? ''
  hit.dispatchEvent(new MouseEvent('mouseleave', init))
  return { count: document.querySelectorAll('.map-edge__hit').length, tip: tip.slice(0, 90), pe: getComputedStyle(hit).pointerEvents }
})()`)
check('carte : explication au survol d’une flèche', Boolean(edge.tip?.includes('→')), `${edge.count} zones, pointer-events=${edge.pe} : ${edge.tip ?? edge.error}`)
await sleep(500)
const node = await evaluate(`(async () => {
  // Premier nœud d'où part une flèche expliquée.
  let text = ''
  for (const n of [...document.querySelectorAll('.map-node')].slice(0, 6)) {
    n.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await new Promise((r) => setTimeout(r, 600))
    text = [...document.querySelectorAll('.v-tooltip.v-overlay--active .v-overlay__content')].map((t) => t.innerText).join(' | ')
    n.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
    if (text.includes('Liens')) break
  }
  return text.slice(text.indexOf('Liens'), text.indexOf('Liens') + 160)
})()`)
check('carte : « Liens » dans l’infobulle d’un nœud', String(node).includes('Liens'), String(node).replace(/\s+/g, ' '))
check('aucune erreur console', errors.length === 0, [...new Set(errors)].join('\n'))
console.log(results.every(Boolean) ? 'TOUT OK' : 'DES VÉRIFICATIONS ONT ÉCHOUÉ')
ws.close()
chrome.kill()
