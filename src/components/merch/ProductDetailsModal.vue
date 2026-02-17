<template>
  <Drawer :open="open" :title="t.productDetails" @close="$emit('close')">
    <div v-if="product" class="mx-auto max-w-6xl">
      <div class="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 class="text-xl font-semibold">{{ product.name[locale] }}</h2>
          <p class="text-sm text-muted-foreground">{{ product.description[locale] }}</p>
          <p class="mt-2 text-base font-semibold">{{ formatCurrency.format(product.price) }}</p>
          <div v-if="selectedVariantLabels.length > 0" class="mt-2 flex flex-wrap gap-2">
            <Badge v-for="label in selectedVariantLabels" :key="label" variant="outline">{{ label }}</Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" @click="$emit('close')">
          <X class="size-4" />
        </Button>
      </div>

      <div class="grid gap-5 md:grid-cols-[1.35fr_0.65fr]">
        <ProductImageCarousel
          :id="product.id"
          :alt="product.name[locale]"
          :image-gallery="product.imageGallery"
          :gradient-class="product.gradientClass"
          class-name="h-[22rem] border md:h-[30rem]"
        />

        <div class="space-y-4 rounded-xl border bg-muted/20 p-4">
          <div v-for="group in variantGroups" :key="group.id">
            <p class="mb-2 text-sm font-medium">{{ group.label[locale] }}</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="option in group.options"
                :key="option.id"
                size="sm"
                :variant="selections[group.id] === option.id ? 'default' : 'outline'"
                class="gap-2"
                @click="setSelection(group.id, option.id)"
              >
                <span
                  v-if="group.type === 'color' && option.swatchHex"
                  class="inline-block h-3 w-3 rounded-full border"
                  :style="{ backgroundColor: option.swatchHex }"
                />
                {{ option.label[locale] }}
              </Button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">{{ t.quantity }}</span>
            <div class="flex items-center gap-1 rounded-full border bg-background px-1 py-1">
              <Button variant="ghost" size="icon" class="h-7 w-7 rounded-full" @click="quantity = Math.max(1, quantity - 1)">
                <Minus class="size-3.5" />
              </Button>
              <span class="w-7 text-center text-sm font-medium">{{ quantity }}</span>
              <Button variant="ghost" size="icon" class="h-7 w-7 rounded-full" @click="quantity = Math.min(25, quantity + 1)">
                <Plus class="size-3.5" />
              </Button>
            </div>
          </div>

          <Button class="w-full" @click="addSelectionToCart">{{ t.addSelection }}</Button>
        </div>
      </div>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { Minus, Plus, X } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'

import ProductImageCarousel from '@/components/merch/ProductImageCarousel.vue'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import Drawer from '@/components/ui/Drawer.vue'
import type { MerchCopy } from '@/config/merch-copy'
import type { Product, StoreLocale } from '@/types/merch'

const props = defineProps<{
  t: MerchCopy
  locale: StoreLocale
  product: Product | null
  open: boolean
  formatCurrency: Intl.NumberFormat
}>()

const emit = defineEmits<{
  close: []
  'add-to-cart': [input: { productId: string; selectedOptions: Record<string, string>; quantity: number }]
}>()

const selections = ref<Record<string, string>>({})
const quantity = ref(1)

watch(
  () => props.product?.id,
  () => {
    selections.value = Object.fromEntries(
      (props.product?.variantGroups ?? []).map((group) => [group.id, group.options[0]?.id ?? '']),
    )
    quantity.value = 1
  },
  { immediate: true },
)

const variantGroups = computed(() => props.product?.variantGroups ?? [])

const selectedVariantLabels = computed(() =>
  variantGroups.value
    .map((group) => {
      const selected = group.options.find((option) => option.id === selections.value[group.id])
      if (!selected) {
        return null
      }

      return `${group.label[props.locale]}: ${selected.label[props.locale]}`
    })
    .filter((value): value is string => Boolean(value)),
)

const setSelection = (groupId: string, optionId: string) => {
  selections.value = {
    ...selections.value,
    [groupId]: optionId,
  }
}

const addSelectionToCart = () => {
  if (!props.product) {
    return
  }

  emit('add-to-cart', {
    productId: props.product.id,
    selectedOptions: selections.value,
    quantity: quantity.value,
  })

  emit('close')
}
</script>
