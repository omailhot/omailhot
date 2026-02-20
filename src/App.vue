<template>
  <Header
    :title="t.appTitle"
    :subtitle="t.appSubtitle"
    :session-email="sessionUser?.email ?? null"
    :is-authenticated="Boolean(sessionUser)"
    :is-admin="isAdmin"
    :view="currentView"
    :auth-busy="authBusy"
    :connect-google-label="t.connectGoogle"
    :connecting-label="t.connecting"
    :sign-out-label="t.logout"
    :admin-label="t.admin"
    :catalog-label="t.backToCatalogShort"
    @connect-google="onConnectGoogle"
    @sign-out="onSignOut"
    @open-admin="onOpenAdmin"
    @open-catalog="currentView = 'catalog'"
    @open-home="onBackToCatalog"
  />

  <main
    class="min-h-[calc(100vh-4rem)] overflow-x-clip bg-[radial-gradient(circle_at_14%_6%,rgba(255,160,0,0.23),transparent_34%),radial-gradient(circle_at_75%_0%,rgba(255,0,53,0.16),transparent_35%)] pb-24 xl:pb-6"
  >
    <div class="mx-auto min-w-0 max-w-[96rem] px-4 py-6 sm:px-6">
      <div v-if="currentView === 'admin'">
        <AdminDashboard
          :t="t"
          :is-view-only="isViewOnly"
          :loading="adminLoading"
          :error="adminError"
          :orders="adminOrders"
          :items-summary="adminItemsSummary"
          @refresh="loadAdminDashboard"
          @select-order="onOpenAdminOrder"
          @delete-order="onDeleteAdminOrder"
          @toggle-view-only="toggleViewOnly"
        />
      </div>
      <div v-else-if="currentView === 'catalog'">
        <div
          v-if="isReadOnlyForCurrentUser"
          class="border-border/70 mb-4 rounded-2xl border bg-[linear-gradient(135deg,rgba(255,160,0,0.15),rgba(255,0,53,0.12))] p-4 shadow-sm"
        >
          <p class="text-foreground font-semibold">
            {{ t.viewOnlyBannerTitle }}
          </p>
          <p class="text-foreground/85 mt-1 text-sm">
            {{ t.viewOnlyBannerBody }}
          </p>
        </div>
        <div
          class="border-border/70 mb-4 flex flex-col gap-3 rounded-2xl border bg-[linear-gradient(135deg,rgba(255,160,0,0.18),rgba(255,0,53,0.14))] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:bg-[linear-gradient(135deg,rgba(255,160,0,0.24),rgba(255,0,53,0.2))]"
        >
          <div>
            <p class="text-foreground">
              Pour inaugurer cette première édition, un crédit est offert pour chaque employé au montant de 250$ par personne, utilisable pour cette édition seulement. Les prix de tous les produits incluent déjà les taxes.
            </p>
            <br>
            <p class="text-foreground">
              <b>La date maximale pour commander est le 1er mars 2026.</b> Si le crédit n’est pas utilisé en entièreté avant la cette date, ce crédit est perdu et non transférable à la prochaine édition, non monnayable, non remboursable.
            </p>
          </div>
        </div>
        <div
          v-if="!sessionUser"
          class="border-border/70 mb-4 flex flex-col gap-3 rounded-2xl border bg-[linear-gradient(135deg,rgba(255,160,0,0.18),rgba(255,0,53,0.14))] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:bg-[linear-gradient(135deg,rgba(255,160,0,0.24),rgba(255,0,53,0.2))]"
        >
          <div>
            <p class="text-foreground font-semibold">
              {{ t.loggedOutBannerTitle }}
            </p>
            <p class="text-foreground/85 dark:text-foreground/80 text-sm">
              {{ t.loggedOutBannerBody }}
            </p>
          </div>
          <Button class="shrink-0" @click="onConnectGoogle">
            {{ t.connectGoogle }}
          </Button>
        </div>
        <div
          v-if="activeOrderConfirmedAt"
          class="border-border/70 bg-card/80 mb-4 flex flex-col gap-3 rounded-2xl border p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p class="font-semibold">{{ t.existingOrderBannerTitle }}</p>
            <p class="text-muted-foreground text-sm">
              {{ orderStatusMessage }}
            </p>
          </div>
          <div class="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button
              v-if="!isReadOnlyForCurrentUser"
              variant="outline"
              :disabled="lockActionBusy"
              @click="onToggleOrderLock"
            >
              {{ t.unlockOrder }}
            </Button>
            <Button @click="onOpenDashboard">
              {{ t.viewMyOrder }}
            </Button>
          </div>
        </div>
        <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <CatalogSection
            :t="t"
            :locale="locale"
            :products="products"
            :cart-lines="derived.cartLines.value"
            :format-currency="formatCurrency"
            :view-only="isReadOnlyForCurrentUser"
            @open-product="actions.setActiveProductId"
            @quick-add="onQuickAdd"
          />
          <CartSidebar
            class="hidden xl:block"
            :t="t"
            :locale="locale"
            :cart-lines="derived.cartLines.value"
            :subtotal="derived.subtotal.value"
            :credit-used="derived.creditUsed.value"
            :credit-remaining="derived.creditRemaining.value"
            :wallet-to-pay="derived.walletToPay.value"
            :format-currency="formatCurrency"
            :read-only="!isOrderEditable || isReadOnlyForCurrentUser"
            @reset-cart="onResetCart"
            @remove-item="onRemoveCartItem"
            @update-item-quantity="onUpdateCartItemQuantity"
            @continue-checkout="onContinueCheckout"
          />
        </div>
      </div>
      <OrderConfirmationPage
        v-else-if="currentView === 'confirmation'"
        :t="t"
        :locale="locale"
        :cart-lines="derived.cartLines.value"
        :subtotal="derived.subtotal.value"
        :credit-used="derived.creditUsed.value"
        :credit-remaining="derived.creditRemaining.value"
        :wallet-to-pay="derived.walletToPay.value"
        :format-currency="formatCurrency"
        :is-submitting="isSubmittingOrder"
        :lock-action-busy="lockActionBusy"
        :is-order-locked="activeOrderLocked"
        :is-lock-deadline-passed="isLockDeadlinePassed"
        :lock-deadline-label="lockDeadlineLabel"
        :order-status-message="orderStatusMessage"
        :view-only="isReadOnlyForCurrentUser"
        :is-placed="false"
        :back-label="t.backToCatalog"
        @back="onBackToCatalog"
        @remove-item="onRemoveCartItem"
        @update-item-quantity="onUpdateCartItemQuantity"
        @update-item-variants="onUpdateCartItemVariants"
        @place-order="submitOrder"
      />
      <OrderPlacedPage
        v-else-if="currentView === 'placed'"
        :t="t"
        :locale="locale"
        :cart-lines="placedOrderPreview.cartLines"
        :deadline-label="lockDeadlineLabel"
        :lock-action-busy="lockActionBusy"
        :view-only="isReadOnlyForCurrentUser"
        @back="onBackToCatalog"
        @unlock-and-back="onUnlockAndBackToCatalog"
      />
      <AdminOrderDetailsPage
        v-else
        :t="t"
        :locale="locale"
        :cart-lines="adminPreview.cartLines"
        :format-currency="formatCurrency"
        @back="onBackFromAdminOrder"
      />
    </div>
  </main>

  <ProductDetailsModal
    :t="t"
    :locale="locale"
    :product="derived.activeProduct.value"
    :open="Boolean(state.activeProductId.value)"
    :format-currency="formatCurrency"
    :read-only="!isOrderEditable || isReadOnlyForCurrentUser"
    @close="actions.setActiveProductId(null)"
    @add-to-cart="onAddToCart"
  />

  <Toaster
    position="bottom-right"
    :mobile-offset="{ bottom: '6rem', right: '1rem', left: '1rem' }"
  />

  <div
    v-if="showOverwriteModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
    @click.self="onCancelOverwriteModal"
  >
    <div
      class="border-border/70 bg-background w-full max-w-md rounded-2xl border p-6 shadow-2xl"
    >
      <h3 class="text-lg font-semibold">{{ t.orderPlacedStatus }}</h3>
      <p class="text-muted-foreground mt-2 text-sm">
        {{ t.existingOrderBannerTitle }}
      </p>
      <p class="text-muted-foreground mt-1 text-sm">
        {{ t.overwriteOrderPrompt }}
      </p>
      <div class="mt-5 grid gap-2 sm:grid-cols-2">
        <Button variant="outline" @click="onGoToExistingOrderFromModal">
          {{ t.viewMyOrder }}
        </Button>
        <Button @click="onConfirmOverwriteOrder">{{
          t.overwriteOrderAction
        }}</Button>
      </div>
    </div>
  </div>

  <button
    v-if="currentView === 'catalog' && !isReadOnlyForCurrentUser"
    type="button"
    class="border-border/70 bg-background/95 hover:bg-background fixed inset-x-0 bottom-0 z-30 flex min-h-[4.5rem] cursor-pointer items-center justify-between border-t px-4 py-4 backdrop-blur transition-colors xl:hidden"
    @click="actions.setCartOpen(true)"
  >
    <div class="flex items-center gap-2">
      <ShoppingBasket class="size-4" />
      <span class="font-medium">{{ t.cartBuilder }}</span>
      <span class="text-muted-foreground text-sm"
        >{{ derived.itemCount.value }} {{ t.items }}</span
      >
    </div>
    <span class="font-semibold">{{
      formatCurrency.format(derived.subtotal.value)
    }}</span>
  </button>

  <CartDrawer
    :open="state.cartOpen.value"
    :t="t"
    :locale="locale"
    :cart-lines="derived.cartLines.value"
    :subtotal="derived.subtotal.value"
    :credit-used="derived.creditUsed.value"
    :credit-remaining="derived.creditRemaining.value"
    :wallet-to-pay="derived.walletToPay.value"
    :format-currency="formatCurrency"
    :read-only="!isOrderEditable || isReadOnlyForCurrentUser"
    @close="actions.setCartOpen(false)"
    @reset-cart="onResetCart"
    @remove-item="onRemoveCartItem"
    @update-item-quantity="onUpdateCartItemQuantity"
    @continue-checkout="onContinueCheckout"
  />
