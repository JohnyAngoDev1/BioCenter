import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(() => {
  try {
    const configPath = join(process.cwd(), '.data', 'config.json')
    if (!existsSync(configPath)) return { buy_button_color: '#269144' }
    const config = JSON.parse(readFileSync(configPath, 'utf-8'))
    return { buy_button_color: config.buy_button_color || '#269144' }
  } catch {
    return { buy_button_color: '#269144' }
  }
})
