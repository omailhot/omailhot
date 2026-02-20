import type { Category, Product } from "@/types/merch";

export const COMPANY_CREDIT = 250;

export const categoryOrder: Array<"all" | Category> = [
	"all",
	"wearables",
	"desk",
	"travel",
	"lifestyle",
  "giftcard"
];

export const products: Product[] = [
  {
    id: 'black-t-shirt-men',
    category: 'wearables',
    price: 40,
    gradientClass: 'from-amber-300/35 via-orange-400/25 to-red-500/20',
    imageGallery: [
      '/merch/printeez-men-shirt.png',
      '/merch/size-guide-printeez-men-shirt.png'
    ],
    variantGroups: [
      {
        id: 'size',
        label: { en: 'Size', fr: 'Taille' },
        type: 'size',
        options: [
          { id: 's', label: { en: 'S', fr: 'S' } },
          { id: 'm', label: { en: 'M', fr: 'M' } },
          { id: 'l', label: { en: 'L', fr: 'L' } },
          { id: 'xl', label: { en: 'XL', fr: 'XL' } },
          { id: '2xl', label: { en: '2XL', fr: '2XL' } },
        ],
      },
    ],
    name: {
      en: '',
      fr: 'T-shirt noir homme',
    },
    description: {
      en: '',
      fr: 'T-shirt 100% coton doux avec signature minimaliste imprimée sur la poitrine. (Model: 6\' 1" (185 cm); 175 lbs (79 kg). SIZE L)',
    },
  },
  {
    id: 'black-t-shirt-women',
    category: 'wearables',
    price: 25,
    gradientClass: 'from-amber-300/35 via-orange-400/25 to-red-500/20',
    imageGallery: [
      '/merch/printeez-women-shirt.png',
      '/merch/printeez-women-shirt-model.png',
      '/merch/size-guide-printeez-women-shirt.png',
    ],
    variantGroups: [
      {
        id: 'size',
        label: { en: 'Size', fr: 'Taille' },
        type: 'size',
        options: [
          { id: 's', label: { en: 'S', fr: 'S' } },
          { id: 'm', label: { en: 'M', fr: 'M' } },
          { id: 'l', label: { en: 'L', fr: 'L' } },
          { id: 'xl', label: { en: 'XL', fr: 'XL' } },
          { id: '2xl', label: { en: '2XL', fr: '2XL' } },
        ],
      },
    ],
    name: {
      en: '',
      fr: 'T-shirt noir femme',
    },
    description: {
      en: '',
      fr: 'T-shirt 100% coton doux avec signature minimaliste imprimée sur le coeur.',
    },
  },
  {
    id: 'black-t-shirt-kids',
    category: 'wearables',
    price: 21,
    gradientClass: 'from-amber-300/35 via-orange-400/25 to-red-500/20',
    imageGallery: [
      '/merch/printeez-tshirt-enfant.png',
      '/merch/printeez-youth-shirt-model.png',
      '/merch/size-guide-printeez-youth-shirt.png',
    ],
    variantGroups: [
      {
        id: 'size',
        label: { en: 'Size', fr: 'Taille' },
        type: 'size',
        options: [
          { id: 'xs', label: { en: 'XS', fr: 'XS' } },
          { id: 'sm', label: { en: 'S', fr: 'S' } },
          { id: 'm', label: { en: 'M', fr: 'M' } },
          { id: 'l', label: { en: 'L', fr: 'L' } },
          { id: 'xl', label: { en: 'XL', fr: 'XL' } }
        ],
      },
    ],
    name: {
      en: '',
      fr: 'T-shirt noir enfant',
    },
    description: {
      en: '',
      fr: 'Imprimé en couleur sur un t-shirt pour jeunes 100 % coton pour un confort incroyable.',
    },
  },
  {
    id: 'vest-men',
    category: 'wearables',
    price: 140,
    gradientClass: 'from-yellow-300/35 via-orange-500/25 to-red-600/20',
    imageGallery: [
      '/merch/vest_1.png',
      '/merch/veste-homme-model.png',
      '/merch/veste-homme-model-poche.png',
      '/merch/veste-homme-size-chard.png',
    ],
    variantGroups: [
      {
        id: 'size',
        label: { en: 'Size', fr: 'Taille' },
        type: 'size',
        options: [
          { id: 's', label: { en: 'S', fr: 'S' } },
          { id: 'm', label: { en: 'M', fr: 'M' } },
          { id: 'l', label: { en: 'L', fr: 'L' } },
          { id: 'xl', label: { en: 'XL', fr: 'XL' } },
          { id: '2xl', label: { en: '2XL', fr: '2XL' } },
          { id: '3xl', label: { en: '3XL', fr: '3XL' } },
        ],
      },
    ],
    name: {
      en: 'Veste sans manche Homme',
      fr: 'Veste sans manche Homme',
    },
    description: {
      en: 'Layer-ready top for hybrid work and travel.',
      fr: 'Coquille extérieure : 100% polyesteré. Matériau isolant : 90% duvet de canard, 10% plumes. Isolante et résistante à l’eau. Deux grandes poches avant avec fermeture à glissière. Deux poches intérieures avec fermeture à glissière.',
    },
  },
  {
    id: 'vest-women',
    category: 'wearables',
    price: 140,
    gradientClass: 'from-yellow-300/35 via-orange-500/25 to-red-600/20',
    imageGallery: [
      '/merch/vest_2.png',
      '/merch/veste-femme-model.png',
      '/merch/veste-femme-size-chard.png',
    ],
    variantGroups: [
      {
        id: 'size',
        label: { en: 'Size', fr: 'Taille' },
        type: 'size',
        options: [
          { id: 's', label: { en: 'S', fr: 'S' } },
          { id: 'm', label: { en: 'M', fr: 'M' } },
          { id: 'l', label: { en: 'L', fr: 'L' } },
          { id: 'xl', label: { en: 'XL', fr: 'XL' } },
          { id: '2xl', label: { en: '2XL', fr: '2XL' } }
        ],
      },
    ],
    name: {
      en: 'Veste sans manche Femme',
      fr: 'Veste matelassée sans manche Femme',
    },
    description: {
      en: 'Layer-ready top for hybrid work and travel.',
      fr: 'Coquille extérieure : 100% polyesteré. Matériau isolant : 90% duvet de canard, 10% plumes. Isolante et résistante à l’eau. Deux grandes poches avant avec fermeture à glissière. Deux poches intérieures avec fermeture à glissière.',
    },
  },
  {
    id: 'bottle-10oz',
    category: 'travel',
    price: 45,
    gradientClass: 'from-orange-300/35 via-rose-500/25 to-red-700/20',
    imageGallery: [
      '/merch/yeti_black_1.png',
      '/merch/yeti_black_2.png',
      '/merch/yeti_red_1.png',
      '/merch/yeti_red_2.png',
    ],
    variantGroups: [
      {
        id: 'color',
        label: { en: 'Color', fr: 'Couleur' },
        type: 'color',
        options: [
          {
            id: 'black',
            label: { en: 'Black', fr: 'Noir' },
            swatchHex: '#1f1f1f',
          },
          {
            id: 'red',
            label: { en: 'Red', fr: 'Éclat solaire' },
            swatchHex: '#d90b2f',
          },
        ],
      },
      {
        id: 'Image',
        label: { en: 'Image', fr: 'Image' },
        type: 'select',
        options: [
          {
            id: 'logo',
            label: { en: 'Logo Propulso', fr: 'Logo Propulso' },
          },
          {
            id: 'rocket',
            label: { en: 'Fusée', fr: 'Fusée' },
          }
        ],
      }
    ],
    name: {
      en: 'Goblet Rambler Yeti',
      fr: 'Goblet Rambler Yeti 295ml',
    },
    description: {
      en: '',
      fr: 'Gobelet 295 ML AVEC COUVERCLE MAGSLIDER™',
    },
  },
  {
    id: 'bottle-20oz',
    category: 'travel',
    price: 63,
    gradientClass: 'from-orange-300/35 via-rose-500/25 to-red-700/20',
    imageGallery: [
      '/merch/yeti_black_1.png',
      '/merch/yeti_black_2.png',
      '/merch/yeti_red_1.png',
      '/merch/yeti_red_2.png',
    ],
    variantGroups: [
      {
        id: 'color',
        label: { en: 'Color', fr: 'Couleur' },
        type: 'color',
        options: [
          {
            id: 'black',
            label: { en: 'Black', fr: 'Noir' },
            swatchHex: '#1f1f1f',
          },
          {
            id: 'red',
            label: { en: 'Red', fr: 'Éclat solaire' },
            swatchHex: '#d90b2f',
          },
        ],
      },
      {
        id: 'Image',
        label: { en: 'Image', fr: 'Image' },
        type: 'select',
        options: [
          {
            id: 'logo',
            label: { en: 'Logo Propulso', fr: 'Logo Propulso' },
          },
          {
            id: 'rocket',
            label: { en: 'Fusée', fr: 'Fusée' },
          }
        ],
      }
    ],
    name: {
      en: 'Goblet Rambler Yeti',
      fr: 'Goblet Rambler Yeti 591ml',
    },
    description: {
      en: '',
      fr: 'Gobelet 591 ML AVEC COUVERCLE MAGSLIDER™',
    },
  },
  {
    id: 'backpack',
    category: 'travel',
    price: 150,
    gradientClass: 'from-amber-300/35 via-red-500/25 to-red-700/20',
    imageGallery: [
      '/merch/bag_1.png',
      '/merch/bag_2.png'
    ],
    name: {
      en: 'Travel Backpack',
      fr: 'Sac à dos pour ordinateur',
    },
    description: {
      en: '',
      fr: 'Sac à dos pour ordinateur portable 16po Thule® Heritage Notus. Polyester recyclé et nylon. Poche intérieure zippée et poche plaquée. Housse rembourrée pour ordinateur portable 40,64 cm. Deux poches latérales pour bouteilles d\'eau.',
    },
  },
  {
    id: 'ciele-cap',
    category: 'lifestyle',
    price: 58,
    gradientClass: 'from-yellow-300/35 via-orange-500/25 to-pink-600/20',
    imageGallery: [
      '/merch/cap_1.png'
    ],
    name: {
      en: 'Knit Beanie',
      fr: 'Casquette Ciele x Propulso',
    },
    description: {
      en: '',
      fr: 'Casquette Ciele UNcap',
    },
  },
  {
    id: 'baseball-cap',
    category: 'lifestyle',
    price: 29,
    gradientClass: 'from-yellow-300/35 via-orange-500/25 to-pink-600/20',
    imageGallery: [
      '/merch/printeez-classic-dad-hat.png'
    ],
    name: {
      en: '',
      fr: 'Casquette Baseball',
    },
    description: {
      en: '',
      fr: 'Casquette Taille unique',
    },
  },
  {
    id: 'beanie',
    category: 'lifestyle',
    price: 22,
    gradientClass: 'from-yellow-300/35 via-orange-500/25 to-pink-600/20',
    imageGallery: [
      '/merch/beanie_1.png'
    ],
    name: {
      en: 'Knit Beanie',
      fr: 'Tuque à pom-pom',
    },
    description: {
      en: '',
      fr: 'Tuque à pom-pom deux couleurs. 100 % acrylique.',
    },
  },
  {
    id: 'natural-bag',
    category: 'lifestyle',
    price: 20,
    gradientClass: 'from-orange-300/35 via-red-400/25 to-pink-600/20',
    imageGallery: [
      '/merch/printeez-sac-beige.png'
    ],
    name: {
      en: '',
      fr: 'Sac réutilisable beige',
    },
    description: {
      en: '',
      fr: 'Couleur naturelle. 100% coton. Poignées en toile tressée de 51 cm (20 po). Hauteur des poignées : 23 cm (9 po)',
    },
  },
  {
    id: 'black-bag',
    category: 'lifestyle',
    price: 20,
    gradientClass: 'from-orange-300/35 via-red-400/25 to-pink-600/20',
    imageGallery: [
      '/merch/printeez-sac-noir.png'
    ],
    name: {
      en: '',
      fr: 'Sac réutilisable noir',
    },
    description: {
      en: '',
      fr: 'Couleur noire. 100% coton. Poignées en toile tressée de 51 cm (20 po). Hauteur des poignées : 23 cm (9 po)',
    },
  },
  {
    id: 'sport-bag',
    category: 'lifestyle',
    price: 60,
    gradientClass: 'from-orange-300/35 via-red-400/25 to-pink-600/20',
    imageGallery: [
      '/merch/printeez-sac-sport-dufflebag.png'
    ],
    name: {
      en: '',
      fr: 'Sac de sport Dufflebag 29L',
    },
    description: {
      en: '',
      fr: 'Sac de sport Dufflebag 29L. 100% polyester. Revêtement intérieur imperméable en PVC. Poignées de transport. Bandoulière amovible. Dimensions: 52cm x 27cm (29 litres).',
    },
  },
  {
    id: 'coasters-trio',
    category: 'lifestyle',
    price: 21,
    gradientClass: 'from-orange-300/35 via-red-400/25 to-pink-600/20',
    imageGallery: [
      '/merch/trio-coasters.png'
    ],
    name: {
      en: '',
      fr: 'Trio de sous-verres',
    },
    description: {
      en: '',
      fr: 'Vos sous-verres préférés du bureau à la maison! Le prix est pour les 3 sous-verres.',
    },
  },
  {
    id: 'mouse-pad-xl',
    category: 'lifestyle',
    price: 18,
    gradientClass: 'from-orange-300/35 via-red-400/25 to-pink-600/20',
    imageGallery: [
      '/merch/mousepad-xl.png',
      '/merch/mousepad-xl-model.png'
    ],
    name: {
      en: '',
      fr: 'Tapis de souris XL',
    },
    description: {
      en: '',
      fr: 'Polyéthylène téréphtalate recyclé. Base en caoutchouc antidérapante. Surface lisse. 12" X 16" (30 cm x 40 cm)',
    },
  },
  {
    id: 'giftcard-saq',
    category: 'giftcard',
    price: 10,
    gradientClass: 'from-zinc-200/60 via-zinc-100/40 to-transparent',
    name: {
      en: 'SAQ gift card',
      fr: 'Carte-cadeau SAQ',
    },
    description: {
      en: '',
      fr: '',
    }
  },
  {
    id: 'giftcard-chocolat-favoris',
    category: 'giftcard',
    price: 10,
    gradientClass: 'from-zinc-200/60 via-zinc-100/40 to-transparent',
    name: {
      en: 'Chocolat Favoris gift card',
      fr: 'Carte-cadeau Chocolat Favoris',
    },
    description: {
      en: '',
      fr: '',
    }
  },
  {
    id: 'giftcard-shop-sante',
    category: 'giftcard',
    price: 10,
    gradientClass: 'from-zinc-200/60 via-zinc-100/40 to-transparent',
    name: {
      en: 'Shop Sante gift card',
      fr: 'Carte-cadeau Shop Sante',
    },
    description: {
      en: '',
      fr: '',
    }
  },
  {
    id: 'giftcard-Pasta-Fumo',
    category: 'giftcard',
    price: 15,
    gradientClass: 'from-zinc-200/60 via-zinc-100/40 to-transparent',
    name: {
      en: 'Pasta Fumo gift card',
      fr: 'Carte-cadeau Pasta Fumo',
    },
    description: {
      en: '',
      fr: '',
    }
  },
  {
    id: 'giftcard-bureau-en-gros',
    category: 'giftcard',
    price: 10,
    gradientClass: 'from-zinc-200/60 via-zinc-100/40 to-transparent',
    name: {
      en: 'Bureau en Gros gift card',
      fr: 'Carte-cadeau Bureau en gros',
    },
    description: {
      en: '',
      fr: '',
    }
  }
]
