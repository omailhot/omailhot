<template>
  <header class="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
      <a :href="localizedHome" class="group flex items-center gap-3">
        <div class="flex size-10 items-center justify-center rounded-xl border border-orange-300/60 bg-[linear-gradient(90deg,#ffa000_20%,#ff4b00,#ff0035)] text-primary-foreground shadow-sm transition group-hover:scale-105">
          <ShoppingBag class="size-4" />
        </div>
        <div>
          <p class="font-semibold tracking-tight">{{ title ?? m.header_name() }}</p>
          <p class="text-xs text-muted-foreground">{{ subtitle ?? m.header_subtitle() }}</p>
        </div>
      </a>

      <div class="flex items-center gap-2">
        <template v-if="sessionEmail">
          <span class="hidden text-xs text-muted-foreground sm:inline">{{ sessionEmail }}</span>
          <Button v-if="isAdmin && view !== 'admin'" size="sm" variant="outline" @click="$emit('open-admin')">
            Admin
          </Button>
          <Button v-if="view === 'admin'" size="sm" variant="outline" @click="$emit('open-catalog')">
            Catalog
          </Button>
          <Button size="sm" variant="ghost" @click="$emit('sign-out')">Sign out</Button>
        </template>
        <Button
          v-else
          size="sm"
          variant="outline"
          :disabled="authBusy"
          @click="$emit('connect-google')"
        >
          {{ authBusy ? 'Connecting...' : 'Connect with Google' }}
        </Button>
        <LocaleSwitcher />
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ShoppingBag } from 'lucide-vue-next'

import Button from '@/components/ui/Button.vue'
import LocaleSwitcher from '@/components/LocaleSwitcher.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { m } from '@/paraglide/messages'
import { localizeHref } from '@/paraglide/runtime'

defineProps<{
  title?: string
  subtitle?: string
  sessionEmail?: string | null
  isAdmin?: boolean
  view?: 'catalog' | 'confirmation' | 'admin'
  authBusy?: boolean
}>()

defineEmits<{
  'connect-google': []
  'sign-out': []
  'open-admin': []
  'open-catalog': []
}>()

const localizedHome = localizeHref('/')
</script>
