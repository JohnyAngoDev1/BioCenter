export default defineEventHandler(async (event) => {
  const token = getCookie(event, "auth_token");
  const body = await readBody(event);
  const config = useRuntimeConfig(event);

  try {
    return await $fetch<any>(`${config.apiUrl}/producto`, {
      method: "POST",
      body,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status ?? 500,
      message: error.data?.message ?? error.message,
    });
  }
});
