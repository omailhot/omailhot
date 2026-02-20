<template>
  <section class="animate-fade-up-delay space-y-4">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="product in visibleProducts"
        :key="product.id"
        class="border-border/60 bg-card/80 flex h-full cursor-pointer flex-col rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        tabindex="0"
        @click="$emit('open-product', product.id)"
        @keydown.enter.prevent="$emit('open-product', product.id)"
        @keydown.space.prevent="$emit('open-product', product.id)"
      >
        <ProductImageCarousel
          :id="product.id"
          :alt="product.name[locale]"
          :image-gallery="product.imageGallery"
          :gradient-class="product.gradientClass"
          class-name="mb-4 h-80"
        />

        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-semibold">{{ product.name[locale] }}</h3>
            <p class="text-muted-foreground mt-1 text-sm">
              {{ getCardDescription(product.description[locale]) }}
            </p>
            <p
              v-if="isGiftCardProduct(product.id)"
              class="text-muted-foreground/85 mt-1 text-[11px] font-medium"
            >
              {{ t.giftCardQuantityLimit }}
            </p>
          </div>
          <div class="text-right">
            <p class="font-semibold">
              {{ formatCurrency.format(product.price) }}
            </p>
            <p class="text-muted-foreground text-xs">{{ t.perItem }}</p>
          </div>
        </div>

        <div
          :class="[
            'mt-auto grid gap-2 pt-4',
            viewOnly ? 'grid-cols-1' : 'grid-cols-2',
          ]"
        >
          <Button
            variant="outline"
            @click.stop="$emit('open-product', product.id)"
          >
            {{ t.viewDetails }}
          </Button>
          <TooltipProvider v-if="!viewOnly && isGiftCardLimitReached(product.id)">
            <Tooltip>
              <TooltipTrigger as-child>
                <span class="inline-flex w-full" @click.stop>
                  <Button
                    class="w-full"
                    disabled
                    @click.stop
                  >
                    <ShoppingCart class="size-4" />
                    {{
                      (product.variantGroups ?? []).length > 0
                        ? t.selectVariant
                        : t.quickAdd
                    }}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                :side-offset="8"
                class="z-[90] max-w-80 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm leading-relaxed font-semibold text-zinc-50 shadow-xl"
              >
                {{ t.giftCardLimitReached }}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            v-else-if="!viewOnly"
            @click.stop="$emit('quick-add', product.id)"
          >
            <ShoppingCart class="size-4" />
            {{
              (product.variantGroups ?? []).length > 0
                ? t.selectVariant
                : t.quickAdd
            }}
          </Button>
        </div>
      </article>
    </div>

    <div
      v-if="hasMore"
      ref="loadMoreSentinel"
      class="h-10 w-full"
      aria-hidden="true"
    />
  </section>
</template>

<script setup lang="ts">
import { ShoppingCart } from "lucide-vue-next";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

import ProductImageCarousel from "@/components/merch/ProductImageCarousel.vue";
import Button from "@/components/ui/Button.vue";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MerchCopy } from "@/config/merch-copy";
import { getMaxQuantityForProductId, isGiftCardProductId } from "@/lib/merch-quantity";
import type { Product, StoreLocale } from "@/types/merch";

const props = defineProps<{
  t: MerchCopy;
  locale: StoreLocale;
  products: Product[];
  cartLines: Array<{
    quantity: number;
    product: {
      id: string;
    };
  }>;
  formatCurrency: Intl.NumberFormat;
  viewOnly?: boolean;
}>();

defineEmits<{
  "open-product": [productId: string];
  "quick-add": [productId: string];
}>();

const INITIAL_VISIBLE = 9;
const PAGE_SIZE = 6;

const visibleCount = ref(INITIAL_VISIBLE);
const loadMoreSentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const visibleProducts = computed(() =>
  props.products.slice(0, visibleCount.value),
);
const hasMore = computed(() => visibleCount.value < props.products.length);

const loadMore = () => {
  if (!hasMore.value) {
    return;
  }
  visibleCount.value = Math.min(
    visibleCount.value + PAGE_SIZE,
    props.products.length,
  );
};

const MAX_CARD_DESCRIPTION_LENGTH = 110;

const getCardDescription = (description: string) => {
  const trimmed = description.trim();
  if (trimmed.length <= MAX_CARD_DESCRIPTION_LENGTH) {
    return trimmed;
  }
  return `${trimmed.slice(0, MAX_CARD_DESCRIPTION_LENGTH - 1).trimEnd()}…`;
};

const isGiftCardProduct = (productId: string) => isGiftCardProductId(productId);
const productQuantityInCart = (productId: string) =>
  props.cartLines
    .filter((line) => line.product.id === productId)
    .reduce((total, line) => total + line.quantity, 0);
const isGiftCardLimitReached = (productId: string) =>
  isGiftCardProduct(productId) &&
  productQuantityInCart(productId) >= getMaxQuantityForProductId(productId);

const reconnectObserver = () => {
  observer?.disconnect();
  if (!loadMoreSentinel.value || !hasMore.value) {
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadMore();
      }
    },
    { rootMargin: "280px 0px" },
  );
  observer.observe(loadMoreSentinel.value);
};

watch(
  () => props.products.length,
  () => {
    visibleCount.value = INITIAL_VISIBLE;
    reconnectObserver();
  },
);

watch(loadMoreSentinel, () => reconnectObserver());
watch(hasMore, () => reconnectObserver());

onMounted(() => reconnectObserver());
onUnmounted(() => observer?.disconnect());
</script>
