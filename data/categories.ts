export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  count: number;
}

export const mockCategories: Category[] = [
  {
    id: "cat-idols",
    name: "Divine Idols",
    slug: "idols",
    description: "Exquisite hand-carved brass, marble, and wood deities for your home temple.",
    image: "https://images.unsplash.com/photo-1609137144813-7d7274092b3b?auto=format&fit=crop&q=80&w=600",
    count: 12,
  },
  {
    id: "cat-incense",
    name: "Sacred Incense",
    slug: "incense",
    description: "Natural dhoop cones, herbal incense sticks, and sambrani cups for purification.",
    image: "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&q=80&w=600",
    count: 8,
  },
  {
    id: "cat-diyas",
    name: "Brass Diyas & Lamps",
    slug: "diyas",
    description: "Traditional akhand diyas, hanging lamps, and brass camphor burners.",
    image: "https://images.unsplash.com/photo-1605847496658-45e0514a6003?auto=format&fit=crop&q=80&w=600",
    count: 6,
  },
  {
    id: "cat-kits",
    name: "Pooja Kits & Samagri",
    slug: "pooja-kits",
    description: "Pre-arranged Vedic samagri kits for Havans, festivals, and daily rituals.",
    image: "https://images.unsplash.com/photo-1543157148-f8464799e186?auto=format&fit=crop&q=80&w=600",
    count: 5,
  },
  {
    id: "cat-rudraksha",
    name: "Rudraksha & Malas",
    slug: "rudraksha",
    description: "Sourced Nepalese and Indonesian beads, japamalas, and gemstone bracelets.",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600",
    count: 8,
  },
  {
    id: "cat-books",
    name: "Spiritual Books & Texts",
    slug: "books",
    description: "Vedas, Upanishads, Bhagavad Gita translation editions, and kids devotional stories.",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600",
    count: 7,
  },
  {
    id: "cat-prasad",
    name: "Bhoga & Dry Prasad",
    slug: "prasad",
    description: "Chappan bhog sweets, organic dry fruits, and temple-offered laddu boxes.",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600",
    count: 5,
  },
  {
    id: "cat-souvenirs",
    name: "Temple Souvenirs",
    slug: "souvenirs",
    description: "Devotional wall frames, brass keychains, metal rings, and spiritual pendants.",
    image: "https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&q=80&w=600",
    count: 6,
  },
];
