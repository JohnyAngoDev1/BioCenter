<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { AMBIENTE_OPTIONS } from "~/composables/useSucursales";
import type { Sucursal } from "~/composables/useSucursales";

definePageMeta({ middleware: "auth", layout: "dashboard" });

const { getAll, remove } = useSucursales();

const {
  data: sucursalesRaw,
  pending,
  error,
  refresh,
} = useAsyncData("sucursales", getAll, {
  server: false,
  default: () => [] as Sucursal[],
});

const search = ref("");

const sucursales = computed(() => sucursalesRaw.value ?? []);

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) return sucursales.value;
  return sucursales.value.filter((s) => s.nombre.toLowerCase().includes(q));
});

function ambienteLabel(value: string) {
  return AMBIENTE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

const columns: TableColumn<Sucursal>[] = [
  { accessorKey: "nombre", header: "Nombre" },
  { accessorKey: "codigo_establecimiento", header: "N° Establecimiento" },
  { accessorKey: "punto_emision", header: "Punto Emisión" },
  { accessorKey: "ambiente", header: "Ambiente" },
  { id: "actions", header: "Acciones" },
];

const deleteOpen = ref(false);
const deleteTarget = ref<Sucursal | null>(null);
const deleting = ref(false);

function openDelete(sucursal: Sucursal) {
  deleteTarget.value = sucursal;
  deleteOpen.value = true;
}

async function confirmDelete() {
  if (!deleteTarget.value?._id) return;
  deleting.value = true;
  try {
    await remove(deleteTarget.value._id);
    await refresh();
    deleteOpen.value = false;
    deleteTarget.value = null;
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <div class="p-6 space-y-5">
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Sucursales</h1>
        <p class="mt-1 text-sm text-gray-500">Gestiona los establecimientos de facturación</p>
      </div>
      <UButton icon="i-lucide-plus" to="/dashboard/sucursales/crear">
        Nueva sucursal
      </UButton>
    </div>

    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      Error al cargar sucursales: {{ (error as any)?.data?.message ?? error?.message }}
    </div>

    <UInput
      v-model="search"
      icon="i-lucide-search"
      placeholder="Buscar por nombre..."
      class="max-w-sm"
    />

    <UCard>
      <UTable :columns="columns" :data="filtered" :loading="pending">
        <template #ambiente-cell="{ row }">
          <UBadge
            :color="row.original.ambiente === 'PROD' ? 'success' : 'warning'"
            variant="subtle"
            size="sm"
          >
            {{ ambienteLabel(row.original.ambiente) }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-1">
            <UButton
              icon="i-lucide-pencil"
              variant="ghost"
              color="neutral"
              size="sm"
              :to="`/dashboard/sucursales/${row.original._id}`"
            />
            <UButton
              icon="i-lucide-trash-2"
              variant="ghost"
              color="error"
              size="sm"
              @click="openDelete(row.original)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <p class="text-sm text-gray-500">
      {{ filtered.length }} sucursal{{ filtered.length !== 1 ? "es" : "" }} encontrada{{ filtered.length !== 1 ? "s" : "" }}
    </p>
  </div>

  <UModal v-model:open="deleteOpen" title="Eliminar sucursal">
    <template #body>
      <p class="text-sm text-gray-600">
        ¿Confirmas que deseas eliminar
        <strong class="text-gray-900">{{ deleteTarget?.nombre }}</strong>?
        Esta acción no se puede deshacer.
      </p>
    </template>
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton
          variant="ghost"
          color="neutral"
          :disabled="deleting"
          @click="deleteOpen = false"
        >
          Cancelar
        </UButton>
        <UButton color="error" :loading="deleting" @click="confirmDelete">
          Eliminar
        </UButton>
      </div>
    </template>
  </UModal>
</template>