</template>

<script setup lang="ts">
import { ShoppingBasket } from "lucide-vue-next";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

import Header from "@/components/Header.vue";
import AdminDashboard from "@/components/merch/AdminDashboard.vue";
import AdminOrderDetailsPage from "@/components/merch/AdminOrderDetailsPage.vue";
import CartDrawer from "@/components/merch/CartDrawer.vue";
import CartSidebar from "@/components/merch/CartSidebar.vue";
import CatalogSection from "@/components/merch/CatalogSection.vue";
import OrderConfirmationPage from "@/components/merch/OrderConfirmationPage.vue";
import OrderPlacedPage from "@/components/merch/OrderPlacedPage.vue";
import ProductDetailsModal from "@/components/merch/ProductDetailsModal.vue";
import Button from "@/components/ui/Button.vue";
import { Toaster } from "@/components/ui/sonner";
import { merchCopy } from "@/config/merch-copy";
import { COMPANY_CREDIT, products } from "@/config/merch-store";
import { useMerchStore } from "@/hooks/use-merch-store";
import {
  buildCartItemId,
  computeBillableByPerson,
  findProductByOrderProductId,
  GIFT_CARD_DEFAULT_AMOUNT,
  GIFT_CARD_MAX_AMOUNT,
  GIFT_CARD_MIN_AMOUNT,
  normalizeSelectedOptions,
  resolveOrderProductSelection,
  validateGiftCardAmount,
} from "@/lib/merch-order";
import { neonClient } from "@/lib/neon-client";
import type { StoreLocale } from "@/types/merch";

const locale = computed<StoreLocale>(() => "fr");
const t = computed(() => merchCopy[locale.value]);

const formatCurrency = computed(
  () =>
    new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }),
);

const { state, derived, actions } = useMerchStore(products);
const currentView = ref<
  "catalog" | "confirmation" | "placed" | "admin" | "admin-order"
>("catalog");
const VIEW_SESSION_KEY = "propulshop-current-view";
const VIEW_ONLY_SESSION_KEY = "propulshop-view-only";
const isSubmittingOrder = ref(false);
const showOverwriteModal = ref(false);
const lockActionBusy = ref(false);
const authBusy = ref(false);
const isViewOnly = ref(false);
const sessionUser = ref<SessionUser | null>(null);
const isAdmin = ref(false);
const adminUsers = ref<
  Array<{
    user_id: string;
    email: string;
    display_name: string;
    created_at: string;
    last_seen_at: string | null;
  }>
