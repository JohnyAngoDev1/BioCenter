import { buildUrl } from "../utils/api";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const token = getCookie(event, "auth_token");
    const apiUrl = (config.apiUrl as string) || "";

    try {
        const res = await $fetch<any>(buildUrl(apiUrl, "producto"), {
            headers: token ? { Authorization: token } : {},
        });

        console.log(res)

        const data = res?.data ?? res;

        if (!Array.isArray(data)) return [];

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
                id: item._id, // Mapeo para compatibilidad con useCart y checkout
                slug
            };
        });
    } catch (error: any) {
        console.error('[API Services Error]:', error);
        return [];
    }
});
