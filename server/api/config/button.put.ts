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

  const storage = useStorage('data')
  await storage.setItem('buy_button_color', color)

  return { success: true, buy_button_color: color }
})