>([]);
const adminOrders = ref<
  Array<{
    id: string;
    user_name: string;
    user_email: string | null;
    item_count: number;
    total_per_person: number;
    billable_per_person: number;
    is_locked: boolean;
    created_at: string;
  }>
>([]);
const adminItemsSummary = ref<
  Array<{
    key: string;
    product_name: string;
    variants: string;
    total_quantity: number;
    order_count: number;
  }>
>([]);
const adminLoading = ref(false);
const adminError = ref<string | null>(null);
const activeOrderId = ref<string | null>(null);
const activeOrderLocked = ref(false);
const activeOrderPlacedAt = ref<string | null>(null);
const activeOrderConfirmedAt = ref<string | null>(null);
const activeOrderLockDeadlineAt = ref("2026-03-01T23:59:59Z");
const isPersistingDraft = ref(false);
const pendingCartAction = ref<null | (() => void)>(null);
const adminSelectedOrderId = ref<string | null>(null);
let adminRefreshTimer: number | null = null;
const placedOrderPreview = ref<{
  cartLines: Array<{
    id: string;
    quantity: number;
    lineTotal: number;
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
  subtotal: number;
  creditUsed: number;
  creditRemaining: number;
  walletToPay: number;
}>({
  cartLines: [],
  subtotal: 0,
  creditUsed: 0,
  creditRemaining: 0,
  walletToPay: 0,
});
const adminPreview = ref<{
  cartLines: Array<{
    id: string;
    quantity: number;
    lineTotal: number;
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
  subtotal: number;
  creditUsed: number;
  creditRemaining: number;
  walletToPay: number;
  isOrderLocked: boolean;
  isLockDeadlinePassed: boolean;
  lockDeadlineLabel: string;
  orderStatusMessage: string;
}>({
  cartLines: [],
  subtotal: 0,
  creditUsed: 0,
  creditRemaining: 0,
  walletToPay: 0,
  isOrderLocked: false,
  isLockDeadlinePassed: false,
  lockDeadlineLabel: "",
  orderStatusMessage: "",
});

const lockDeadlineDate = computed(
  () => new Date(activeOrderLockDeadlineAt.value),
);
const lockDeadlineLabel = computed(() =>
  lockDeadlineDate.value.toLocaleString(
    locale.value === "fr" ? "fr-CA" : "en-CA",
    {
      dateStyle: "long",
      timeStyle: "short",
    },
  ),
);
const isLockDeadlinePassed = computed(
  () => Date.now() >= lockDeadlineDate.value.getTime(),
);
const isOrderEditable = computed(() => Boolean(sessionUser.value));
const isReadOnlyForCurrentUser = computed(
  () => isViewOnly.value,
);
const orderStatusMessage = computed(() => {
  if (!activeOrderConfirmedAt.value) {
    return t.value.orderNoDraftStatus;
  }
  return `${t.value.orderPlacedStatus} ${new Date(activeOrderConfirmedAt.value).toLocaleString(locale.value === "fr" ? "fr-CA" : "en-CA")}.`;
});

const buildOrderStatusMessage = (input: {
  activeOrderId: string | null;
  placedAt: string | null;
}) => {
  if (!input.activeOrderId) {
    return t.value.orderNoDraftStatus;
  }
  if (input.placedAt) {
    return `${t.value.orderPlacedStatus} ${new Date(input.placedAt).toLocaleString(locale.value === "fr" ? "fr-CA" : "en-CA")}.`;
  }
  return t.value.orderUnlockedStatus;
};

const toggleViewOnly = () => {
  if (!isAdmin.value) {
    return;
  }
  isViewOnly.value = !isViewOnly.value;
};

const onQuickAdd = (productId: string) => {
  if (isReadOnlyForCurrentUser.value) {
    return;
  }
  if (!ensureOrderEditable()) {
    return;
  }

  const product = products.find((item) => item.id === productId);
  if (!product) {
    return;
  }

  if ((product.variantGroups ?? []).length > 0) {
    actions.setActiveProductId(productId);
    return;
  }

  runCartActionOrPromptOverwrite(() => {
    actions.quickAdd(productId);
    actions.enqueueToast(t.value.addedToCart);
    void persistCartDraft();
  });
};

const onAddToCart = (input: {
  productId: string;
  selectedOptions: Record<string, string>;
  quantity: number;
}) => {
  if (isReadOnlyForCurrentUser.value) {
    return;
  }
  if (!ensureOrderEditable()) {
    return;
  }
  if (input.productId === "gift-card") {
    const rawAmount = Number(
      input.selectedOptions.amount ?? GIFT_CARD_DEFAULT_AMOUNT,
    );
    if (
      !validateGiftCardAmount(
        rawAmount,
        GIFT_CARD_MIN_AMOUNT,
        GIFT_CARD_MAX_AMOUNT,
      )
    ) {
      actions.enqueueToast(t.value.giftCardOutOfRange);
      return;
    }
  }
  runCartActionOrPromptOverwrite(() => {
    actions.addToCart(
      input.productId,
      normalizeSelectedOptions(input.selectedOptions),
      input.quantity,
    );
    actions.enqueueToast(t.value.addedToCart);
    void persistCartDraft();
  });
};

const onResetCart = () => {
  if (isReadOnlyForCurrentUser.value) {
    return;
  }
  if (!ensureOrderEditable()) {
    return;
  }
  actions.resetCart();
  void persistCartDraft();
};

const onRemoveCartItem = (cartItemId: string) => {
  if (isReadOnlyForCurrentUser.value) {
    return;
  }
  if (!ensureOrderEditable()) {
    return;
  }
  actions.removeCartItem(cartItemId);
  void persistCartDraft();
};

const onUpdateCartItemQuantity = (cartItemId: string, nextQuantity: number) => {
  if (isReadOnlyForCurrentUser.value) {
    return;
  }
  if (!ensureOrderEditable()) {
    return;
  }
  actions.updateCartItemQuantity(cartItemId, nextQuantity);
  void persistCartDraft();
};

const onUpdateCartItemVariants = (
  cartItemId: string,
  nextSelectedOptions: Record<string, string>,
) => {
  if (isReadOnlyForCurrentUser.value) {
    return;
  }
  if (!ensureOrderEditable()) {
    return;
  }
  actions.updateCartItemVariants(
    cartItemId,
    normalizeSelectedOptions(nextSelectedOptions),
  );
  void persistCartDraft();
};

const onContinueCheckout = () => {
  if (derived.cartLines.value.length === 0) {
    return;
  }

  actions.setCartOpen(false);
  currentView.value = "confirmation";
};

const onBackToCatalog = () => {
  currentView.value = "catalog";
};

const onUnlockAndBackToCatalog = async () => {
  await onToggleOrderLock();
  currentView.value = "catalog";
};

const onOpenDashboard = () => {
  currentView.value = activeOrderConfirmedAt.value ? "placed" : "confirmation";
};

const runCartActionOrPromptOverwrite = (action: () => void) => {
  if (activeOrderConfirmedAt.value) {
    pendingCartAction.value = action;
    showOverwriteModal.value = true;
    return;
  }
  action();
};

const onConfirmOverwriteOrder = () => {
  showOverwriteModal.value = false;
  activeOrderConfirmedAt.value = null;
  activeOrderPlacedAt.value = null;
  placedOrderPreview.value = {
    cartLines: [],
    subtotal: 0,
    creditUsed: 0,
    creditRemaining: 0,
    walletToPay: 0,
  };
  const action = pendingCartAction.value;
  pendingCartAction.value = null;
  action?.();
};

const onGoToExistingOrderFromModal = () => {
  showOverwriteModal.value = false;
  pendingCartAction.value = null;
  currentView.value = "placed";
};

const onCancelOverwriteModal = () => {
  showOverwriteModal.value = false;
  pendingCartAction.value = null;
};

const onToggleOrderLock = async () => {
  if (isReadOnlyForCurrentUser.value) {
    return;
  }
  if (!sessionUser.value || lockActionBusy.value) {
    return;
  }

  if (!activeOrderConfirmedAt.value) {
    await submitOrder();
    return;
  }

  if (!activeOrderId.value) {
    return;
  }

  lockActionBusy.value = true;
  try {
    const orderResult = await neonClient
      .from("orders")
      .select("raw_payload")
      .eq("id", activeOrderId.value)
      .eq("user_id", sessionUser.value.id)
      .single();
    if (orderResult.error) {
      throw orderResult.error;
    }

    const currentRawPayload = (
      orderResult.data as { raw_payload?: unknown } | null
    )?.raw_payload;
    const nextRawPayload =
      currentRawPayload && typeof currentRawPayload === "object"
        ? {
            ...(currentRawPayload as Record<string, unknown>),
            confirmedAt: null,
          }
        : { confirmedAt: null };

    const updateOrder = await neonClient
      .from("orders")
      .update({
        submitted_at: new Date().toISOString(),
        is_locked: false,
        locked_at: null,
        raw_payload: nextRawPayload,
      })
      .eq("id", activeOrderId.value)
      .eq("user_id", sessionUser.value.id);
    if (updateOrder.error) {
      throw updateOrder.error;
    }

    activeOrderConfirmedAt.value = null;
    await loadCurrentUserOrder();
    currentView.value = "confirmation";
    actions.setCartOpen(false);
    actions.enqueueToast(t.value.reopenOrder);
  } catch (error) {
    console.error(error);
    actions.enqueueToast(t.value.orderSendFailed);
  } finally {
    lockActionBusy.value = false;
  }
};

const onBackFromAdminOrder = () => {
  currentView.value = "admin";
};

const onOpenAdminOrder = async (orderId: string) => {
  if (!isAdmin.value) {
    return;
  }

  const orderResult = await neonClient
    .from("orders")
    .select(
      "id,subtotal,credit_used,credit_remaining,wallet_to_pay,raw_payload",
    )
    .eq("id", orderId)
    .single();
  if (orderResult.error || !orderResult.data) {
    actions.enqueueToast(t.value.orderSendFailed);
    return;
  }

  const labelsByCartLineId = new Map<string, Record<string, string>>();
  const rawPayload = (orderResult.data as { raw_payload?: unknown })
    .raw_payload;
  if (rawPayload && typeof rawPayload === "object") {
    const payloadItems = (rawPayload as Record<string, unknown>).items;
    if (Array.isArray(payloadItems)) {
      for (const item of payloadItems) {
        if (!item || typeof item !== "object") {
          continue;
        }
        const casted = item as Record<string, unknown>;
        const id = typeof casted.id === "string" ? casted.id : null;
        const labels =
          casted.selectedOptionLabels &&
          typeof casted.selectedOptionLabels === "object"
            ? (casted.selectedOptionLabels as Record<string, string>)
            : null;
        if (!id || !labels) {
          continue;
        }
        labelsByCartLineId.set(id, labels);
      }
    }
  }

  const itemsResult = await neonClient
    .from("order_items")
    .select(
      "id,cart_line_id,product_id,product_name,quantity,line_total,selected_options",
    )
    .eq("order_id", orderId);
  if (itemsResult.error) {
    actions.enqueueToast(t.value.orderSendFailed);
    return;
  }

  adminSelectedOrderId.value = orderId;
  adminPreview.value = {
    cartLines: (
      (itemsResult.data ?? []) as Array<{
        id: string;
        cart_line_id: string;
        product_id: string;
        product_name: string;
        quantity: number;
        line_total: number;
        selected_options: Record<string, string> | null;
      }>
    ).map((item) => {
      const selectedOptions = normalizeSelectedOptions(
        (item.selected_options ?? {}) as Record<string, string>,
      );
      const product = findProductByOrderProductId(
        products,
        item.product_id,
        selectedOptions,
      );
      return {
        id: item.id,
        quantity: item.quantity,
        lineTotal: item.line_total,
        selectedOptions,
        selectedOptionLabels: labelsByCartLineId.get(item.cart_line_id),
        product: {
          name: product?.name ?? {
            en: item.product_name,
            fr: item.product_name,
          },
          imageGallery: product?.imageGallery,
          gradientClass: product?.gradientClass,
          variantGroups: product?.variantGroups,
        },
      };
    }),
    subtotal: Number(
      (orderResult.data as { subtotal: string | number }).subtotal,
    ),
    creditUsed: Number(
      (orderResult.data as { credit_used: string | number }).credit_used,
    ),
    creditRemaining: Number(
      (orderResult.data as { credit_remaining: string | number })
        .credit_remaining,
    ),
    walletToPay: Number(
      (orderResult.data as { wallet_to_pay: string | number }).wallet_to_pay,
    ),
    isOrderLocked: false,
    isLockDeadlinePassed: false,
    lockDeadlineLabel: "",
    orderStatusMessage: buildOrderStatusMessage({
      activeOrderId: orderId,
      placedAt: null,
    }),
  };

  currentView.value = "admin-order";
};

const onDeleteAdminOrder = async (orderId: string) => {
  if (!isAdmin.value) {
    return;
  }

  try {
    const deleteOrder = await neonClient
      .from("orders")
      .delete()
      .eq("id", orderId);
    if (deleteOrder.error) {
      throw deleteOrder.error;
    }

    if (adminSelectedOrderId.value === orderId) {
      adminSelectedOrderId.value = null;
      currentView.value = "admin";
    }
    if (activeOrderId.value === orderId) {
      await loadCurrentUserOrder();
    }
    await loadAdminDashboard();
    actions.enqueueToast("Commande supprimée avec succès.");
  } catch (error) {
    console.error(error);
    actions.enqueueToast(t.value.orderSendFailed);
  }
};

type OrderPayload = {
  requestId: string;
  submittedAt: string;
  locale: StoreLocale;
  itemCount: number;
  itemsSummary: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    selectedOptions: Record<string, string>;
    selectedOptionLabels: Record<string, string>;
  }>;
  totals: {
    subtotal: number;
    creditUsed: number;
    creditRemaining: number;
    walletToPay: number;
  };
};

const getOrderPayload = (): OrderPayload => ({
  requestId: crypto.randomUUID(),
  submittedAt: new Date().toISOString(),
  locale: locale.value,
  itemCount: derived.itemCount.value,
  itemsSummary: derived.cartLines.value
    .map((line) => {
      const selected = Object.entries(
        normalizeSelectedOptions(line.selectedOptions),
      )
        .map(([key, value]) => `${key}=${value}`)
        .join(", ");
      const selectedText = selected.length > 0 ? ` (${selected})` : "";
      return `${line.product.name[locale.value]} x${line.quantity}${selectedText}`;
    })
    .join(" | "),
  items: derived.cartLines.value.map((line) => {
    const selectedOptions = normalizeSelectedOptions(line.selectedOptions);
    const orderSelection = resolveOrderProductSelection(
      line.product,
      selectedOptions,
    );
    return {
      id: buildCartItemId(line.productId, selectedOptions),
      productId: orderSelection.orderProductId,
      productName: line.product.name[locale.value],
      quantity: line.quantity,
      unitPrice: orderSelection.unitPrice,
      lineTotal: orderSelection.unitPrice * line.quantity,
      selectedOptions,
      selectedOptionLabels: Object.fromEntries(
        (line.product.variantGroups ?? [])
          .map((group) => {
            const selectedOption = group.options.find(
              (option) => option.id === line.selectedOptions[group.id],
            );
            if (!selectedOption) {
              return null;
            }
            return [
              group.label[locale.value],
              selectedOption.label[locale.value],
            ] as const;
          })
          .filter(
            (value): value is readonly [string, string] =>
              Array.isArray(value) && value.length === 2,
          ),
      ),
    };
  }),
  totals: {
    subtotal: derived.subtotal.value,
    creditUsed: derived.creditUsed.value,
    creditRemaining: derived.creditRemaining.value,
    walletToPay: derived.walletToPay.value,
  },
});

const persistCartDraft = async (
  showErrorToast = false,
  confirmSelection = false,
) => {
  if (!sessionUser.value || isPersistingDraft.value) {
    return false;
  }

  isPersistingDraft.value = true;
  try {
    if (derived.cartLines.value.length === 0) {
      if (!activeOrderId.value) {
        return true;
      }

      const deleteOrder = await neonClient
        .from("orders")
        .delete()
        .eq("id", activeOrderId.value)
        .eq("user_id", sessionUser.value.id);
      if (deleteOrder.error) {
        throw deleteOrder.error;
      }

      activeOrderId.value = null;
      activeOrderLocked.value = false;
      activeOrderPlacedAt.value = null;
      activeOrderConfirmedAt.value = null;
      return true;
    }

    const payload = getOrderPayload();
    const confirmedAt = confirmSelection ? new Date().toISOString() : null;
    const persistedPayload = {
      ...payload,
      confirmedAt,
    };
    let orderId = activeOrderId.value;

    if (!orderId) {
      const insertOrder = await neonClient
        .from("orders")
        .insert({
          id: crypto.randomUUID(),
          request_id: payload.requestId,
          submitted_at: payload.submittedAt,
          user_id: sessionUser.value.id,
          user_email: sessionUser.value.email,
          locale: payload.locale,
          item_count: payload.itemCount,
          items_summary: payload.itemsSummary,
          subtotal: payload.totals.subtotal,
          credit_used: payload.totals.creditUsed,
          credit_remaining: payload.totals.creditRemaining,
          wallet_to_pay: payload.totals.walletToPay,
          is_locked: confirmSelection,
          locked_at: confirmedAt,
          raw_payload: persistedPayload,
        })
        .select("id")
        .single();

      if (insertOrder.error) {
        throw insertOrder.error;
      }

      orderId = (insertOrder.data as { id: string }).id;
      activeOrderId.value = orderId;
    } else {
      const updateOrder = await neonClient
        .from("orders")
        .update({
          submitted_at: payload.submittedAt,
          user_email: sessionUser.value.email,
          locale: payload.locale,
          item_count: payload.itemCount,
          items_summary: payload.itemsSummary,
          subtotal: payload.totals.subtotal,
          credit_used: payload.totals.creditUsed,
          credit_remaining: payload.totals.creditRemaining,
          wallet_to_pay: payload.totals.walletToPay,
          is_locked: confirmSelection,
          locked_at: confirmedAt,
          raw_payload: persistedPayload,
        })
        .eq("id", orderId)
        .eq("user_id", sessionUser.value.id);
      if (updateOrder.error) {
        throw updateOrder.error;
      }
    }

    const deleteItems = await neonClient
      .from("order_items")
      .delete()
      .eq("order_id", orderId);
    if (deleteItems.error) {
      throw deleteItems.error;
    }

    const insertItems = await neonClient.from("order_items").insert(
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
    );
    if (insertItems.error) {
      throw insertItems.error;
    }

    activeOrderConfirmedAt.value = confirmedAt;
    return true;
  } catch (error) {
    console.error(error);
    if (showErrorToast) {
      actions.enqueueToast(t.value.orderSendFailed);
    }
    return false;
  } finally {
    isPersistingDraft.value = false;
  }
};

type SessionUser = {
  id: string;
  email: string | null;
  isAdminClaim: boolean;
};

type PostgrestErrorLike = {
  code?: string;
  message?: string;
};

const missingTableWarnings = new Set<string>();

const isMissingTableError = (error: unknown, tableName: string) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const casted = error as PostgrestErrorLike;
  return (
    casted.code === "PGRST205" &&
    typeof casted.message === "string" &&
    casted.message.includes(`public.${tableName}`)
  );
};

