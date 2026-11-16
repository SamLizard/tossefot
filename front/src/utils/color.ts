/** Mélange une couleur hexadécimale avec du blanc (amount > 0) ou du noir (amount < 0). */
export function lighten(hex: string, amount: number): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return hex
  const value = parseInt(match[1]!, 16)
  const channels = [value >> 16, (value >> 8) & 0xff, value & 0xff]
  const target = amount >= 0 ? 255 : 0
  const k = Math.abs(amount)
  return (
    '#' +
    channels
      .map((c) => Math.round(c + (target - c) * k).toString(16).padStart(2, '0'))
      .join('')
  )
}
