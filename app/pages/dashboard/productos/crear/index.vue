<script setup lang="ts">
definePageMeta({ middleware: "auth", layout: "dashboard" });

const { create } = useProductos();
const router = useRouter();

const form = ref({
  sku: "",
  url: "",
  title: "",
  description: "",
  longDescription: "",
  price: 0,
  image: "",
  category: "",
  badge: "",
  features: [] as string[],
  isApplyPay: true,
  isApplyAddress: true,
  isApplyIva: false,
});

const loading = ref(false);

async function handleSubmit() {
  if (!form.value.title || !form.value.description || !form.value.category) {
    return;
  }
  loading.value = true;
  try {
    await create(form.value);
    await router.push("/dashboard/productos");
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
        <h1 class="text-2xl font-bold text-gray-900">Nuevo producto</h1>
        <p class="mt-0.5 text-sm text-gray-500">
          Completa los campos para agregar un producto al catálogo
        </p>
      </div>
    </div>

    <UCard class="max-w-4xl">
      <ProductosProductoForm v-model="form" :loading="loading">
        <template #actions>
          <UButton variant="ghost" color="neutral" to="/dashboard/productos">
            Cancelar
          </UButton>
          <UButton :loading="loading" icon="i-lucide-save" @click="handleSubmit">
            Crear producto
          </UButton>
        </template>
      </ProductosProductoForm>
    </UCard>
  </div>
</template>
