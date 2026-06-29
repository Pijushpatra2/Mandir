# TEMPLE ERP - MOCK DATA ARCHITECTURE

This document specifies the structures and schemas for mock datasets inside the `/src/data` folder. These files drive the entire application interface, rendering realistic statistics, listings, and detailed records.

---

## 1. DATA SCHEMAS & INTERFACES

### 1.1 Temple Configuration (`/src/data/temple.ts`)
Stores basic information about the temple, contact coordinates, opening/closing schedules, and live stream settings.
```typescript
export interface TempleConfig {
  name: string;
  address: string;
  phone: string;
  email: string;
  darshanTimings: {
    morning: string;
    evening: string;
    aarti: string[];
  };
  liveStreamUrl: string;
}
```

### 1.2 Event Directory (`/src/data/events.ts`)
Maintains a registry of upcoming festivals, community gatherings, and cultural events.
```typescript
export interface TempleEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  bannerImage: string;
  capacityLimit?: number;
  registeredCount: number;
  category: "Festival" | "Satsang" | "Seva" | "Cultural";
}
```

### 1.3 Donation Ledgers (`/src/data/donations.ts`)
Details ongoing campaigns (Annadan, Building Fund, Expansion, Festival Seva) and transactional history.
```typescript
export interface DonationCampaign {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  donorCount: number;
  category: "General" | "Building" | "Festival" | "Annadan";
}

export interface DonationTx {
  id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  campaignId: string;
  paymentMethod: "Card" | "UPI" | "NetBanking" | "Cash";
  date: string;
  receiptNumber: string;
  status: "PAID" | "PENDING" | "FAILED";
}
```

### 1.4 Membership Records (`/src/data/members.ts`)
Defines devotees enrolled as members, including family profiles, statuses, and validation dates.
```typescript
export interface FamilyMember {
  fullName: string;
  relationship: string;
  age: number;
}

export interface MemberRecord {
  id: string;
  membershipNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: "ACTIVE" | "PENDING" | "EXPIRED" | "SUSPENDED";
  validUntil: string;
  qrCodeUrl: string;
  familyMembers: FamilyMember[];
  joinedDate: string;
}
```

### 1.5 Hall Bookings (`/src/data/hallBookings.ts`)
Tracks bookings for the "Radhe Krishna Hall" to drive the availability calendar.
```typescript
export interface HallBookingRecord {
  id: string;
  userId: string;
  devoteeName: string;
  eventTitle: string;
  bookingDate: string; // ISO date string (YYYY-MM-DD)
  durationDays: number;
  totalPrice: number;
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
  paymentStatus: "PAID" | "PENDING";
  notes?: string;
}
```

### 1.6 Pooja Bookings (`/src/data/poojaBookings.ts`)
Maintains scheduled services and priest assignments.
```typescript
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
  date: string;
  slot: string; // "Morning" | "Evening"
  priestName: string;
  status: "CONFIRMED" | "PENDING" | "COMPLETED";
  paymentStatus: "PAID" | "PENDING";
  amount: number;
}
```

### 1.7 Other Support Files
- **`gallery.ts`**: Collection of image items categorized by event, deity, and facility.
- **`notifications.ts`**: Array of triggers (renewals, event changes) driving the admin notification center.
- **`testimonials.ts`**: List of devotee reviews and experiences.
- **`news.ts`**: Press releases, updates, and temple bulletins.

---

## 2. MUTATION SIMULATIONS

All dashboard tables and devotee forms process mutations client-side:
- **Form Submissions**: When a user registers a pooja or submits a donation, the client displays a loader, pushes the record into a local temporary array or state list (or updates `localStorage`), and redirects to a success receipt.
- **Admin Approvals**: Action buttons (e.g. Approve Member, Cancel Booking) trigger React state updates that modify the record's status in the list, reflecting changes instantly in the tables and statistics count.
