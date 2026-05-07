<script setup lang="ts">
definePageMeta({ layout: false });

const { isAuthenticated } = useAuth();

if (isAuthenticated.value) {
  await navigateTo("/dashboard");
}
</script>

<template>
  <UApp>
    <div class="flex min-h-screen">
      <div class="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-primary p-12 relative overflow-hidden">
        <div class="absolute inset-0 opacity-10">
          <div class="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-white" />
          <div class="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white" />
          <div class="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
        </div>
        <div class="relative z-10 text-center text-white">
          <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm">
            <UIcon name="i-lucide-activity" class="size-10 text-white" />
          </div>
          <h2 class="text-4xl font-bold mb-3">BioCenter</h2>
          <p class="text-lg text-white/80 max-w-xs">
            Plataforma de gestión para tu bienestar y salud
          </p>
        </div>
      </div>

      <div class="flex flex-1 flex-col items-center justify-center bg-gray-50 px-6 py-12">
        <div class="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <AuthLoginForm />
        </div>
        <p class="mt-6 text-xs text-gray-400">
          © {{ new Date().getFullYear() }} BioCenter. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </UApp>
</template>
