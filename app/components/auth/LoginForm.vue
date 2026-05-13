<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const schema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type Schema = z.output<typeof schema>;

const { login, loading } = useAuth();
const showPassword = ref(false);

const state = reactive<Partial<Schema>>({
  email: undefined,
  password: undefined,
});

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  await login(event.data.email, event.data.password);
};
</script>

<template>
  <div class="w-full max-w-sm">
    <div class="mb-8 text-center">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <UIcon name="i-lucide-shield-check" class="size-7 text-primary" />
      </div>
      <h1 class="text-2xl font-bold text-gray-900">Iniciar sesión</h1>
      <p class="mt-1 text-sm text-gray-500">Ingresa tus credenciales para continuar</p>
    </div>

    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField label="Correo electrónico" name="email">
        <UInput
          v-model="state.email"
          type="email"
          placeholder="correo@ejemplo.com"
          size="lg"
          class="w-full"
          icon="i-lucide-mail"
          autocomplete="email"
        />
      </UFormField>

      <UFormField label="Contraseña" name="password">
        <UInput
          v-model="state.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="••••••••"
          size="lg"
          class="w-full"
          icon="i-lucide-lock"
          autocomplete="current-password"
          :ui="{ icon: { trailing: { pointer: '' } } }"
        >
          <template #trailing>
            <UButton
              color="gray"
              variant="ghost"
              :icon="showPassword ? 'i-heroicons-eye-slash-20-solid' : 'i-heroicons-eye-20-solid'"
              :padded="false"
              @click="showPassword = !showPassword"
            />
          </template>
        </UInput>
      </UFormField>

      <UButton
        type="submit"
        size="lg"
        class="mt-2 w-full justify-center"
        :loading="loading"
      >
        Ingresar
      </UButton>
    </UForm>
  </div>
</template>
