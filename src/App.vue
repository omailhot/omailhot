<template>
  <Header
    :title="t.appTitle"
    :subtitle="t.appSubtitle"
    :session-email="sessionUser?.email ?? null"
    :is-admin="isAdmin"
    :view="currentView"
    :auth-busy="authBusy"
    @connect-google="onConnectGoogle"
    @sign-out="onSignOut"
    @open-admin="onOpenAdmin"
    @open-catalog="currentView = 'catalog'"
  />

  <main class="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_14%_6%,rgba(255,160,0,0.23),transparent_34%),radial-gradient(circle_at_75%_0%,rgba(255,0,53,0.16),transparent_35%)] pb-6">
    <div class="mx-auto max-w-[96rem] px-4 py-6 sm:px-6">
      <section
        v-if="sessionUser && currentView !== 'admin'"
        class="mb-4 rounded-xl border bg-background/80 p-4"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm">
            {{ orderStatusMessage }}
          </p>
          <div class="flex items-center gap-2">
            <Button
              v-if="activeOrderId && activeOrderLocked && !isLockDeadlinePassed"
              :disabled="lockActionBusy"
              variant="outline"
              size="sm"
              @click="onUnlockOrder"
            >
              Unlock order
            </Button>
            <Button
              v-if="!activeOrderLocked && !isLockDeadlinePassed"
              :disabled="lockActionBusy || !activeOrderId"
              size="sm"
              @click="onLockOrder"
            >
              Lock order
            </Button>
          </div>
        </div>
      </section>
      <div v-if="currentView === 'admin'">
        <AdminDashboard
          :loading="adminLoading"
          :error="adminError"
          :users="adminUsers"
          :orders="adminOrders"
          @refresh="loadAdminDashboard"
        />
      </div>
      <div class="mt-5" v-else-if="currentView === 'catalog'">
        <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <CatalogSection
          :t="t"
          :locale="locale"
          :search="state.search.value"
          :filtered-products="filteredProducts"
          :format-currency="formatCurrency"
          @search-change="actions.setSearch"
          @open-product="actions.setActiveProductId"
          @quick-add="onQuickAdd"
        />
        <CartSidebar
          :t="t"
          :locale="locale"
          :cart-lines="derived.cartLines.value"
          :subtotal="derived.subtotal.value"
          :credit-used="derived.creditUsed.value"
          :credit-remaining="derived.creditRemaining.value"
          :wallet-to-pay="derived.walletToPay.value"
          :format-currency="formatCurrency"
          :read-only="!isOrderEditable"
          @reset-cart="onResetCart"
          @remove-item="onRemoveCartItem"
          @update-item-quantity="onUpdateCartItemQuantity"
          @continue-checkout="onContinueCheckout"
        />
        </div>
      </div>
      <OrderConfirmationPage
        v-else
        :t="t"
        :locale="locale"
        :cart-lines="derived.cartLines.value"
        :subtotal="derived.subtotal.value"
        :credit-used="derived.creditUsed.value"
        :credit-remaining="derived.creditRemaining.value"
        :wallet-to-pay="derived.walletToPay.value"
        :format-currency="formatCurrency"
        :is-submitting="isSubmittingOrder"
        @back="onBackToCatalog"
        @place-order="submitOrder"
      />
    </div>
  </main>

  <ProductDetailsModal
    :t="t"
    :locale="locale"
    :product="derived.activeProduct.value"
    :open="Boolean(state.activeProductId.value)"
    :format-currency="formatCurrency"
    @close="actions.setActiveProductId(null)"
    @add-to-cart="onAddToCart"
  />

  <ToastStack :toasts="state.toastQueue.value" />

</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import Header from '@/components/Header.vue'
import AdminDashboard from '@/components/merch/AdminDashboard.vue'
import CartSidebar from '@/components/merch/CartSidebar.vue'
import CatalogSection from '@/components/merch/CatalogSection.vue'
import OrderConfirmationPage from '@/components/merch/OrderConfirmationPage.vue'
import ProductDetailsModal from '@/components/merch/ProductDetailsModal.vue'
import ToastStack from '@/components/merch/ToastStack.vue'
import Button from '@/components/ui/Button.vue'
import { merchCopy } from '@/config/merch-copy'
import { products } from '@/config/merch-store'
import { useMerchStore } from '@/hooks/use-merch-store'
import { neonClient } from '@/lib/neon-client'
import { getLocale } from '@/paraglide/runtime'
import type { StoreLocale } from '@/types/merch'

