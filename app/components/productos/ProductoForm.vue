<script setup lang="ts">
import type { Producto } from "~/composables/useProductos";

const props = defineProps<{
  modelValue: Partial<Producto>;
  loading?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [Partial<Producto>];
  "update:imageFiles": [File[]];
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

const STOPWORDS = new Set([
  "de",
  "la",
  "el",
  "los",
  "las",
  "con",
  "y",
  "o",
  "a",
  "en",
  "por",
  "del",
  "un",
  "una",
  "al",
]);

function generateSku(title: string): string {
  const words = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0 && !STOPWORDS.has(w));
  const parts = words.slice(0, 3).map((w) => w.slice(0, 3));
  return ["pd", ...parts].join("-");
}

const skuAutoMode = ref(!props.modelValue.sku);

watch(
  () => form.value.title,
  (title) => {
    if (skuAutoMode.value) {
      emit("update:modelValue", {
        ...props.modelValue,
        title,
        sku: generateSku(title ?? ""),
      });
    }
  },
);

function onSkuInput(val: unknown) {
  const v = String(val);
  skuAutoMode.value = !v;
  update("sku", v);
}

const toast = useToast()
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

function validateAndFilterFiles(files: File[]): File[] {
  const valid: File[] = []
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      toast.add({
        title: 'Imagen muy grande',
        description: `"${file.name}" supera los 2MB. Por favor comprímela antes de subirla.`,
        icon: 'i-heroicons-exclamation-triangle',
        color: 'error'
      })
    } else {
      valid.push(file)
    }
  }
  return valid
}

const imageFiles = ref<File[]>([]);
const imageInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

// Previews de archivos nuevos seleccionados
const filePreviews = computed(() =>
  imageFiles.value.map((f) => URL.createObjectURL(f)),
);

// URLs existentes guardadas en el modelo
const existingImages = computed(() => form.value.image ?? []);

function onImageFiles(event: Event) {
  const files = validateAndFilterFiles(
    Array.from((event.target as HTMLInputElement).files ?? [])
  );
  if (!files.length) return;
  imageFiles.value = [...imageFiles.value, ...files];
  emit("update:imageFiles", imageFiles.value);
  if (imageInput.value) imageInput.value.value = "";
}

function onDrop(event: DragEvent) {
  isDragging.value = false;
  const files = validateAndFilterFiles(
    Array.from(event.dataTransfer?.files ?? []).filter((f) => f.type.startsWith("image/"))
  );
  if (!files.length) return;
  imageFiles.value = [...imageFiles.value, ...files];
  emit("update:imageFiles", imageFiles.value);
}

function removeNewImage(index: number) {
  imageFiles.value = imageFiles.value.filter((_, i) => i !== index);
  emit("update:imageFiles", imageFiles.value);
}

function removeExistingImage(index: number) {
  update(
    "image",
    existingImages.value.filter((_, i) => i !== index),
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

      <UFormField label="SKU">
        <div class="flex items-center gap-2 w-full">
          <UInput
            :model-value="form.sku"
            placeholder="Auto-generado del título"
            class="flex-1 font-mono"
            @update:model-value="onSkuInput($event)"
          />
          <span
            v-if="skuAutoMode"
            class="shrink-0 text-xs text-primary-500 bg-primary-50 px-2 py-1 rounded font-medium"
            >Auto</span
          >
        </div>
      </UFormField>

      <UFormField label="URL de destino" class="md:col-span-2">
        <UInput
          :model-value="form.url"
          placeholder="https://... (si está vacío, se usa la página del producto por defecto)"
          class="w-full"
          @update:model-value="update('url', $event)"
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

      <UFormField label="Imágenes" class="md:col-span-2">
        <div class="space-y-3 w-full">
          <!-- Dropzone -->
          <div
            class="relative w-full rounded-xl border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 py-8"
            :class="isDragging ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50 bg-gray-50'"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
            @click="imageInput?.click()"
          >
            <UIcon name="i-lucide-image-plus" class="size-8 text-gray-400" />
            <p class="text-sm text-gray-500 text-center">
              Arrastra imágenes aquí o <span class="text-primary font-semibold">haz clic para seleccionar</span>
            </p>
            <p class="text-xs text-gray-400">Puedes seleccionar varias a la vez · Máx. 2MB por imagen</p>
            <input
              ref="imageInput"
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              @change="onImageFiles"
            />
          </div>

          <!-- Imágenes existentes (ya guardadas) -->
          <div v-if="existingImages.length" class="space-y-1">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Guardadas</p>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(url, i) in existingImages"
                :key="url"
                class="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group"
              >
                <img :src="url" class="w-full h-full object-cover" />
                <button
                  class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  @click.stop="removeExistingImage(i)"
                >
                  <UIcon name="i-lucide-trash-2" class="size-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          <!-- Imágenes nuevas (pendientes de subir) -->
          <div v-if="filePreviews.length" class="space-y-1">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Por subir</p>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(preview, i) in filePreviews"
                :key="preview"
                class="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-primary/40 group"
              >
                <img :src="preview" class="w-full h-full object-cover" />
                <button
                  class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  @click.stop="removeNewImage(i)"
                >
                  <UIcon name="i-lucide-trash-2" class="size-4 text-white" />
                </button>
              </div>
            </div>
          </div>
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

    <div
      class="grid grid-cols-1 gap-4 md:grid-cols-3 rounded-xl border border-gray-100 bg-gray-50 p-4"
    >
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-gray-800">Requiere pago</p>
          <p class="text-xs text-gray-500">
            Muestra el botón "Añadir al carrito"
          </p>
        </div>
        <USwitch
          :model-value="form.isApplyPay !== false"
          @update:model-value="update('isApplyPay', $event)"
        />
      </div>
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-gray-800">Requiere dirección</p>
          <p class="text-xs text-gray-500">
            Solicita dirección de entrega en el checkout
          </p>
        </div>
        <USwitch
          :model-value="form.isApplyAddress !== false"
          @update:model-value="update('isApplyAddress', $event)"
        />
      </div>
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-gray-800">Aplica IVA</p>
          <p class="text-xs text-gray-500">
            Calcula IVA 15% sobre este producto
          </p>
        </div>
        <USwitch
          :model-value="form.isApplyIva === true"
          @update:model-value="update('isApplyIva', $event)"
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
          <UIcon
            name="i-lucide-check-circle-2"
            class="size-4 shrink-0 text-primary"
          />
          <span class="flex-1 text-sm text-gray-700">{{ feature }}</span>
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            color="neutral"
            size="xs"
            @click="removeFeature(i)"
          />
        </div>

        <div
          v-if="!form.features?.length"
          class="rounded-lg border border-dashed border-gray-200 py-4 text-center"
        >
          <p class="text-sm text-gray-400">
            Sin características. Agrega la primera abajo.
          </p>
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
