export default defineEventHandler(async (event) => {
  const { sub_2 } = await readBody<{ sub_2: string }>(event)
  const res = await $fetch<{ data: Array<{ _id: string; name_es: string }> }>(
    'https://api-hoor.magdata.com.ec/parroquia/filter',
    { method: 'POST', body: { sub_2 } }
  )
  return res.data.map(p => ({ label: p.name_es, value: p._id }))
})
