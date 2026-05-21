<script setup lang="ts">
definePageMeta({ middleware: "auth", layout: "dashboard" });

const route = useRoute();
const { getById, update } = useProductos();
const { uploadImage } = useS3Upload();

const id = route.params.id as string;

const { data: producto, error } = await useAsyncData(`producto-${id}`, () =>
  getById(id),
);

if (error.value || !producto.value) {
  await navigateTo("/dashboard/productos");
}

const form = ref({ isApplyIva: false, ...producto.value });
const imageFile = ref<File | null>(null);
const loading = ref(false);

async function handleSubmit() {
  loading.value = true;
  try {
    if (imageFile.value) {
      form.value.image = await uploadImage(imageFile.value, "biocenter/products");
    }
    await update(id, form.value);
    await navigateTo("/dashboard/productos");
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
        to="/dashboard/productos"
      />
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Editar producto</h1>
        <p class="mt-0.5 text-sm text-gray-500 truncate max-w-sm">
          {{ form.title }}
        </p>
      </div>
    </div>

    <UCard class="max-w-4xl">
      <ProductosProductoForm v-model="form" :loading="loading" @update:image-file="imageFile = $event">
        <template #actions>
          <UButton variant="ghost" color="neutral" to="/dashboard/productos">
            Cancelar
          </UButton>
          <UButton :loading="loading" icon="i-lucide-save" @click="handleSubmit">
            Guardar cambios
          </UButton>
        </template>
      </ProductosProductoForm>
    </UCard>
  </div>
</template>
