<template>
  <section class="mt-5">
    <Card class="px-6">
      <CardHeader class="flex flex-row items-center justify-between px-0">
        <div class="flex items-center gap-2">
          <Button size="sm" :variant="activeTab === 'orders' ? 'default' : 'outline'" @click="activeTab = 'orders'">
            Orders
          </Button>
          <Button size="sm" :variant="activeTab === 'items' ? 'default' : 'outline'" @click="activeTab = 'items'">
            Items to Buy
          </Button>
        </div>
        <div class="flex items-center gap-2">
          <Button
            v-if="activeTab === 'items'"
            size="sm"
            variant="outline"
            :disabled="loading || Boolean(error) || itemsSummary.length === 0"
            @click="exportItemsSummaryCsv"
          >
            Export CSV
          </Button>
          <Button size="sm" variant="outline" @click="$emit('refresh')">Refresh</Button>
        </div>
      </CardHeader>
      <CardContent class="px-0">
        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
        <p v-else-if="loading" class="text-sm text-muted-foreground">Loading data...</p>

        <p v-else-if="activeTab === 'orders' && orders.length === 0" class="text-sm text-muted-foreground">
          No orders yet.
        </p>
        <div v-else-if="activeTab === 'orders'" class="overflow-auto">
          <table class="w-full min-w-[38rem] text-sm">
            <thead class="text-left text-muted-foreground">
              <tr>
                <th class="py-2 pr-3">Name</th>
                <th class="py-2 pr-3">Items</th>
                <th class="py-2 pr-3">Subtotal</th>
                <th class="py-2">Placed</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="order in orders"
                :key="order.id"
                class="cursor-pointer border-t transition-colors hover:bg-muted/40"
                role="button"
                tabindex="0"
                @click="$emit('select-order', order.id)"
                @keydown.enter="$emit('select-order', order.id)"
                @keydown.space.prevent="$emit('select-order', order.id)"
              >
                <td class="py-2 pr-3">{{ order.user_name }}</td>
                <td class="py-2 pr-3">{{ order.item_count }}</td>
                <td class="py-2 pr-3">{{ formatSubtotal(order.subtotal) }}</td>
                <td class="py-2">{{ formatDateTime(order.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-else-if="itemsSummary.length === 0" class="text-sm text-muted-foreground">
          No items to aggregate yet.
        </p>
        <div v-else class="overflow-auto">
          <table class="w-full min-w-[42rem] text-sm">
            <thead class="text-left text-muted-foreground">
              <tr>
                <th class="py-2 pr-3">Item</th>
                <th class="py-2 pr-3">Variants</th>
                <th class="py-2 pr-3">Total Qty</th>
                <th class="py-2">Orders</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in itemsSummary" :key="item.key" class="border-t">
                <td class="py-2 pr-3 font-medium">{{ item.product_name }}</td>
                <td class="py-2 pr-3 text-muted-foreground">{{ item.variants }}</td>
                <td class="py-2 pr-3">{{ item.total_quantity }}</td>
                <td class="py-2">{{ item.order_count }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="activeTab === 'items'"
          class="mt-4 grid gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 sm:grid-cols-3"
        >
          <div>
            <p class="text-xs uppercase tracking-wide text-muted-foreground">Initial Budget</p>
            <p class="text-lg font-semibold">{{ formatSubtotal(initialBudget) }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-wide text-muted-foreground">Total Costs</p>
            <p class="text-lg font-semibold">{{ formatSubtotal(totalCosts) }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-wide text-muted-foreground">
              {{ budgetDelta >= 0 ? 'Remaining' : 'Over budget' }}
            </p>
            <p :class="['text-lg font-semibold', budgetDelta < 0 ? 'text-red-600' : 'text-emerald-700']">
              {{ formatSubtotal(Math.abs(budgetDelta)) }}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import { COMPANY_CREDIT } from '@/config/merch-store'

const props = defineProps<{
  loading: boolean
  error: string | null
  orders: Array<{
    id: string
    user_name: string
    item_count: number
    subtotal: string | number
    created_at: string
  }>
  itemsSummary: Array<{
    key: string
    product_name: string
    variants: string
    total_quantity: number
    order_count: number
  }>
}>()

defineEmits<{
  refresh: []
  'select-order': [orderId: string]
}>()

const activeTab = ref<'orders' | 'items'>('orders')
const totalCosts = computed(() =>
  props.orders.reduce((total, order) => total + Number(order.subtotal || 0), 0),
)
const initialBudget = computed(() => props.orders.length * COMPANY_CREDIT)
const budgetDelta = computed(() => initialBudget.value - totalCosts.value)

const escapeCsv = (value: string | number) => {
  const raw = String(value ?? '')
  if (raw.includes('"') || raw.includes(',') || raw.includes('\n')) {
    return `"${raw.replace(/"/g, '""')}"`
  }
  return raw
}

const exportItemsSummaryCsv = () => {
  const headers = ['Item', 'Variants', 'Total Qty', 'Orders']
  const rows = props.itemsSummary.map((item) => [
    item.product_name,
    item.variants,
    item.total_quantity,
    item.order_count,
  ])

  const csvLines = [headers, ...rows].map((row) => row.map((cell) => escapeCsv(cell)).join(','))
  const csvContent = `\uFEFF${csvLines.join('\n')}`
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `items-to-buy-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

const formatDateTime = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const formatSubtotal = (value: string | number) => {
  const numeric = Number(value)
  if (Number.isNaN(numeric)) {
    return `${value} $`
  }
  return `${numeric.toFixed(2)} $`
}
</script>
