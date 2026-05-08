import axios from "axios";

export function useApi() {
  const config = useRuntimeConfig();
  const token = useCookie<string | null>("auth_token");
  const router = useRouter();
  const toast = useToast();

  const instance = axios.create({
    baseURL: (config.public.apiUrl as string).replace(/\/+$/, ""),
    headers: { "Content-Type": "application/json" },
  });

  instance.interceptors.request.use((req) => {
    if (token.value) {
      req.headers.Authorization = token.value;
    }
    return req;
  });

  instance.interceptors.response.use(
    (res) => res,
    async (error) => {
      if (error.response?.status === 401) {
        token.value = null;
        await $fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        toast.add({
          title: "Sesión expirada",
          description: "Inicia sesión nuevamente.",
          color: "warning",
        });
        await router.push("/login");
      }
      return Promise.reject(error);
    },
  );

  return instance;
}
