<template>
  <section class="mt-5 space-y-4">
    <Card class="px-4 sm:px-6">
      <CardHeader
        class="flex flex-col items-stretch justify-between gap-3 px-0 sm:flex-row sm:items-center"
      >
        <div class="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            :variant="activeTab === 'orders' ? 'default' : 'outline'"
            @click="activeTab = 'orders'"
          >
            Commandes
          </Button>
          <Button
            size="sm"
            :variant="activeTab === 'items' ? 'default' : 'outline'"
            @click="activeTab = 'items'"
          >
            Articles à commander
          </Button>
        </div>
        <div class="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <Button
            v-if="activeTab === 'items'"
            size="sm"
            variant="outline"
            :disabled="loading || Boolean(error) || itemsSummary.length === 0"
            @click="exportItemsSummaryCsv"
          >
            Export CSV
          </Button>
          <Button size="sm" variant="outline" @click="$emit('refresh')"
            >Rafraîchir</Button
          >
        </div>
      </CardHeader>

      <CardContent class="px-0">
        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
        <p v-else-if="loading" class="text-muted-foreground text-sm">
          Chargement...
        </p>

        <p
          v-else-if="activeTab === 'orders' && orders.length === 0"
          class="text-muted-foreground text-sm"
        >
          Aucune commande.
        </p>
        <div v-else-if="activeTab === 'orders'" class="overflow-auto">
          <table class="w-full min-w-[54rem] text-sm">
            <thead class="text-muted-foreground text-left">
              <tr>
                <th class="py-2 pr-3">Nom</th>
                <th class="py-2 pr-3">{{ t.adminEmail }}</th>
                <th class="py-2 pr-3">Articles</th>
                <th class="py-2 pr-3">{{ t.totalPerPerson }}</th>
                <th class="py-2 pr-3">{{ t.billablePerPerson }}</th>
                <th class="py-2 pr-3">Verrouillée</th>
                <th class="py-2">Date</th>
                <th class="py-2 pl-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="order in orders"
                :key="order.id"
                class="hover:bg-muted/40 cursor-pointer border-t transition-colors"
                role="button"
                tabindex="0"
                @click="$emit('select-order', order.id)"
                @keydown.enter="$emit('select-order', order.id)"
                @keydown.space.prevent="$emit('select-order', order.id)"
              >
                <td class="py-2 pr-3">{{ order.user_name }}</td>
                <td class="py-2 pr-3">{{ order.user_email ?? "-" }}</td>
                <td class="py-2 pr-3">{{ order.item_count }}</td>
                <td class="py-2 pr-3">
                  {{ formatSubtotal(order.total_per_person) }}
                </td>
                <td class="py-2 pr-3">
                  {{ formatSubtotal(order.billable_per_person) }}
                </td>
                <td class="py-2 pr-3">
                  <Badge
                    :class="
                      order.is_locked
                        ? 'border-emerald-200 bg-emerald-100 text-emerald-800'
                        : 'border-red-200 bg-red-100 text-red-800'
                    "
                  >
                    {{ order.is_locked ? "Oui" : "Non" }}
                  </Badge>
                </td>
                <td class="py-2">{{ formatDateTime(order.created_at) }}</td>
                <td class="py-2 pl-3 text-right">
                  <Button
                    size="sm"
                    variant="destructive"
                    @click.stop="openDeleteConfirm(order.id, order.user_name)"
                  >
                    Supprimer
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p
          v-else-if="itemsSummary.length === 0"
          class="text-muted-foreground text-sm"
        >
          Aucun article à agréger.
        </p>
        <div v-else class="overflow-auto">
          <table class="w-full min-w-[42rem] text-sm">
            <thead class="text-muted-foreground text-left">
              <tr>
                <th class="py-2 pr-3">Article</th>
                <th class="py-2 pr-3">Variantes</th>
                <th class="py-2 pr-3">Quantité</th>
                <th class="py-2">Commandes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in itemsSummary" :key="item.key" class="border-t">
                <td class="py-2 pr-3 font-medium">{{ item.product_name }}</td>
                <td class="text-muted-foreground py-2 pr-3">
                  {{ item.variants }}
                </td>
                <td class="py-2 pr-3">{{ item.total_quantity }}</td>
                <td class="py-2">{{ item.order_count }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="activeTab === 'items'"
          class="border-border/70 bg-muted/20 mt-4 grid gap-3 rounded-xl border p-4 sm:grid-cols-3"
        >
          <div>
            <p class="text-muted-foreground text-xs tracking-wide uppercase">
              Budget initial
            </p>
            <p class="text-lg font-semibold">
              {{ formatSubtotal(initialBudget) }}
            </p>
          </div>
          <div>
            <p class="text-muted-foreground text-xs tracking-wide uppercase">
              Coût total
            </p>
            <p class="text-lg font-semibold">
              {{ formatSubtotal(totalCosts) }}
            </p>
          </div>
          <div>
            <p class="text-muted-foreground text-xs tracking-wide uppercase">
              {{ budgetDelta >= 0 ? "Restant" : "Dépassement" }}
            </p>
            <p
              :class="[
                'text-lg font-semibold',
                budgetDelta < 0 ? 'text-red-600' : 'text-emerald-700',
              ]"
            >
              {{ formatSubtotal(Math.abs(budgetDelta)) }}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <div class="border-destructive/40 bg-destructive/10 rounded-xl border p-4">
      <div
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <p class="text-sm font-medium">
          Mode lecture seule global
        </p>
        <Button
          size="sm"
          variant="destructive"
          @click="showReadonlyConfirm = true"
        >
          {{ isViewOnly ? t.viewOnlyDisable : t.viewOnlyEnable }}
        </Button>
      </div>
    </div>

    <div
      v-if="showReadonlyConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
      @click.self="showReadonlyConfirm = false"
    >
      <div
        class="border-border/70 bg-background w-full max-w-md rounded-2xl border p-6 shadow-2xl"
      >
        <h3 class="text-lg font-semibold">Confirmation requise</h3>
        <p class="text-muted-foreground mt-2 text-sm">
          Cette action active le mode lecture seule global.
        </p>
        <p class="text-muted-foreground mt-1 text-sm">
          Personne n'aura accès au shop pour ajouter, modifier ou confirmer une
          commande.
        </p>
        <div class="mt-5 grid gap-2 sm:grid-cols-2">
          <Button variant="outline" @click="showReadonlyConfirm = false"
            >Annuler</Button
          >
          <Button variant="destructive" @click="confirmToggleReadonly"
            >Confirmer</Button
          >
        </div>
      </div>
    </div>

    <div
      v-if="deleteTarget"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
      @click.self="closeDeleteConfirm"
    >
      <div
        class="border-border/70 bg-background w-full max-w-md rounded-2xl border p-6 shadow-2xl"
      >
        <h3 class="text-lg font-semibold">Confirmer la suppression</h3>
        <p class="text-muted-foreground mt-2 text-sm">
          Supprimer la commande de {{ deleteTarget.userName }} ?
        </p>
        <p class="text-muted-foreground mt-1 text-sm">
          Cette action est irréversible.
        </p>
        <div class="mt-5 grid gap-2 sm:grid-cols-2">
          <Button variant="outline" @click="closeDeleteConfirm">Annuler</Button>
          <Button variant="destructive" @click="confirmDeleteOrder"
            >Supprimer</Button
          >
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import Badge from "@/components/ui/Badge.vue";
import Button from "@/components/ui/Button.vue";
import Card from "@/components/ui/Card.vue";
import CardContent from "@/components/ui/CardContent.vue";
import CardHeader from "@/components/ui/CardHeader.vue";
import type { MerchCopy } from "@/config/merch-copy";
import { COMPANY_CREDIT } from "@/config/merch-store";

