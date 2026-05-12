import { useAsyncData } from '#app'
import type { Service } from '~/interfaces/service.interface'

export const useServices = () => {
    const { data: servicesList, pending, error } = useAsyncData<Service[]>(
        'services',
        () => $fetch<Service[]>('/api/services')
    )

    return {
        servicesList,
        pending,
        error
    }
}
