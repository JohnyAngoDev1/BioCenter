export default defineEventHandler(async (event) => {
  const { path, filename } = getQuery(event) as { path: string; filename: string };
  const config = useRuntimeConfig(event);

  if (!path || !filename) {
    throw createError({ statusCode: 400, message: "path y filename son requeridos" });
  }

  const baseUrl = config.firmarArchivo || process.env.NUXT_FIRMAR_ARCHIVO || process.env.FIRMAR_ARCHIVO;

  if (!baseUrl) {
    throw createError({ statusCode: 500, message: "FIRMAR_ARCHIVO no configurado" });
  }

  const res = await $fetch<{ signedUrl: string; url_save: string }>(
    `${baseUrl}/signedurl`,
    { params: { path, filename } },
  );

  return res;
});