const props = defineProps<{
  t: MerchCopy;
  isViewOnly: boolean;
  loading: boolean;
  error: string | null;
  orders: Array<{
    id: string;
    user_name: string;
    user_email: string | null;
    item_count: number;
    total_per_person: number;
    billable_per_person: number;
    is_locked: boolean;
    created_at: string;
  }>;
  itemsSummary: Array<{
    key: string;
    product_name: string;
    variants: string;
    total_quantity: number;
    order_count: number;
  }>;
}>();

const emit = defineEmits<{
  refresh: [];
  "select-order": [orderId: string];
  "delete-order": [orderId: string];
  "toggle-view-only": [];
}>();

const activeTab = ref<"orders" | "items">("orders");
const showReadonlyConfirm = ref(false);
const deleteTarget = ref<null | { id: string; userName: string }>(null);
const totalCosts = computed(() =>
  props.orders.reduce(
    (total, order) => total + Number(order.total_per_person || 0),
    0,
  ),
);
const initialBudget = computed(() => props.orders.length * COMPANY_CREDIT);
const budgetDelta = computed(() => initialBudget.value - totalCosts.value);

const escapeCsv = (value: string | number) => {
  const raw = String(value ?? "");
  if (raw.includes('"') || raw.includes(",") || raw.includes("\n")) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
};

const exportItemsSummaryCsv = () => {
  const headers = ["Article", "Variantes", "Qté totale", "Commandes"];
  const rows = props.itemsSummary.map((item) => [
    item.product_name,
    item.variants,
    item.total_quantity,
    item.order_count,
  ]);

  const csvLines = [headers, ...rows].map((row) =>
    row.map((cell) => escapeCsv(cell)).join(","),
  );
  const csvContent = `\uFEFF${csvLines.join("\n")}`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `items-to-buy-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const formatSubtotal = (value: string | number) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return `${value} $`;
  }
  return `${numeric.toFixed(2)} $`;
};

const confirmToggleReadonly = () => {
  emit("toggle-view-only");
  showReadonlyConfirm.value = false;
};

const openDeleteConfirm = (id: string, userName: string) => {
  deleteTarget.value = { id, userName };
};

const closeDeleteConfirm = () => {
  deleteTarget.value = null;
};

const confirmDeleteOrder = () => {
  const orderId = deleteTarget.value?.id;
  if (!orderId) {
    return;
  }
  emit("delete-order", orderId);
  closeDeleteConfirm();
};
</script>
