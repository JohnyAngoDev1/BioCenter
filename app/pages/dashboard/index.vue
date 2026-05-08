<script setup lang="ts">
definePageMeta({ middleware: "auth", layout: "dashboard" });
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
    <p class="mt-1 text-sm text-gray-500">Bienvenido al panel de administración</p>

    <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <UCard>
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <UIcon name="i-lucide-package" class="size-6 text-primary" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Productos</p>
            <NuxtLink
              to="/dashboard/productos"
              class="text-sm text-primary hover:underline"
            >
              Ver catálogo →
            </NuxtLink>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
            <UIcon name="i-lucide-shopping-bag" class="size-6 text-emerald-600" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Pedidos</p>
            <NuxtLink
              to="/dashboard/pedidos"
              class="text-sm text-emerald-600 hover:underline"
            >
              Ver pedidos →
            </NuxtLink>
          </div>
        </div>
      </UCard>

      <!-- Usuarios - pendiente de implementar
      <UCard>
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50">
            <UIcon name="i-lucide-users" class="size-6 text-violet-600" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Usuarios</p>
            <p class="text-sm text-gray-400">Próximamente</p>
          </div>
        </div>
      </UCard>
      -->
    </div>
  </div>
</template>
