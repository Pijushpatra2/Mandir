export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string; // ISO date string
  read: boolean;
  category: "booking" | "donation" | "membership" | "system";
}

export const mockNotifications: SystemNotification[] = [
  {
    id: "not-1",
    title: "New Hall Booking Request",
    message: "Prashant Joshi submitted a request to book Radhe Krishna Hall for 'Upanayana' on 2026-07-05.",
    timestamp: "2026-06-21T05:30:00Z",
    read: false,
    category: "booking"
  },
  {
    id: "not-2",
    title: "High Donation Received",
    message: "Sanjay Shah donated ₹50,000 cash towards Nitya Annadan Seva campaign.",
    timestamp: "2026-06-20T11:30:00Z",
    read: false,
    category: "donation"
  },
  {
    id: "not-3",
    title: "Membership Approval Pending",
    message: "New membership application received from Sneha Desai (Annual Membership).",
    timestamp: "2026-06-20T10:12:00Z",
    read: true,
    category: "membership"
  },
  {
    id: "not-4",
    title: "Stripe Webhook Alert",
    message: "Stripe payment verification processed successfully for checkout session cs_test_12345.",
    timestamp: "2026-06-20T08:15:00Z",
    read: true,
    category: "system"
  },
  {
    id: "not-5",
    title: "Pooja Booking Submitted",
    message: "Nitin Desai registered for Maha Abhishek Seva on 2026-06-23.",
    timestamp: "2026-06-20T06:30:00Z",
    read: true,
    category: "booking"
  }
];
