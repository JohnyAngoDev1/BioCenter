<script setup lang="ts">
import { ORDER_STATUSES } from "~/composables/usePedidos";

definePageMeta({ middleware: "auth", layout: "dashboard" });

const route = useRoute();
const { getById, update } = usePedidos();

const { data: pedido, pending, error } = useAsyncData(
  `pedido-${route.params.id}`,
  () => getById(route.params.id as string),
  { server: false },
);

const statusColors: Record<string, "success" | "warning" | "error" | "neutral"> = {
  entregado: "success",
  procesando: "warning",
  pendiente: "neutral",
  cancelado: "error",
};

function statusLabel(value?: string) {
  return ORDER_STATUSES.find((s) => s.value === value)?.label ?? value ?? "Sin estado";
}

const newStatus = ref("");
const saving = ref(false);

watch(pedido, (val) => {
  if (val) newStatus.value = val.status ?? "";
}, { immediate: true });

async function saveStatus() {
  if (!pedido.value?._id || !newStatus.value) return;
  saving.value = true;
  try {
    await update(pedido.value._id, newStatus.value);
    pedido.value.status = newStatus.value;
  } finally {
    saving.value = false;
  }
}

function formatDate(date?: string) {
  if (!date) return "—";
  return new Date(date).toLocaleString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(val?: { $numberDecimal: string }) {
  return val ? `$${Number(val.$numberDecimal).toFixed(2)}` : "—";
}
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center gap-3">
      <UButton
        icon="i-lucide-arrow-left"
        variant="ghost"
        color="neutral"
        to="/dashboard/pedidos"
      />
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Detalle del Pedido</h1>
        <p v-if="pedido" class="mt-0.5 text-sm text-gray-500 font-mono">
          {{ pedido.order_code }}
        </p>
      </div>
    </div>

    <div v-if="pending" class="flex justify-center py-20">
      <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-gray-400" />
    </div>

    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      Error al cargar el pedido: {{ (error as any)?.data?.message ?? (error as any)?.message }}
    </div>

    <template v-else-if="pedido">
      <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <!-- Estado del pedido -->
        <UCard class="lg:col-span-1">
          <template #header>
            <h2 class="font-semibold text-gray-900">Estado del pedido</h2>
          </template>
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500">Actual:</span>
              <UBadge
                :color="statusColors[pedido.status ?? ''] ?? 'neutral'"
                variant="subtle"
              >
                {{ statusLabel(pedido.status) }}
              </UBadge>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cambiar estado</label>
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
            <UButton
              color="primary"
              block
              :loading="saving"
              :disabled="!newStatus || newStatus === pedido.status"
              @click="saveStatus"
            >
              Guardar estado
            </UButton>
          </div>
        </UCard>

        <!-- Info del cliente -->
        <UCard class="lg:col-span-2">
          <template #header>
            <h2 class="font-semibold text-gray-900">Información del cliente</h2>
          </template>
          <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt class="text-gray-500">Nombre</dt>
              <dd class="font-medium text-gray-900">{{ pedido.billingData?.fullName ?? pedido.full_name }}</dd>
            </div>
            <div>
              <dt class="text-gray-500">Cédula / RUC</dt>
              <dd class="font-medium text-gray-900">{{ pedido.billingData?.dni ?? pedido.document_number }}</dd>
            </div>
            <div>
              <dt class="text-gray-500">Email</dt>
              <dd class="font-medium text-gray-900">{{ pedido.billingData?.email }}</dd>
            </div>
            <div>
              <dt class="text-gray-500">Teléfono</dt>
              <dd class="font-medium text-gray-900">{{ pedido.billingData?.phone }}</dd>
            </div>
            <div class="col-span-2">
              <dt class="text-gray-500">Dirección</dt>
              <dd class="font-medium text-gray-900">
                {{ pedido.billingData?.main_street }}, {{ pedido.billingData?.secondary_street }}
                {{ pedido.billingData?.house_number }}
              </dd>
            </div>
          </dl>
        </UCard>
      </div>

      <!-- Productos del pedido -->
      <UCard>
        <template #header>
          <h2 class="font-semibold text-gray-900">Productos</h2>
        </template>
        <div class="divide-y divide-gray-100">
          <div
            v-for="(item, i) in pedido.items"
            :key="i"
            class="flex items-center justify-between py-3"
          >
            <div>
              <p class="font-medium text-gray-900">{{ item.name_snapshot }}</p>
              <p class="text-xs text-gray-400">
                Cantidad: {{ item.quantity }} · P. unitario: {{ formatMoney(item.unit_price) }}
              </p>
            </div>
            <span class="font-semibold text-gray-900">{{ formatMoney(item.total_price) }}</span>
          </div>
        </div>
        <div class="mt-4 space-y-1 border-t border-gray-100 pt-4 text-sm">
          <div class="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>{{ formatMoney(pedido.subtotal) }}</span>
          </div>
          <div class="flex justify-between text-gray-500">
            <span>IVA</span>
            <span>{{ formatMoney(pedido.iva) }}</span>
          </div>
          <div class="flex justify-between font-bold text-gray-900 text-base pt-1">
            <span>Total</span>
            <span>{{ formatMoney(pedido.total) }}</span>
          </div>
        </div>
      </UCard>

      <!-- Pago -->
      <UCard>
        <template #header>
          <h2 class="font-semibold text-gray-900">Información de pago</h2>
        </template>
        <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          <div>
            <dt class="text-gray-500">Proveedor</dt>
            <dd class="font-medium text-gray-900 capitalize">{{ pedido.payment_provider }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Estado pago</dt>
            <dd>
              <UBadge
                :color="pedido.payment_status === 'paid' ? 'success' : 'warning'"
                variant="subtle"
                size="sm"
              >
                {{ pedido.payment_status === "paid" ? "Pagado" : pedido.payment_status }}
              </UBadge>
            </dd>
          </div>
          <div>
            <dt class="text-gray-500">Estado PayPhone</dt>
            <dd>
              <UBadge
                :color="pedido.payphone_status === 'APPROVED' ? 'success' : 'error'"
                variant="subtle"
                size="sm"
              >
                {{ pedido.payphone_status }}
              </UBadge>
            </dd>
          </div>
          <div class="col-span-2 sm:col-span-3">
            <dt class="text-gray-500">Referencia de pago</dt>
            <dd class="font-mono text-xs text-gray-700 break-all">{{ pedido.payment_reference }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Fecha de creación</dt>
            <dd class="font-medium text-gray-900">{{ formatDate(pedido.createdAt) }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Última actualización</dt>
            <dd class="font-medium text-gray-900">{{ formatDate(pedido.updatedAt) }}</dd>
          </div>
        </dl>
      </UCard>
    </template>
  </div>
</template>
