export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
}

export interface OrderTimeline {
  status: "PENDING" | "SHIPPED" | "DELIVERED";
  timestamp: string;
  title: string;
  description: string;
}

export interface ShopOrder {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod: "CARD" | "UPI" | "COD";
  status: "PENDING" | "SHIPPED" | "DELIVERED";
  date: string;
  trackingNumber: string;
  timeline: OrderTimeline[];
}

export const mockOrders: ShopOrder[] = [
  {
    id: "ORD-12847",
    customerId: "cust-1",
    customerName: "Harish Mehta",
    items: [
      {
        productId: "prod-kit-1",
        name: "Complete Vedic Havan Samagri Kit",
        price: 999,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1543157148-f8464799e186?auto=format&fit=crop&q=80&w=600"
      },
      {
        productId: "prod-kit-4",
        name: "Ganga Jal (Holy Water) 500ml",
        price: 150,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&q=80&w=600"
      }
    ],
    subtotal: 1299,
    discount: 100,
    tax: 60,
    total: 1259,
    shippingAddress: {
      name: "Harish Mehta",
      line1: "A-45, Sector 62",
      city: "Noida",
      state: "Uttar Pradesh",
      postalCode: "201301",
      phone: "+91 99110 54321"
    },
    paymentMethod: "UPI",
    status: "DELIVERED",
    date: "2026-06-21",
    trackingNumber: "TRK678129034",
    timeline: [
      {
        status: "PENDING",
        timestamp: "2026-06-21 10:30 AM",
        title: "Order Placed",
        description: "Payment confirmed and order received by Sri Radhe Krishna Mandir store."
      },
      {
        status: "SHIPPED",
        timestamp: "2026-06-22 02:15 PM",
        title: "Dispatched from Temple Hub",
        description: "Package handed over to BlueDart Courier partners. Tracking ID: TRK678129034."
      },
      {
        status: "DELIVERED",
        timestamp: "2026-06-24 11:45 AM",
        title: "Successfully Delivered",
        description: "Package received and signed by Harish Mehta."
      }
    ]
  },
  {
    id: "ORD-12901",
    customerId: "cust-2",
    customerName: "Pooja Sharma",
    items: [
      {
        productId: "prod-idol-1",
        name: "Handcrafted Brass Ganesha Idol",
        price: 3499,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?auto=format&fit=crop&q=80&w=600"
      }
    ],
    subtotal: 3499,
    discount: 300,
    tax: 160,
    total: 3359,
    shippingAddress: {
      name: "Pooja Sharma",
      line1: "B-201, Green Glen Layout",
      city: "Bangalore",
      state: "Karnataka",
      postalCode: "560103",
      phone: "+91 98223 88442"
    },
    paymentMethod: "CARD",
    status: "SHIPPED",
    date: "2026-06-25",
    trackingNumber: "TRK789123019",
    timeline: [
      {
        status: "PENDING",
        timestamp: "2026-06-25 09:12 AM",
        title: "Order Placed",
        description: "Credit Card payment verified. Preparing spiritual items."
      },
      {
        status: "SHIPPED",
        timestamp: "2026-06-26 11:00 AM",
        title: "Shipped from Bangalore Hub",
        description: "Your package is currently in transit via BlueDart express service."
      }
    ]
  },
  {
    id: "ORD-12942",
    customerId: "cust-3",
    customerName: "Amit Singhal",
    items: [
      {
        productId: "prod-book-1",
        name: "Bhagavad Gita As It Is (Hardbound)",
        price: 550,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600"
      },
      {
        productId: "prod-incense-1",
        name: "Organic Mysore Sandalwood Sticks",
        price: 299,
        quantity: 3,
        image: "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&q=80&w=600"
      }
    ],
    subtotal: 1997,
    discount: 150,
    tax: 92,
    total: 1939,
    shippingAddress: {
      name: "Amit Singhal",
      line1: "C-12, Malviya Nagar",
      city: "Jaipur",
      state: "Rajasthan",
      postalCode: "302017",
      phone: "+91 91100 23456"
    },
    paymentMethod: "COD",
    status: "PENDING",
    date: "2026-06-26",
    trackingNumber: "TRK800293710",
    timeline: [
      {
        status: "PENDING",
        timestamp: "2026-06-26 04:30 PM",
        title: "Order Received",
        description: "Cash on delivery order verified. Ready for warehouse processing."
      }
    ]
  }
];
