import type { Testimonials } from '~/interfaces/testimonial.interface';

export const useTestimonials = () => {
    const testimonialsList: Testimonials[] = [
        {
            user: {
                name: 'Evan You',
                description: 'Author of Vue.js and Vite',
                avatar: {
                    src: 'https://avatars.githubusercontent.com/u/499550?v=4',
                    alt: 'Evan You'
                }
            },
            quote: 'Nuxt on Cloudflare infra with minimal effort - this is huge!',
            rate: 1
        },
        {
            user: {
                name: 'Igor Minar',
                description: 'Software Engineer at Cloudflare',
                avatar: {
                    src: 'https://avatars.githubusercontent.com/u/216296?v=4',
                    alt: 'Igor Minar'
                }
            },
            quote: 'I love the polish and the batteries-included approach. NuxtHub takes web framework and hosting integration to a new level!',
            rate: 3
        },
    ]

    return {
        testimonialsList
    }
}
