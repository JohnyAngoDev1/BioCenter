export function useAuth() {
  const router = useRouter();
  const toast = useToast();

  const loading = ref(false);
  const token = useCookie<string | null>("auth_token");
  const isAuthenticated = computed(() => !!token.value);

  const login = async (email: string, password: string) => {
    loading.value = true;
    try {
      await $fetch("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      await router.push("/dashboard");
    } catch (error: any) {
      toast.add({
        title: "Error al iniciar sesión",
        description: error?.data?.message ?? "Credenciales inválidas",
        color: "error",
      });
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    await $fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    token.value = null;
    await router.push("/login");
  };

  return { login, logout, isAuthenticated, loading };
}
