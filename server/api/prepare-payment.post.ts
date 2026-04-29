export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const response = await $fetch<Record<string, unknown>>(
    `${config.payphoneApiUrl}/prepare`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    }
  )

  return response
})
