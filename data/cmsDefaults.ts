export interface HomeCmsData {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    bgImageUrl: string;
    ctaPrimaryText: string;
    ctaPrimaryLink: string;
    ctaSecondaryText: string;
    ctaSecondaryLink: string;
  };
  intro: {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
    coreItems: Array<{ title: string; desc: string }>;
  };
  services: {
    badge: string;
    title: string;
    subtitle: string;
    servicesList: Array<{ title: string; desc: string; href: string }>;
  };
  timings: {
    badge: string;
    title: string;
    subtitle: string;
    morningHours: string;
    eveningHours: string;
    aartis: Array<{ time: string; name: string }>;
    guidelines: string;
  };
  festivals: {
    badge: string;
    title: string;
    subtitle: string;
  };
  live_darshan: {
    badge: string;
    title: string;
    subtitle: string;
    streamTitle: string;
    liveStreamUrl: string;
    isLive: boolean;
    scheduleNote: string;
  };
  hall_showcase: {
    badge: string;
    title: string;
    subtitle: string;
    capacityText: string;
  };
  gallery_highlight: {
    badge: string;
    title: string;
    subtitle: string;
  };
  mobile_app: {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
    features: Array<{ title: string; desc: string }>;
    googlePlayUrl?: string;
    appStoreUrl?: string;
    qrCodeImageUrl?: string;
    qrCodeLabel?: string;
  };
  testimonials: {
    badge: string;
    title: string;
    subtitle: string;
    items?: Array<{
      id: string;
      name: string;
      location: string;
      rating: number;
      quote: string;
      avatar?: string;
    }>;
  };
  latest_news: {
    badge: string;
    title: string;
    subtitle: string;
    articles?: Array<{
      id: string;
      title: string;
      excerpt: string;
      content: string;
      publishedDate: string;
      category: string;
      imageUrl: string;
    }>;
  };
}

export interface AboutCmsData {
  hero: {
    badge: string;
    title: string;
    description: string;
    showcaseImage: string;
    badge1Text: string;
    badge2Text: string;
    trustCard1Title: string;
    trustCard1Desc: string;
    trustCard2Title: string;
    trustCard2Desc: string;
    trustCard3Title: string;
    trustCard3Desc: string;
  };
  purpose: {
    sectionTitle: string;
    subtitle: string;
    missionTitle: string;
    missionDesc: string;
    visionTitle: string;
    visionDesc: string;
    valuesTitle: string;
    valuesList: string[];
    commitmentTitle: string;
    commitmentDesc: string;
  };
  metrics: {
    stats: Array<{ number: string; title: string; subtitle: string }>;
  };
  story: {
    badge: string;
    title: string;
    p1: string;
    p2: string;
    milestones: Array<{ year: string; title: string; desc: string }>;
  };
  offers: {
    badge: string;
    title: string;
    subtitle: string;
    offersList: Array<{ title: string; desc: string }>;
  };
  testimonials: {
    badge: string;
    title: string;
    testimonials: Array<{
      name: string;
      location: string;
      rating: number;
      quote: string;
      avatar: string;
    }>;
  };
}

export interface DonationsCmsData {
  hero: {
    badge: string;
    title: string;
    description: string;
    bgImageUrl: string;
  };
  donation_form: {
    badge: string;
    title: string;
    subtitle: string;
    securityBadge1: string;
    securityBadge2: string;
    securityBadge3: string;
  };
  causes: {
    badge: string;
    title: string;
    subtitle: string;
    causes: Array<{
      type: string;
      title: string;
      desc: string;
      rateText: string;
      rate: number;
      img: string;
    }>;
  };
  recent_donors: {
    title: string;
    subtitle: string;
    viewAllText: string;
  };
  bank_details: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    swiftCode: string;
    branch: string;
    mobileMoneyUpi: string;
    currency: string;
  };
  faqs: {
    badge: string;
    title: string;
    subtitle: string;
    faqs: Array<{ question: string; answer: string }>;
  };
}

export interface GalleryCmsData {
  header: {
    badge: string;
    title: string;
    subtitle: string;
  };
  categories: {
    categories: string[];
  };
}

