import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

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

  const configPath = resolve('./server/data/config.json')
  const config = JSON.parse(readFileSync(configPath, 'utf-8'))
  config.buy_button_color = color
  writeFileSync(configPath, JSON.stringify(config, null, 2))

  return { success: true, buy_button_color: color }
})
