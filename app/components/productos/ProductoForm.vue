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

const imagePreview = computed(() => form.value.image || null);
const imageInput = ref<HTMLInputElement | null>(null);

function onImageFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    update("image", e.target?.result as string);
  };
  reader.readAsDataURL(file);
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

      <UFormField label="Imagen">
        <div class="space-y-3 w-full">
          <div
            v-if="imagePreview"
            class="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
          >
            <img :src="imagePreview" class="w-full h-full object-cover" />
            <UButton
              icon="i-lucide-x"
              size="xs"
              color="error"
              variant="solid"
              class="absolute top-2 right-2 rounded-full"
              @click="update('image', '')"
            />
          </div>
          <div class="flex gap-2">
            <UInput
              :model-value="form.image"
              placeholder="URL de imagen o sube un archivo"
              class="flex-1"
              @update:model-value="update('image', $event)"
            />
            <UButton
              icon="i-lucide-upload"
              variant="outline"
              color="neutral"
              @click="imageInput?.click()"
            >
              Subir
            </UButton>
          </div>
          <input
            ref="imageInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onImageFile"
          />
        </div>
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

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-gray-800">Requiere pago</p>
          <p class="text-xs text-gray-500">Muestra el botón "Añadir al carrito"</p>
        </div>
        <USwitch
          :model-value="form.isApplyPay !== false"
          @update:model-value="update('isApplyPay', $event)"
        />
      </div>
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-gray-800">Requiere dirección</p>
          <p class="text-xs text-gray-500">Solicita dirección de entrega en el checkout</p>
        </div>
        <USwitch
          :model-value="form.isApplyAddress !== false"
          @update:model-value="update('isApplyAddress', $event)"
        />
      </div>
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
