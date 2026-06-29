# TEMPLE ERP - PROJECT CONTEXT (FRONTEND ONLY)

This document maps out the functional requirements, page flows, routes, and layout structures for the **Temple ERP Platform Frontend**. The application is designed to simulate a complete enterprise SaaS system using robust frontend state and comprehensive mock data.

---

## 1. TARGET AUDIENCES & ROLES

The platform simulates multiple perspectives using a client-side mock role-switcher in the header or settings panel:

### 1.1 Devotee / Public Portal
- **Goal**: Browse temple details, view live stream, donate, request Pooja slots, sign up for membership, check hall availability.
- **Access**: Public routes (`/about`, `/darshan`, `/services`, `/donations`, `/membership`, `/events`, `/hall-booking`, `/gallery`, `/live-darshan`, `/contact`).

### 1.2 Administrative Staff Roles
These roles access `/dashboard` paths and toggle dashboard UI sections:
- **Super Admin**: Access to settings, user management, audit logs.
- **Trustee**: Approval boards for memberships and high-capacity bookings, reports.
- **Accountant**: Double-entry journal views, donation ledger audits, Excel/Tally XML exports interface.
- **Booking Manager**: Hall booking calendar manager, Pooja schedule logs, status toggles.
- **Content Manager**: Gallery uploads manager, active events scheduler.

---

## 2. SITE MAP & ROUTING STRUCTURE

```text
/                       --> Homepage (immersive storytelling, quick service buttons, stats, timelines)
├── /about              --> History, mission, and vision cards
├── /darshan            --> Interactive Darshan schedules and आरती timings grid
├── /services           --> Comprehensive list of Poojas with slot reservation forms
├── /donations          --> Campaign donation panels with progress indicators and checkout modals
├── /membership         --> Registration forms, priority access outlines, digital ID cards
├── /events             --> Calendar lists, festival registers, event timeline logs
├── /hall-booking       --> Radhe Krishna Hall showcase, interactive calendar interface
├── /gallery            --> Masonry grid layout with photo/video categorizations
├── /live-darshan       --> Mock YouTube live player, interactive mock devotee chat
├── /contact            --> Feedback fields, general information, Google Map mock
└── /dashboard          --> Admin dashboard shell
    ├── /members        --> Member grids, search filters, family profiles, print layouts
    ├── /donations      --> Transaction tables, export controls, campaign stats charts
    ├── /bookings       --> Master Pooja & Hall bookings list with slot modification
    ├── /events         --> Festival and event editing, registrations list
    ├── /gallery        --> Asset media upload and sorting simulator
    ├── /inventory      --> Digital register tracking gold, silver, property assets
    ├── /accounting     --> Account balances charts, general ledger sheet, Tally export controls
    ├── /reports        --> Report builders (Membership, Donations, Hall Bookings)
    └── /settings       --> Configuration for temple rules, timing limits, notification setups
```

---

## 3. CORE USER FLOWS & INTERACTIVE FEATURES

### 3.1 Online Pooja Booking Flow
1. User visits `/services`, chooses a Pooja service (e.g., Satyanarayan Pooja, Archana).
2. Opens a booking drawer or modal containing a multi-step form:
   - **Step 1**: Personal Info & Devotee Names (with Nakshatra, Gothra inputs).
   - **Step 2**: Select date & slot (morning/evening) using an interactive calendar picker.
   - **Step 3**: Optional Samagri kit add-ons.
   - **Step 4**: Payment Gateway simulator (mock Stripe/Razorpay cards).
3. Success screen showing generated receipt number, date, slot, and a downloadable PDF simulator.

### 3.2 Donation Flow
1. User selects a campaign from `/donations` (e.g., Building Fund, Annadan Seva).
2. Choose pre-set amounts (₹1,100, ₹5,100, ₹11,000, Custom).
3. Input donor details, optional PAN card number (for Section 80G tax exemption in India).
4. Simulate payment processing with a sleek loading animation.
5. Generates donation tax receipt on completion.

### 3.3 Hall Booking calendar & Request
1. User views `/hall-booking`, sees details for Radhe Krishna Hall.
2. Interacts with a visual monthly calendar showing Booked vs. Available dates.
3. Selects start date and number of days.
4. Fills out event details (Marriage, Upanayana, Satsang), capacity estimate, and catering needs.
5. Submits request, resulting in a "Pending Approval" card in the Devotee Portal / Admin dashboard.

### 3.4 Admin Workflows (SaaS Dashboard)
- **Member Directory Filters**: Search members by name, status (Pending, Active, Expired), or date range. Toggle family detail sections.
- **Booking Approvals**: Accept or decline pending hall reservations, automatically updating status and updating the calendar schedule.
- **Accounting & Ledger Sheets**: Simulate ledger balances for General Fund, Building Fund, Festival Fund, and Donation Fund. Trigger export scripts that generate mock Tally XML content inside raw text areas for copy-pasting.
