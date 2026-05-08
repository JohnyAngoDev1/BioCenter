<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Producto } from "~/composables/useProductos";

definePageMeta({ middleware: "auth", layout: "dashboard" });

const { getAll, remove } = useProductos();

const {
  data: productosRaw,
  pending,
  error,
  refresh,
} = useAsyncData("productos", getAll, {
  server: false,
  default: () => [] as Producto[],
});

const search = ref("");
const page = ref(1);
const pageSize = ref(10);

const productos = computed(() => productosRaw.value ?? []);

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) return productos.value;
  return productos.value.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.badge ?? "").toLowerCase().includes(q),
  );
});

const total = computed(() => filtered.value.length);

const paginated = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filtered.value.slice(start, start + pageSize.value);
});

watch([search, pageSize], () => {
  page.value = 1;
});

const columns: TableColumn<Producto>[] = [
  { accessorKey: "image", header: "Imagen" },
  { accessorKey: "title", header: "Título" },
  { accessorKey: "category", header: "Categoría" },
  { accessorKey: "price", header: "Precio" },
  { accessorKey: "badge", header: "Badge" },
  { id: "actions", header: "Acciones" },
];

const deleteOpen = ref(false);
const deleteTarget = ref<Producto | null>(null);
const deleting = ref(false);

function openDelete(producto: Producto) {
  deleteTarget.value = producto;
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
        <h1 class="text-2xl font-bold text-gray-900">Productos</h1>
        <p class="mt-1 text-sm text-gray-500">Gestiona el catálogo de servicios</p>
      </div>
      <UButton icon="i-lucide-plus" to="/dashboard/productos/crear">
        Nuevo producto
      </UButton>
    </div>

    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      Error al cargar productos: {{ (error as any)?.data?.message ?? error?.message }}
    </div>

    <div class="flex items-center gap-3">
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar por título, categoría..."
        class="max-w-sm flex-1"
      />
      <select
        v-model.number="pageSize"
        class="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option :value="10">10 filas</option>
        <option :value="25">25 filas</option>
        <option :value="50">50 filas</option>
        <option :value="100">100 filas</option>
      </select>
    </div>

    <UCard>
      <UTable :columns="columns" :data="paginated" :loading="pending">
        <template #image-cell="{ row }">
          <div class="py-1">
            <img
              v-if="row.original.image"
              :src="row.original.image"
              :alt="row.original.title"
              class="h-11 w-11 rounded-lg object-cover ring-1 ring-gray-100"
            />
            <div
              v-else
              class="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100"
            >
              <UIcon name="i-lucide-image" class="size-5 text-gray-400" />
            </div>
          </div>
        </template>

        <template #title-cell="{ row }">
          <div class="max-w-xs">
            <p class="font-medium text-gray-900 truncate">{{ row.original.title }}</p>
            <p class="text-xs text-gray-400 truncate mt-0.5">{{ row.original.description }}</p>
          </div>
        </template>

        <template #price-cell="{ row }">
          <span class="font-semibold text-gray-900">
            ${{ Number(row.original.price).toFixed(2) }}
          </span>
        </template>

        <template #badge-cell="{ row }">
          <UBadge v-if="row.original.badge" color="primary" variant="subtle" size="sm">
            {{ row.original.badge }}
          </UBadge>
          <span v-else class="text-gray-300">—</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-1">
            <UButton
              icon="i-lucide-pencil"
              variant="ghost"
              color="neutral"
              size="sm"
              :to="`/dashboard/productos/${row.original._id}`"
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

    <div class="flex items-center justify-between">
      <p class="text-sm text-gray-500">
        {{ total }} producto{{ total !== 1 ? "s" : "" }} encontrado{{ total !== 1 ? "s" : "" }}
      </p>
      <UPagination
        v-if="total > pageSize"
        v-model:page="page"
        :total="total"
        :items-per-page="pageSize"
      />
    </div>
  </div>

  <UModal v-model:open="deleteOpen" title="Eliminar producto">
    <template #body>
      <p class="text-sm text-gray-600">
        ¿Confirmas que deseas eliminar
        <strong class="text-gray-900">{{ deleteTarget?.title }}</strong>?
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
