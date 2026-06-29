export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinedDate: string;
  ordersCount: number;
  totalSpent: number;
}

export const mockCustomers: Customer[] = [
  {
    id: "cust-1",
    name: "Harish Mehta",
    email: "harish.mehta@gmail.com",
    phone: "+91 99110 54321",
    address: "A-45, Sector 62, Noida, UP - 201301",
    joinedDate: "2026-01-15",
    ordersCount: 3,
    totalSpent: 4296
  },
  {
    id: "cust-2",
    name: "Pooja Sharma",
    email: "pooja.sharma@yahoo.com",
    phone: "+91 98223 88442",
    address: "B-201, Green Glen Layout, Bellandur, Bangalore, KA - 560103",
    joinedDate: "2026-02-10",
    ordersCount: 2,
    totalSpent: 2450
  },
  {
    id: "cust-3",
    name: "Amit Singhal",
    email: "amit.singhal@rediffmail.com",
    phone: "+91 91100 23456",
    address: "C-12, Malviya Nagar, Jaipur, RJ - 302017",
    joinedDate: "2026-03-05",
    ordersCount: 4,
    totalSpent: 9800
  },
  {
    id: "cust-4",
    name: "Sunita Reddy",
    email: "sunita.reddy@outlook.com",
    phone: "+91 88440 12890",
    address: "H-56, Banjara Hills, Road No 12, Hyderabad, TS - 500034",
    joinedDate: "2026-04-18",
    ordersCount: 1,
    totalSpent: 1299
  },
  {
    id: "cust-5",
    name: "Vikram Malhotra",
    email: "vikram.malhotra@gmail.com",
    phone: "+91 77330 98765",
    address: "Flat 4B, Silver Oak Apartments, Bandra West, Mumbai, MH - 400050",
    joinedDate: "2026-05-12",
    ordersCount: 2,
    totalSpent: 3890
  }
];