export interface ContactCmsData {
  header: {
    badge: string;
    title: string;
    subtitle: string;
  };
  info: {
    address: string;
    phone: string;
    email: string;
    officeHours: string;
    bookingNote: string;
  };
  feedback_form: {
    title: string;
    subtitle: string;
    submitButtonText: string;
    successMessage: string;
  };
  map: {
    title: string;
    mapLocationText: string;
    mapEmbedUrl: string;
  };
}

export const DEFAULT_HOME_CONTENT: HomeCmsData = {
  hero: {
    badge: "WELCOME TO MANDIR",
    title: "Your Devotion, Our Responsibility",
    subtitle: "Experience divine blessings, book services, join events, and stay connected with your temple, anytime, anywhere.",
    bgImageUrl: "/temple_hero_bg.png",
    ctaPrimaryText: "Book a Service",
    ctaPrimaryLink: "/services",
    ctaSecondaryText: "Explore More",
    ctaSecondaryLink: "/darshan"
  },
  intro: {
    badge: "ABOUT MANDIR",
    title: "Tradition Rooted, Technology Driven",
    subtitle: "Sacred Spiritual Sanctuary",
    description: "SKSS Temple, Kampala is a complete digital platform dedicated to temples and devotees. We blend ancient traditions with modern technology to make your spiritual journey seamless, transparent and more meaningful.",
    coreItems: [
      { title: "Sacred Sanctorum", desc: "Experience profound tranquility through daily aartis, bhajans and Vedic recitations." },
      { title: "Devotee First", desc: "Online pooja booking, transparent accounts, and digital receipt generation." },
      { title: "Community Welfare", desc: "Weekly Annadan feeding, blood donation camps, and educational outreach." },
      { title: "Global Satsang", desc: "Connecting thousands of devotees across continents with high-definition darshan streams." }
    ]
  },
  services: {
    badge: "QUICK ACCESS",
    title: "Temple Services & Sevas",
    subtitle: "Explore our divine offerings crafted for your spiritual growth and community welfare.",
    servicesList: [
      { title: "Pooja Booking", desc: "Book personalized or family poojas with resident priests.", href: "/booking?type=puja" },
      { title: "Hall Booking", desc: "Reserve Shree Swaminarayan Hall for weddings and holy functions.", href: "/booking?type=hall" },
      { title: "Donation Portal", desc: "Contribute to Annadan, Temple Expansion, or general funds.", href: "/donations" },
      { title: "Membership Program", desc: "Join our community with digital QR cards & family profiles.", href: "/membership" },
      { title: "Live Darshan", desc: "Watch live stream broadcast from the main shrine.", href: "/live-darshan" },
      { title: "Temple Events", desc: "Stay updated with upcoming festivals and spiritual discourse schedules.", href: "/events" }
    ]
  },
  timings: {
    badge: "DAILY WORSHIP SCHEDULES",
    title: "Sacred Darshan Timings",
    subtitle: "Join us for daily prayers and experience spiritual rejuvenation. Timings are scheduled around the traditional daily routines of deity worship.",
    morningHours: "5:30 AM - 11:00 AM",
    eveningHours: "4:00 PM - 8:30 PM",
    aartis: [
      { time: "6:00 AM", name: "Mangala Aarti" },
      { time: "7:00 AM", name: "Shringar Aarti" },
      { time: "6:45 PM", name: "Sandhya Aarti" }
    ],
    guidelines: "Devotees are requested to maintain peaceful decorum and silence inside the inner sanctum."
  },
  festivals: {
    badge: "DIVINE CELEBRATIONS",
    title: "Upcoming Celebrations & Festivals",
    subtitle: "Participate in spectacular seasonal gatherings, holy rites, cultural pageantry, and community feasts with SKSS Kampala."
  },
  live_darshan: {
    badge: "SACRED BROADCAST",
    title: "Virtual Shrine & Live Darshan",
    subtitle: "Connect online and feel the divine energy. Watch live broadcasts from the main shrine at Kampala.",
    streamTitle: "Daily Sacred Darshan Live Stream",
    liveStreamUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    isLive: true,
    scheduleNote: "Streaming daily morning Mangala Aarti (6:00 AM) and evening Sandhya Aarti (6:45 PM EAT)."
  },
  hall_showcase: {
    badge: "SANCTIFIED SPACES",
    title: "Shree Swaminarayan Community Hall",
    subtitle: "A premier banquet and devotional facility designed to host memorable weddings, Upanayanams, cultural festivities, and spiritual gatherings.",
    capacityText: "1200+ capacity auditorium with elevated royal stage and lighting."
  },
  gallery_highlight: {
    badge: "SACRED MOMENTS",
    title: "Temple Media Gallery",
    subtitle: "Glimpses of daily rituals, beautiful festivals, and community welfare events."
  },
  mobile_app: {
    badge: "MANDIR MOBILE APP",
    title: "Carry Temple Grace Everywhere in Your Pocket",
    subtitle: "Sacred Tech in Hand",
    description: "Available for iOS and Android. Receive daily shlokas, custom push notifications for Aarti timings, download donation receipts, and access member details instantly on the go.",
    features: [
      { title: "Aarti Alerts", desc: "Get notified for all Aarti timings" },
      { title: "Quick Receipts", desc: "Instant digital 80G tax receipts" },
      { title: "QR Pass", desc: "Speedy entry for festivals & pujas" },
      { title: "Daily Darshan", desc: "High-definition morning photos" }
    ],
    googlePlayUrl: "https://play.google.com",
    appStoreUrl: "https://www.apple.com/app-store/",
    qrCodeImageUrl: "",
    qrCodeLabel: "Scan to Download App"
  },
  testimonials: {
    badge: "DEVOTEE VOICES",
    title: "What Devotees Say",
    subtitle: "Real stories of grace, solace, and fellowship from our satsang community.",
    items: [
      {
        id: "test-1",
        name: "Dr. Arvind Subramanian",
        location: "Kampala, Uganda",
        rating: 5,
        quote: "The Shree Swaminarayan Mandir ERP has revolutionized how my family connects with the temple. From booking annual sevas to downloading tax exemptions, the experience is incredibly seamless and elegant.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80"
      },
      {
        id: "test-2",
        name: "Meenakshi Iyengar",
        location: "Nairobi, Kenya",
        rating: 5,
        quote: "Even while traveling abroad, I can join the live Darshan and sponsor a Pooja for my children's birthdays. The system is easy to use, responsive, and the digital receipts are generated instantly.",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80"
      },
      {
        id: "test-3",
        name: "Pranav Goenka",
        location: "London, UK",
        rating: 5,
        quote: "Booking the Shree Swaminarayan Hall for my daughter's wedding was very stress-free. The availability calendar is transparent, the deposit tracking is clear, and the staff are helpful.",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80"
      },
      {
        id: "test-4",
        name: "Sunita Patel",
        location: "Ahmedabad, India",
        rating: 5,
        quote: "The Annadanam seva contribution process is transparent and fills our hearts with immense peace. Truly a model for modern spiritual administration and devotee care.",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80"
      }
    ]
  },
  latest_news: {
    badge: "MANDIR BULLETINS",
    title: "Latest News & Press Releases",
    subtitle: "Stay informed about temple events, infrastructural modifications, and social updates.",
    articles: [
      {
        id: "news-1",
        title: "New Devotee Portal Launched Online",
        excerpt: "We are thrilled to introduce our state-of-the-art ERP platform featuring unified pooja bookings, instant donation receipts, and online memberships.",
        content: "We are thrilled to introduce our state-of-the-art ERP platform featuring unified pooja bookings, instant donation receipts, and online memberships. This upgrade was funded by our Trustees to streamline pilgrim bookings and make all services easily accessible worldwide.",
        publishedDate: "2026-06-20",
        category: "Announcement",
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "news-2",
        title: "Special Preparations for Rathyatra 2026",
        excerpt: "The chariot painting and wheel construction have officially begun. We welcome volunteers for floral service and crowd coordination.",
        content: "The chariot painting and wheel construction have officially begun. We welcome volunteers for floral service and crowd coordination. Over 50,000 devotees are expected to attend the historic chariot pull along spiritual boulevard on July 10th. Sign up in the portal's events page.",
        publishedDate: "2026-06-18",
        category: "Festival",
        imageUrl: "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "news-3",
        title: "Vedic Gurukul Free Summer Camp Success",
        excerpt: "More than 150 children graduated from our 2-week Vedic learning camp, mastering Sanskrit shlokas, character building, and ethics.",
        content: "More than 150 children graduated from our 2-week Vedic learning camp, mastering Sanskrit shlokas, character building, and ethics. The closing ceremony saw vibrant cultural dramas and musical performances by the students. We thank all donor patrons who sponsored this project.",
        publishedDate: "2026-06-15",
        category: "Community",
        imageUrl: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "news-4",
        title: "Solar Power Expansion Project Completed",
        excerpt: "Our holy temple complex is now 80% solar powered, saving resources for expanded daily Annadan and community dispensary medicines.",
        content: "Our holy temple complex is now 80% solar powered, saving resources for expanded daily Annadan and community dispensary medicines. Devotees commended this green temple initiative.",
        publishedDate: "2026-06-05",
        category: "Community",
        imageUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80"
      }
    ]
  }
};

