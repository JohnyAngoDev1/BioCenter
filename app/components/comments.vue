<script setup lang="ts">
import { useTemplate } from '~/composables/useTemplate';
import { useTestimonials } from '~/composables/useTestimonials';

const { t } = useTemplate()
const { testimonialsList } = useTestimonials()
</script>

<template>
    <UPageSection class="bg-secondary">
        <UContainer>
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 gap-6">
                <div class="max-w-2xl space-y-4 text-left">
                    <span class="text-primary text-sm font-black uppercase tracking-[0.2em] block">
                        {{ t('comments_section_subtitle') }}
                    </span>
                    <h2 class="text-4xl lg:text-6xl font-black text-black tracking-tighter leading-[1.1]">
                        {{ t('comments_section_title') }}
                    </h2>
                </div>

                <div class="flex gap-3">
                    <UButton icon="i-heroicons-chevron-left" variant="outline"
                        class="p-3 border-gray-200 text-gray-900 hover:bg-gray-50 rounded-full" />
                    <UButton icon="i-heroicons-chevron-right" variant="outline"
                        class="p-3 border-gray-200 text-gray-900 hover:bg-gray-50 rounded-full" />
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <UPageCard v-for="(testimonial, index) in testimonialsList" :key="index" class=" rounded-4xl">
                    <div class="absolute top-2 right-10">
                        <span class="text-primary/10 text-5xl leading-none">❞</span>
                    </div>

                    <template #header>
                        <div class="flex gap-1">
                            <UIcon v-for="n in 5" :key="n"
                                :name="n <= testimonial.rate ? 'i-heroicons-star-20-solid' : 'heroicons-outline:star'"
                                :class="n <= testimonial.rate ? 'text-primary' : 'text-primary opacity-50'"
                                class="text-xl" />
                        </div>
                    </template>



                    <template #footer>
                        <p class="text-gray-500 text-xl leading-relaxed flex-2">
                            "{{ testimonial.quote }}"
                        </p>

                    </template>
                    <div class="flex items-center gap-4">
                        <UAvatar :src="testimonial.user.avatar.src" :alt="testimonial.user.name" size="lg"
                            class="bg-gray-100" />
                        <div class="flex flex-col">
                            <span class="font-bold text-[#0f172a] text-lg">{{ testimonial.user.name }}</span>
                            <span class="text-gray-400 text-xs uppercase font-bold tracking-wider">{{
                                testimonial.user.description }}</span>
                        </div>
                    </div>

                </UPageCard>
            </div>
        </UContainer>
    </UPageSection>
</template>