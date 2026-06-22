<script setup lang="ts">
definePageMeta({ middleware: "auth", layout: "dashboard" });

const route = useRoute();
const { getById, update, getAll } = useSucursales();

const id = route.params.id as string;

const { data: sucursal, error } = await useAsyncData(`sucursal-${id}`, () =>
  getById(id),
);

if (error.value || !sucursal.value) {
  await navigateTo("/dashboard/sucursales");
}

const form = ref({ ...sucursal.value });
const loading = ref(false);
const nombreError = ref("");

async function handleSubmit() {
  nombreError.value = "";

  if (!form.value.nombre?.trim() || !form.value.ambiente) {
    return;
  }

  loading.value = true;
  try {
    const existentes = await getAll();
    const nombreDuplicado = existentes.some(
      (s) =>
        s._id !== id &&
        s.nombre.trim().toLowerCase() === form.value.nombre!.trim().toLowerCase(),
    );
    if (nombreDuplicado) {
      nombreError.value = "Ya existe una sucursal con ese nombre";
      return;
    }

    await update(id, form.value);
    await navigateTo("/dashboard/sucursales");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="p-6">
    <div class="mb-6 flex items-center gap-3">
      <UButton
        icon="i-lucide-arrow-left"
        variant="ghost"
        color="neutral"
        to="/dashboard/sucursales"
      />
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Editar sucursal</h1>
        <p class="mt-0.5 text-sm text-gray-500 truncate max-w-sm">
          {{ form.nombre }}
        </p>
      </div>
    </div>

    <UCard class="max-w-3xl">
      <SucursalesSucursalForm v-model="form" :loading="loading" :nombre-error="nombreError">
        <template #actions>
          <UButton variant="ghost" color="neutral" to="/dashboard/sucursales">
            Cancelar
          </UButton>
          <UButton :loading="loading" icon="i-lucide-save" @click="handleSubmit">
            Guardar cambios
          </UButton>
        </template>
      </SucursalesSucursalForm>
    </UCard>
  </div>
</template>
