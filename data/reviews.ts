export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}

export const mockReviews: ProductReview[] = [
  {
    id: "rev-1",
    productId: "prod-idol-1",
    customerName: "Harish Mehta",
    rating: 5,
    comment: "Excellent detail on Lord Ganesha. The brass is heavy and has a beautiful yellow sheen. Highly recommended for home altars!",
    date: "2026-06-20",
    verifiedPurchase: true
  },
  {
    id: "rev-2",
    productId: "prod-idol-1",
    customerName: "Sanjay Gupta",
    rating: 4,
    comment: "Very neat work. The crown details are spectacular. Weight matches the description. Delivery was fast.",
    date: "2026-06-18",
    verifiedPurchase: true
  },
  {
    id: "rev-3",
    productId: "prod-incense-1",
    customerName: "Pooja Sharma",
    rating: 5,
    comment: "The scent of sandalwood is incredibly authentic, unlike synthetic sprays. It creates a serene meditative atmosphere in the living room.",
    date: "2026-06-22",
    verifiedPurchase: true
  },
  {
    id: "rev-4",
    productId: "prod-diya-1",
    customerName: "Rajesh Kumar",
    rating: 5,
    comment: "The glass cover is thick and protects the flame very well from the fan ceiling wind. The oil capacity lasts a full day.",
    date: "2026-06-15",
    verifiedPurchase: true
  },
  {
    id: "rev-5",
    productId: "prod-kit-1",
    customerName: "Sunita Reddy",
    rating: 5,
    comment: "Everything required for Homa was in the box. Excellent quality herbs. Saved me a trip to five different shops. Highly recommended!",
    date: "2026-06-10",
    verifiedPurchase: true
  },
  {
    id: "rev-6",
    productId: "prod-rudr-1",
    customerName: "Amit Singhal",
    rating: 4,
    comment: "Authentic five mukhi rudraksha. Hand knots are tight, beads are symmetric. The color is natural brown.",
    date: "2026-06-11",
    verifiedPurchase: true
  },
  {
    id: "rev-7",
    productId: "prod-book-1",
    customerName: "Vikram Malhotra",
    rating: 5,
    comment: "The most clear explanation of the Gita. Print is large enough to read easily. The Sanskrit commentaries are invaluable.",
    date: "2026-06-08",
    verifiedPurchase: true
  }
];