const isPermissionDeniedError = (error: unknown, tableName: string) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const casted = error as PostgrestErrorLike;
  return (
    casted.code === "42501" &&
    typeof casted.message === "string" &&
    casted.message.toLowerCase().includes(`table ${tableName}`.toLowerCase())
  );
};

const isPolicyRecursionError = (error: unknown, tableName: string) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const casted = error as PostgrestErrorLike;
  return (
    casted.code === "42P17" &&
    typeof casted.message === "string" &&
    casted.message
      .toLowerCase()
      .includes(`relation "${tableName}"`.toLowerCase())
  );
};

const warnMissingTableOnce = (tableName: string) => {
  if (missingTableWarnings.has(tableName)) {
    return;
  }
  missingTableWarnings.add(tableName);
  console.warn(
    `Table public.${tableName} manquante. Exécutez database/neon-schema.sql.`,
  );
};

const warnPolicyRecursionOnce = (tableName: string) => {
  const key = `policy-recursion:${tableName}`;
  if (missingTableWarnings.has(key)) {
    return;
  }
  missingTableWarnings.add(key);
  console.warn(
    `RLS policy recursion detected on ${tableName}. Fix policy in database/neon-schema.sql (drop/recreate admin_users_select).`,
  );
};

const getDisplayNameFromEmail = (email: string | null, fallbackId: string) => {
  if (!email) {
    return fallbackId.slice(0, 8);
  }

  const prefix = email.split("@")[0]?.trim();
  if (!prefix) {
    return fallbackId.slice(0, 8);
  }

  return prefix;
};

