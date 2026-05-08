import { buildUrl } from "../../utils/api";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const config = useRuntimeConfig(event);
  const token = getCookie(event, "auth_token");

  try {
    const res = await $fetch<any>(buildUrl(config.apiUrl, `producto/${id}`), {
      headers: token ? { Authorization: token } : {},
    });
    return res?.data ?? res;
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status ?? 500,
      message: error.data?.message ?? error.message,
    });
  }
});