const locale = computed<StoreLocale>(() => (getLocale() === 'fr' ? 'fr' : 'en'))
const t = computed(() => merchCopy[locale.value])

const formatCurrency = computed(
  () =>
    new Intl.NumberFormat(locale.value === 'fr' ? 'fr-CA' : 'en-CA', {
      style: 'currency',
      currency: 'CAD',
    }),
)

const { state, derived, actions } = useMerchStore(products)
const currentView = ref<'catalog' | 'confirmation' | 'admin'>('catalog')
const isSubmittingOrder = ref(false)
const lockActionBusy = ref(false)
const authBusy = ref(false)
const sessionUser = ref<SessionUser | null>(null)
const isAdmin = ref(false)
const adminUsers = ref<
  Array<{ user_id: string; email: string; display_name: string; created_at: string; last_seen_at: string | null }>
>([])
const adminOrders = ref<
  Array<{
    id: string
    request_id: string
    user_email: string | null
    item_count: number
    subtotal: string | number
    created_at: string
  }>
>([])
const adminLoading = ref(false)
const adminError = ref<string | null>(null)
const activeOrderId = ref<string | null>(null)
const activeOrderLocked = ref(false)
const activeOrderPlacedAt = ref<string | null>(null)
const activeOrderLockDeadlineAt = ref('2026-03-02T00:00:00Z')

const lockDeadlineDate = computed(() => new Date(activeOrderLockDeadlineAt.value))
const lockDeadlineLabel = computed(() =>
  lockDeadlineDate.value.toLocaleString(locale.value === 'fr' ? 'fr-CA' : 'en-CA', {
    dateStyle: 'long',
    timeStyle: 'short',
  }),
)
const isLockDeadlinePassed = computed(() => Date.now() >= lockDeadlineDate.value.getTime())
const isOrderEditable = computed(
  () => Boolean(sessionUser.value) && Boolean(!activeOrderLocked.value) && !isLockDeadlinePassed.value,
)
const orderStatusMessage = computed(() => {
  if (!activeOrderId.value) {
    return `No saved order yet. Save and lock before ${lockDeadlineLabel.value}.`
  }
  if (activeOrderPlacedAt.value) {
    return `Order is placed. Locked at ${new Date(activeOrderPlacedAt.value).toLocaleString(locale.value === 'fr' ? 'fr-CA' : 'en-CA')}.`
  }
  if (activeOrderLocked.value) {
    return `Order is locked. If needed, unlock it before ${lockDeadlineLabel.value}.`
  }
  if (isLockDeadlinePassed.value) {
    return `March 1 deadline passed. Your order is now placed.`
  }
  return `Order is unlocked. Lock it in before ${lockDeadlineLabel.value}, otherwise it will be placed automatically on March 1.`
})

const filteredProducts = computed(() => {
  const query = state.search.value.trim().toLowerCase()

  return products.filter((product) => {
    const searchableText = `${product.name[locale.value]} ${product.description[locale.value]}`.toLowerCase()
    return query.length === 0 || searchableText.includes(query)
  })
})

const onQuickAdd = (productId: string) => {
  if (!ensureOrderEditable()) {
    return
  }

  const product = products.find((item) => item.id === productId)
  if (!product) {
    return
  }

  if ((product.variantGroups ?? []).length > 0) {
    actions.setActiveProductId(productId)
    return
  }

  actions.quickAdd(productId)
  actions.enqueueToast(t.value.addedToCart)
}

const onAddToCart = (input: { productId: string; selectedOptions: Record<string, string>; quantity: number }) => {
  if (!ensureOrderEditable()) {
    return
  }
  actions.addToCart(input.productId, input.selectedOptions, input.quantity)
  actions.enqueueToast(t.value.addedToCart)
}

const onResetCart = () => {
  if (!ensureOrderEditable()) {
    return
  }
  actions.resetCart()
}

const onRemoveCartItem = (cartItemId: string) => {
  if (!ensureOrderEditable()) {
    return
  }
  actions.removeCartItem(cartItemId)
}

const onUpdateCartItemQuantity = (cartItemId: string, nextQuantity: number) => {
  if (!ensureOrderEditable()) {
    return
  }
  actions.updateCartItemQuantity(cartItemId, nextQuantity)
}

const onContinueCheckout = () => {
  if (!ensureOrderEditable()) {
    return
  }

  if (derived.cartLines.value.length === 0) {
    return
  }

  currentView.value = 'confirmation'
}

const onBackToCatalog = () => {
  currentView.value = 'catalog'
}

