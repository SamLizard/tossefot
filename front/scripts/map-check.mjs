// Carte : après un zoom, la transformation 3D (couche GPU, texte pixelisé) doit disparaître.
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PORT = 9400 + Math.floor(Math.random() * 500)
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-proxy-server', `--user-data-dir=${mkdtempSync(join(tmpdir(), 'tossefot-map-'))}`, `--remote-debugging-port=${PORT}`, '--window-size=1300,900', 'about:blank'])
await sleep(2000)
const page = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === 'page')
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r))
let id = 0
const pending = new Map()
ws.addEventListener('message', ({ data }) => { const m = JSON.parse(data); if (m.id && pending.has(m.id)) pending.get(m.id)(m.result) })
const send = (method, params = {}) => new Promise((r) => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })) })
const evaluate = async (e) => (await send('Runtime.evaluate', { expression: e, returnByValue: true })).result.value
const state = () => evaluate(`(() => { const l = document.querySelector('.argument-map__layer'); return l.style.transform + ' | will-change=' + getComputedStyle(l).willChange })()`)

await send('Page.navigate', { url: 'http://127.0.0.1:4173/#/bk56b_tosafot_behahi_hanaa/map' })
await sleep(3000)
console.log('repos      :', await state())
await evaluate(`document.querySelector('.argument-map__viewport').dispatchEvent(new WheelEvent('wheel', { deltaY: -300, clientX: 400, clientY: 300, bubbles: true, cancelable: true }))`)
await sleep(30)
console.log('pendant    :', await state())
await sleep(400)
console.log('après 400ms:', await state())
ws.close()
chrome.kill()
