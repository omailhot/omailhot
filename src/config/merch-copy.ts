import type { Category, StoreLocale } from '@/types/merch'

type LocalizedCategoryLabels = Record<'all' | Category, string>

export type MerchCopy = {
  appTitle: string
  appSubtitle: string
  landingBadge: string
  landingTitle: string
  landingDescription: string
  landingBullet1: string
  landingBullet2: string
  landingBullet3: string
  landingCta: string
  loginTitle: string
  loginSubtitle: string
  emailLabel: string
  emailPlaceholder: string
  signIn: string
  connectGoogle: string
  connecting: string
  closeLogin: string
  invalidEmail: string
  invalidDomain: string
  tabCatalog: string
  tabProfile: string
  catalogTitle: string
  catalogSubtitle: string
  search: string
  resetCart: string
  removeItem: string
  viewDetails: string
  quickAdd: string
  addedToCart: string
  perItem: string
  quantity: string
  variant: string
  variants: string
  noVariants: string
  selectVariant: string
  productDetails: string
  addSelection: string
  categoryLabels: LocalizedCategoryLabels
  profileTitle: string
  profileSubtitle: string
  loggedInAs: string
  logout: string
  admin: string
  backToCatalogShort: string
  walletTitle: string
  walletSubtitle: string
  creditAvailable: string
  creditUsed: string
  creditRemaining: string
  walletToPay: string
  settingsTitle: string
  settingOrderUpdates: string
  settingDrops: string
  cartBuilder: string
  closeCart: string
  items: string
  emptyCart: string
  addFromCatalog: string
  subtotal: string
  checkout: string
  continueSelection: string
  checkoutHint: string
  reviewTitle: string
  reviewSubtitle: string
  itemsToOrder: string
  confirmationTitle: string
  confirmationSubtitle: string
  invoiceLater: string
  invoiceExplanation: string
  backToCatalog: string
  placeOrder: string
  reopenOrder: string
  modifyOrder: string
  orderSent: string
  orderAuthRequired: string
  orderSendFailed: string
  orderNoDraftStatus: string
  orderPlacedStatus: string
  orderLockedStatus: string
  orderUnlockedStatus: string
  deadlinePassed: string
  cannotEditAfterDeadline: string
  unlockBeforeEditing: string
  lockOrder: string
  unlockOrder: string
  lockExplanationTitle: string
  lockExplanationBody: string
  lockDeadlineLabel: string
  existingOrderBannerTitle: string
  viewMyOrder: string
  policy: string
}

