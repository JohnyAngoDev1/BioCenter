<script setup lang="ts">
import type { Producto } from "~/composables/useProductos";

const props = defineProps<{
  modelValue: Partial<Producto>;
  loading?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [Partial<Producto>];
  submit: [];
}>();

const form = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

function update(field: keyof Producto, value: any) {
  emit("update:modelValue", { ...props.modelValue, [field]: value });
}

const newFeature = ref("");

function addFeature() {
  if (!newFeature.value.trim()) return;
  update("features", [...(form.value.features ?? []), newFeature.value.trim()]);
  newFeature.value = "";
}

function removeFeature(index: number) {
  update(
    "features",
    (form.value.features ?? []).filter((_, i) => i !== index),
  );
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <UFormField label="Título" required class="md:col-span-2">
        <UInput
          :model-value="form.title"
          placeholder="Nombre del producto"
          class="w-full"
          @update:model-value="update('title', $event)"
        />
      </UFormField>

      <UFormField label="Categoría" required>
        <UInput
          :model-value="form.category"
          placeholder="Ej: Sueros Vitales"
          class="w-full"
          @update:model-value="update('category', $event)"
        />
      </UFormField>

      <UFormField label="Precio (USD)" required>
        <UInput
          :model-value="form.price"
          type="number"
          placeholder="0.00"
          class="w-full"
          @update:model-value="update('price', Number($event))"
        />
      </UFormField>

      <UFormField label="Badge">
        <UInput
          :model-value="form.badge"
          placeholder="Ej: Más Vendido"
          class="w-full"
          @update:model-value="update('badge', $event)"
        />
      </UFormField>

      <UFormField label="Imagen (URL)">
        <UInput
          :model-value="form.image"
          placeholder="/images/services/nombre.png"
          class="w-full"
          @update:model-value="update('image', $event)"
        />
      </UFormField>

      <UFormField label="Descripción corta" required class="md:col-span-2">
        <UTextarea
          :model-value="form.description"
          placeholder="Descripción breve visible en la tarjeta del producto"
          :rows="2"
          class="w-full"
          @update:model-value="update('description', $event)"
        />
      </UFormField>

      <UFormField label="Descripción larga" class="md:col-span-2">
        <UTextarea
          :model-value="form.longDescription"
          placeholder="Descripción detallada del servicio..."
          :rows="4"
          class="w-full"
          @update:model-value="update('longDescription', $event)"
        />
      </UFormField>
    </div>

    <div>
      <p class="mb-3 text-sm font-medium text-gray-700">Características</p>
      <div class="space-y-2">
        <div
          v-for="(feature, i) in form.features"
          :key="i"
          class="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
        >
          <UIcon name="i-lucide-check-circle-2" class="size-4 shrink-0 text-primary" />
          <span class="flex-1 text-sm text-gray-700">{{ feature }}</span>
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            color="neutral"
            size="xs"
            @click="removeFeature(i)"
          />
        </div>

        <div v-if="!(form.features?.length)" class="rounded-lg border border-dashed border-gray-200 py-4 text-center">
          <p class="text-sm text-gray-400">Sin características. Agrega la primera abajo.</p>
        </div>

        <div class="flex gap-2 pt-1">
          <UInput
            v-model="newFeature"
            placeholder="Nueva característica..."
            class="flex-1"
            @keydown.enter.prevent="addFeature"
          />
          <UButton variant="outline" icon="i-lucide-plus" @click="addFeature">
            Agregar
          </UButton>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-3 border-t border-gray-100 pt-5">
      <slot name="actions" />
    </div>
  </div>
</template>
