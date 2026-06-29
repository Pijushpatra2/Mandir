export interface TempleEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  bannerImage: string;
  capacityLimit: number;
  registeredCount: number;
  category: "Festival" | "Satsang" | "Seva" | "Cultural";
  status: "Upcoming" | "Completed" | "Ongoing";
}

export const templeEvents: TempleEvent[] = [
  {
    id: "evt-1",
    title: "Sri Krishna Janmashtami Mahotsav",
    description: "Celebrate the divine appearance of Lord Krishna with continuous bhajans, Abhishek, and a midnight Maha Aarti. A grand feast (Prasadam) will be served to all.",
    date: "2026-08-15",
    time: "6:00 PM - 12:30 AM",
    bannerImage: "https://images.unsplash.com/photo-1608976479500-66c1b376d8b6?auto=format&fit=crop&w=800&q=80",
    capacityLimit: 5000,
    registeredCount: 4200,
    category: "Festival",
    status: "Upcoming"
  },
  {
    id: "evt-2",
    title: "Maha Shivratri Jagran",
    description: "An all-night prayer vigil with continuous chanting of 'Om Namah Shivaya', four-phase Rudrabhishek, and devotional musical offerings.",
    date: "2026-03-08",
    time: "7:00 PM - 6:00 AM",
    bannerImage: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=800&q=80",
    capacityLimit: 3000,
    registeredCount: 3000,
    category: "Festival",
    status: "Completed"
  },
  {
    id: "evt-3",
    title: "Grand Diwali Festival of Lights",
    description: "Illuminating the entire temple premises with 10,000 clay lamps (diyas), accompanied by Govardhan Pooja, Annakut Mahotsav, and beautiful spiritual discourses.",
    date: "2026-11-08",
    time: "5:30 PM - 9:30 PM",
    bannerImage: "https://images.unsplash.com/photo-1605847444195-223000858807?auto=format&fit=crop&w=800&q=80",
    capacityLimit: 4000,
    registeredCount: 1850,
    category: "Festival",
    status: "Upcoming"
  },
  {
    id: "evt-4",
    title: "Jagannath Rath Yatra",
    description: "The annual chariot festival pulling the magnificent carts of Lord Jagannath, Baladev, and Subhadra through the streets of Divine City, accompanied by congregational chanting.",
    date: "2026-07-10",
    time: "8:00 AM - 4:00 PM",
    bannerImage: "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=800&q=80",
    capacityLimit: 8000,
    registeredCount: 6500,
    category: "Festival",
    status: "Upcoming"
  },
  {
    id: "evt-5",
    title: "Weekly Bhagavad Gita Satsang",
    description: "Deep philosophical study and discussions on the teachings of the Bhagavad Gita led by senior resident Acharyas. Includes interactive Q&A and meditation.",
    date: "2026-06-28",
    time: "4:30 PM - 6:00 PM",
    bannerImage: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    capacityLimit: 300,
    registeredCount: 180,
    category: "Satsang",
    status: "Upcoming"
  },
  {
    id: "evt-6",
    title: "Mega Annadan Seva Drive",
    description: "Distribution of free, nutritious, sanctified meals (Prasadam) to over 5,000 underprivileged individuals across the city slums and shelter homes.",
    date: "2026-06-25",
    time: "11:00 AM - 3:00 PM",
    bannerImage: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80",
    capacityLimit: 100,
    registeredCount: 95,
    category: "Seva",
    status: "Upcoming"
  }
];
