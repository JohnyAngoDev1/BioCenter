export default defineEventHandler(async (event) => {
  const token = getCookie(event, "auth_token");
  const config = useRuntimeConfig(event);

  try {
    return await $fetch<any[]>(`${config.apiUrl}/producto`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status ?? 500,
      message: error.data?.message ?? error.message,
    });
  }
});
