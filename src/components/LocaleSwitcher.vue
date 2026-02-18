<template>
  <div class="flex items-center rounded-full border border-border/70 bg-card/80 p-1">
    <button
      v-for="locale in locales"
      :key="locale"
      type="button"
      :aria-pressed="locale === currentLocale"
      :class="[
        'cursor-default rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition',
        locale === currentLocale
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
      ]"
      @click="onSwitchLocale(locale)"
    >
      {{ locale }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { getLocale, locales, setLocale } from '@/paraglide/runtime'

const currentLocale = ref(getLocale())

const onSwitchLocale = (locale: (typeof locales)[number]) => {
  currentLocale.value = locale
  setLocale(locale)
}
</script>
