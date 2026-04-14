<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useTemplate } from '~/composables/useTemplate'

const { t } = useTemplate()

const nombre = ref('')
const correo = ref('')
const asunto = ref('')
const mensaje = ref('')

const sendForm = () => {
  const phone = t('wspbutton_phone_number')
  const text = `Hola, mi nombre es ${nombre.value}. 
Correo: ${correo.value}
Asunto: ${asunto.value}
Mensaje: ${mensaje.value}`
  
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank')
}

const items = computed(() => [
  t('contactus_subject_option_1'),
  t('contactus_subject_option_2'),
  t('contactus_subject_option_3'),
  t('contactus_subject_option_4')
])
</script>

<template>
  <UPageSection class="bg-primary/10">
    <UContainer>
      <div class="bg-white rounded-[3rem] overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2">

        <div class="bg-primary p-10 sm:p-16 flex flex-col justify-between text-white">
          <div class="space-y-10">
            <div class="space-y-6">
              <h2 class="text-5xl lg:text-5xl font-black tracking-tighter leading-[1.1] whitespace-pre-line">
                {{ t('contactus_header_title') }}
              </h2>
              <p class="text-white/90 leading-relaxed max-w-md">
                {{ t('contactus_header_description') }}
              </p>
            </div>

            <div class="space-y-5">
              <div class="flex items-center gap-5">
                <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <UIcon name="i-heroicons-envelope" class="text-2xl text-white" />
                </div>
                <a :href="'mailto:' + t('contactus_info_email')" class="font-bold hover:underline transition-all">
                  {{ t('contactus_info_email') }}
                </a>
              </div>
              <div class="flex items-center gap-5">
                <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <UIcon name="i-heroicons-map-pin" class="text-2xl text-white" />
                </div>
                <span class="font-bold">{{ t('contactus_info_address') }}</span>
              </div>
              <div class="flex items-center gap-5">
                <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <UIcon name="i-heroicons-phone" class="text-2xl text-white" />
                </div>
                <a :href="'tel:' + t('contactus_info_phone').replace(/\s+/g, '')" class="font-bold hover:underline transition-all">
                  {{ t('contactus_info_phone') }}
                </a>
              </div>
            </div>
          </div>

          <div class="pt-10 border-t border-white/20">
            <p class="uppercase tracking-[0.2em] mb-6 opacity-80">
              {{ t('contactus_social_title') }}
            </p>
            <div class="flex gap-4">
              <UButton icon="zmdi:globe" variant="ghost" />
              <UButton icon="ic:baseline-grid-view" variant="ghost" />
              <UButton icon="material-symbols:share-outline" variant="ghost" />
            </div>
          </div>
        </div>

        <div class="p-8 sm:p-16 bg-white flex flex-col justify-center">
          <div class="space-y-8 ld:">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <UFormField :label="t('contactus_form_name_label')">
                <UInput v-model="nombre" placeholder="John Doe" variant="none"
                  class="bg-gray-50 rounded-xl p-2 w-full" />
              </UFormField>

              <UFormField :label="t('contactus_form_email_label')">
                <UInput v-model="correo" placeholder="john@company.com" variant="none"
                  class="bg-gray-50 rounded-xl p-2 w-full" />
              </UFormField>
            </div>

            <UFormField :label="t('contactus_form_subject_label')" class="w-full">
              <USelectMenu v-model="asunto" :placeholder="t('contactus_form_subject_placeholder')" :items="items" clear
                variant="none" class="bg-gray-50 rounded-xl py-3 w-full" />
            </UFormField>

            <UFormField :label="t('contactus_form_message_label')">
              <UTextarea v-model="mensaje" :placeholder="t('contactus_form_message_placeholder')" variant="none"
                :rows="5" class="bg-gray-50 rounded-xl w-full" />
            </UFormField>

            <div class="pt-4">
              <UButton block size="xl"
                class="rounded-2xl py-5 bg-primary text-white font-bold text-lg shadow-xl shadow-primary/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-3"
                @click="sendForm">
                <div class="flex items-center gap-2">
                  <span>{{ t('contactus_form_submit_button') }}</span>
                  <UIcon name="material-symbols:send-outline" class="size-5" />
                </div>
              </UButton>
            </div>
          </div>
        </div>

      </div>
    </UContainer>
  </UPageSection>
</template>