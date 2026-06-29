export interface GalleryItem {
  id: string;
  title: string;
  category: "Deities" | "Festivals" | "Temple Complex" | "Social Events";
  imageUrl: string;
  videoUrl?: string;
  date: string;
}

export const mockGalleryItems: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Sri Radhe Krishna Shringar Darshan",
    category: "Deities",
    imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    date: "2026-06-21"
  },
  {
    id: "gal-2",
    title: "Janmashtami Midnight Abhishek Ceremony",
    category: "Festivals",
    imageUrl: "https://images.unsplash.com/photo-1608976479500-66c1b376d8b6?auto=format&fit=crop&w=800&q=80",
    date: "2025-08-25"
  },
  {
    id: "gal-3",
    title: "Main Temple Dome & Architecture",
    category: "Temple Complex",
    imageUrl: "https://images.unsplash.com/photo-1583373834249-137a86892a50?auto=format&fit=crop&w=800&q=80",
    date: "2026-05-10"
  },
  {
    id: "gal-4",
    title: "Vasant Utsav Holi Celebrations",
    category: "Festivals",
    imageUrl: "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=800&q=80",
    date: "2026-03-25"
  },
  {
    id: "gal-5",
    title: "Spiritual Discourse Hall in Evening",
    category: "Temple Complex",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    date: "2026-04-18"
  },
  {
    id: "gal-6",
    title: "Devotees Serving in Nitya Annadan Kitchen",
    category: "Social Events",
    imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80",
    date: "2026-06-01"
  },
  {
    id: "gal-7",
    title: "Maha Shivratri Deepotsav",
    category: "Festivals",
    imageUrl: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=800&q=80",
    date: "2026-03-08"
  },
  {
    id: "gal-8",
    title: "Children's Spiritual Camp Prize Distribution",
    category: "Social Events",
    imageUrl: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80",
    date: "2026-06-15"
  }
];
