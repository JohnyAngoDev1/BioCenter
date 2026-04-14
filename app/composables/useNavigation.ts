import { computed } from 'vue'
import { useTemplate } from '~/composables/useTemplate'
import { useRoute } from 'vue-router'

export const useNavigation = () => {
    const { t } = useTemplate()
    const route = useRoute()

    const navItems = computed(() => {
        const items = [
            { label: t('navbar_link_home'), to: '/#top' },
            { label: t('navbar_link_services'), to: '/#servicios' },
            { label: t('navbar_link_contact'), to: '#contacto' },
        ]

        if (route.path === '/servicios') {
            return items.filter(item => item.to !== '/#servicios')
        }

        return items
    })

    const footerLinks = computed(() => ({
        experience: [
            { label: t('footer_link_portfolio'), to: '#' },
            { label: t('footer_link_consulting'), to: '#' },
            { label: t('footer_link_catalog'), to: '#' },
            { label: t('footer_link_processes'), to: '#' }
        ],
        company: [
            { label: t('footer_link_story'), to: '#' },
            { label: t('footer_link_team'), to: '#' },
            { label: t('footer_link_press'), to: '#' },
            { label: t('footer_link_privacy'), to: '#' }
        ]
    }))

    return {
        navItems,
        footerLinks
    }
}
