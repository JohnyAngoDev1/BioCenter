import { useFetch } from '#app'
import type { Service } from '~/interfaces/service.interface'

export const useServices = () => {
    const { data: servicesList, pending, error } = useFetch<Service[]>('/api/services')

    return {
        servicesList,
        pending,
        error
    }
}