export const DEFAULT_ABOUT_CONTENT: AboutCmsData = {
  hero: {
    badge: "ABOUT OUR MANDIR",
    title: "Rooted in Tradition, Driven by Devotion",
    description: "SKSS Temple, Kampala is a modern temple management platform dedicated to preserving our spiritual heritage and making temple services accessible to devotees everywhere.",
    showcaseImage: "/images/hero-temple.jpg",
    badge1Text: "Kampala Satsang Portal",
    badge2Text: "50,000+ Devotees",
    trustCard1Title: "Trusted & Secure",
    trustCard1Desc: "Bank-level 256-bit security for donations & bookings.",
    trustCard2Title: "Devotee First",
    trustCard2Desc: "Crafted with sincere devotion, seva, and spiritual care.",
    trustCard3Title: "24/7 Mandir Access",
    trustCard3Desc: "Online pooja booking, live darshan & devotee desk."
  },
  purpose: {
    sectionTitle: "OUR PURPOSE",
    subtitle: "Empowering temples and devotees through technology while staying true to our spiritual roots.",
    missionTitle: "Our Mission",
    missionDesc: "To simplify temple services and bring devotees closer to divine experiences through technology and devotion.",
    visionTitle: "Our Vision",
    visionDesc: "To become the most trusted digital platform for temples and devotees worldwide, fostering a stronger spiritual community.",
    valuesTitle: "Our Values",
    valuesList: ["Faith & Devotion", "Transparency", "Inclusivity", "Service Excellence"],
    commitmentTitle: "Our Commitment",
    commitmentDesc: "We are committed to preserving our traditions while embracing innovation for the betterment of temples and devotees."
  },
  metrics: {
    stats: [
      { number: "50,000+", title: "Happy Devotees", subtitle: "Trust us across the globe" },
      { number: "500+", title: "Temples Connected", subtitle: "Empowering spiritual spaces" },
      { number: "10,000+", title: "Poojas Booked Daily", subtitle: "Seva made simple" },
      { number: "2Cr+", title: "Donations Processed", subtitle: "With complete transparency" }
    ]
  },
  story: {
    badge: "OUR STORY",
    title: "A Journey of Faith and Innovation",
    p1: "SKSS Temple, Kampala was born out of a simple belief — devotion should be accessible to all. We combine technology with tradition to help temples manage operations efficiently and devotees connect effortlessly.",
    p2: "From online pooja bookings to live darshan and digital donations, we are reshaping the way spirituality meets modern life.",
    milestones: [
      { year: "2018", title: "The Beginning", desc: "Started with a vision to digitize temple services and make devotion easier." },
      { year: "2020", title: "Growing Together", desc: "Onboarded 100+ temples and built a community of thousands of devotees." },
      { year: "2022", title: "Going Digital", desc: "Launched mobile app, live darshan, and secure donation platform." },
      { year: "2024 & Beyond", title: "Building the Future", desc: "Expanding services and creating a global spiritual ecosystem." }
    ]
  },
  offers: {
    badge: "WHAT WE OFFER",
    title: "What We Offer",
    subtitle: "Comprehensive digital solutions for temples and devotees",
    offersList: [
      { title: "Pooja & Seva Booking", desc: "Book personalized poojas & sevas online" },
      { title: "Live Darshan", desc: "Watch live & stay connected to divinity" },
      { title: "Donations", desc: "Contribute for a greater cause securely" },
      { title: "Temple Management", desc: "Smart tools for temple administration" },
      { title: "Devotee Community", desc: "A divine community that grows together" }
    ]
  },
  testimonials: {
    badge: "WHAT DEVOTEES SAY",
    title: "What Devotees Say",
    testimonials: [
      {
        name: "Priya Sharma",
        location: "Kampala",
        rating: 5,
        quote: "Mandir has made booking poojas so easy. The experience is smooth and the seva is truly divine.",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80"
      },
      {
        name: "Rohit Verma",
        location: "Delhi",
        rating: 5,
        quote: "The live darshan feature helps me feel connected to the temple even when I am far away.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80"
      }
    ]
  }
};

