const EMPRESA_ID = '6a28b655351277cfc5b1b3fb'
const API_URL = 'https://landingpay.magdata.com.ec'

export default defineEventHandler(async () => {
  try {
    const res = await $fetch<{ data: { buy_button_color?: string } }>(`${API_URL}/empresa/${EMPRESA_ID}`)
    return { buy_button_color: res?.data?.buy_button_color || '#269144' }
  } catch {
    return { buy_button_color: '#269144' }
  }
})
