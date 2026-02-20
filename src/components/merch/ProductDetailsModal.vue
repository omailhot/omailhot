<template>
  <Drawer :open="open" :title="t.productDetails" @close="$emit('close')">
    <div
      v-if="product"
      class="mx-auto w-full max-h-[calc(86dvh-2rem)] max-w-7xl overflow-y-auto pr-1"
    >
      <div class="mb-4 flex justify-end">
        <Button variant="ghost" size="icon" @click="$emit('close')">
          <X class="size-4" />
        </Button>
      </div>

      <div class="grid w-full gap-5 md:grid-cols-[1.35fr_0.65fr]">
        <ProductImageCarousel
          :id="product.id"
          :alt="product.name[locale]"
          :image-gallery="variantImageGallery"
          :gradient-class="product.gradientClass"
          :zoomable="true"
          class-name="h-[22rem] border md:h-[30rem]"
        />

        <div class="bg-muted/20 flex max-h-[70vh] min-h-0 flex-col rounded-xl border p-4">
          <div class="min-h-0 flex-1 space-y-4 overflow-y-auto pb-24 pr-1">
            <div>
              <h2 class="text-xl font-semibold">{{ product.name[locale] }}</h2>
              <p class="text-muted-foreground text-sm">
                {{ product.description[locale] }}
              </p>
              <p class="mt-2 text-base font-semibold">
                {{ formatCurrency.format(product.price) }}
              </p>
            </div>

            <div v-for="group in variantGroups" :key="group.id">
              <p class="mb-2 text-sm font-medium">
                {{ getVariantGroupLabel(group) }}
              </p>
              <div class="flex flex-wrap gap-2">
                <Button
                  v-for="option in group.options"
                  :key="option.id"
                  size="sm"
                  :variant="
                    selections[group.id] === option.id ? 'default' : 'outline'
                  "
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
              <div>
                <span class="text-sm font-medium">{{ t.quantity }}</span>
                <p
                  v-if="isGiftCardProduct"
                  class="text-muted-foreground mt-1 text-xs"
                >
                  {{ t.giftCardQuantityLimit }}
                </p>
              </div>
              <QuantityStepper v-model="quantity" :min="1" :max="maxQuantity" />
            </div>
          </div>

          <div
            class="sticky bottom-0 mt-2 border-t bg-muted/20 pt-3"
            style="padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 0.25rem);"
          >
            <Button class="w-full" :disabled="readOnly" @click="addSelectionToCart">
              {{ t.addSelection }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { X } from "lucide-vue-next";
import { computed, ref, watch } from "vue";

import ProductImageCarousel from "@/components/merch/ProductImageCarousel.vue";
import Button from "@/components/ui/Button.vue";
import Drawer from "@/components/ui/Drawer.vue";
import QuantityStepper from "@/components/ui/QuantityStepper.vue";
import type { MerchCopy } from "@/config/merch-copy";
import { getMaxQuantityForProductId, isGiftCardProductId } from "@/lib/merch-quantity";
import type { Product, ProductVariantGroup, StoreLocale } from "@/types/merch";

const props = defineProps<{
  t: MerchCopy;
  locale: StoreLocale;
  product: Product | null;
  open: boolean;
  formatCurrency: Intl.NumberFormat;
  readOnly?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  "add-to-cart": [
    input: {
      productId: string;
      selectedOptions: Record<string, string>;
      quantity: number;
    },
  ];
}>();

const selections = ref<Record<string, string>>({});
const quantity = ref(1);

watch(
  () => props.product?.id,
  () => {
    selections.value = Object.fromEntries(
      (props.product?.variantGroups ?? []).map((group) => [
        group.id,
        group.options[0]?.id ?? "",
      ]),
    );
    quantity.value = 1;
  },
  { immediate: true },
);

const variantGroups = computed(() => props.product?.variantGroups ?? []);
const maxQuantity = computed(() =>
  props.product ? getMaxQuantityForProductId(props.product.id) : 25,
);
const isGiftCardProduct = computed(() =>
  props.product ? isGiftCardProductId(props.product.id) : false,
);
const variantImageGallery = computed(() => {
  if (!props.product?.imageGallery?.length) {
    return props.product?.imageGallery;
  }

  const selectedGroups = (props.product.variantGroups ?? [])
    .map((group) => {
      const selected = selections.value[group.id];
      if (!selected) {
        return null;
      }
      return { groupId: group.id.toLowerCase(), selected: selected.toLowerCase() };
    })
    .filter((value): value is { groupId: string; selected: string } => Boolean(value));
  if (selectedGroups.length === 0) {
    return props.product.imageGallery;
  }

  const matches = props.product.imageGallery.filter((image) =>
    selectedGroups.every(({ groupId, selected }) => {
      const normalized = image.toLowerCase();
      if (groupId.includes("color")) {
        return normalized.includes(selected);
      }
      if (groupId.includes("image")) {
        if (selected === "logo") {
          return normalized.includes("logo") || normalized.includes("_2.");
        }
        if (selected === "rocket") {
          return normalized.includes("rocket") || normalized.includes("_1.");
        }
        return normalized.includes(selected);
      }
      return true;
    }),
  );
  if (matches.length === 0 || matches.length === props.product.imageGallery.length) {
    return props.product.imageGallery;
  }

  return [
    ...matches,
    ...props.product.imageGallery.filter((image) => !matches.includes(image)),
  ];
});

const getVariantGroupLabel = (group: ProductVariantGroup) => {
  if (group.type === "size") {
    return props.locale === "fr" ? "Tailles" : "Sizes";
  }
  if (group.type === "color") {
    return props.locale === "fr" ? "Couleurs" : "Colors";
  }
  return group.label[props.locale];
};

const setSelection = (groupId: string, optionId: string) => {
  selections.value = {
    ...selections.value,
    [groupId]: optionId,
  };
};

const addSelectionToCart = () => {
  if (!props.product) {
    return;
  }

  emit("add-to-cart", {
    productId: props.product.id,
    selectedOptions: selections.value,
    quantity: quantity.value,
  });

  emit("close");
};
</script>
