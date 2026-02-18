<template>
  <aside class="xl:sticky xl:top-24 xl:self-start">
    <Card class="shadow-md">
      <CardHeader class="flex flex-row items-start justify-between gap-3">
        <div class="flex w-full items-center justify-between">
          <CardTitle>{{ t.cartBuilder }}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            :disabled="readOnly"
            @click="$emit('reset-cart')"
            >{{ t.resetCart }}</Button
          >
        </div>
      </CardHeader>

      <CardContent class="space-y-4">
        <div class="cart-scrollbar max-h-[44vh] space-y-3 overflow-auto pr-1">
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
                  (nextQuantity) => $emit('update-item-quantity', line.id, nextQuantity)
                "
              />

              <Button
                variant="ghost"
                size="sm"
                :disabled="readOnly"
                @click="$emit('remove-item', line.id)"
                >{{ t.removeItem }}</Button
              >
            </div>
          </div>
        </div>

        <div class="bg-muted/30 rounded-2xl border p-4">
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
            class="mt-4 w-full"
            :disabled="cartLines.length === 0 || readOnly"
            @click="$emit('continue-checkout')"
          >
            <ArrowRight class="size-4" />
            {{ t.continueSelection }}
          </Button>
          <p class="text-muted-foreground mt-2 text-xs">{{ t.checkoutHint }}</p>
        </div>
      </CardContent>
    </Card>
  </aside>
</template>

<script setup lang="ts">
import { ArrowRight, ShoppingBasket } from "lucide-vue-next";

import Button from "@/components/ui/Button.vue";
import Card from "@/components/ui/Card.vue";
import CardContent from "@/components/ui/CardContent.vue";
import CardHeader from "@/components/ui/CardHeader.vue";
import CardTitle from "@/components/ui/CardTitle.vue";
import QuantityStepper from "@/components/ui/QuantityStepper.vue";
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
  cartLines: CartLine[];
  subtotal: number;
  creditUsed: number;
  creditRemaining: number;
  walletToPay: number;
  formatCurrency: Intl.NumberFormat;
  readOnly?: boolean;
}>();

defineEmits<{
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
