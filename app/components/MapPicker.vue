<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  isCompact: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'close'])

const mapContainer = ref<HTMLElement | null>(null)
let map: any = null
let marker: any = null

// Coordenadas iniciales (Ecuador - Guayaquil aprox por defecto)
const lat = ref(-2.1702)
const lng = ref(-79.9223)

onMounted(async () => {
  console.log('[MapPicker] Componente montado. Iniciando carga de Leaflet...')
  if (!mapContainer.value) {
    console.error('[MapPicker] No se encontró el contenedor del mapa.')
    return
  }

  // Importación dinámica para evitar "window is not defined" en SSR
  const L = await import('leaflet')
  console.log('[MapPicker] Librería Leaflet cargada correctamente.')

  // Esperar un momento a que el Modal termine de abrirse y tenga dimensiones reales
  setTimeout(() => {
    if (!mapContainer.value) return
    
    const containerHeight = mapContainer.value.offsetHeight
    const containerWidth = mapContainer.value.offsetWidth
    console.log(`[MapPicker] Inicializando mapa en contenedor de ${containerWidth}x${containerHeight}px`)

    // Icono Personalizado Esmeralda (SVG)
    const emeraldPin = L.divIcon({
      className: 'custom-emerald-pin',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-10 h-10 bg-primary/20 rounded-full animate-ping"></div>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21C16 17.5 19 14.4183 19 10C19 6.13401 15.866 3 12 3C8.13401 3 5 6.13401 5 10C5 14.4183 8 17.5 12 21Z" fill="#10b981" stroke="white" stroke-width="2" stroke-linejoin="round"/>
            <circle cx="12" cy="10" r="3" fill="white"/>
          </svg>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    })

    map = L.map(mapContainer.value, {
      zoomControl: !props.isCompact // Ocultar en modo compacto
    }).setView([lat.value, lng.value], 15)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map)

    // Escala del mapa
    if (!props.isCompact) {
      L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map)
    }

    // Marcador que sigue al centro del mapa
    marker = L.marker([lat.value, lng.value], { icon: emeraldPin }).addTo(map)

    map.on('move', () => {
      if (map && marker) {
        const center = map.getCenter()
        marker.setLatLng(center)
        lat.value = center.lat
        lng.value = center.lng
      }
    })

    // Forzar el redibujado por si acaso
    map.invalidateSize()
    console.log('[MapPicker] Mapa renderizado y listo.')
  }, 200)
})

onUnmounted(() => {
  if (map) {
    console.log('[MapPicker] Destruyendo instancia de mapa.')
    map.remove()
  }
})

const handleConfirm = () => {
  console.log('[MapPicker] Ubicación confirmada:', { lat: lat.value, lng: lng.value })
  emit('confirm', { lat: lat.value, lng: lng.value })
}
</script>

<template>
  <div class="flex flex-col w-full overflow-hidden bg-gray-50 rounded-2xl border border-gray-100 shadow-inner transition-all duration-500"
       :class="isCompact ? 'h-[150px]' : 'min-h-[350px]'"
  >
    <!-- Map Container -->
    <div ref="mapContainer" class="flex-1 relative z-0" :class="isCompact ? 'min-h-[150px]' : 'min-h-[250px]'">
      <!-- Loader visual sutil mientras Leaflet se inicializa -->
      <div v-if="!map" class="absolute inset-0 flex items-center justify-center bg-gray-50/50">
        <UIcon name="i-heroicons-arrow-path-20-solid" class="animate-spin text-primary text-2xl" />
      </div>
      
      <!-- Overlay de bloque para modo compacto -->
      <div v-if="isCompact" class="absolute inset-0 z-[1001] bg-transparent cursor-default"></div>

      <!-- Crosshair visual mejorado (Solo si no es compacto) -->
      <div v-if="!isCompact" class="absolute inset-0 pointer-events-none flex items-center justify-center z-[1000]">
        <div class="w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)] border-2 border-white"></div>
        <div class="absolute w-12 h-12 border-2 border-primary/20 rounded-full animate-pulse"></div>
      </div>
    </div>

    <!-- Footer Stats & Button (Oculto en modo compacto) -->
    <div v-if="!isCompact" class="p-3 border-t border-gray-100 bg-white z-10">
      <div class="flex items-center justify-between gap-4">
        <div class="hidden sm:flex items-center gap-2">
          <UIcon name="i-heroicons-globe-alt-20-solid" class="text-primary" />
          <div class="px-2 py-1 rounded bg-gray-50 border border-gray-100 text-[10px] font-mono text-gray-500 font-bold uppercase tracking-tighter">
            📍 {{ lat.toFixed(5) }}, {{ lng.toFixed(5) }}
          </div>
        </div>
        <UButton 
          type="button"
          color="primary" 
          size="lg" 
          class="rounded-full px-10 font-bold shadow-lg shadow-primary/10 flex-1 sm:flex-none"
          @click="handleConfirm"
        >
          Fijar esta ubicación
        </UButton>
      </div>
    </div>
  </div>
</template>

<style>
/* Estilos Globales para Leaflet */
.leaflet-container {
  width: 100%;
  height: 100%;
  font-family: inherit;
}

/* Rediseño de Controles de Zoom */
.leaflet-control-zoom {
  border: none !important;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08) !important;
  margin-top: 15px !important;
  margin-left: 15px !important;
}

.leaflet-control-zoom-in, .leaflet-control-zoom-out {
  background: white !important;
  color: #10b981 !important;
  border: 1px solid #f3f4f6 !important;
  border-radius: 12px !important;
  width: 36px !important;
  height: 36px !important;
  line-height: 36px !important;
  font-weight: bold !important;
  transition: all 0.2s ease !important;
}

.leaflet-control-zoom-in:hover, .leaflet-control-zoom-out:hover {
  background: #f9fafb !important;
  transform: scale(1.05);
}

.leaflet-control-zoom-in {
  margin-bottom: 4px !important;
}

/* Animación del Pin */
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>
