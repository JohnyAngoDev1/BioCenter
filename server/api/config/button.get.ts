import { readFileSync } from 'fs'
import { resolve } from 'path'

export default defineEventHandler(() => {
  try {
    const configPath = resolve('./server/data/config.json')
    const config = JSON.parse(readFileSync(configPath, 'utf-8'))
    return { buy_button_color: config.buy_button_color || '#269144' }
  } catch {
    return { buy_button_color: '#269144' }
  }
})
