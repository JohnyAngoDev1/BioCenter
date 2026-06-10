<template>
  <div class="bg-white min-h-screen">
    <UContainer class="max-w-3xl py-16 px-5">

      <NuxtLink to="/" prefetch class="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary transition-colors mb-10">
        <UIcon name="i-heroicons-arrow-left-20-solid" />
        Volver al inicio
      </NuxtLink>

      <span class="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-3 block">
        Legal
      </span>
      <h1 class="text-4xl md:text-5xl font-black text-black leading-tight mb-4">
        Políticas de Privacidad
      </h1>
      <p class="text-gray-400 text-sm mb-12">Última actualización: {{ new Date().getFullYear() }}</p>

      <div class="prose prose-sm max-w-none space-y-8 text-gray-600 leading-relaxed">

        <section class="space-y-3">
          <h2 class="text-lg font-black text-black uppercase tracking-widest text-xs">
            Tratamiento de Datos Personales
          </h2>
          <p>
            Nuestra política de privacidad informa a los usuarios sobre el tratamiento de sus datos personales.
            Recopilamos información a través de formularios y cookies con el fin de mejorar la experiencia del
            usuario y ofrecer servicios personalizados.
          </p>
        </section>

        <section class="space-y-3">
          <h2 class="text-lg font-black text-black uppercase tracking-widest text-xs">
            Almacenamiento y Uso
          </h2>
          <p>
            Los datos se almacenan de manera segura y se utilizan exclusivamente para los fines especificados.
            No compartimos información personal con terceros sin el consentimiento del usuario.
          </p>
        </section>

        <section class="space-y-3">
          <h2 class="text-lg font-black text-black uppercase tracking-widest text-xs">
            Derechos del Usuario
          </h2>
          <p>
            Los usuarios tienen derecho a acceder, rectificar y eliminar sus datos en cualquier momento.
            Para ejercer estos derechos, puede contactarnos a través de los canales disponibles en nuestra
            página de contacto.
          </p>
        </section>

      </div>
    </UContainer>
  </div>
</template>
