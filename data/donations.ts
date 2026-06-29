export interface DonationCampaign {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  donorCount: number;
  image: string;
  category: "General" | "Building" | "Festival" | "Annadan";
}

export interface DonationTx {
  id: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  amount: number;
  campaignId: string;
  campaignTitle: string;
  paymentMethod: "Card" | "UPI" | "NetBanking" | "Cash";
  date: string;
  receiptNumber: string;
  status: "PAID" | "PENDING" | "FAILED";
  panNumber?: string;
}

export const donationCampaigns: DonationCampaign[] = [
  {
    id: "camp-1",
    title: "General Temple Seva",
    description: "Support the daily upkeep, floral decorations, and general utility maintenance of the deities and temple premises.",
    goalAmount: 1500000,
    raisedAmount: 945000,
    donorCount: 780,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    category: "General"
  },
  {
    id: "camp-2",
    title: "Nitya Annadan Seva",
    description: "Provide free sanctified vegetarian food (Prasadam) to daily pilgrims and underprivileged families in the locality.",
    goalAmount: 2500000,
    raisedAmount: 1850000,
    donorCount: 1420,
    image: "https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=800&q=80",
    category: "Annadan"
  },
  {
    id: "camp-3",
    title: "New Spiritual Education Wing",
    description: "Contribute to the construction of a three-story Vedic library, seminar halls, and children's spiritual education classes.",
    goalAmount: 5000000,
    raisedAmount: 3200000,
    donorCount: 450,
    image: "https://images.unsplash.com/photo-1583373834249-137a86892a50?auto=format&fit=crop&w=800&q=80",
    category: "Building"
  },
  {
    id: "camp-4",
    title: "Sri Krishna Janmashtami Spl Seva",
    description: "Fund the grand floral decorations, high-end illumination, cultural setups, and maha-prasad distribution on Janmashtami night.",
    goalAmount: 1000000,
    raisedAmount: 480000,
    donorCount: 310,
    image: "https://images.unsplash.com/photo-1608976479500-66c1b376d8b6?auto=format&fit=crop&w=800&q=80",
    category: "Festival"
  }
];

export const mockDonations: DonationTx[] = [
  {
    id: "tx-1",
    donorName: "Ramesh Sharma",
    donorEmail: "ramesh.sharma@example.com",
    donorPhone: "+91 98765 43210",
    amount: 11000,
    campaignId: "camp-3",
    campaignTitle: "New Spiritual Education Wing",
    paymentMethod: "UPI",
    date: "2026-06-20T10:15:30Z",
    receiptNumber: "REC-2026-0842",
    status: "PAID",
    panNumber: "ABCDE1234F"
  },
  {
    id: "tx-2",
    donorName: "Ananya Patel",
    donorEmail: "ananya.p@example.com",
    donorPhone: "+91 99887 76655",
    amount: 5100,
    campaignId: "camp-2",
    campaignTitle: "Nitya Annadan Seva",
    paymentMethod: "Card",
    date: "2026-06-19T14:22:12Z",
    receiptNumber: "REC-2026-0841",
    status: "PAID",
    panNumber: "PQRST9876Z"
  },
  {
    id: "tx-3",
    donorName: "Vikram Malhotra",
    donorEmail: "vikram.m@example.com",
    donorPhone: "+91 91234 56789",
    amount: 25000,
    campaignId: "camp-3",
    campaignTitle: "New Spiritual Education Wing",
    paymentMethod: "NetBanking",
    date: "2026-06-18T18:45:00Z",
    receiptNumber: "REC-2026-0840",
    status: "PAID",
    panNumber: "VWXYZ5678M"
  },
  {
    id: "tx-4",
    donorName: "Devendra Joshi",
    donorEmail: "d.joshi@example.com",
    donorPhone: "+91 88776 65544",
    amount: 1008,
    campaignId: "camp-1",
    campaignTitle: "General Temple Seva",
    paymentMethod: "UPI",
    date: "2026-06-18T08:12:45Z",
    receiptNumber: "REC-2026-0839",
    status: "PAID"
  },
  {
    id: "tx-5",
    donorName: "Sanjay Shah",
    donorEmail: "sanjay.shah@example.com",
    donorPhone: "+91 77665 54433",
    amount: 50000,
    campaignId: "camp-2",
    campaignTitle: "Nitya Annadan Seva",
    paymentMethod: "Cash",
    date: "2026-06-17T11:30:00Z",
    receiptNumber: "REC-2026-0838",
    status: "PAID",
    panNumber: "JKLMN4321A"
  },
  {
    id: "tx-6",
    donorName: "Meera Nair",
    donorEmail: "meera.nair@example.com",
    donorPhone: "+91 90000 12345",
    amount: 15000,
    campaignId: "camp-4",
    campaignTitle: "Sri Krishna Janmashtami Spl Seva",
    paymentMethod: "Card",
    date: "2026-06-16T16:04:18Z",
    receiptNumber: "REC-2026-0837",
    status: "PENDING"
  }
];
