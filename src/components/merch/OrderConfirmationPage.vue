<template>
  <section class="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
    <Card class="shadow-md">
      <CardHeader>
        <CardTitle>{{ t.itemsToOrder }}</CardTitle>
        <CardDescription>{{ t.reviewSubtitle }}</CardDescription>
      </CardHeader>

      <CardContent>
        <div v-if="cartLines.length === 0" class="rounded-xl border border-dashed p-6 text-center">
          <p class="font-medium">{{ t.emptyCart }}</p>
          <p class="text-sm text-muted-foreground">{{ t.addFromCatalog }}</p>
        </div>

        <div v-else class="space-y-3">
          <div v-for="line in cartLines" :key="line.id" class="rounded-xl border p-4">
            <div class="flex items-start gap-3">
              <div
                class="h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-muted/20"
              >
                <img
                  v-if="line.product.imageGallery?.[0]"
                  :src="line.product.imageGallery[0]"
                  :alt="line.product.name[locale]"
                  class="h-full w-full object-contain p-1"
                  loading="lazy"
                />
                <div
                  v-else
                  :class="[
                    'h-full w-full bg-gradient-to-br',
                    line.product.gradientClass ?? 'from-zinc-200/60 via-zinc-100/40 to-transparent',
                  ]"
                />
              </div>
              <div class="flex min-w-0 flex-1 items-start justify-between gap-3">
                <div>
                  <p class="font-medium">{{ line.product.name[locale] }}</p>
                  <p v-if="getVariantLabels(line).length > 0" class="mt-1 text-xs text-muted-foreground">
                    {{ getVariantLabels(line).join(' | ') }}
                  </p>
                  <p class="mt-1 text-xs text-muted-foreground">{{ t.quantity }}: {{ line.quantity }}</p>
                </div>
                <p class="font-semibold">{{ formatCurrency.format(line.lineTotal) }}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <aside class="xl:sticky xl:top-24 xl:self-start">
      <Card class="shadow-md">
        <CardHeader>
          <CardTitle>{{ t.confirmationTitle }}</CardTitle>
          <CardDescription>{{ t.confirmationSubtitle }}</CardDescription>
        </CardHeader>

        <CardContent class="space-y-4">
          <div class="space-y-2 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">{{ t.subtotal }}</span>
              <span>{{ formatCurrency.format(subtotal) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">{{ t.creditUsed }}</span>
              <span>-{{ formatCurrency.format(creditUsed) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">{{ t.creditRemaining }}</span>
              <span>{{ formatCurrency.format(creditRemaining) }}</span>
            </div>
            <div class="flex items-center justify-between text-base">
              <span class="font-medium">{{ t.invoiceLater }}</span>
              <span class="font-semibold">{{ formatCurrency.format(walletToPay) }}</span>
            </div>
          </div>

          <div class="rounded-xl border bg-muted/30 p-3 text-sm text-muted-foreground">
            {{ t.invoiceExplanation }}
          </div>

          <div class="grid gap-2">
            <Button variant="outline" @click="$emit('back')">{{ backLabel ?? t.backToCatalog }}</Button>
            <template v-if="!readOnly">
              <Button
                :disabled="cartLines.length === 0 || isSubmitting"
                :class="
                  isPlaced
                    ? 'bg-zinc-700 text-zinc-100 hover:bg-zinc-600'
                    : ''
                "
                @mouseenter="isPlacedButtonHovered = true"
                @mouseleave="isPlacedButtonHovered = false"
                @click="$emit('place-order')"
              >
                <component
                  :is="isPlacedButtonHovered ? LockOpen : Lock"
                  v-if="isPlaced"
                  class="size-4"
                />
                {{
                  isPlacedButtonHovered && isPlaced
                    ? t.reopenOrder
                    : isPlaced
                      ? t.orderPlacedStatus
                      : t.placeOrder
                }}
              </Button>
            </template>
          </div>
        </CardContent>
      </Card>
    </aside>
  </section>
</template>

<script setup lang="ts">
import { Lock, LockOpen } from 'lucide-vue-next'
import { ref } from 'vue'

import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import type { MerchCopy } from '@/config/merch-copy'
import type { ProductVariantGroup, StoreLocale } from '@/types/merch'

type CartLine = {
  id: string
  quantity: number
  lineTotal: number
  selectedOptions: Record<string, string>
  selectedOptionLabels?: Record<string, string>
  product: {
    name: Record<StoreLocale, string>
    variantGroups?: ProductVariantGroup[]
    imageGallery?: string[]
    gradientClass?: string
  }
}

const props = defineProps<{
  t: MerchCopy
  locale: StoreLocale
  cartLines: CartLine[]
  subtotal: number
  creditUsed: number
  creditRemaining: number
  walletToPay: number
  formatCurrency: Intl.NumberFormat
  isSubmitting?: boolean
  lockActionBusy?: boolean
  isOrderLocked: boolean
  isLockDeadlinePassed: boolean
  lockDeadlineLabel: string
  orderStatusMessage: string
  readOnly?: boolean
  isPlaced?: boolean
  backLabel?: string
}>()

defineEmits<{
  back: []
  'place-order': []
}>()

const isPlacedButtonHovered = ref(false)

const getVariantLabels = (line: CartLine) =>
  {
    const snapshotLabels = Object.entries(line.selectedOptionLabels ?? {})
      .filter(([key, value]) => Boolean(key) && Boolean(value))
      .map(([key, value]) => `${key}: ${value}`)
    if (snapshotLabels.length > 0) {
      return snapshotLabels
    }

    const mappedLabels = (line.product.variantGroups ?? [])
      .map((group) => {
        const selectedOption = group.options.find((option) => option.id === line.selectedOptions[group.id])
        if (!selectedOption) {
          return null
        }

        return `${group.label[props.locale]}: ${selectedOption.label[props.locale]}`
      })
      .filter((value): value is string => Boolean(value))

    if (mappedLabels.length > 0) {
      return mappedLabels
    }

    return Object.entries(line.selectedOptions)
      .filter(([, value]) => Boolean(value))
      .map(([key, value]) => `${key}: ${value}`)
  }
</script>
