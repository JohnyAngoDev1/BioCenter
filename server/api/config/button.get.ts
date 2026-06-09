export default defineEventHandler(async () => {
  try {
    const storage = useStorage('data')
    const color = await storage.getItem<string>('buy_button_color')
    return { buy_button_color: color || '#269144' }
  } catch {
    return { buy_button_color: '#269144' }
  }
})
