<template>
  <section class="mt-5">
    <Card class="shadow-md">
      <CardHeader class="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle>Order details</CardTitle>
          <CardDescription>Admin view of submitted items</CardDescription>
        </div>
        <Button variant="outline" @click="$emit('back')">Retour en arrière</Button>
      </CardHeader>
      <CardContent>
        <div v-if="cartLines.length === 0" class="rounded-xl border border-dashed p-6 text-center">
          <p class="font-medium">{{ t.emptyCart }}</p>
          <p class="text-sm text-muted-foreground">{{ t.addFromCatalog }}</p>
        </div>

        <div v-else class="space-y-3">
          <div v-for="line in cartLines" :key="line.id" class="rounded-xl border p-4">
            <div class="flex items-start gap-3">
              <div class="h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-muted/20">
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
                  <p class="mt-1 text-xs text-muted-foreground">
                    {{ t.variants }}: {{ getVariantLabels(line).join(' | ') || t.noVariants }}
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
  </section>
</template>

<script setup lang="ts">
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
  formatCurrency: Intl.NumberFormat
}>()

defineEmits<{
  back: []
}>()

const getVariantLabels = (line: CartLine) => {
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

  const snapshotLabels = Object.entries(line.selectedOptionLabels ?? {})
    .filter(([key, value]) => Boolean(key) && Boolean(value))
    .map(([key, value]) => `${key}: ${value}`)
  if (snapshotLabels.length > 0) {
    return snapshotLabels
  }

  return Object.entries(line.selectedOptions)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${key}: ${value}`)
}
</script>