export const DEFAULT_DONATIONS_CONTENT: DonationsCmsData = {
  hero: {
    badge: "DONATE WITH FAITH",
    title: "Your Donation, Their Blessing",
    description: "Your contribution helps us maintain the temple, support daily rituals, fund annadanam, celebrate festivals and preserve our ancient traditions.",
    bgImageUrl: "/temple_hero_bg.png"
  },
  donation_form: {
    badge: "DONATE WITH FAITH",
    title: "Online Sacred Seva Portal",
    subtitle: "Select your desired seva campaign, payment gateway, and receive instant digital receipts.",
    securityBadge1: "100% Secure",
    securityBadge2: "Instant Tax Receipt",
    securityBadge3: "Trusted by 50K+"
  },
  causes: {
    badge: "IMPACT",
    title: "Your Donation Creates Impact",
    subtitle: "Every shilling contributed transforms into prasad, scripture preservation, and sanctified community service.",
    causes: [
      { type: "general", title: "Daily Pujas", desc: "Support daily pujas and rituals for divine blessings.", rateText: "UGX 501 / Day", rate: 501, img: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=180&h=130&q=80" },
      { type: "annadanam", title: "Annadanam", desc: "Provide meals to devotees and those in need.", rateText: "UGX 1,101 / Meal Service", rate: 1101, img: "https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=180&h=130&q=80" },
      { type: "festival", title: "Festival Celebrations", desc: "Support grand celebrations and cultural traditions.", rateText: "UGX 2,101 / Festival", rate: 2101, img: "https://images.unsplash.com/photo-1608976479500-66c1b376d8b6?auto=format&fit=crop&w=180&h=130&q=80" },
      { type: "gau", title: "Gau Seva", desc: "Care and protection of cows.", rateText: "UGX 1,101 / Month", rate: 1101, img: "https://images.unsplash.com/photo-1583373834249-137a86892a50?auto=format&fit=crop&w=180&h=130&q=80" },
      { type: "maintenance", title: "Temple Maintenance", desc: "Preserve and maintain our sacred temple.", rateText: "UGX 5,101 / Support", rate: 5101, img: "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=180&h=130&q=80" }
    ]
  },
  recent_donors: {
    title: "Recent Donors",
    subtitle: "Celebrating our selfless benefactors who keep the temple lights shining.",
    viewAllText: "View All Donors"
  },
  bank_details: {
    bankName: "Stanbic Bank Uganda",
    accountName: "Shree Swaminarayan Temple Kampala Seva Trust",
    accountNumber: "9030018472910",
    swiftCode: "SBICUGKX",
    branch: "Forest Mall Lugogo Branch, Kampala",
    mobileMoneyUpi: "AIRTEL/MTN: +256 759031334 (Code: 849201)",
    currency: "UGX"
  },
  faqs: {
    badge: "FAQS",
    title: "Frequently Asked Questions",
    subtitle: "Everything you need to know about donation receipts, tax deductions, and payment methods.",
    faqs: [
      {
        question: "Is my donation tax deductible?",
        answer: "Yes, all donations made to Shree Swaminarayan Temple Kampala are tax-deductible under regional tax codes. An official donation receipt will be emailed immediately."
      },
      {
        question: "How will I receive the donation receipt?",
        answer: "Once payment is verified, a high-resolution digital receipt is generated on screen and sent to your registered email address. You can also view it in your dashboard."
      },
      {
        question: "Can I donate anonymously?",
        answer: "Absolutely. Simply check the 'Donate Anonymously' box in the form. Your contribution will be processed, but your name will be hidden from the public lists."
      },
      {
        question: "Which payment methods are accepted?",
        answer: "We support Mobile Money UPI, Credit/Debit cards (Visa, Mastercard, RuPay), Net Banking from leading banks, and digital wallets."
      },
      {
        question: "Is my payment information secure?",
        answer: "All transactions are encrypted using bank-level 256-bit SSL encryption. We do not store any card data or bank credentials on our servers."
      }
    ]
  }
};

export const DEFAULT_GALLERY_CONTENT: GalleryCmsData = {
  header: {
    badge: "Snapshots",
    title: "Temple Media Gallery",
    subtitle: "A collection of divine shringars, vibrant festivals, community services, and architectural beauty."
  },
  categories: {
    categories: ["All", "Deities", "Festivals", "Temple Complex", "Social Events"]
  }
};

export const DEFAULT_CONTACT_CONTENT: ContactCmsData = {
  header: {
    badge: "Reach out",
    title: "Contact & Feedback",
    subtitle: "Get in touch with the mandir administrative office or send us your spiritual feedback."
  },
  info: {
    address: "Shree Swaminarayan Complex, Nsimbiziwoome, Bukoto, Kampala, Uganda",
    phone: "+256 759031334",
    email: "info@sksstkampala.com",
    officeHours: "Monday - Sunday: 9:00 AM - 6:00 PM",
    bookingNote: "For wedding hall site inspection, please book an appointment via the hall booking panel."
  },
  feedback_form: {
    title: "Send a Message",
    subtitle: "Write your feedback, seva inquiries, or prayer requests to our administrative office.",
    submitButtonText: "Submit message",
    successMessage: "Thank you for your feedback. Our administrative office will review your request shortly."
  },
  map: {
    title: "Location Map Simulator",
    mapLocationText: "Shree Swaminarayan Complex, Nsimbiziwoome, Bukoto, Kampala, Uganda",
    mapEmbedUrl: "https://maps.google.com/?q=Bukoto,Kampala,Uganda"
  }
};

export const INITIAL_GALLERY_ITEMS = [
  { id: "gal-1", title: "Sri Radhe Krishna Shringar Darshan", category: "Deities", imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80", date: "2026-06-21" },
  { id: "gal-2", title: "Janmashtami Midnight Abhishek", category: "Festivals", imageUrl: "https://images.unsplash.com/photo-1608976479500-66c1b376d8b6?auto=format&fit=crop&w=800&q=80", date: "2025-08-25" },
  { id: "gal-3", title: "Main Temple Dome & Architecture", category: "Temple Complex", imageUrl: "https://images.unsplash.com/photo-1583373834249-137a86892a50?auto=format&fit=crop&w=800&q=80", date: "2026-05-10" },
  { id: "gal-4", title: "Vasant Utsav Holi Celebrations", category: "Festivals", imageUrl: "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=800&q=80", date: "2026-03-25" },
  { id: "gal-5", title: "Spiritual Discourse Hall in Evening", category: "Temple Complex", imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80", date: "2026-04-18" },
  { id: "gal-6", title: "Devotees Serving in Nitya Annadan Kitchen", category: "Social Events", imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80", date: "2026-06-01" },
  { id: "gal-7", title: "Maha Shivratri Deepotsav", category: "Festivals", imageUrl: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=800&q=80", date: "2026-03-08" },
  { id: "gal-8", title: "Children's Spiritual Camp Prize Distribution", category: "Social Events", imageUrl: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80", date: "2026-06-15" }
];
