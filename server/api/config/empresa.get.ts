const EMPRESA_ID = '6a28b655351277cfc5b1b3fb'
const API_URL = 'https://landingpay.magdata.com.ec'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({ statusCode: 401, message: 'No autorizado' })
  }

  try {
    const res = await $fetch<{ data: Record<string, any> }>(`${API_URL}/empresa/${EMPRESA_ID}`, {
      headers: { Authorization: token },
    })
    const empresa = res?.data ?? {}

    return {
      ruc: empresa.ruc ?? '',
      razon_social: empresa.razon_social ?? '',
      nombre_comercial: empresa.nombre_comercial ?? '',
      direccion_matriz: empresa.direccion_matriz ?? '',
      email: empresa.email ?? '',
      telefono: empresa.telefono ?? '',
      logo: empresa.logo ?? '',
      requiere_facturacion: empresa.requiere_facturacion ?? false,
      buy_button_color: empresa.buy_button_color ?? '#269144',
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status ?? 500,
      message: error.data?.message ?? error.message,
    })
  }
})