type OrderPayload = {
  requestId: string
  submittedAt: string
  locale: StoreLocale
  itemCount: number
  itemsSummary: string
  items: Array<{
    id: string
    productId: string
    productName: string
    quantity: number
    unitPrice: number
    lineTotal: number
    selectedOptions: Record<string, string>
  }>
  totals: {
    subtotal: number
    creditUsed: number
    creditRemaining: number
    walletToPay: number
  }
}

const getOrderPayload = (): OrderPayload => ({
  requestId: crypto.randomUUID(),
  submittedAt: new Date().toISOString(),
  locale: locale.value,
  itemCount: derived.itemCount.value,
  itemsSummary: derived.cartLines.value
    .map((line) => {
      const selected = Object.entries(line.selectedOptions)
        .map(([key, value]) => `${key}=${value}`)
        .join(', ')
      const selectedText = selected.length > 0 ? ` (${selected})` : ''
      return `${line.product.name[locale.value]} x${line.quantity}${selectedText}`
    })
    .join(' | '),
  items: derived.cartLines.value.map((line) => ({
    id: line.id,
    productId: line.productId,
    productName: line.product.name[locale.value],
    quantity: line.quantity,
    unitPrice: line.product.price,
    lineTotal: line.lineTotal,
    selectedOptions: line.selectedOptions,
  })),
  totals: {
    subtotal: derived.subtotal.value,
    creditUsed: derived.creditUsed.value,
    creditRemaining: derived.creditRemaining.value,
    walletToPay: derived.walletToPay.value,
  },
})

type SessionUser = {
  id: string
  email: string | null
}

const getDisplayNameFromEmail = (email: string | null, fallbackId: string) => {
  if (!email) {
    return fallbackId.slice(0, 8)
  }

  const prefix = email.split('@')[0]?.trim()
  if (!prefix) {
    return fallbackId.slice(0, 8)
  }

  return prefix
}

const getSessionUser = (sessionPayload: unknown): SessionUser | null => {
  if (!sessionPayload || typeof sessionPayload !== 'object') {
    return null
  }

  const direct = sessionPayload as Record<string, unknown>
  const source = direct.data && typeof direct.data === 'object' ? (direct.data as Record<string, unknown>) : direct
  const user = source.user

  if (!user || typeof user !== 'object') {
    return null
  }

  const casted = user as Record<string, unknown>
  const id = typeof casted.id === 'string' ? casted.id : null
  const email = typeof casted.email === 'string' ? casted.email : null

  if (!id) {
    return null
  }

  return { id, email }
}

