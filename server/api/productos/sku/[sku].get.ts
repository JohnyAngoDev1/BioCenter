import { buildUrl } from "../../../utils/api";

export default defineEventHandler(async (event) => {
  const sku = getRouterParam(event, "sku");
  const config = useRuntimeConfig(event);
  const token = getCookie(event, "auth_token");

  try {
    const res = await $fetch<any>(buildUrl(config.apiUrl, "producto"), {
      headers: token ? { Authorization: token } : {},
    });

    const list: any[] = res?.data ?? res ?? [];
    const producto = list.find((p: any) => p.sku === sku);

    if (!producto) {
      throw createError({ statusCode: 404, message: "Producto no encontrado" });
    }

    const title = producto.title || "sin-titulo";
    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    return { ...producto, id: producto._id, slug };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode ?? error.response?.status ?? 500,
      message: error.message ?? error.data?.message,
    });
  }
});
