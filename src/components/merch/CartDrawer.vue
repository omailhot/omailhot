<template>
  <Drawer :open="open" :title="t.cartBuilder" @close="$emit('close')">
    <div
      class="mx-auto flex max-h-[calc(86dvh-4.5rem)] w-full max-w-6xl flex-col pb-2 md:max-h-none"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold">{{ t.cartBuilder }}</h2>
        </div>
        <Button variant="ghost" size="icon" @click="$emit('close')">
          <X class="size-4" />
        </Button>
      </div>
      <div class="mt-1 flex items-center justify-between gap-2">
        <p class="text-muted-foreground text-xs">{{ t.policy }}</p>
      </div>
      <div class="mt-2 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          :disabled="readOnly"
          @click="$emit('reset-cart')"
        >
          {{ t.resetCart }}
        </Button>
      </div>

      <div
        class="mt-4 flex min-h-0 flex-1 flex-col gap-5 md:grid md:grid-cols-[1.45fr_1fr]"
      >
        <div
          class="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 md:max-h-[50vh] md:flex-none"
        >
          <div
            v-if="cartLines.length === 0"
            class="rounded-xl border border-dashed p-6 text-center"
          >
            <ShoppingBasket class="text-muted-foreground mx-auto mb-2 size-5" />
            <p class="font-medium">{{ t.emptyCart }}</p>
            <p class="text-muted-foreground text-sm">{{ t.addFromCatalog }}</p>
          </div>

          <div
            v-for="line in cartLines"
            v-else
            :key="line.id"
            class="rounded-xl border p-3"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="font-medium">{{ line.product.name[locale] }}</p>
                <p
                  v-if="getVariantLabels(line).length > 0"
                  class="text-muted-foreground text-xs"
                >
                  {{ getVariantLabels(line).join(" | ") }}
                </p>
              </div>
              <p class="font-medium">
                {{ formatCurrency.format(line.lineTotal) }}
              </p>
            </div>

            <div class="mt-3 flex items-center justify-between">
              <QuantityStepper
                :model-value="line.quantity"
                :disabled="readOnly"
                @update:model-value="
                  (nextQuantity) =>
                    $emit('update-item-quantity', line.id, nextQuantity)
                "
              />

              <Button
                variant="ghost"
                size="sm"
                :disabled="readOnly"
                @click="$emit('remove-item', line.id)"
              >
                {{ t.removeItem }}
              </Button>
            </div>
          </div>
        </div>

        <div class="bg-muted/30 shrink-0 rounded-2xl border p-4">
          <div class="space-y-2 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">{{ t.subtotal }}</span>
              <span>{{ formatCurrency.format(subtotal) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground inline-flex items-center gap-1">
                {{ t.creditUsed }}
                <Tooltip :content="t.creditCommitteeTooltip">
                  <CircleHelp class="size-3.5" />
                </Tooltip>
              </span>
              <span>-{{ formatCurrency.format(creditUsed) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">{{ t.walletToPay }}</span>
              <span class="font-semibold">{{
                formatCurrency.format(walletToPay)
              }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">{{ t.creditRemaining }}</span>
              <span>{{ formatCurrency.format(creditRemaining) }}</span>
            </div>
          </div>
          <Button
            v-if="!readOnly"
            class="mt-4 w-full"
            :disabled="cartLines.length === 0"
            @click="$emit('continue-checkout')"
          >
            <ArrowRight class="size-4" />
            {{ t.continueSelection }}
          </Button>
        </div>
      </div>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { ArrowRight, CircleHelp, ShoppingBasket, X } from "lucide-vue-next";

import Button from "@/components/ui/Button.vue";
import Drawer from "@/components/ui/Drawer.vue";
import QuantityStepper from "@/components/ui/QuantityStepper.vue";
import Tooltip from "@/components/ui/Tooltip.vue";
import type { MerchCopy } from "@/config/merch-copy";
import type { ProductVariantGroup, StoreLocale } from "@/types/merch";

type CartLine = {
  id: string;
  quantity: number;
  lineTotal: number;
  selectedOptions: Record<string, string>;
  product: {
    name: Record<StoreLocale, string>;
    variantGroups?: ProductVariantGroup[];
  };
};

const props = defineProps<{
  t: MerchCopy;
  locale: StoreLocale;
  open: boolean;
  cartLines: CartLine[];
  subtotal: number;
  creditUsed: number;
  creditRemaining: number;
  walletToPay: number;
  formatCurrency: Intl.NumberFormat;
  readOnly?: boolean;
}>();

defineEmits<{
  close: [];
  "reset-cart": [];
  "remove-item": [cartItemId: string];
  "update-item-quantity": [cartItemId: string, nextQuantity: number];
  "continue-checkout": [];
}>();

const getVariantLabels = (line: CartLine) =>
  (line.product.variantGroups ?? [])
    .map((group) => {
      const selectedOption = group.options.find(
        (option) => option.id === line.selectedOptions[group.id],
      );
      if (!selectedOption) {
        return null;
      }

      return `${group.label[props.locale]}: ${selectedOption.label[props.locale]}`;
    })
    .filter((value): value is string => Boolean(value));
</script>
