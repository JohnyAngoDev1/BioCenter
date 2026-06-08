<script setup lang="ts">
const route = useRoute();
const { logout } = useAuth();

const navItems = [
  { label: "Dashboard", icon: "i-lucide-layout-dashboard", to: "/dashboard" },
  { label: "Productos", icon: "i-lucide-package", to: "/dashboard/productos" },
  { label: "Pedidos", icon: "i-lucide-shopping-bag", to: "/dashboard/pedidos" },
  { label: "Configuración", icon: "i-lucide-settings", to: "/dashboard/configuracion" },
  // { label: "Usuarios", icon: "i-lucide-users", to: "/dashboard/usuarios" },
  // { label: "Pagos", icon: "i-lucide-credit-card", to: "/dashboard/pagos" },
];

const isActive = (path: string) => {
  if (path === "/dashboard") return route.path === "/dashboard";
  return route.path.startsWith(path);
};
</script>

<template>
  <aside class="flex h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
    <div class="flex h-16 items-center gap-3 border-b border-gray-100 px-5">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <UIcon name="i-lucide-activity" class="size-5 text-white" />
      </div>
      <span class="text-base font-bold text-gray-900">BioCenter</span>
    </div>

    <nav class="flex-1 space-y-0.5 overflow-y-auto p-3">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        :class="
          isActive(item.to)
            ? 'bg-primary/10 text-primary'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        "
      >
        <UIcon :name="item.icon" class="size-5 shrink-0" />
        {{ item.label }}
      </NuxtLink>
    </nav>

    <div class="border-t border-gray-100 p-3">
      <button
        class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
        @click="logout"
      >
        <UIcon name="i-lucide-log-out" class="size-5 shrink-0" />
        Cerrar sesión
      </button>
    </div>
  </aside>
</template>
