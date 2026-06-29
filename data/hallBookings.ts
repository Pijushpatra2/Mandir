export interface HallBookingRecord {
  id: string;
  devoteeName: string;
  devoteeEmail: string;
  devoteePhone: string;
  eventTitle: string;
  bookingDate: string; // YYYY-MM-DD
  durationDays: number;
  totalPrice: number;
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
  paymentStatus: "PAID" | "PENDING";
  notes?: string;
  hallName: string;
  startTime?: string;
  endTime?: string;
}

export const mockHallBookings: HallBookingRecord[] = [
  {
    id: "hb-1",
    devoteeName: "Vikram Malhotra",
    devoteeEmail: "vikram.m@example.com",
    devoteePhone: "+91 91234 56789",
    eventTitle: "Grand Marriage Ceremony",
    bookingDate: "2026-06-25",
    durationDays: 2,
    totalPrice: 150000,
    status: "CONFIRMED",
    paymentStatus: "PAID",
    notes: "Requires standard stage setup, lighting, and priest for Vivah Sanskar.",
    hallName: "Shree Swaminarayan Hall"
  },
  {
    id: "hb-2",
    devoteeName: "Ragini Sen",
    devoteeEmail: "ragini.sen@example.com",
    devoteePhone: "+91 88990 11223",
    eventTitle: "Spiritual Discourses & Satsang",
    bookingDate: "2026-06-28",
    durationDays: 1,
    totalPrice: 50000,
    status: "CONFIRMED",
    paymentStatus: "PAID",
    notes: "Requires seating for 1000 people, audio/video projection setup.",
    hallName: "Shree Swaminarayan Hall"
  },
  {
    id: "hb-3",
    devoteeName: "Prashant Joshi",
    devoteeEmail: "p.joshi@example.com",
    devoteePhone: "+91 98888 77777",
    eventTitle: "Upanayana (Thread Ceremony)",
    bookingDate: "2026-07-05",
    durationDays: 1,
    totalPrice: 75000,
    status: "PENDING",
    paymentStatus: "PENDING",
    notes: "Requires priest service and booking of auxiliary rooms.",
    hallName: "Shree Swaminarayan Hall"
  },
  {
    id: "hb-4",
    devoteeName: "Siddharth Goel",
    devoteeEmail: "siddharth.goel@example.com",
    devoteePhone: "+91 95555 44444",
    eventTitle: "Golden Jubilee Anniversary Celebrations",
    bookingDate: "2026-07-12",
    durationDays: 1,
    totalPrice: 75000,
    status: "CANCELLED",
    paymentStatus: "PENDING",
    notes: "Client cancelled due to logistical changes.",
    hallName: "Shree Swaminarayan Hall"
  },
  {
    id: "hb-5",
    devoteeName: "Anil Kulkarni",
    devoteeEmail: "anil.k@example.com",
    devoteePhone: "+91 93333 22222",
    eventTitle: "Devotional Music Concert",
    bookingDate: "2026-07-18",
    durationDays: 1,
    totalPrice: 60000,
    status: "PENDING",
    paymentStatus: "PENDING",
    notes: "Acoustics testing needed one day prior.",
    hallName: "Shree Swaminarayan Hall"
  }
];
