export default defineEventHandler(async (event) => {
  const token = getCookie(event, "auth_token");
  const id = getRouterParam(event, "id");
  const config = useRuntimeConfig(event);

  try {
    return await $fetch<any>(`${config.apiUrl}/producto/delete/${id}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status ?? 500,
      message: error.data?.message ?? error.message,
    });
  }
});
