import { buildUrl } from "../../utils/api";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const config = useRuntimeConfig(event);
  const token = getCookie(event, "auth_token");

  try {
    const res = await $fetch<any>(buildUrl(config.apiUrl, `producto/${id}`), {
      headers: token ? { Authorization: token } : {},
    });

    const producto = res?.data ?? res;

    if (producto && producto._id) {
      // Generar un slug a partir del título (consistencia con frontend)
      const title = producto.title || "sin-titulo";
      const slug = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // eliminar tildes
        .replace(/[^a-z0-9]+/g, '-') // reemplazar espacios o caracteres raros por guión
        .replace(/(^-|-$)+/g, ''); // quitar guiones de los bordes

      return {
        ...producto,
        id: producto._id,
        slug
      };
    }

    return producto;
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status ?? 500,
      message: error.data?.message ?? error.message,
    });
  }
});
