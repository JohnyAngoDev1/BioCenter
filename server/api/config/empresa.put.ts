const EMPRESA_ID = '6a28b655351277cfc5b1b3fb'
const API_URL = 'https://landingpay.magdata.com.ec'

const ALLOWED_FIELDS = [
  'ruc',
  'razon_social',
  'nombre_comercial',
  'direccion_matriz',
  'email',
  'telefono',
  'logo',
  'requiere_facturacion',
  'buy_button_color',
  'archivo_certificado',
  'clave_certificado',
] as const

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({ statusCode: 401, message: 'No autorizado' })
  }

  const body = await readBody(event)
  const payload: Record<string, any> = {}
  for (const field of ALLOWED_FIELDS) {
    if (body?.[field] !== undefined) {
      payload[field] = body[field]
    }
  }

  if (Object.keys(payload).length === 0) {
    throw createError({ statusCode: 400, message: 'No hay campos para actualizar' })
  }

  try {
    await $fetch(`${API_URL}/empresa/update/${EMPRESA_ID}`, {
      method: 'PUT',
      headers: { Authorization: token },
      body: payload,
    })
    return { success: true }
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status ?? 500,
      message: error.data?.message ?? error.message,
    })
  }
})
