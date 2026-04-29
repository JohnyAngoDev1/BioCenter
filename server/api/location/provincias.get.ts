export default defineEventHandler(async () => {
  const res = await $fetch<{ data: Array<{ _id: string; name_es: string }> }>(
    'https://api-hoor.magdata.com.ec/provincia'
  )
  return res.data.map(p => ({ label: p.name_es, value: p._id }))
})
