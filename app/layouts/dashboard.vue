<template>
  <UApp>
    <div class="flex h-screen overflow-hidden bg-gray-50">
      <DashboardSidebar />
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
  </UApp>
</template>