const ensureUserProfile = async (user: SessionUser) => {
  const upsert = await neonClient.from('app_users').upsert(
    {
      user_id: user.id,
      email: user.email ?? `${user.id}@unknown.local`,
      display_name: getDisplayNameFromEmail(user.email, user.id),
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
  if (upsert.error) {
    throw upsert.error
  }
}

const refreshSession = async () => {
  const payload = await neonClient.auth.getSession()
  const user = getSessionUser(payload)
  sessionUser.value = user

  if (!user) {
    isAdmin.value = false
    activeOrderId.value = null
    activeOrderLocked.value = false
    activeOrderPlacedAt.value = null
    actions.replaceCart([])
    return
  }

  await ensureUserProfile(user)

  const adminCheck = await neonClient.from('admin_users').select('user_id').eq('user_id', user.id).limit(1)
  if (adminCheck.error) {
    throw adminCheck.error
  }

  isAdmin.value = (adminCheck.data?.length ?? 0) > 0
}

const loadCurrentUserOrder = async () => {
  if (!sessionUser.value) {
    return
  }

  const orderResult = await neonClient
    .from('orders')
    .select('id,is_locked,placed_at,lock_deadline_at')
    .eq('user_id', sessionUser.value.id)
    .limit(1)

  if (orderResult.error) {
    throw orderResult.error
  }

  const order = (orderResult.data?.[0] as {
    id: string
    is_locked: boolean
    placed_at: string | null
    lock_deadline_at: string
  } | undefined) ?? null

  if (!order) {
    activeOrderId.value = null
    activeOrderLocked.value = false
    activeOrderPlacedAt.value = null
    activeOrderLockDeadlineAt.value = '2026-03-02T00:00:00Z'
    actions.replaceCart([])
    return
  }

  activeOrderId.value = order.id
  activeOrderLockDeadlineAt.value = order.lock_deadline_at

  if (!order.placed_at && Date.now() >= new Date(order.lock_deadline_at).getTime()) {
    const markPlaced = await neonClient
      .from('orders')
      .update({
        is_locked: true,
        locked_at: new Date().toISOString(),
        placed_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .eq('user_id', sessionUser.value.id)
      .select('is_locked,placed_at')
      .single()

    if (!markPlaced.error && markPlaced.data) {
      order.is_locked = (markPlaced.data as { is_locked: boolean }).is_locked
      order.placed_at = (markPlaced.data as { placed_at: string | null }).placed_at
    }
  }

  activeOrderLocked.value = order.is_locked
  activeOrderPlacedAt.value = order.placed_at

  const itemsResult = await neonClient
    .from('order_items')
    .select('product_id,quantity,selected_options')
    .eq('order_id', order.id)
  if (itemsResult.error) {
    throw itemsResult.error
  }

  const cartItems = ((itemsResult.data ?? []) as Array<{
    product_id: string
    quantity: number
    selected_options: Record<string, string>
  }>).map((item) => ({
    id: `${item.product_id}::${Object.entries(item.selected_options ?? {})
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join('|')}`,
    productId: item.product_id,
    quantity: item.quantity,
    selectedOptions: (item.selected_options ?? {}) as Record<string, string>,
  }))

  actions.replaceCart(cartItems)
}

const ensureOrderEditable = () => {
  if (!sessionUser.value) {
    actions.enqueueToast(t.value.orderAuthRequired)
    return false
  }

  if (isOrderEditable.value) {
    return true
  }

  if (isLockDeadlinePassed.value) {
    actions.enqueueToast('March 1 deadline passed. Your order can no longer be modified.')
    return false
  }

  actions.enqueueToast('Order is locked. Unlock it before editing.')
  return false
}

const onConnectGoogle = async () => {
  authBusy.value = true
  try {
    const result = await neonClient.auth.signIn.social({
      provider: 'google',
      callbackURL: window.location.href,
    })
    if ((result as { error?: { message?: string } })?.error) {
      throw new Error((result as { error?: { message?: string } }).error?.message ?? 'Google sign-in failed')
    }
  } catch (error) {
    console.error(error)
    actions.enqueueToast(error instanceof Error ? error.message : 'Authentication failed')
  } finally {
    authBusy.value = false
  }
}

const onSignOut = async () => {
  try {
    await neonClient.auth.signOut()
  } finally {
    sessionUser.value = null
    isAdmin.value = false
    activeOrderId.value = null
    activeOrderLocked.value = false
    activeOrderPlacedAt.value = null
    activeOrderLockDeadlineAt.value = '2026-03-02T00:00:00Z'
    actions.replaceCart([])
    currentView.value = 'catalog'
  }
}

const loadAdminDashboard = async () => {
  if (!isAdmin.value) {
    return
  }

  adminLoading.value = true
  adminError.value = null
  try {
    const usersResult = await neonClient
      .from('app_users')
      .select('user_id,email,display_name,created_at,last_seen_at')
      .order('last_seen_at', { ascending: false })
    if (usersResult.error) {
      throw usersResult.error
    }

    const ordersResult = await neonClient
      .from('orders')
      .select('id,request_id,user_email,item_count,subtotal,created_at')
      .order('created_at', { ascending: false })
    if (ordersResult.error) {
      throw ordersResult.error
    }

    adminUsers.value = (usersResult.data ?? []) as Array<{
      user_id: string
      email: string
      display_name: string
      created_at: string
      last_seen_at: string | null
    }>
    adminOrders.value = (ordersResult.data ?? []) as Array<{
      id: string
      request_id: string
      user_email: string | null
      item_count: number
      subtotal: string | number
      created_at: string
    }>
  } catch (error) {
    adminError.value = error instanceof Error ? error.message : 'Failed to load admin data'
  } finally {
    adminLoading.value = false
  }
}

const onOpenAdmin = async () => {
  if (!isAdmin.value) {
    return
  }
  currentView.value = 'admin'
  await loadAdminDashboard()
}

const submitOrder = async () => {
  if (derived.cartLines.value.length === 0 || isSubmittingOrder.value) {
    return
  }

  if (!ensureOrderEditable()) {
    return
  }

  isSubmittingOrder.value = true
  const payload = getOrderPayload()

  try {
    const sessionPayload = await neonClient.auth.getSession()
    const sessionUser = getSessionUser(sessionPayload)
    if (!sessionUser) {
      actions.enqueueToast(t.value.orderAuthRequired)
      return
    }

    let orderId = activeOrderId.value
    if (!orderId) {
      const insertOrder = await neonClient
        .from('orders')
        .insert({
          id: crypto.randomUUID(),
          request_id: payload.requestId,
          submitted_at: payload.submittedAt,
          user_id: sessionUser.id,
          user_email: sessionUser.email,
          locale: payload.locale,
          item_count: payload.itemCount,
          items_summary: payload.itemsSummary,
          subtotal: payload.totals.subtotal,
          credit_used: payload.totals.creditUsed,
          credit_remaining: payload.totals.creditRemaining,
          wallet_to_pay: payload.totals.walletToPay,
          raw_payload: payload,
          is_locked: false,
          lock_deadline_at: activeOrderLockDeadlineAt.value,
          placed_at: null,
        })
        .select('id')
        .single()

      if (insertOrder.error) {
        throw insertOrder.error
      }
      orderId = (insertOrder.data as { id: string }).id
      activeOrderId.value = orderId
    } else {
      const updateOrder = await neonClient
        .from('orders')
        .update({
          request_id: payload.requestId,
          submitted_at: payload.submittedAt,
          user_email: sessionUser.email,
          locale: payload.locale,
          item_count: payload.itemCount,
          items_summary: payload.itemsSummary,
          subtotal: payload.totals.subtotal,
          credit_used: payload.totals.creditUsed,
          credit_remaining: payload.totals.creditRemaining,
          wallet_to_pay: payload.totals.walletToPay,
          raw_payload: payload,
        })
        .eq('id', orderId)
      if (updateOrder.error) {
        throw updateOrder.error
      }
    }

    const deleteItems = await neonClient.from('order_items').delete().eq('order_id', orderId)
    if (deleteItems.error) {
      throw deleteItems.error
    }

    if (payload.items.length > 0) {
      const insertedItems = await neonClient.from('order_items').insert(
        payload.items.map((item) => ({
          id: crypto.randomUUID(),
          order_id: orderId,
          cart_line_id: item.id,
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          line_total: item.lineTotal,
          selected_options: item.selectedOptions,
        })),
      )
      if (insertedItems.error) {
        throw insertedItems.error
      }
    }

    actions.enqueueToast(t.value.orderSent)
    await loadCurrentUserOrder()
    currentView.value = 'catalog'
  } catch (error) {
    console.error(error)
    actions.enqueueToast(t.value.orderSendFailed)
  } finally {
    isSubmittingOrder.value = false
  }
}

const onLockOrder = async () => {
  if (!activeOrderId.value || !sessionUser.value || lockActionBusy.value) {
    return
  }
  if (isLockDeadlinePassed.value) {
    actions.enqueueToast('March 1 deadline passed. Order is now placed.')
    return
  }

  lockActionBusy.value = true
  try {
    const response = await neonClient
      .from('orders')
      .update({
        is_locked: true,
        locked_at: new Date().toISOString(),
        placed_at: new Date().toISOString(),
      })
      .eq('id', activeOrderId.value)
      .eq('user_id', sessionUser.value.id)
      .select('id')
      .single()

    if (response.error) {
      throw response.error
    }

    activeOrderLocked.value = true
    activeOrderPlacedAt.value = new Date().toISOString()
    actions.enqueueToast('Order locked in.')
  } catch (error) {
    console.error(error)
    actions.enqueueToast('Unable to lock order.')
  } finally {
    lockActionBusy.value = false
  }
}

const onUnlockOrder = async () => {
  if (!activeOrderId.value || !sessionUser.value || lockActionBusy.value) {
    return
  }
  if (isLockDeadlinePassed.value) {
    actions.enqueueToast('March 1 deadline passed. Order can no longer be unlocked.')
    return
  }

  lockActionBusy.value = true
  try {
    const response = await neonClient
      .from('orders')
      .update({
        is_locked: false,
        locked_at: null,
        placed_at: null,
      })
      .eq('id', activeOrderId.value)
      .eq('user_id', sessionUser.value.id)
      .select('id')
      .single()

    if (response.error) {
      throw response.error
    }

    activeOrderLocked.value = false
    activeOrderPlacedAt.value = null
    actions.enqueueToast('Order unlocked.')
  } catch (error) {
    console.error(error)
    actions.enqueueToast('Unable to unlock order.')
  } finally {
    lockActionBusy.value = false
  }
}

onMounted(async () => {
  try {
    await refreshSession()
    await loadCurrentUserOrder()
  } catch (error) {
    console.error(error)
  }
})
</script>
