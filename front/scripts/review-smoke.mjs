// Test de fumée du mode relecture : commenter → page Relecture → prompt → JSON corrigé → réponses de l'IA.
// Usage : node scripts/review-smoke.mjs (avec `npm run preview` lancé sur 127.0.0.1:4173).
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PROFILE = mkdtempSync(join(tmpdir(), 'tossefot-chrome-'))
const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const ORIGIN = process.env.TOSSEFOT_ORIGIN ?? 'http://127.0.0.1:4173/'
const SLUG = 'bk56b_tosafot_behahi_hanaa'
const DOC_ID = 'bk56b-tosafot-behahi-hanaa'
const PORT = 9400 + Math.floor(Math.random() * 500)
const COMMENT = 'Test relecture : préciser selon רש״י.'

const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-proxy-server', `--user-data-dir=${PROFILE}`, `--remote-debugging-port=${PORT}`, 'about:blank'])
await sleep(2000)
const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()
const page = targets.find((t) => t.type === 'page')
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
const navigate = async (hash, wait = 2500) => {
  await send('Page.navigate', { url: ORIGIN + '#/' + hash })
  await sleep(wait)
}
const mainText = () => evaluate('document.querySelector("main")?.innerText ?? ""')
// Clic sur le bouton dont le texte (ou aria-label) correspond.
const clickButton = (pattern, scope = 'document') =>
  evaluate(`(() => {
    const re = new RegExp(${JSON.stringify(pattern)})
    const b = [...${scope}.querySelectorAll('button, a.v-btn')].find(b => re.test(b.textContent) || re.test(b.getAttribute('aria-label') ?? ''))
    b?.click(); return Boolean(b)
  })()`)

let failures = 0
const check = (label, ok, detail = '') => {
  if (!ok) failures++
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ' — ' + detail : ''}`)
}

await send('Runtime.enable')
await send('Page.enable')
// Largeur « bureau » : sous md, l'indicateur n'affiche que l'icône.
await send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false })

// 1. Mode relecture activé, remarques effacées.
await navigate(`${SLUG}/context`, 2000)
await evaluate(`(() => {
  const key = 'tossefot.preferences.v1'
  const prefs = JSON.parse(localStorage.getItem(key) ?? '{}')
  localStorage.setItem(key, JSON.stringify({ ...prefs, reviewMode: true }))
  for (const k of Object.keys(localStorage)) if (k.startsWith('tossefot.review.v1.')) localStorage.removeItem(k)
  return true
})()`)
await send('Page.reload')
await sleep(2000)
check('indicateur « Mode relecture » dans la barre', /Mode relecture/.test(await evaluate('document.querySelector("header")?.innerText ?? ""')))

// 2. Structure, nœud I ouvert : on sélectionne un passage du segment s1 puis on clique sur « Commenter ».
await navigate(`${SLUG}/structure?open=I`)
const opened = await evaluate(`(() => {
  const card = document.querySelector('[data-segment-id="s1"]')
  const he = card?.querySelector('.segment-he')
  if (he) { const r = document.createRange(); r.selectNodeContents(he); const s = getSelection(); s.removeAllRanges(); s.addRange(r) }
  const b = card?.querySelector('button[aria-label^="Commenter"]')
  b?.click(); return Boolean(b)
})()`)
await sleep(700)
check('bouton « Commenter » sur le segment s1', opened)
const quote = await evaluate('[...document.querySelectorAll(".v-overlay--active textarea")][0]?.value ?? ""')
check('citation préremplie avec la sélection', quote.length > 0, quote.slice(0, 40))
await evaluate(`(() => {
  const areas = [...document.querySelectorAll('.v-overlay--active textarea')]
  const t = areas[areas.length - 1]
  t.value = ${JSON.stringify(COMMENT)}; t.dispatchEvent(new Event('input', { bubbles: true })); return true
})()`)
await sleep(200)
check('clic sur « Enregistrer »', await clickButton('Enregistrer', 'document.querySelector(".v-overlay--active")'))
await sleep(500)
const badge = await evaluate(`document.querySelector('[data-segment-id="s1"] button[aria-label^="Commenter"]')?.getAttribute('aria-label') ?? ''`)
check('badge du bouton = 1', /\(1 /.test(badge), badge)

// 3. Page Relecture : la remarque est listée.
await navigate(`${SLUG}/review`)
const reviewText = await mainText()
check('remarque listée sur la page Relecture', reviewText.includes(COMMENT))
check('cible « Segment s1 » affichée', /Segment s1/.test(reviewText))

// 4. Prompt : on intercepte le presse-papiers.
await evaluate(`(() => { navigator.clipboard.writeText = async (t) => { window.__copied = t }; return true })()`)
check('clic sur « Copier le prompt pour l\'IA »', await clickButton('Copier le prompt'))
await sleep(500)
const prompt = await evaluate('window.__copied ?? ""')
check('le prompt contient la remarque', prompt.includes(COMMENT))
check('le prompt contient la consigne sur les ids stables', /ids stables/.test(prompt))
check('le prompt contient le format reviewLog', /reviewLog/.test(prompt) && /"commentId": "c1"/.test(prompt))
check('la remarque passe en « Envoyé »', /Envoyé/.test(await mainText()))

// 5. JSON corrigé avec reviewLog : chargé comme version locale.
const doc = JSON.parse(readFileSync(new URL('../../data/bk56b_tosafot_behahi_hanaa.json', import.meta.url), 'utf8'))
const s1 = doc.segments.find((s) => s.id === 's1')
s1.translation = s1.translation + ' (corrigé)'
doc.meta.version = '2099-01-01T00:00:00Z'
doc.reviewLog = [{ commentId: 'c1', status: 'corrigé', change: 'Ajout de « selon רש״י » dans s1.', targets: ['s1'] }]
const loaded = await evaluate(`(() => {
  const input = [...document.querySelectorAll('main input[type=file]')].pop()
  const dt = new DataTransfer()
  dt.items.add(new File([${JSON.stringify(JSON.stringify(doc))}], 'corrige.json', { type: 'application/json' }))
  input.files = dt.files
  input.dispatchEvent(new Event('change', { bubbles: true }))
  return Boolean(input)
})()`)
await sleep(1500)
const afterLoad = await mainText()
check('JSON corrigé chargé et vérifié', loaded && /Version locale enregistrée/.test(afterLoad) && /✓/.test(afterLoad))
await navigate(`local-${DOC_ID}/review`, 3000)
const localText = await mainText()
check('version locale ouverte', /version locale/.test(localText))
check('réponse de l\'IA appliquée (Corrigé)', /Corrigé/.test(localText) && localText.includes('selon רש״י'))
check('changements : s1 · Traduction', /s1/.test(localText) && /Traduction/.test(localText))

console.log(errors.length ? `ERREURS (${errors.length}) :\n` + [...new Set(errors)].join('\n') : 'Aucune erreur console')
ws.close()
chrome.kill()
process.exit(failures || errors.length ? 1 : 0)
