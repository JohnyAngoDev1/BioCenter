<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { type Pedido, ORDER_STATUSES } from "~/composables/usePedidos";

definePageMeta({ middleware: "auth", layout: "dashboard" });

const { getAll, update } = usePedidos();

const {
  data: pedidosRaw,
  pending,
  error,
  refresh,
} = useAsyncData("pedidos", getAll, {
  server: false,
  default: () => [] as Pedido[],
});

const search = ref("");
const page = ref(1);
const pageSize = ref(10);

const pedidos = computed(() => pedidosRaw.value ?? []);

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) return pedidos.value;
  return pedidos.value.filter(
    (p) =>
      p.full_name.toLowerCase().includes(q) ||
      p.order_code.toLowerCase().includes(q) ||
      p.billingData?.email?.toLowerCase().includes(q) ||
      (p.status ?? "").toLowerCase().includes(q),
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

const columns: TableColumn<Pedido>[] = [
  { accessorKey: "order_code", header: "Código" },
  { accessorKey: "full_name", header: "Cliente" },
  { accessorKey: "total", header: "Total" },
  { accessorKey: "payment_status", header: "Pago" },
  { accessorKey: "status", header: "Estado" },
  { accessorKey: "createdAt", header: "Fecha" },
  { id: "actions", header: "Acciones" },
];

const statusColors: Record<string, "success" | "warning" | "error" | "neutral"> = {
  entregado: "success",
  procesando: "warning",
  pendiente: "neutral",
  cancelado: "error",
};

function statusLabel(value?: string) {
  return ORDER_STATUSES.find((s) => s.value === value)?.label ?? value ?? "—";
}

const updateOpen = ref(false);
const updateTarget = ref<Pedido | null>(null);
const newStatus = ref("");
const updating = ref(false);

function openUpdate(pedido: Pedido) {
  updateTarget.value = pedido;
  newStatus.value = pedido.status ?? "";
  updateOpen.value = true;
}

async function confirmUpdate() {
  if (!updateTarget.value?._id || !newStatus.value) return;
  updating.value = true;
  try {
    await update(updateTarget.value._id, newStatus.value);
    await refresh();
    updateOpen.value = false;
  } finally {
    updating.value = false;
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTotal(val?: { $numberDecimal: string }) {
  return val ? `$${Number(val.$numberDecimal).toFixed(2)}` : "—";
}
</script>

<template>
  <div class="p-6 space-y-5">
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Pedidos</h1>
        <p class="mt-1 text-sm text-gray-500">Gestiona los pedidos de la tienda</p>
      </div>
    </div>

    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      Error al cargar pedidos: {{ (error as any)?.data?.message ?? (error as any)?.message }}
    </div>

    <div class="flex items-center gap-3">
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar por cliente, código, email..."
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
        <template #order_code-cell="{ row }">
          <span class="font-mono text-xs text-gray-700">{{ row.original.order_code }}</span>
        </template>

        <template #full_name-cell="{ row }">
          <div>
            <p class="font-medium text-gray-900">{{ row.original.full_name }}</p>
            <p class="text-xs text-gray-400">{{ row.original.billingData?.email }}</p>
          </div>
        </template>

        <template #total-cell="{ row }">
          <span class="font-semibold text-gray-900">{{ formatTotal(row.original.total) }}</span>
        </template>

        <template #payment_status-cell="{ row }">
          <UBadge
            :color="row.original.payment_status === 'paid' ? 'success' : 'warning'"
            variant="subtle"
            size="sm"
          >
            {{ row.original.payment_status === "paid" ? "Pagado" : row.original.payment_status }}
          </UBadge>
        </template>

        <template #status-cell="{ row }">
          <UBadge
            :color="statusColors[row.original.status ?? ''] ?? 'neutral'"
            variant="subtle"
            size="sm"
          >
            {{ statusLabel(row.original.status) }}
          </UBadge>
        </template>

        <template #createdAt-cell="{ row }">
          <span class="text-sm text-gray-500">{{ formatDate(row.original.createdAt) }}</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-1">
            <UButton
              icon="i-lucide-eye"
              variant="ghost"
              color="neutral"
              size="sm"
              :to="`/dashboard/pedidos/${row.original._id}`"
            />
            <UButton
              icon="i-lucide-pencil"
              variant="ghost"
              color="primary"
              size="sm"
              @click="openUpdate(row.original)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <div class="flex items-center justify-between">
      <p class="text-sm text-gray-500">
        {{ total }} pedido{{ total !== 1 ? "s" : "" }} encontrado{{ total !== 1 ? "s" : "" }}
      </p>
      <UPagination
        v-if="total > pageSize"
        v-model:page="page"
        :total="total"
        :items-per-page="pageSize"
      />
    </div>
  </div>

  <UModal v-model:open="updateOpen" title="Actualizar estado del pedido">
    <template #body>
      <div class="space-y-4">
        <p class="text-sm text-gray-600">
          Pedido: <strong class="text-gray-900">{{ updateTarget?.order_code }}</strong>
        </p>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nuevo estado</label>
          <select
            v-model="newStatus"
            class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="" disabled>Selecciona un estado</option>
            <option v-for="s in ORDER_STATUSES" :key="s.value" :value="s.value">
              {{ s.label }}
            </option>
          </select>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton
          variant="ghost"
          color="neutral"
          :disabled="updating"
          @click="updateOpen = false"
        >
          Cancelar
        </UButton>
        <UButton
          color="primary"
          :loading="updating"
          :disabled="!newStatus"
          @click="confirmUpdate"
        >
          Guardar
        </UButton>
      </div>
    </template>
  </UModal>
</template>
