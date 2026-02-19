<template>
  <section
    class="ml-auto mr-auto mt-5 flex min-h-[calc(80vh-12rem)] w-full max-w-7xl flex-col items-center justify-center gap-6 px-4"
  >
    <Card class="mx-auto w-full max-w-md shadow-md">
      <CardHeader class="text-center">
        <CardTitle class="text-center">{{ t.placedPageTitle }}</CardTitle>
        <CardDescription class="mx-auto max-w-sm">{{
          t.placedPageBody
        }}</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div v-if="recapLines.length > 0" class="rounded-xl border bg-muted/20 p-3">
          <p class="mb-2 text-sm font-medium">Resume des articles commandes</p>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li v-for="line in recapLines" :key="line.id">
              <div class="flex items-start gap-2">
                <div
                  class="bg-muted/20 h-12 w-12 shrink-0 overflow-hidden rounded-lg border"
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
                      line.product.gradientClass ??
                        'from-zinc-200/60 via-zinc-100/40 to-transparent',
                    ]"
                  />
                </div>
                <div class="min-w-0">
                  <p class="break-words">
                    {{ line.product.name[locale] }} x{{ line.quantity }}
                  </p>
                  <p
                    v-if="getVariantSummary(line).length > 0"
                    class="text-xs break-words text-muted-foreground/90"
                  >
                    {{ getVariantSummary(line).join(" · ") }}
                  </p>
                </div>
              </div>
            </li>
          </ul>
          <p v-if="remainingCount > 0" class="mt-2 text-xs text-muted-foreground">
            +{{ remainingCount }} autre(s) article(s)
          </p>
        </div>
        <div
          :class="[
            'mx-auto grid w-full max-w-md gap-2',
            viewOnly ? 'grid-cols-1' : 'sm:grid-cols-2',
          ]"
        >
          <Button
            v-if="!viewOnly"
            variant="outline"
            :disabled="lockActionBusy"
            @click="$emit('unlock-and-back')"
          >
            {{ t.unlockOrder }}
          </Button>
          <Button @click="$emit('back')">{{ t.backToCatalog }}</Button>
        </div>
      </CardContent>
    </Card>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Button from "@/components/ui/Button.vue";
import Card from "@/components/ui/Card.vue";
import CardContent from "@/components/ui/CardContent.vue";
import CardDescription from "@/components/ui/CardDescription.vue";
import CardHeader from "@/components/ui/CardHeader.vue";
import CardTitle from "@/components/ui/CardTitle.vue";
import type { MerchCopy } from "@/config/merch-copy";
import type { StoreLocale } from "@/types/merch";

const props = defineProps<{
  t: MerchCopy;
  locale: StoreLocale;
  cartLines: Array<{
    id: string;
    quantity: number;
    selectedOptions: Record<string, string>;
    selectedOptionLabels?: Record<string, string>;
    product: {
      name: Record<StoreLocale, string>;
      imageGallery?: string[];
      gradientClass?: string;
      variantGroups?: Array<{
        id: string;
        label: Record<StoreLocale, string>;
        type: "size" | "color" | "select";
        options: Array<{
          id: string;
          label: Record<StoreLocale, string>;
          swatchHex?: string;
        }>;
      }>;
    };
  }>;
  deadlineLabel: string;
  lockActionBusy?: boolean;
  viewOnly?: boolean;
}>();

defineEmits<{
  back: [];
  "unlock-and-back": [];
}>();

const recapLines = computed(() => props.cartLines.slice(0, 4));
const remainingCount = computed(() =>
  Math.max(props.cartLines.length - recapLines.value.length, 0),
);

const getVariantSummary = (line: (typeof props.cartLines)[number]) => {
  const fromGroups = (line.product.variantGroups ?? [])
    .map((group) => {
      const selectedValue = line.selectedOptions[group.id];
      if (!selectedValue) {
        return null;
      }
      const option = group.options.find((item) => item.id === selectedValue);
      const label = option?.label?.[props.locale];
      return label ? `${group.label[props.locale]}: ${label}` : null;
    })
    .filter((value): value is string => Boolean(value));

  if (fromGroups.length > 0) {
    return fromGroups;
  }

  const fromSavedLabels = Object.entries(line.selectedOptionLabels ?? {})
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${key}: ${value}`);
  if (fromSavedLabels.length > 0) {
    return fromSavedLabels;
  }

  return Object.entries(line.selectedOptions)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${key}: ${value}`);
};
</script>
