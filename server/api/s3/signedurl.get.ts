export default defineEventHandler(async (event) => {
  const { path, filename } = getQuery(event) as { path: string; filename: string };
  const config = useRuntimeConfig(event);

  if (!path || !filename) {
    throw createError({ statusCode: 400, message: "path y filename son requeridos" });
  }

  const res = await $fetch<{ signedUrl: string; url_save: string }>(
    `${config.firmarArchivo}/signedurl`,
    { params: { path, filename } },
  );

  return res;
});
