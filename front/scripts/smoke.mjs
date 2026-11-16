// Test de fumée : ouvre chaque vue dans Chrome sans interface, relève les erreurs console
// et clique sur « Vérifier le texte ». Usage : node scripts/smoke.mjs (avec `npm run preview` lancé).
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = process.env.BASE ?? 'http://localhost:4173/#/bk56b_tosafot_behahi_hanaa/'
const PORT = 9333

const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`, 'about:blank'])
await sleep(1500)
const [page] = await (await fetch(`http://localhost:${PORT}/json`)).json()
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r))

let id = 0
const pending = new Map()
const errors = []
ws.addEventListener('message', ({ data }) => {
  const msg = JSON.parse(data)
  if (msg.id && pending.has(msg.id)) pending.get(msg.id)(msg.result)
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
for (const view of ['context', 'structure?open=I,II,II.A', 'text', 'map', 'synthesis', 'glossary', 'notes']) {
  await send('Page.navigate', { url: BASE + view })
  await sleep(1500)
  const size = await evaluate('document.querySelector("main")?.innerText.length ?? 0')
  console.log(`${view.padEnd(28)} texte=${size}`)
}

const clicked = await evaluate(`(() => {
  const b = [...document.querySelectorAll('button')].find(b => /Vérifier/.test(b.textContent) || b.getAttribute('aria-label')?.includes('Vérifier'))
  b?.click(); return Boolean(b)
})()`)
await sleep(800)
const result = await evaluate('document.querySelector(".v-overlay--active .v-alert")?.innerText ?? ""')
console.log('Vérifier le texte :', clicked, '→', result.replace(/\s+/g, ' ').slice(0, 120))

console.log(errors.length ? `ERREURS (${errors.length}) :\n` + [...new Set(errors)].join('\n') : 'Aucune erreur console')
ws.close()
chrome.kill()
