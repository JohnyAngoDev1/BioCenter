export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig(event);

  try {
    const data = await $fetch<any>(`${config.apiUrl}/usuario/login`, {
      method: "POST",
      body,
    });

    if (data.token) {
      setCookie(event, "auth_token", data.token, {
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        secure: !import.meta.dev,
      });
      const { token: _token, ...rest } = data;
      return rest;
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
