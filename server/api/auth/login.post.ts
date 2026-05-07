import { buildUrl } from "../../utils/api";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig(event);

  try {
    const data = await $fetch<any>(buildUrl(config.apiUrl, "usuario/login"), {
      method: "POST",
      body,
    });

    const token = data?.data?.token;

    if (token) {
      setCookie(event, "auth_token", token, {
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        secure: !import.meta.dev,
      });
      const { token: _t, ...userData } = data.data;
      return { ...data, data: userData };
    }

    return data;
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status ?? 500,
      data: error.data,
      message: error.data?.message ?? error.message,
    });
  }
});
