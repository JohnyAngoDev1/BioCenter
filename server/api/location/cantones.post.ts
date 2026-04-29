export default defineEventHandler(async (event) => {
  const { sub_1 } = await readBody<{ sub_1: string }>(event)
  const res = await $fetch<{ data: Array<{ _id: string; name_es: string }> }>(
    'https://api-hoor.magdata.com.ec/canton/filter',
    { method: 'POST', body: { sub_1 } }
  )
  return res.data.map(c => ({ label: c.name_es, value: c._id }))
})
