import { buildUrl } from "../../utils/api";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const config = useRuntimeConfig(event);
  const token = getCookie(event, "auth_token");

  try {
    return await $fetch<any>(buildUrl(config.apiUrl, `producto/${id}`), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status ?? 500,
      message: error.data?.message ?? error.message,
    });
  }
});
