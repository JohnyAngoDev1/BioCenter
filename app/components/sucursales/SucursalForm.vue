<script setup lang="ts">
import { AMBIENTE_OPTIONS } from "~/composables/useSucursales";
import type { Sucursal } from "~/composables/useSucursales";
import { useEmpresas } from "~/composables/useEmpresas";

const props = defineProps<{
  modelValue: Partial<Sucursal>;
  loading?: boolean;
  nombreError?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [Partial<Sucursal>];
}>();

const form = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

function update(field: keyof Sucursal, value: any) {
  emit("update:modelValue", { ...props.modelValue, [field]: value });
}

const { getAll: getAllEmpresas } = useEmpresas();
const empresaOptions = ref<{ label: string; value: string }[]>([]);

onMounted(async () => {
  const empresas = await getAllEmpresas();
  empresaOptions.value = empresas.map((e) => ({
    label: e.nombre_comercial || e.razon_social,
    value: e._id,
  }));
  if (!form.value.empresa && empresaOptions.value[0] && empresaOptions.value.length === 1) {
    update("empresa", empresaOptions.value[0].value);
  }
});
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <UFormField label="Nombre" required :error="nombreError || undefined" class="md:col-span-2">
        <UInput
          :model-value="form.nombre"
          placeholder="Ej: Sucursal Quito Norte"
          class="w-full"
          @update:model-value="update('nombre', $event)"
        />
      </UFormField>

      <UFormField label="Empresa" required class="md:col-span-2">
        <USelect
          :model-value="form.empresa"
          :items="empresaOptions"
          value-key="value"
          label-key="label"
          placeholder="Selecciona empresa"
          class="w-full"
          @update:model-value="update('empresa', $event)"
        />
      </UFormField>

      <UFormField label="N° Establecimiento" required>
        <UInput
          :model-value="form.codigo_establecimiento"
          type="number"
          placeholder="Ej: 1"
          class="w-full"
          @update:model-value="update('codigo_establecimiento', Number($event))"
        />
      </UFormField>

      <UFormField label="N° Punto de Emisión" required>
        <UInput
          :model-value="form.punto_emision"
          type="number"
          placeholder="Ej: 1"
          class="w-full"
          @update:model-value="update('punto_emision', Number($event))"
        />
      </UFormField>

      <UFormField label="N° Secuencial Factura" required>
        <UInput
          :model-value="form.secuencia_factura"
          type="number"
          placeholder="0"
          class="w-full"
          @update:model-value="update('secuencia_factura', Number($event))"
        />
      </UFormField>

      <UFormField label="N° Secuencial Nota de Crédito" required>
        <UInput
          :model-value="form.secuencia_anulacion"
          type="number"
          placeholder="0"
          class="w-full"
          @update:model-value="update('secuencia_anulacion', Number($event))"
        />
      </UFormField>

      <UFormField label="Ambiente" required class="md:col-span-2">
        <USelect
          :model-value="form.ambiente"
          :items="AMBIENTE_OPTIONS"
          value-key="value"
          label-key="label"
          placeholder="Selecciona ambiente"
          class="w-full"
          @update:model-value="update('ambiente', $event)"
        />
      </UFormField>
    </div>

    <div class="flex justify-end gap-3 border-t border-gray-100 pt-5">
      <slot name="actions" />
    </div>
  </div>
</template>
