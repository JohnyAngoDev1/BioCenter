import { useAsyncData } from '#app'
import axios from 'axios'
import type { Service } from '~/interfaces/service.interface'

export const useServices = () => {
    // Usamos useAsyncData para que Nuxt maneje el estado entre servidor y cliente
    const { data: servicesList, pending, error } = useAsyncData<Service[]>(
        'services',
        async () => {
            // Importante: Axios requiere URL absoluta en SSR (servidor)
            // En el cliente, las rutas relativas funcionan bien.
            const config = useRuntimeConfig();
            const baseUrl = import.meta.server ? (process.env.NITRO_URL || 'http://localhost:3000') : '';
            
            try {
                const { data } = await axios.get(`${baseUrl}/api/services`);
                return data;
            } catch (err) {
                console.error('[useServices] Axios error:', err);
                throw err;
            }
        }
    )

    return {
        servicesList,
        pending,
        error
    }
}
