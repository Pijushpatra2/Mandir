export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  publishedDate: string;
  category: "Announcement" | "Festival" | "Community";
  imageUrl: string;
}

export const mockNews: NewsArticle[] = [
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
  }
];
