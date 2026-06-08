import { readFileSync } from 'fs'
import { resolve } from 'path'

export default defineEventHandler(() => {
  try {
    const path = resolve('server/data/config.json')
    const config = JSON.parse(readFileSync(path, 'utf-8'))
    return { buy_button_color: config.buy_button_color || '#269144' }
  } catch {
    return { buy_button_color: '#269144' }
  }
})