const getSessionUser = (sessionPayload: unknown): SessionUser | null => {
  if (!sessionPayload || typeof sessionPayload !== "object") {
    return null;
  }

  const direct = sessionPayload as Record<string, unknown>;
  const source =
    direct.data && typeof direct.data === "object"
      ? (direct.data as Record<string, unknown>)
      : direct;
  const session =
    source.session && typeof source.session === "object"
      ? (source.session as Record<string, unknown>)
      : null;
  const user = source.user ?? session?.user;

  if (!user || typeof user !== "object") {
    return null;
  }

  const casted = user as Record<string, unknown>;
  const id = typeof casted.id === "string" ? casted.id : null;
  const email = typeof casted.email === "string" ? casted.email : null;
  const role =
    typeof casted.role === "string" ? casted.role.toLowerCase() : null;
  const roles = Array.isArray(casted.roles)
    ? casted.roles
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.toLowerCase())
    : [];
  const metadata = casted.app_metadata;
  const metadataRole =
    metadata &&
    typeof metadata === "object" &&
    typeof (metadata as Record<string, unknown>).role === "string"
      ? ((metadata as Record<string, unknown>).role as string).toLowerCase()
      : null;
  const isAdminClaim =
    role === "admin" || roles.includes("admin") || metadataRole === "admin";

  if (!id) {
    return null;
  }

  return { id, email, isAdminClaim };
};

