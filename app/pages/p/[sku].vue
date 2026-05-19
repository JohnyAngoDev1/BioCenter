<script setup lang="ts">
const route = useRoute();
const sku = route.params.sku as string;

const { data: producto, error } = await useAsyncData(`sku-${sku}`, () =>
  $fetch(`/api/productos/sku/${encodeURIComponent(sku)}`).catch(() => null)
);

if (error.value || !producto.value) {
  await navigateTo("/servicios", { redirectCode: 302 });
} else {
  const BASE = "https://www.biocenter.life";
  const rawUrl = (producto.value as any).url as string | undefined;
  const destino = rawUrl
    ? rawUrl.startsWith("http") ? rawUrl : `${BASE}/${rawUrl.replace(/^\//, "")}`
    : `${BASE}/servicio/${(producto.value as any).slug}`;
  await navigateTo(destino, { external: true, redirectCode: 302 });
}
</script>

<template>
  <div />
</template>
