import { buildUrl } from "../../utils/api";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const token = getCookie(event, "auth_token");

  try {
    const res = await $fetch<any>(buildUrl(config.apiUrl, "producto"), {
      headers: token ? { Authorization: token } : {},
    });

    const data = res?.data ?? res;

    if (!Array.isArray(data)) return data;

    return data.map((item: any) => {
      const title = item.title || "sin-titulo";
      const slug = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      return {
        ...item,
        id: item._id,
        slug
      };
    });
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status ?? 500,
      message: error.data?.message ?? error.message,
    });
  }
});
