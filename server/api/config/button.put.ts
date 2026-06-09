import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

function getConfigPath() {
  return join(process.cwd(), '.data', 'config.json')
}

function readConfig(): Record<string, string> {
  const configPath = getConfigPath()
  if (!existsSync(configPath)) return {}
  return JSON.parse(readFileSync(configPath, 'utf-8'))
}

function writeConfig(data: Record<string, string>) {
  const configPath = getConfigPath()
  mkdirSync(join(process.cwd(), '.data'), { recursive: true })
  writeFileSync(configPath, JSON.stringify(data, null, 2))
}

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({ statusCode: 401, message: 'No autorizado' })
  }

  const body = await readBody(event)
  const color = body?.buy_button_color

  if (!color || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
    throw createError({ statusCode: 400, message: 'Color inválido. Debe ser un hex válido (ej: #269144)' })
  }

  const config = readConfig()
  config.buy_button_color = color
  writeConfig(config)

  return { success: true, buy_button_color: color }
})