const ensureUserProfile = async (user: SessionUser) => {
  const upsert = await neonClient.from("app_users").upsert(
    {
      user_id: user.id,
      email: user.email ?? `${user.id}@unknown.local`,
      display_name: getDisplayNameFromEmail(user.email, user.id),
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (upsert.error) {
    if (isMissingTableError(upsert.error, "app_users")) {
      warnMissingTableOnce("app_users");
      return;
    }
    if (isPolicyRecursionError(upsert.error, "admin_users")) {
      warnPolicyRecursionOnce("admin_users");
      return;
    }
    throw upsert.error;
  }
};

const refreshSession = async () => {
  const payload = await neonClient.auth.getSession();
  const user = getSessionUser(payload);
  sessionUser.value = user;

  if (!user) {
    isAdmin.value = false;
    activeOrderId.value = null;
    activeOrderLocked.value = false;
    activeOrderPlacedAt.value = null;
    activeOrderConfirmedAt.value = null;
    actions.replaceCart([]);
    return;
  }

  await ensureUserProfile(user);

  const adminCheck = await neonClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .limit(1);
  if (adminCheck.error) {
    if (isPolicyRecursionError(adminCheck.error, "admin_users")) {
      warnPolicyRecursionOnce("admin_users");
      isAdmin.value = false;
      return;
    }
    if (isMissingTableError(adminCheck.error, "admin_users")) {
      warnMissingTableOnce("admin_users");
    } else {
      console.error(adminCheck.error);
    }
    isAdmin.value = false;
    return;
  }

  const hasAdminRow = (adminCheck.data?.length ?? 0) > 0;
  isAdmin.value = hasAdminRow;
  if (user.isAdminClaim && !hasAdminRow) {
    actions.enqueueToast(
      "Droit admin détecté, mais le mapping admin_users est manquant.",
    );
  }
};

const loadCurrentUserOrder = async () => {
  if (!sessionUser.value) {
    return;
  }

  const orderResult = await neonClient
    .from("orders")
    .select("id,raw_payload,is_locked,locked_at")
    .eq("user_id", sessionUser.value.id)
    .limit(1);

  if (orderResult.error) {
    throw orderResult.error;
  }

  const order =
    (orderResult.data?.[0] as
      | { id: string; is_locked: boolean; locked_at: string | null }
      | undefined) ?? null;

  if (!order) {
    activeOrderId.value = null;
    activeOrderLocked.value = false;
    activeOrderPlacedAt.value = null;
    activeOrderConfirmedAt.value = null;
    activeOrderLockDeadlineAt.value = "2026-03-01T23:59:59Z";
    placedOrderPreview.value = {
      cartLines: [],
      subtotal: 0,
      creditUsed: 0,
      creditRemaining: 0,
      walletToPay: 0,
    };
    actions.replaceCart([]);
    return;
  }

  activeOrderId.value = order.id;
  activeOrderLocked.value = order.is_locked;
  activeOrderPlacedAt.value = null;
  const rawPayload = (
    orderResult.data?.[0] as { raw_payload?: unknown } | undefined
  )?.raw_payload;
  const labelsByCartLineId = new Map<string, Record<string, string>>();
  if (rawPayload && typeof rawPayload === "object") {
    const confirmedAt = (rawPayload as Record<string, unknown>).confirmedAt;
    activeOrderConfirmedAt.value =
      typeof confirmedAt === "string" && confirmedAt.length > 0
        ? confirmedAt
        : order.is_locked
          ? order.locked_at
          : null;
    const payloadItems = (rawPayload as Record<string, unknown>).items;
    if (Array.isArray(payloadItems)) {
      for (const item of payloadItems) {
        if (!item || typeof item !== "object") {
          continue;
        }
        const casted = item as Record<string, unknown>;
        const id = typeof casted.id === "string" ? casted.id : null;
        const labels =
          casted.selectedOptionLabels &&
          typeof casted.selectedOptionLabels === "object"
            ? (casted.selectedOptionLabels as Record<string, string>)
            : null;
        if (!id || !labels) {
          continue;
        }
        labelsByCartLineId.set(id, labels);
      }
    }
  } else {
    activeOrderConfirmedAt.value = null;
  }

  const itemsResult = await neonClient
    .from("order_items")
    .select("cart_line_id,product_id,quantity,selected_options")
    .eq("order_id", order.id);
  if (itemsResult.error) {
    throw itemsResult.error;
  }

  const cartItems = (
    (itemsResult.data ?? []) as Array<{
      cart_line_id: string;
      product_id: string;
      quantity: number;
      selected_options: Record<string, string>;
    }>
  ).map((item) => {
    const selectedOptions = normalizeSelectedOptions(
      (item.selected_options ?? {}) as Record<string, string>,
    );
    const catalogProduct = findProductByOrderProductId(
      products,
      item.product_id,
      selectedOptions,
    );
    const catalogProductId = catalogProduct?.id ?? item.product_id;
    return {
      id: buildCartItemId(catalogProductId, selectedOptions),
      productId: catalogProductId,
      quantity: item.quantity,
      selectedOptions,
      selectedOptionLabels: labelsByCartLineId.get(item.cart_line_id),
    };
  });

  if (activeOrderConfirmedAt.value) {
    const lines = cartItems
      .map((item) => {
        const product = findProductByOrderProductId(
          products,
          item.productId,
          item.selectedOptions,
        );
        if (!product) {
          return null;
        }

        const orderSelection = resolveOrderProductSelection(
          product,
          item.selectedOptions,
        );
        return {
          id: item.id,
          quantity: item.quantity,
          lineTotal: item.quantity * orderSelection.unitPrice,
          selectedOptions: item.selectedOptions,
          selectedOptionLabels: item.selectedOptionLabels,
          product,
        };
      })
      .filter((line): line is NonNullable<typeof line> => line !== null);

    const subtotal = lines.reduce((total, line) => total + line.lineTotal, 0);
    const creditUsed = Math.min(COMPANY_CREDIT, subtotal);
    const creditRemaining = Math.max(COMPANY_CREDIT - creditUsed, 0);
    const walletToPay = Math.max(subtotal - COMPANY_CREDIT, 0);

    placedOrderPreview.value = {
      cartLines: lines,
      subtotal,
      creditUsed,
      creditRemaining,
      walletToPay,
    };
    actions.replaceCart([]);
  } else {
    placedOrderPreview.value = {
      cartLines: [],
      subtotal: 0,
      creditUsed: 0,
      creditRemaining: 0,
      walletToPay: 0,
    };
    actions.replaceCart(cartItems);
  }
};

const ensureOrderEditable = () => {
  if (!sessionUser.value) {
    void onConnectGoogle();
    return false;
  }
  return true;
};

const onConnectGoogle = async () => {
  authBusy.value = true;
  try {
    const result = await neonClient.auth.signIn.social({
      provider: "google",
      callbackURL: window.location.href,
    });
    if ((result as { error?: { message?: string } })?.error) {
      throw new Error(
        (result as { error?: { message?: string } }).error?.message ??
          "Connexion Google impossible",
      );
    }
  } catch (error) {
    console.error(error);
    actions.enqueueToast(
      error instanceof Error ? error.message : "Authentification impossible",
    );
  } finally {
    authBusy.value = false;
  }
};

const onSignOut = async () => {
  try {
    await neonClient.auth.signOut();
  } finally {
    sessionUser.value = null;
    isAdmin.value = false;
    activeOrderId.value = null;
    activeOrderLocked.value = false;
    activeOrderPlacedAt.value = null;
    activeOrderConfirmedAt.value = null;
    activeOrderLockDeadlineAt.value = "2026-03-01T23:59:59Z";
    actions.replaceCart([]);
    currentView.value = "catalog";
  }
};

const loadAdminDashboard = async () => {
  if (!isAdmin.value) {
    return;
  }

  adminLoading.value = true;
  adminError.value = null;
  try {
    const usersResult = await neonClient
      .from("app_users")
      .select("user_id,email,display_name,created_at,last_seen_at")
      .order("last_seen_at", { ascending: false });
    if (
      usersResult.error &&
      isPolicyRecursionError(usersResult.error, "admin_users")
    ) {
      warnPolicyRecursionOnce("admin_users");
      adminUsers.value = [];
    }
    if (
      usersResult.error &&
      !isMissingTableError(usersResult.error, "app_users")
    ) {
      if (isPolicyRecursionError(usersResult.error, "admin_users")) {
        // Continue loading orders even if app_users is blocked by recursive policy.
      } else if (isPermissionDeniedError(usersResult.error, "app_users")) {
        adminError.value =
          "Permission base de données manquante pour app_users.";
        return;
      } else {
        throw usersResult.error;
      }
    }
    if (
      usersResult.error &&
      isMissingTableError(usersResult.error, "app_users")
    ) {
      warnMissingTableOnce("app_users");
    }

    const ordersResult = await neonClient
      .from("orders")
      .select("id,user_id,user_email,item_count,subtotal,is_locked,created_at")
      .order("created_at", { ascending: false });
    if (ordersResult.error) {
      if (isPermissionDeniedError(ordersResult.error, "orders")) {
        adminError.value = "Permission base de données manquante pour orders.";
        return;
      }
      throw ordersResult.error;
    }

    const orderItemsResult = await neonClient
      .from("order_items")
      .select("order_id,product_name,quantity,selected_options");
    if (orderItemsResult.error) {
      throw orderItemsResult.error;
    }

    if (!usersResult.error) {
      adminUsers.value = (usersResult.data ?? []) as Array<{
        user_id: string;
        email: string;
        display_name: string;
        created_at: string;
        last_seen_at: string | null;
      }>;
    }
    const usersById = new Map(
      adminUsers.value.map((user) => [user.user_id, user.display_name]),
    );
    adminOrders.value = (
      (ordersResult.data ?? []) as Array<{
        id: string;
        user_id: string;
        user_email: string | null;
        item_count: number;
        subtotal: string | number;
        is_locked: boolean;
        created_at: string;
      }>
    ).map((order) => {
      const billing = computeBillableByPerson(
        Number(order.subtotal),
        COMPANY_CREDIT,
      );
      return {
        id: order.id,
        user_name:
          usersById.get(order.user_id) ??
          order.user_email?.split("@")[0] ??
          "-",
        user_email: order.user_email,
        item_count: order.item_count,
        total_per_person: billing.total,
        billable_per_person: billing.billable,
        is_locked: order.is_locked,
        created_at: order.created_at,
      };
    });

    const itemSummaryMap = new Map<
      string,
      {
        key: string;
        product_name: string;
        variants: string;
        total_quantity: number;
        order_ids: Set<string>;
      }
    >();

    (
      (orderItemsResult.data ?? []) as Array<{
        order_id: string;
        product_name: string;
        quantity: number;
        selected_options: Record<string, string> | null;
      }>
    ).forEach((item) => {
      const variantEntries = Object.entries(
        normalizeSelectedOptions(
          (item.selected_options ?? {}) as Record<string, string>,
        ),
      )
        .filter(([, value]) => Boolean(value))
        .sort(([a], [b]) => a.localeCompare(b));
      const variants =
        variantEntries.length > 0
          ? variantEntries.map(([key, value]) => `${key}: ${value}`).join(" | ")
          : "Defaut";
      const key = `${item.product_name}::${variants}`;
      const existing = itemSummaryMap.get(key);
      if (existing) {
        existing.total_quantity += item.quantity;
        existing.order_ids.add(item.order_id);
        return;
      }

      itemSummaryMap.set(key, {
        key,
        product_name: item.product_name,
        variants,
        total_quantity: item.quantity,
        order_ids: new Set([item.order_id]),
      });
    });

    adminItemsSummary.value = Array.from(itemSummaryMap.values())
      .map((entry) => ({
        key: entry.key,
        product_name: entry.product_name,
        variants: entry.variants,
        total_quantity: entry.total_quantity,
        order_count: entry.order_ids.size,
      }))
      .sort((a, b) => b.total_quantity - a.total_quantity);
  } catch (error) {
    adminError.value =
      error instanceof Error
        ? error.message
        : "Impossible de charger les données admin";
  } finally {
    adminLoading.value = false;
  }
};

const onOpenAdmin = async () => {
  if (!isAdmin.value) {
    return;
  }
  currentView.value = "admin";
  await loadAdminDashboard();
};

const submitOrder = async () => {
  if (isReadOnlyForCurrentUser.value) {
    return;
  }
  if (derived.cartLines.value.length === 0 || isSubmittingOrder.value) {
    return;
  }

  if (!ensureOrderEditable()) {
    return;
  }

  isSubmittingOrder.value = true;
  try {
    const shouldConfirm = !activeOrderConfirmedAt.value;
    const persisted = await persistCartDraft(true, shouldConfirm);
    if (!persisted) {
      return;
    }

    if (shouldConfirm) {
      actions.enqueueToast(t.value.orderSent);
    } else {
      actions.enqueueToast(t.value.reopenOrder);
    }

    await loadCurrentUserOrder();
    currentView.value = shouldConfirm ? "placed" : "confirmation";
  } finally {
    isSubmittingOrder.value = false;
  }
};

onMounted(async () => {
  if (typeof window !== "undefined") {
    const savedView = window.sessionStorage.getItem(VIEW_SESSION_KEY);
    if (
      savedView === "confirmation" ||
      savedView === "placed" ||
      savedView === "admin"
    ) {
      currentView.value = savedView;
    }
    isViewOnly.value =
      window.sessionStorage.getItem(VIEW_ONLY_SESSION_KEY) === "1";
  }

  if (window.location.hostname === "127.0.0.1") {
    const normalizedUrl = new URL(window.location.href);
    normalizedUrl.hostname = "localhost";
    window.location.replace(normalizedUrl.toString());
    return;
  }

  try {
    await refreshSession();
    if (
      (currentView.value === "admin" || currentView.value === "admin-order") &&
      !isAdmin.value
    ) {
      currentView.value = "catalog";
    }
    await loadCurrentUserOrder();
  } catch (error) {
    console.error(error);
  }
});

watch(currentView, (nextView) => {
  if (typeof window === "undefined") {
    return;
  }

  const persistedView = nextView === "admin-order" ? "admin" : nextView;
  window.sessionStorage.setItem(VIEW_SESSION_KEY, persistedView);
});

watch(isViewOnly, (nextValue) => {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(VIEW_ONLY_SESSION_KEY, nextValue ? "1" : "0");
});

watch(
  () => [currentView.value, isAdmin.value] as const,
  async ([view, admin]) => {
    if (adminRefreshTimer) {
      window.clearInterval(adminRefreshTimer);
      adminRefreshTimer = null;
    }

    if (!admin || view !== "admin") {
      return;
    }

    await loadAdminDashboard();
    adminRefreshTimer = window.setInterval(() => {
      void loadAdminDashboard();
    }, 30000);
  },
  { immediate: true },
);

onUnmounted(() => {
  if (adminRefreshTimer) {
    window.clearInterval(adminRefreshTimer);
    adminRefreshTimer = null;
  }
});
</script>