export const merchCopy: Record<StoreLocale, MerchCopy> = {
  en: {
    appTitle: 'Propulso Merch',
    appSubtitle: 'Internal employee store',
    landingBadge: 'Modern Team Store',
    landingTitle: 'Premium merch experience for every employee',
    landingDescription:
      'Choose products in real time, keep control of your budget, and submit one clean cart request.',
    landingBullet1: 'Curated catalog with instant quantity updates',
    landingBullet2: 'Company credit and wallet split always visible',
    landingBullet3: 'Profile controls and notifications included',
    landingCta: 'Access employee store',
    loginTitle: 'Employee Login',
    loginSubtitle: 'Use your Propulso e-mail to access the internal store.',
    emailLabel: 'Work e-mail',
    emailPlaceholder: 'name@propulso.io',
    signIn: 'Sign in',
    connectGoogle: 'Connect with Google',
    connecting: 'Connecting...',
    closeLogin: 'Close login',
    invalidEmail: 'Please enter a valid e-mail address.',
    invalidDomain: 'Use your @propulso.io e-mail to continue.',
    tabCatalog: 'Catalog',
    tabProfile: 'Profile',
    catalogTitle: 'Catalog',
    catalogSubtitle: 'Pick your merch items.',
    search: 'Search products',
    resetCart: 'Reset cart',
    removeItem: 'Remove',
    viewDetails: 'View details',
    quickAdd: 'Quick add',
    addedToCart: 'Added to cart',
    perItem: 'per item',
    quantity: 'Qty',
    variant: 'Variant',
    variants: 'Variants',
    noVariants: 'Default option',
    selectVariant: 'Select',
    productDetails: 'Product details',
    addSelection: 'Add selection',
    categoryLabels: {
      all: 'All',
      wearables: 'Wearables',
      desk: 'Desk',
      travel: 'Travel',
      lifestyle: 'Lifestyle',
    },
    profileTitle: 'User Profile',
    profileSubtitle: 'Manage your account and wallet.',
    loggedInAs: 'Logged in as',
    logout: 'Logout',
    admin: 'Admin',
    backToCatalogShort: 'Catalog',
    walletTitle: 'Wallet',
    walletSubtitle:
      'Propulso credit is applied first. Remaining amount is your personal payment.',
    creditAvailable: 'Credit available',
    creditUsed: 'Credit used',
    creditRemaining: 'Credit remaining',
    walletToPay: 'From your wallet',
    settingsTitle: 'Settings',
    settingOrderUpdates: 'Order status e-mails',
    settingDrops: 'Notify me about new drops',
    cartBuilder: 'Cart',
    closeCart: 'Close cart',
    items: 'items',
    emptyCart: 'Your cart is empty',
    addFromCatalog: 'Add items from the catalog to build your cart.',
    subtotal: 'Subtotal',
    checkout: 'Submit order',
    continueSelection: 'Go to confirmation page',
    checkoutHint:
      'Submitting sends your selected items to the internal merch order flow.',
    reviewTitle: 'Order review',
    reviewSubtitle: 'Verify selected items and quantities before confirming.',
    itemsToOrder: 'Everything to order',
    confirmationTitle: 'Confirmation',
    confirmationSubtitle: 'Summary before final validation.',
    invoiceLater: 'Amount invoiced later',
    invoiceExplanation:
      'Any amount exceeding company credit will be invoiced after internal approval.',
    backToCatalog: 'Back to catalog',
    placeOrder: 'Confirm selection',
    reopenOrder: 'Re-open order',
    modifyOrder: 'Modify order',
    orderSent: 'Order sent successfully.',
    orderAuthRequired: 'Please sign in before placing an order.',
    orderSendFailed: 'Order could not be sent. Please try again.',
    orderNoDraftStatus: 'No saved order yet.',
    orderPlacedStatus: 'Order is placed.',
    orderLockedStatus: 'Order is locked.',
    orderUnlockedStatus: 'Order is unlocked.',
    deadlinePassed: 'March 1 deadline passed. Order is now placed.',
    cannotEditAfterDeadline: 'March 1 deadline passed. Your order can no longer be modified.',
    unlockBeforeEditing: 'Order is locked. Unlock it before editing.',
    lockOrder: 'Lock order',
    unlockOrder: 'Unlock order',
    lockExplanationTitle: 'Lock-in before deadline',
    lockExplanationBody:
      'Lock your order before March 1. If not locked, your current selection will still be placed automatically on March 1.',
    lockDeadlineLabel: 'Deadline',
    existingOrderBannerTitle: 'You already have an order in progress.',
    viewMyOrder: 'View my order',
    policy:
      'Propulso applies $150 credit first, then any remaining amount is paid from your personal wallet.',
  },
  fr: {
    appTitle: 'Merch Propulso',
    appSubtitle: 'Boutique interne',
    landingBadge: 'Boutique équipe',
    landingTitle: 'Expérience merch premium pour chaque employé',
    landingDescription:
      'Choisissez vos articles en temps réel, suivez votre budget et envoyez un panier clair.',
    landingBullet1: 'Catalogue sélectif avec quantités en direct',
    landingBullet2:
      'Partage entre crédit entreprise et portefeuille toujours visible',
    landingBullet3: 'Profil, préférences et notifications inclus',
    landingCta: 'Accéder à la boutique employé',
    loginTitle: 'Connexion employé',
    loginSubtitle:
      'Utilisez votre e-mail Propulso pour accéder à la boutique interne.',
    emailLabel: 'E-mail propulso.io',
    emailPlaceholder: 'name@propulso.io',
    signIn: 'Se connecter',
    connectGoogle: 'Se connecter avec Google',
    connecting: 'Connexion...',
    closeLogin: 'Fermer la connexion',
    invalidEmail: 'Veuillez entrer une adresse e-mail valide.',
    invalidDomain: 'Utilisez votre e-mail @propulso.io.',
    tabCatalog: 'Catalogue',
    tabProfile: 'Profil',
    catalogTitle: 'Catalogue',
    catalogSubtitle: 'Choisissez vos articles.',
    search: 'Rechercher des produits',
    resetCart: 'Vider le panier',
    removeItem: 'Retirer',
    viewDetails: 'Voir les détails',
    quickAdd: 'Ajout rapide',
    addedToCart: 'Ajouté au panier',
    perItem: 'par article',
    quantity: 'Qté',
    variant: 'Variante',
    variants: 'Variantes',
    noVariants: 'Option par défaut',
    selectVariant: 'Choisir',
    productDetails: 'Détails du produit',
    addSelection: 'Ajouter la sélection',
    categoryLabels: {
      all: 'Tous',
      wearables: 'Vêtements',
      desk: 'Bureau',
      travel: 'Voyage',
      lifestyle: 'Style de vie',
    },
    profileTitle: 'Profil utilisateur',
    profileSubtitle: 'Gérez votre compte et votre portefeuille.',
    loggedInAs: 'Connecté en tant que',
    logout: 'Se déconnecter',
    admin: 'Admin',
    backToCatalogShort: 'Catalogue',
    walletTitle: 'Portefeuille',
    walletSubtitle:
      'Le crédit Propulso est appliqué en premier. Le reste est à votre charge.',
    creditAvailable: 'Crédit disponible',
    creditUsed: 'Crédit utilisé',
    creditRemaining: 'Crédit restant',
    walletToPay: 'Depuis votre portefeuille',
    settingsTitle: 'Paramètres',
    settingOrderUpdates: 'E-mails de statut de commande',
    settingDrops: "M'avertir des nouvelles collections",
    cartBuilder: 'Panier',
    closeCart: 'Fermer le panier',
    items: 'articles',
    emptyCart: 'Votre panier est vide',
    addFromCatalog:
      'Ajoutez des articles depuis le catalogue pour créer votre panier.',
    subtotal: 'Sous-total',
    checkout: 'Envoyer la commande',
    continueSelection: 'Aller a la page de confirmation',
    checkoutHint:
      "L'envoi transmet les articles sélectionnés pour traitement de la commande interne.",
    reviewTitle: 'Révision de commande',
    reviewSubtitle: 'Vérifiez les articles et les quantités avant confirmation.',
    itemsToOrder: 'Tout ce qui sera commandé',
    confirmationTitle: 'Confirmation',
    confirmationSubtitle: 'Résumé avant validation finale.',
    invoiceLater: 'Montant facturé plus tard',
    invoiceExplanation:
      "Tout montant au-delà du crédit entreprise sera facturé après approbation interne.",
    backToCatalog: 'Retour au catalogue',
    placeOrder: 'Confirmer la sélection',
    reopenOrder: 'Ré-ouvrir la commande',
    modifyOrder: 'Modifier la commande',
    orderSent: 'Commande envoyée avec succès.',
    orderAuthRequired: 'Veuillez vous connecter avant de passer une commande.',
    orderSendFailed: "La commande n'a pas pu être envoyée. Veuillez réessayer.",
    orderNoDraftStatus: 'Aucune commande enregistrée pour le moment.',
    orderPlacedStatus: 'La commande est placée.',
    orderLockedStatus: 'La commande est verrouillée.',
    orderUnlockedStatus: 'La commande est déverrouillée.',
    deadlinePassed: 'La date limite du 1er mars est passée. La commande est maintenant placée.',
    cannotEditAfterDeadline: 'La date limite du 1er mars est passée. La commande ne peut plus être modifiée.',
    unlockBeforeEditing: 'La commande est verrouillée. Déverrouillez-la pour modifier.',
    lockOrder: 'Verrouiller la commande',
    unlockOrder: 'Déverrouiller la commande',
    lockExplanationTitle: 'Verrouillage avant la date limite',
    lockExplanationBody:
      "Verrouillez votre commande avant le 1er mars. Si elle n'est pas verrouillée, la sélection actuelle sera quand même placée automatiquement le 1er mars.",
    lockDeadlineLabel: 'Date limite',
    existingOrderBannerTitle: 'Vous avez deja une commande en cours.',
    viewMyOrder: 'Voir ma commande',
    policy:
      "Propulso applique d'abord 150 $ de crédit, puis le reste est payé depuis votre portefeuille personnel.",
  },
}
