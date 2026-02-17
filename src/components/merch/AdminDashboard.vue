<template>
  <section class="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_1.2fr]">
    <Card class="px-6">
      <CardHeader class="px-0">
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <CardContent class="px-0">
        <p v-if="loading" class="text-sm text-muted-foreground">Loading users...</p>
        <p v-else-if="users.length === 0" class="text-sm text-muted-foreground">No users yet.</p>
        <div v-else class="overflow-auto">
          <table class="w-full min-w-[28rem] text-sm">
            <thead class="text-left text-muted-foreground">
              <tr>
                <th class="py-2 pr-3">Name</th>
                <th class="py-2 pr-3">Email</th>
                <th class="py-2 pr-3">User ID</th>
                <th class="py-2">Last seen</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.user_id" class="border-t">
                <td class="py-2 pr-3">{{ user.display_name }}</td>
                <td class="py-2 pr-3">{{ user.email }}</td>
                <td class="py-2 pr-3 font-mono text-xs">{{ user.user_id }}</td>
                <td class="py-2">{{ user.last_seen_at ?? user.created_at }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <Card class="px-6">
      <CardHeader class="flex flex-row items-center justify-between px-0">
        <CardTitle>Orders</CardTitle>
        <Button size="sm" variant="outline" @click="$emit('refresh')">Refresh</Button>
      </CardHeader>
      <CardContent class="px-0">
        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
        <p v-else-if="loading" class="text-sm text-muted-foreground">Loading orders...</p>
        <p v-else-if="orders.length === 0" class="text-sm text-muted-foreground">No orders yet.</p>
        <div v-else class="overflow-auto">
          <table class="w-full min-w-[38rem] text-sm">
            <thead class="text-left text-muted-foreground">
              <tr>
                <th class="py-2 pr-3">Request</th>
                <th class="py-2 pr-3">Email</th>
                <th class="py-2 pr-3">Items</th>
                <th class="py-2 pr-3">Subtotal</th>
                <th class="py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id" class="border-t">
                <td class="py-2 pr-3 font-mono text-xs">{{ order.request_id }}</td>
                <td class="py-2 pr-3">{{ order.user_email ?? '-' }}</td>
                <td class="py-2 pr-3">{{ order.item_count }}</td>
                <td class="py-2 pr-3">{{ order.subtotal }}</td>
                <td class="py-2">{{ order.created_at }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </section>
</template>

<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'

defineProps<{
  loading: boolean
  error: string | null
  users: Array<{
    user_id: string
    email: string
    display_name: string
    created_at: string
    last_seen_at: string | null
  }>
  orders: Array<{
    id: string
    request_id: string
    user_email: string | null
    item_count: number
    subtotal: string | number
    created_at: string
  }>
}>()

defineEmits<{
  refresh: []
}>()
</script>
