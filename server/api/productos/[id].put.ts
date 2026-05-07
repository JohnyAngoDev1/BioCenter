import { buildUrl } from "../../utils/api";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const config = useRuntimeConfig(event);
  const token = getCookie(event, "auth_token");

  try {
    return await $fetch<any>(buildUrl(config.apiUrl, `producto/update/${id}`), {
      method: "PUT",
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
