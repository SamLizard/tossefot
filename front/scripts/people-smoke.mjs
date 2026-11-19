// Test de fumée des fiches de personnes : puces dans un segment, fenêtre de la fiche, grille du glossaire.
// Usage : TOSSEFOT_URL=http://127.0.0.1:4174/#/bk56b_tosafot_behahi_hanaa/ node scripts/people-smoke.mjs
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PROFILE = mkdtempSync(join(tmpdir(), 'tossefot-chrome-'))
const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = process.env.TOSSEFOT_URL ?? 'http://127.0.0.1:4173/#/bk56b_tosafot_behahi_hanaa/'
const PORT = 9400 + Math.floor(Math.random() * 500)
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
await send('Runtime.enable')

await send('Page.navigate', { url: BASE + 'structure?open=I,II' })
await sleep(3000)
const chips = await evaluate(`[...document.querySelectorAll('[data-segment-id]')].map(c => ({
  id: c.dataset.segmentId,
  people: [...c.querySelectorAll('.v-chip .mdi-account-outline')].map(i => i.closest('.v-chip').innerText.trim()),
})).filter(c => c.people.length)`)
console.log('Segments avec des personnes :', JSON.stringify(chips))
const s1 = await evaluate(`document.querySelector('[data-segment-id="s1"]')?.querySelectorAll('.mdi-account-outline').length ?? -1`)
console.log('Puces dans s1 :', s1)

const clicked = await evaluate(`(() => {
  const i = document.querySelector('[data-segment-id] .v-chip .mdi-account-outline')
  i?.closest('.v-chip').click(); return i?.closest('.v-chip').innerText.trim() ?? null
})()`)
await sleep(800)
const dialog = await evaluate(`(() => {
  const d = document.querySelector('.v-overlay--active .person-dialog')
  if (!d) return null
  return {
    name: d.querySelector('.person-name')?.innerText,
    links: [...d.querySelectorAll('a[href]')].map(a => a.innerText.trim() + ' ' + a.target + ' ' + a.rel),
    appears: d.querySelectorAll('.v-chip--label').length,
  }
})()`)
console.log('Clic sur', clicked, '→ fiche :', JSON.stringify(dialog))

// Un clic sur « Apparaît dans » ferme la fiche et ouvre le segment dans le panneau.
const seg = await evaluate(`(() => {
  const c = [...document.querySelectorAll('.v-overlay--active .person-dialog .v-chip')].find(c => /^s\\d+$/.test(c.innerText.trim()))
  c?.click(); return c?.innerText.trim() ?? null
})()`)
await sleep(800)
const afterSeg = await evaluate(`({
  dialogOpen: Boolean(document.querySelector('.v-overlay--active .person-dialog')),
  panel: document.querySelector('.segment-panel.v-navigation-drawer--active') !== null,
})`)
console.log('Clic sur segment', seg, '→', JSON.stringify(afterSeg))

await send('Page.navigate', { url: BASE + 'glossary' })
await sleep(2500)
await evaluate(`[...document.querySelectorAll('.v-tab')].find(t => /Personnes/.test(t.innerText))?.click()`)
await sleep(800)
const cards = await evaluate(`document.querySelectorAll('.v-window-item--active [data-person-id]').length`)
console.log('Fiches dans le glossaire :', cards)
await evaluate(`[...document.querySelectorAll('.v-window-item--active button')].find(b => /Voir la fiche/.test(b.innerText))?.click()`)
await sleep(800)
const fromGlossary = await evaluate(`document.querySelector('.v-overlay--active .person-dialog .person-name')?.innerText ?? null`)
console.log('« Voir la fiche » →', fromGlossary)

console.log(errors.length ? `ERREURS (${errors.length}) :\n` + [...new Set(errors)].join('\n') : 'Aucune erreur console')
ws.close()
chrome.kill()
