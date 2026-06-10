const EMPRESA_ID = '6a28b655351277cfc5b1b3fb'
const API_URL = 'https://landingpay.magdata.com.ec'

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

  await $fetch(`${API_URL}/empresa/${EMPRESA_ID}`, {
    method: 'PUT',
    body: { buy_button_color: color },
  })

  return { success: true, buy_button_color: color }
})
