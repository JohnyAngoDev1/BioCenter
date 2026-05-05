<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center animate-fade-in">
      <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h1 class="text-3xl font-bold text-slate-900 mb-2">¡Pago Exitoso!</h1>
      <p class="text-slate-600 mb-8">
        Tu transacción ha sido procesada correctamente. Pronto recibirás un correo con los detalles de tu pedido.
      </p>

      <div class="bg-slate-50 rounded-2xl p-4 mb-8 text-left">
        <div class="flex justify-between mb-2">
          <span class="text-slate-500 text-sm">Transacción ID:</span>
          <span class="text-slate-900 font-mono text-sm">{{ transactionId }}</span>
        </div>
      </div>

      <NuxtLink 
        to="/" 
        class="block w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
      >
        Volver al Inicio
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const transactionId = computed(() => route.query.clientTransactionId || 'N/A')

// Aquí podrías añadir lógica para limpiar el carrito si fuera necesario
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
