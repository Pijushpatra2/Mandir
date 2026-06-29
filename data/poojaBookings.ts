export interface PoojaService {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMin: number;
}

export interface PoojaBookingRecord {
  id: string;
  poojaId: string;
  poojaName: string;
  devoteeName: string;
  gothra?: string;
  nakshatra?: string;
  date: string; // YYYY-MM-DD
  slot: string; // e.g. "Morning (6:30 AM)", "Evening (5:30 PM)"
  priestName: string;
  status: "CONFIRMED" | "PENDING" | "COMPLETED" | "CANCELLED";
  paymentStatus: "PAID" | "PENDING" | "FAILED";
  amount: number;
  receiptNumber: string;
}

export const poojaServices: PoojaService[] = [
  {
    id: "ps-1",
    name: "Satyanarayan Pooja",
    description: "A highly auspicious ritual performed to seek the blessings of Lord Satyanarayan (Lord Vishnu) for prosperity, health, and peace of mind.",
    price: 2100,
    durationMin: 120
  },
  {
    id: "ps-2",
    name: "Maha Abhishek Seva",
    description: "Grand ceremonial bathing of the main deities with milk, honey, yogurt, ghee, and sanctified herbal waters, accompanied by Vedic hymns.",
    price: 5100,
    durationMin: 90
  },
  {
    id: "ps-3",
    name: "Archana Seva",
    description: "A shorter offering chanting the 108 holy names of Lord Radhe Krishna, performed on behalf of the devotee's family with fruit and flower offerings.",
    price: 251,
    durationMin: 15
  },
  {
    id: "ps-4",
    name: "Shringar Seva",
    description: "Sponsor the deity's exquisite daily dressing, jewelry, and fresh floral garlands, obtaining special seating for the morning Aarti.",
    price: 3100,
    durationMin: 60
  },
  {
    id: "ps-5",
    name: "Sudarshana Homa",
    description: "A powerful fire ritual invoked to eliminate negative forces, grant health, block obstacles, and protect the devotee's household.",
    price: 11000,
    durationMin: 180
  }
];

export const mockPoojaBookings: PoojaBookingRecord[] = [
  {
    id: "pb-1",
    poojaId: "ps-1",
    poojaName: "Satyanarayan Pooja",
    devoteeName: "Rajesh Kumar",
    gothra: "Kashyap",
    nakshatra: "Rohini",
    date: "2026-06-22",
    slot: "Morning (8:30 AM)",
    priestName: "Pandit Ramachandra Shastri",
    status: "CONFIRMED",
    paymentStatus: "PAID",
    amount: 2100,
    receiptNumber: "PUJ-2026-0391"
  },
  {
    id: "pb-2",
    poojaId: "ps-3",
    poojaName: "Archana Seva",
    devoteeName: "Preeti Sharma",
    gothra: "Bharadwaj",
    nakshatra: "Ashwini",
    date: "2026-06-22",
    slot: "Morning (7:30 AM)",
    priestName: "Pandit Hari Prasad",
    status: "CONFIRMED",
    paymentStatus: "PAID",
    amount: 251,
    receiptNumber: "PUJ-2026-0392"
  },
  {
    id: "pb-3",
    poojaId: "ps-2",
    poojaName: "Maha Abhishek Seva",
    devoteeName: "Nitin Desai",
    gothra: "Vasishta",
    nakshatra: "Revati",
    date: "2026-06-23",
    slot: "Morning (6:30 AM)",
    priestName: "Pandit Venkatesh Bhat",
    status: "PENDING",
    paymentStatus: "PENDING",
    amount: 5100,
    receiptNumber: "PUJ-2026-0393"
  },
  {
    id: "pb-4",
    poojaId: "ps-5",
    poojaName: "Sudarshana Homa",
    devoteeName: "Vikas Hegde",
    gothra: "Gautama",
    nakshatra: "Krittika",
    date: "2026-06-24",
    slot: "Morning (8:00 AM)",
    priestName: "Pandit Ananthakrishna Shastri",
    status: "PENDING",
    paymentStatus: "PENDING",
    amount: 11000,
    receiptNumber: "PUJ-2026-0394"
  },
  {
    id: "pb-5",
    poojaId: "ps-4",
    poojaName: "Shringar Seva",
    devoteeName: "Karan Chawla",
    gothra: "Kashyap",
    nakshatra: "Uttara Phalguni",
    date: "2026-06-25",
    slot: "Evening (5:30 PM)",
    priestName: "Pandit Hari Prasad",
    status: "COMPLETED",
    paymentStatus: "PAID",
    amount: 3100,
    receiptNumber: "PUJ-2026-0388"
  }
];
