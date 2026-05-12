import { buildUrl } from "../utils/api";

const toSlug = (title: string) =>
  title
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  // Usa el token de sesión del usuario si existe, sino el token de catálogo del servidor
  const userToken = getCookie(event, "auth_token");
  const token = userToken || config.catalogToken;

  if (!token) {
    throw createError({ statusCode: 503, message: "Catalog token not configured" });
  }

  try {
    const res = await $fetch<any>(buildUrl(config.apiUrl, "producto"), {
      headers: { Authorization: token },
    });

    const products: any[] = res?.data ?? res;

    return products.map((product: any) => ({
      ...product,
      id: product._id ?? product.id,
      slug: toSlug(product.title ?? ''),
    }));
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status ?? 500,
      message: error.data?.message ?? error.message,
    });
  }
});
