export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  price: number;
  stock: number;
  images: string[];
  rating: number;
  reviewsCount: number;
  specs: Record<string, string>;
  isFeatured?: boolean;
  isNew?: boolean;
}

export const mockProducts: Product[] = [
  // 1. Divine Idols (1-10)
  {
    id: "prod-idol-1",
    name: "Handcrafted Brass Ganesha Idol",
    slug: "brass-ganesha-idol",
    description: "Bring auspicious blessings to your home with this meticulously handcrafted brass Ganesha idol. Depicted in a seated blessing posture, holding a modak, it features intricate details on the crown and robes.",
    categoryId: "cat-idols",
    price: 3499,
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.8,
    reviewsCount: 34,
    specs: { "Material": "Pure Brass", "Height": "8 inches", "Weight": "2.1 kg", "Origin": "Aligarh, India" },
    isFeatured: true
  },
  {
    id: "prod-idol-2",
    name: "Marble Dust Radha Krishna Statue",
    slug: "marble-dust-radha-krishna",
    description: "A breathtaking marble dust statue depicting the eternal love of Sri Radha and Sri Krishna. The statue features hand-painted floral decorations with gold accents, perfect for home altars.",
    categoryId: "cat-idols",
    price: 4999,
    stock: 8,
    images: [
      "https://images.unsplash.com/photo-1609137144813-7d7274092b3b?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.9,
    reviewsCount: 22,
    specs: { "Material": "Marble Dust & Resin", "Height": "12 inches", "Weight": "3.5 kg", "Paint": "Waterproof Acrylic" },
    isFeatured: true,
    isNew: true
  },
  {
    id: "prod-idol-3",
    name: "Bronze Nataraja Idol (Cosmic Dancer)",
    slug: "bronze-nataraja-idol",
    description: "Representing Shiva as the cosmic dancer Nataraja. Cast in high-quality bronze with a dark antique finish, depicting the cycle of creation and destruction.",
    categoryId: "cat-idols",
    price: 5500,
    stock: 5,
    images: [
      "https://images.unsplash.com/photo-1609803387140-5dfc88686cf2?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.7,
    reviewsCount: 19,
    specs: { "Material": "Bronze", "Height": "10 inches", "Weight": "2.8 kg", "Posture": "Tandava" }
  },
  {
    id: "prod-idol-4",
    name: "Pure Silver Lakshmi & Ganesha Coins",
    slug: "pure-silver-lakshmi-ganesha-coins",
    description: "99.9% pure silver coins engraved with Lakshmi and Ganesha. Perfect for Diwali pooja, home temple placement, or gifting during ceremonies.",
    categoryId: "cat-idols",
    price: 1800,
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.9,
    reviewsCount: 52,
    specs: { "Purity": "99.9% Silver", "Weight": "20 grams", "Diameter": "40 mm", "Packaging": "Airtight Case" }
  },
  {
    id: "prod-idol-5",
    name: "Wooden Hand-carved Hanuman Murti",
    slug: "wooden-carved-hanuman-murti",
    description: "Elegant, hand-carved Hanuman statue made from premium wild neem wood. Hanuman is shown in a standing posture holding his Gada, radiating strength and devotion.",
    categoryId: "cat-idols",
    price: 2499,
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.6,
    reviewsCount: 15,
    specs: { "Material": "Neem Wood", "Height": "9 inches", "Weight": "1.2 kg", "Finish": "Natural Polish" }
  },
  {
    id: "prod-idol-6",
    name: "Black Stone Shiva Lingam",
    slug: "black-stone-shiva-lingam",
    description: "Sourced from the Narmada river, this smooth black stone Shiva Lingam represents cosmic consciousness. Includes a brass Yoni stand.",
    categoryId: "cat-idols",
    price: 1299,
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.8,
    reviewsCount: 41,
    specs: { "Stone Type": "Narmada Banalinga", "Stand": "Brass", "Total Height": "5 inches", "Weight": "850 g" }
  },
  {
    id: "prod-idol-7",
    name: "Handcrafted Brass Durga Idol",
    slug: "handcrafted-brass-durga-idol",
    description: "Intricately detailed idol of Goddess Durga seated on her lion mount, wielding her ten weapons. Cast in solid brass with polish highlights.",
    categoryId: "cat-idols",
    price: 6800,
    stock: 4,
    images: [
      "https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 5.0,
    reviewsCount: 14,
    specs: { "Material": "Solid Brass", "Height": "11 inches", "Weight": "4.2 kg", "Hands": "Ten (Dashabhuja)" }
  },
  {
    id: "prod-idol-8",
    name: "Terracotta Saraswati Idol",
    slug: "terracotta-saraswati-idol",
    description: "Eco-friendly clay Saraswati idol painted in traditional organic colors. Representing knowledge, arts, and music with her Veena.",
    categoryId: "cat-idols",
    price: 999,
    stock: 18,
    images: [
      "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.5,
    reviewsCount: 8,
    specs: { "Material": "Eco Terracotta Clay", "Height": "7 inches", "Weight": "600 g", "Color": "Natural clay colors" }
  },
  {
    id: "prod-idol-9",
    name: "Panchdhatu Ram Darbar Set",
    slug: "panchdhatu-ram-darbar-set",
    description: "An elegant composite set of Sri Rama, Sita Devi, Lakshmana, and Hanuman. Made from Panchdhatu (alloy of five metals) representing spiritual harmony.",
    categoryId: "cat-idols",
    price: 8999,
    stock: 3,
    images: [
      "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.9,
    reviewsCount: 11,
    specs: { "Material": "Panchdhatu Alloy", "Max Height": "9 inches", "Total Weight": "5.6 kg", "Set Components": "4 Figures" }
  },
  {
    id: "prod-idol-10",
    name: "Brass Laddu Gopal (Bal Krishna)",
    slug: "brass-laddu-gopal",
    description: "Adorable Bal Krishna holding a butter ball. Handcrafted in shiny yellow brass, complete with an elegant velvet swing (Jhula).",
    categoryId: "cat-idols",
    price: 1999,
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1597735881932-d9664c9675d2?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.8,
    reviewsCount: 30,
    specs: { "Material": "Polished Brass", "Height": "4 inches", "Weight": "700 g", "Includes": "Velvet Jhula" }
  },

  // 2. Sacred Incense (11-17)
  {
    id: "prod-incense-1",
    name: "Organic Mysore Sandalwood Sticks",
    slug: "mysore-sandalwood-incense",
    description: "Charcoal-free, hand-rolled incense sticks made from pure Mysore Sandalwood powder and essential oils. Creates a serene, meditative environment.",
    categoryId: "cat-incense",
    price: 299,
    stock: 120,
    images: [
      "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.7,
    reviewsCount: 88,
    specs: { "Fragrance": "Mysore Sandalwood", "Sticks Count": "80 sticks", "Burning Time": "45 mins per stick", "Charcoal": "0%" },
    isFeatured: true
  },
  {
    id: "prod-incense-2",
    name: "Natural Loban & Guggal Dhoop Cups",
    slug: "loban-guggal-dhoop-cups",
    description: "Traditional charcoal cups filled with natural Loban and Guggal resins. Releases thick, purifying smoke that dispels negativity.",
    categoryId: "cat-incense",
    price: 199,
    stock: 150,
    images: [
      "https://images.unsplash.com/photo-1612547087680-77a8b3017a47?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.6,
    reviewsCount: 42,
    specs: { "Resins": "Loban & Guggal", "Cups Count": "12 cups", "Includes": "Metal burner plate", "Smoke Density": "High" }
  },
  {
    id: "prod-incense-3",
    name: "Vedic Jasmine (Mogra) Dhoop Cones",
    slug: "mogra-dhoop-cones",
    description: "No-bamboo dhoop cones made from floral residues of Mogra flowers. Infuses the room with a sweet, calming floral aroma.",
    categoryId: "cat-incense",
    price: 150,
    stock: 200,
    images: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.5,
    reviewsCount: 31,
    specs: { "Fragrance": "Mogra (Jasmine)", "Cones Count": "40 cones", "Base": "Dry flowers and herbs", "Bamboo": "None" }
  },
  {
    id: "prod-incense-4",
    name: "Kasturi Musk Premium Incense",
    slug: "kasturi-musk-incense",
    description: "Exquisite temple-blend incense with synthetic Kasturi Musk. Deep, warm, and earthy tones that linger for hours.",
    categoryId: "cat-incense",
    price: 350,
    stock: 80,
    images: [
      "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.8,
    reviewsCount: 65,
    specs: { "Fragrance": "Kasturi Musk", "Sticks Count": "50 sticks", "Burning Time": "50 mins", "Charcoal": "None" }
  },
  {
    id: "prod-incense-5",
    name: "Tulsi & Neem Purification Sticks",
    slug: "tulsi-neem-purification-sticks",
    description: "Herbal incense sticks made with crushed dry Tulsi leaves and Neem bark powder. Natural insect repellent and air purifier.",
    categoryId: "cat-incense",
    price: 180,
    stock: 90,
    images: [
      "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.4,
    reviewsCount: 23,
    specs: { "Ingredients": "Tulsi, Neem, Camphor", "Sticks Count": "60 sticks", "Smell": "Herbal, Refreshing" }
  },
  {
    id: "prod-incense-6",
    name: "Assorted Temple Fragrances Box",
    slug: "assorted-temple-fragrances-box",
    description: "A combination box containing 4 fragrances: Sandalwood, Jasmine, Rose, and Loban. Perfect starter pack for daily puja rituals.",
    categoryId: "cat-incense",
    price: 499,
    stock: 60,
    images: [
      "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.7,
    reviewsCount: 110,
    specs: { "Fragrances": "4 variants", "Total Sticks": "160 sticks", "Gift Box": "Included" }
  },
  {
    id: "prod-incense-7",
    name: "Sacred Camphor (Kapur) Tablets",
    slug: "sacred-camphor-tablets",
    description: "100% pure bhimseni camphor tablets. Leaves no ash or residue when burned, filling the space with therapeutic scent.",
    categoryId: "cat-incense",
    price: 250,
    stock: 110,
    images: [
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.9,
    reviewsCount: 95,
    specs: { "Type": "Pure Bhimseni Camphor", "Weight": "100 grams", "Residue": "0%", "Chemicals": "None" }
  },

  // 3. Brass Diyas & Lamps (18-23)
  {
    id: "prod-diya-1",
    name: "Classic Akhand Brass Diya",
    slug: "classic-akhand-brass-diya",
    description: "Designed with a glass chimney to protect the flame from wind, this Akhand Diya burns for over 24 hours. Made with heavy brass.",
    categoryId: "cat-diyas",
    price: 899,
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1605847496658-45e0514a6003?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.8,
    reviewsCount: 74,
    specs: { "Material": "Brass and Borosilicate Glass", "Burning Time": "24+ Hours", "Height": "6 inches", "Weight": "450 g" },
    isFeatured: true
  },
  {
    id: "prod-diya-2",
    name: "Five-Face Brass Aarti Diya",
    slug: "five-face-brass-aarti-diya",
    description: "Traditional Aarti Panch Pradip with a sturdy wooden handle. Cast in brass, allowing five cotton wicks to burn simultaneously during worship.",
    categoryId: "cat-diyas",
    price: 650,
    stock: 22,
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.6,
    reviewsCount: 38,
    specs: { "Material": "Brass & Sheesham Wood", "Faces": "5 wicks", "Length": "9 inches", "Weight": "550 g" }
  },
  {
    id: "prod-diya-3",
    name: "Peacock Hanging Brass Lamp",
    slug: "peacock-hanging-brass-lamp",
    description: "Stunning hanging oil lamp adorned with a traditional peacock emblem. Attached to a heavy brass link chain, suitable for doorways.",
    categoryId: "cat-diyas",
    price: 1850,
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.7,
    reviewsCount: 17,
    specs: { "Material": "Brass", "Chain Length": "18 inches", "Lamp Diameter": "4 inches", "Weight": "1.2 kg" }
  },
  {
    id: "prod-diya-4",
    name: "Lotus-shaped Brass Kamakshi Diya",
    slug: "lotus-kamakshi-diya",
    description: "An auspicious Kamakshi Diya carved with the likeness of Goddess Lakshmi. Petals are shaped like a blooming lotus.",
    categoryId: "cat-diyas",
    price: 1100,
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1605847496658-45e0514a6003?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.9,
    reviewsCount: 29,
    specs: { "Material": "Yellow Brass", "Height": "5.5 inches", "Weight": "650 g", "Iconography": "Goddess Gajalakshmi" }
  },
  {
    id: "prod-diya-5",
    name: "Carved Brass Camphor Burner",
    slug: "carved-brass-camphor-burner",
    description: "Therapeutic camphor diffuser lamp. Heat from a tea-light candle at the base slowly diffuses camphor placed on the top plate.",
    categoryId: "cat-diyas",
    price: 590,
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.5,
    reviewsCount: 16,
    specs: { "Material": "Brass", "Diffuser Type": "Tea-light heated", "Height": "4.5 inches", "Weight": "320 g" }
  },
  {
    id: "prod-diya-6",
    name: "Designer Floral Clay Diya (Pack of 12)",
    slug: "designer-floral-clay-diya-12",
    description: "Hand-painted clay diyas with floral patterns. Coated with organic oil-resistant paint, ideal for Diwali and Karthigai Deepam.",
    categoryId: "cat-diyas",
    price: 249,
    stock: 75,
    images: [
      "https://images.unsplash.com/photo-1605847496658-45e0514a6003?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.7,
    reviewsCount: 44,
    specs: { "Material": "Natural Clay", "Count": "12 diyas", "Colors": "Assorted Acrylics", "Eco-friendly": "Yes" }
  },

  // 4. Pooja Kits & Samagri (24-28)
  {
    id: "prod-kit-1",
    name: "Complete Vedic Havan Samagri Kit",
    slug: "vedic-havan-samagri-kit",
    description: "Contains 36 natural ingredients including sandalwood shavings, herbs, camphor, dry coconut, ghee, and samagri mix for domestic fire rituals (Homa).",
    categoryId: "cat-kits",
    price: 999,
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1543157148-f8464799e186?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.9,
    reviewsCount: 81,
    specs: { "Ingredients Count": "36 items", "Net Weight": "1.5 kg", "Storage Life": "12 Months", "Suitability": "All Homas" },
    isFeatured: true
  },
  {
    id: "prod-kit-2",
    name: "Premium Satyanarayan Pooja Box",
    slug: "premium-satyanarayan-pooja-box",
    description: "All-in-one ritual kit containing Roli, Akshat, Molly thread, Haldi, Panchmeva, Puja Supari, Kalash cloth, and Satyanarayan Katha booklet.",
    categoryId: "cat-kits",
    price: 1499,
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1530268729831-4b0b9e170218?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.8,
    reviewsCount: 39,
    specs: { "Vessel Kalash": "Copper (Included)", "Katha Book": "Hindi & Sanskrit", "Items List": "24 ritual items" },
    isNew: true
  },
  {
    id: "prod-kit-3",
    name: "Pure Cow Ghee Diya Wicks (Box of 100)",
    slug: "pure-cow-ghee-diya-wicks-100",
    description: "Ready-to-use wicks pre-soaked in pure, solidified cow ghee. Saves time in daily puja setup. Placed directly in the diya.",
    categoryId: "cat-kits",
    price: 349,
    stock: 140,
    images: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.7,
    reviewsCount: 125,
    specs: { "Ghee type": "Solidified Cow Ghee", "Wicks Count": "100 wicks", "Burning Duration": "30 mins", "Residue": "Low" }
  },
  {
    id: "prod-kit-4",
    name: "Ganga Jal (Holy Water) 500ml",
    slug: "ganga-jal-500ml",
    description: "Hermetically sealed holy water collected directly from the pristine origin of Gangotri. Packaged in a copper-colored secure bottle.",
    categoryId: "cat-kits",
    price: 150,
    stock: 90,
    images: [
      "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.9,
    reviewsCount: 150,
    specs: { "Volume": "500 ml", "Origin": "Gangotri, Uttarkashi", "Bottle Material": "Food-grade PET", "Expiry": "Indefinite" }
  },
  {
    id: "prod-kit-5",
    name: "Sandalwood Ashtagandha Paste Powder",
    slug: "ashtagandha-paste-powder",
    description: "Pure Ashtagandha powder blended with saffron, sandalwood, and tulsi extracts. Used for tilak on idols and devotee foreheads.",
    categoryId: "cat-kits",
    price: 120,
    stock: 180,
    images: [
      "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.6,
    reviewsCount: 57,
    specs: { "Net Weight": "50 grams", "Form": "Powder (Mix with water)", "Aroma": "Intense Saffron-Sandalwood" }
  },

  // 5. Rudraksha & Malas (29-35)
  {
    id: "prod-rudr-1",
    name: "Natural 5-Mukhi Rudraksha Mala",
    slug: "natural-5-mukhi-rudraksha-mala",
    description: "Authentic 108+1 bead japamala made from natural 5-Mukhi Indonesian beads. Professionally knotted with red silk thread, suitable for chanting and wearing.",
    categoryId: "cat-rudraksha",
    price: 450,
    stock: 65,
    images: [
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.8,
    reviewsCount: 92,
    specs: { "Bead Count": "108 + 1 Guru bead", "Mukhi": "5-Mukhi (Panchmukhi)", "Bead Size": "8 mm", "Certification": "Lab Certified" },
    isFeatured: true
  },
  {
    id: "prod-rudr-2",
    name: "Premium Tulsi Chanting Mala",
    slug: "premium-tulsi-chanting-mala",
    description: "Handcrafted white Tulsi wood bead mala with knotted silk spacers. Highly revered in Vaishnava traditions for Hare Krishna japa.",
    categoryId: "cat-rudraksha",
    price: 250,
    stock: 110,
    images: [
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.7,
    reviewsCount: 68,
    specs: { "Material": "Original Tulsi Wood", "Beads": "108", "Bead Shape": "Round", "Tassel": "Orange Silk" }
  },
  {
    id: "prod-rudr-3",
    name: "Sandalwood Chanting Japamala",
    slug: "sandalwood-chanting-japamala",
    description: "Fragrant, natural red sandalwood beads strung together for japa. Releases a comforting sweet aroma when held and rubbed.",
    categoryId: "cat-rudraksha",
    price: 399,
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.5,
    reviewsCount: 35,
    specs: { "Material": "Red Sandalwood", "Bead Size": "10 mm", "Total Beads": "108", "Aroma": "Naturally Sweet" }
  },
  {
    id: "prod-rudr-4",
    name: "Lab-Certified 1-Mukhi Nepalese Rudraksha",
    slug: "lab-certified-1-mukhi-nepalese-rudraksha",
    description: "Extremely rare, half-moon shaped Ek-Mukhi Rudraksha bead from Nepal. Capped in 92.5 sterling silver pendant holder.",
    categoryId: "cat-rudraksha",
    price: 12500,
    stock: 2,
    images: [
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 5.0,
    reviewsCount: 7,
    specs: { "Origin": "Nepal", "Mukhi": "1-Mukhi (Ek Mukhi)", "Silver Cap": "92.5 Sterling Silver", "Certificate": "IGL Lab Card Included" },
    isNew: true
  },
  {
    id: "prod-rudr-5",
    name: "Sphatik (Quartz Crystal) Mala",
    slug: "sphatik-quartz-crystal-mala",
    description: "Cooling quartz crystal diamond-cut beads. Helps calm the mind and body, associated with Goddess Saraswati and Shiva worship.",
    categoryId: "cat-rudraksha",
    price: 1200,
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.7,
    reviewsCount: 24,
    specs: { "Material": "Natural Quartz Crystal", "Bead Cuts": "Diamond Cut", "Beads Count": "108+1", "Bead Size": "7 mm" }
  },
  {
    id: "prod-rudr-6",
    name: "Lotus Seed (Kamal Gatta) Mala",
    slug: "lotus-seed-kamal-gatta-mala",
    description: "Made from natural dried black lotus seeds, associated with Goddess Lakshmi. Used extensively during Lakshmi Pooja and prosperity chants.",
    categoryId: "cat-rudraksha",
    price: 320,
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.4,
    reviewsCount: 19,
    specs: { "Material": "Natural Lotus Seeds", "Count": "108 beads", "Color": "Charcoal Black", "Purpose": "Wealth Chanting" }
  },
  {
    id: "prod-rudr-7",
    name: "Red Coral & Pearl Bracelet",
    slug: "red-coral-pearl-bracelet",
    description: "Sturdy stretch gemstone bracelet combining red coral beads (Moonga) and freshwater white pearls. Balances Mars and Moon energies.",
    categoryId: "cat-rudraksha",
    price: 1600,
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.8,
    reviewsCount: 12,
    specs: { "Gemstones": "Natural Red Coral & Fresh Pearls", "Thread": "Elastic Stretch", "Size": "Fits wrists 6-8 in" }
  },

  // 6. Spiritual Books (36-42)
  {
    id: "prod-book-1",
    name: "Bhagavad Gita As It Is (Hardbound)",
    slug: "bhagavad-gita-as-it-is-hardbound",
    description: "The largest-selling translation of the Bhagavad Gita by A.C. Bhaktivedanta Swami Prabhupada. Includes original Sanskrit, English transliteration, word meanings, and elaborate purports.",
    categoryId: "cat-books",
    price: 550,
    stock: 80,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.9,
    reviewsCount: 245,
    specs: { "Pages": "850 pages", "Language": "English & Sanskrit", "Binding": "Hardbound Deluxe", "Publisher": "BBT" },
    isFeatured: true
  },
  {
    id: "prod-book-2",
    name: "The Upanishads (Set of 4 Volumes)",
    slug: "upanishads-set-4-volumes",
    description: "English translation and commentary of the major Upanishads. Excellent introduction to Vedantic philosophy and wisdom.",
    categoryId: "cat-books",
    price: 1450,
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.8,
    reviewsCount: 31,
    specs: { "Author": "Swami Nikhilananda", "Format": "Paperback Set", "Volumes": "4 Books", "Language": "English" }
  },
  {
    id: "prod-book-3",
    name: "Ramayana (Valmiki Translation)",
    slug: "ramayana-valmiki-translation",
    description: "An authentic two-volume prose translation of the ancient epic Ramayana by sage Valmiki. Gift-box packaging.",
    categoryId: "cat-books",
    price: 1200,
    stock: 22,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.9,
    reviewsCount: 46,
    specs: { "Volumes": "2 books", "Language": "English prose", "Publisher": "Gita Press", "Weight": "2.0 kg" }
  },
  {
    id: "prod-book-4",
    name: "Patanjali Yoga Sutras Commentary",
    slug: "patanjali-yoga-sutras-commentary",
    description: "Detailed analysis and spiritual explanation of Patanjali's 196 Yoga aphorisms, covering Raja Yoga and meditation.",
    categoryId: "cat-books",
    price: 380,
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.6,
    reviewsCount: 19,
    specs: { "Author": "Swami Vivekananda", "Pages": "240 pages", "Format": "Paperback" }
  },
  {
    id: "prod-book-5",
    name: "Illustrated Stories for Kids: Krishna",
    slug: "illustrated-stories-kids-krishna",
    description: "A beautifully illustrated collection of stories detailing Bal Krishna's childhood, his fights with demons, and butter thefts.",
    categoryId: "cat-books",
    price: 299,
    stock: 60,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.7,
    reviewsCount: 54,
    specs: { "Illustrations": "Full Color", "Age Group": "4-10 Years", "Pages": "96 pages", "Cover": "Softback" }
  },
  {
    id: "prod-book-6",
    name: "Autobiography of a Yogi (Premium Edition)",
    slug: "autobiography-of-a-yogi-premium",
    description: "The spiritual classic by Paramahansa Yogananda. Explains the science of Kriya Yoga and matches Eastern spirituality with Western research.",
    categoryId: "cat-books",
    price: 450,
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.9,
    reviewsCount: 88,
    specs: { "Author": "Paramahansa Yogananda", "Format": "Hardcover with foil", "Pages": "510 pages" }
  },
  {
    id: "prod-book-7",
    name: "Srimad Bhagavatam (Canto 1-3 Set)",
    slug: "srimad-bhagavatam-canto-1-3-set",
    description: "First three cantos of the Bhagavata Purana detailing the avatars of Vishnu, cosmic creation, and devotees dialogues.",
    categoryId: "cat-books",
    price: 1990,
    stock: 8,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 5.0,
    reviewsCount: 16,
    specs: { "Binding": "Hardbound Set", "Volumes": "6 books", "Language": "Sanskrit & English" }
  },

  // 7. Bhoga & Dry Prasad (43-47)
  {
    id: "prod-prasad-1",
    name: "Sri Sri Radha Krishna Special Bhog Laddu",
    slug: "radha-krishna-special-bhog-laddu",
    description: "Pure gram flour laddus cooked in pure cow ghee and mixed with almonds, saffron, and pistachios. Offered at the main altar before packing.",
    categoryId: "cat-prasad",
    price: 350,
    stock: 100,
    images: [
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.9,
    reviewsCount: 180,
    specs: { "Weight": "500 grams", "Ghee Type": "Pure Desi Cow Ghee", "Altar Offering": "Yes (Maha-prasad)", "Shelf Life": "10 Days" },
    isFeatured: true
  },
  {
    id: "prod-prasad-2",
    name: "Premium Dry Fruit Prasad Box",
    slug: "premium-dry-fruit-prasad-box",
    description: "A combination box containing almonds, cashew nuts, raisins, and dried dates. Cleaned, offered at aarti, and packaged in a vacuum seal.",
    categoryId: "cat-prasad",
    price: 599,
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.8,
    reviewsCount: 45,
    specs: { "Weight": "400 grams", "Assortment": "Almonds, Cashews, Raisins, Dates", "Storage": "Vacuum Sealed Box" }
  },
  {
    id: "prod-prasad-3",
    name: "Devotional Tulsi Elaichi Mishri Pack",
    slug: "tulsi-elaichi-mishri-pack",
    description: "Crisp sugar candy crystals mixed with dried holy tulsi leaves and green cardamom pods. A traditional mouth-freshening prasad.",
    categoryId: "cat-prasad",
    price: 120,
    stock: 160,
    images: [
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.7,
    reviewsCount: 33,
    specs: { "Net Weight": "250 grams", "Ingredients": "Sugar Crystals, Tulsi, Cardamom", "Container": "Reusable Glass Jar" }
  },
  {
    id: "prod-prasad-4",
    name: "Pure Himalayan Honey Bhog (250g)",
    slug: "pure-himalayan-honey-bhog",
    description: "Organic forest honey collected from wild hives in the Himalayas. Offered in a sacred worship jar, ideal for panchamrit preparation.",
    categoryId: "cat-prasad",
    price: 280,
    stock: 70,
    images: [
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.8,
    reviewsCount: 51,
    specs: { "Net Weight": "250 grams", "Purity": "100% Raw Forest Honey", "Packaging": "Glass Jar" }
  },
  {
    id: "prod-prasad-5",
    name: "Mathura Peda Maha-Prasad Box",
    slug: "mathura-peda-maha-prasad",
    description: "Caramelized milk solids pedas seasoned with nutmeg and cardamom. Traditional prasad of Vrindavan and Mathura temples.",
    categoryId: "cat-prasad",
    price: 380,
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.9,
    reviewsCount: 95,
    specs: { "Weight": "500 grams", "Base": "Condensed milk solids (Khoya)", "Shelf Life": "7 Days" }
  },

  // 8. Temple Souvenirs (48-52)
  {
    id: "prod-souv-1",
    name: "Sri Radhe Krishna Gold Foil Frame",
    slug: "radhe-krishna-gold-foil-frame",
    description: "Elegant 24k gold plated foil sheet showcasing Sri Radha Krishna. Enclosed in a heavy synthetic wood frame with glass top, perfect for desks.",
    categoryId: "cat-souvenirs",
    price: 1299,
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.8,
    reviewsCount: 50,
    specs: { "Plating": "24k Gold Foil", "Frame Material": "Teak-finish Synthetic Wood", "Size": "8x6 inches", "Placement": "Wall / Table" },
    isFeatured: true
  },
  {
    id: "prod-souv-2",
    name: "Embossed Brass Keychain (Mantra Carving)",
    slug: "embossed-brass-keychain",
    description: "Heavy brass keychain engraved with 'Hare Krishna Maha Mantra' on one side and a flute icon on the reverse.",
    categoryId: "cat-souvenirs",
    price: 199,
    stock: 120,
    images: [
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.5,
    reviewsCount: 22,
    specs: { "Material": "100% Solid Brass", "Weight": "45 grams", "Ring Diameter": "1.25 inches" }
  },
  {
    id: "prod-souv-3",
    name: "Spiritual Brass Wrist Kada",
    slug: "spiritual-brass-wrist-kada",
    description: "A polished open-loop brass bracelet engraved with defensive geometric lines. Designed to balance magnetic energies in the wrist.",
    categoryId: "cat-souvenirs",
    price: 299,
    stock: 80,
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.6,
    reviewsCount: 41,
    specs: { "Material": "Brass alloy", "Width": "8 mm", "Diameter": "2.6 inches (Adjustable)" }
  },
  {
    id: "prod-souv-4",
    name: "Radhe Radhe Cotton Prayer Shawl",
    slug: "radhe-prayer-shawl",
    description: "Pure saffron cotton prayer shawl printed with 'Radhe Radhe' and peacock feather graphics. Soft, breathable, worn during prayers.",
    categoryId: "cat-souvenirs",
    price: 499,
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.7,
    reviewsCount: 38,
    specs: { "Fabric": "100% Cotton", "Size": "2.0m x 1.0m", "Color": "Saffron (Orange-yellow)" }
  },
  {
    id: "prod-souv-5",
    name: "Sterling Silver Flute Pendant",
    slug: "sterling-silver-flute-pendant",
    description: "A delicate 92.5 sterling silver pendant representing Lord Krishna's divine flute (Bansuri). High polish finish, fits standard chains.",
    categoryId: "cat-souvenirs",
    price: 1599,
    stock: 18,
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.9,
    reviewsCount: 15,
    specs: { "Material": "92.5% Sterling Silver", "Length": "1.5 inches", "Weight": "6.2 grams", "Stone": "Small Cubic Zirconia accent" },
    isNew: true
  },
  {
    id: "prod-souv-6",
    name: "Vrindavan Tulsi Wood Pendant Necklace",
    slug: "vrindavan-tulsi-wood-necklace",
    description: "Beautiful pendant made of aged Vrindavan Tulsi wood beads, strung together on a durable black thread with copper accents.",
    categoryId: "cat-souvenirs",
    price: 349,
    stock: 90,
    images: [
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.8,
    reviewsCount: 29,
    specs: { "Wood Source": "Vrindavan Sacred Tulsi", "Thread Material": "Nylon Cord", "Adjustable Length": "Yes" }
  }
];
