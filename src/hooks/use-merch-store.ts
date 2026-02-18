import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { COMPANY_CREDIT } from '@/config/merch-store'
import type { CartItem, Category, Product } from '@/types/merch'

type ToastMessage = {
  id: string
  message: string
}

const CART_SESSION_KEY = 'propulso-merch-cart'

const buildCartItemId = (productId: string, selectedOptions: Record<string, string>) => {
  const entries = Object.entries(selectedOptions).sort(([a], [b]) => a.localeCompare(b))
  const optionKey = entries.map(([key, value]) => `${key}:${value}`).join('|')
  return `${productId}::${optionKey}`
}

export function useMerchStore(products: Product[]) {
  const activeCategory = ref<'all' | Category>('all')
  const cartItems = ref<CartItem[]>([])
  const cartOpen = ref(false)
  const orderUpdates = ref(true)
  const dropUpdates = ref(false)
  const activeProductId = ref<string | null>(null)
  const toastQueue = ref<ToastMessage[]>([])

  const persistCartToSession = () => {
    if (typeof window === 'undefined') {
      return
    }

    window.sessionStorage.setItem(CART_SESSION_KEY, JSON.stringify(cartItems.value))
  }

  const restoreCartFromSession = () => {
    if (typeof window === 'undefined') {
      return
    }

    const raw = window.sessionStorage.getItem(CART_SESSION_KEY)
    if (!raw) {
      return
    }

    try {
      const parsed = JSON.parse(raw) as CartItem[]
      if (!Array.isArray(parsed)) {
        return
      }

      cartItems.value = parsed
        .map((item) => ({
          id: buildCartItemId(item.productId, item.selectedOptions ?? {}),
          productId: item.productId,
          quantity: Math.max(1, Math.min(Number(item.quantity ?? 1), 25)),
          selectedOptions:
            item.selectedOptions && typeof item.selectedOptions === 'object'
              ? item.selectedOptions
              : {},
        }))
        .filter((item) => Boolean(item.productId))
    } catch (error) {
      console.warn('Could not restore cart from session storage', error)
    }
  }

  onMounted(() => {
    restoreCartFromSession()

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        cartOpen.value = false
        activeProductId.value = null
      }
    }

    window.addEventListener('keydown', onEscape)
    onUnmounted(() => {
      window.removeEventListener('keydown', onEscape)
    })
  })

  watch(
    cartItems,
    () => {
      persistCartToSession()
    },
    { deep: true },
  )

  const productById = computed(() => new Map(products.map((product) => [product.id, product])))

  const cartLines = computed(() =>
    cartItems.value
      .map((item) => {
        const product = productById.value.get(item.productId)
        if (!product) {
          return null
        }

        return {
          ...item,
          product,
          lineTotal: item.quantity * product.price,
        }
      })
      .filter((line): line is NonNullable<typeof line> => line !== null),
  )

  const itemCount = computed(() => cartLines.value.reduce((total, line) => total + line.quantity, 0))
  const subtotal = computed(() => cartLines.value.reduce((total, line) => total + line.lineTotal, 0))
  const creditUsed = computed(() => Math.min(COMPANY_CREDIT, subtotal.value))
  const creditRemaining = computed(() => Math.max(COMPANY_CREDIT - creditUsed.value, 0))
  const walletToPay = computed(() => Math.max(subtotal.value - COMPANY_CREDIT, 0))

  const activeProduct = computed(() => {
    if (!activeProductId.value) {
      return null
    }

    return productById.value.get(activeProductId.value) ?? null
  })

  const addToCart = (productId: string, selectedOptions: Record<string, string>, quantity = 1) => {
    const normalizedQuantity = Math.max(1, Math.min(quantity, 25))
    const cartItemId = buildCartItemId(productId, selectedOptions)

    const existingIndex = cartItems.value.findIndex((item) => item.id === cartItemId)
    if (existingIndex === -1) {
      cartItems.value = [
        ...cartItems.value,
        {
          id: cartItemId,
          productId,
          quantity: normalizedQuantity,
          selectedOptions,
          selectedOptionLabels: undefined,
        },
      ]
      return
    }

    const next = [...cartItems.value]
    next[existingIndex] = {
      ...next[existingIndex],
      quantity: Math.min(25, next[existingIndex].quantity + normalizedQuantity),
    }
    cartItems.value = next
  }

  const removeCartItem = (cartItemId: string) => {
    cartItems.value = cartItems.value.filter((item) => item.id !== cartItemId)
  }

  const updateCartItemQuantity = (cartItemId: string, nextQuantity: number) => {
    const quantity = Math.max(0, Math.min(nextQuantity, 25))
    if (quantity === 0) {
      removeCartItem(cartItemId)
      return
    }

    cartItems.value = cartItems.value.map((item) =>
      item.id === cartItemId ? { ...item, quantity } : item,
    )
  }

  const quickAdd = (productId: string) => {
    const product = productById.value.get(productId)
    if (!product) {
      return
    }

    const defaultOptions = Object.fromEntries(
      (product.variantGroups ?? []).map((group) => [group.id, group.options[0]?.id ?? '']),
    )

    addToCart(productId, defaultOptions, 1)
  }

  const resetCart = () => {
    cartItems.value = []
  }

  const replaceCart = (items: CartItem[]) => {
    cartItems.value = items
      .map((item) => ({
        id: buildCartItemId(item.productId, item.selectedOptions),
        productId: item.productId,
        quantity: Math.max(1, Math.min(item.quantity, 25)),
        selectedOptions: item.selectedOptions,
        selectedOptionLabels: item.selectedOptionLabels,
      }))
      .filter((item) => item.quantity > 0)
  }

  const enqueueToast = (message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    toastQueue.value = [...toastQueue.value, { id, message }]

    window.setTimeout(() => {
      toastQueue.value = toastQueue.value.filter((toast) => toast.id !== id)
    }, 2300)
  }

  return {
    state: {
      activeCategory,
      cartOpen,
      orderUpdates,
      dropUpdates,
      activeProductId,
      toastQueue,
    },
    derived: {
      cartLines,
      itemCount,
      subtotal,
      creditUsed,
      creditRemaining,
      walletToPay,
      activeProduct,
    },
    actions: {
      setActiveCategory: (value: 'all' | Category) => {
        activeCategory.value = value
      },
      setCartOpen: (value: boolean) => {
        cartOpen.value = value
      },
      setOrderUpdates: (value: boolean) => {
        orderUpdates.value = value
      },
      setDropUpdates: (value: boolean) => {
        dropUpdates.value = value
      },
      setActiveProductId: (value: string | null) => {
        activeProductId.value = value
      },
      addToCart,
      quickAdd,
      removeCartItem,
      updateCartItemQuantity,
      resetCart,
      replaceCart,
      enqueueToast,
    },
  }
}
