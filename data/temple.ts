export interface TempleConfig {
  name: string;
  tagline: string;
  history: string;
  mission: string;
  vision: string;
  address: string;
  phone: string;
  email: string;
  darshanTimings: {
    morning: string;
    evening: string;
    aarti: { time: string; name: string }[];
  };
  liveStreamUrl: string;
}

export const templeConfig: TempleConfig = {
  name: "Shree Kutch Satsang Swaminarayan Temple, Kampala",
  tagline: "Experience Divine Grace and Spiritual Peace",
  history: "Shree Kutch Satsang Swaminarayan Temple, Kampala has grown from a humble community sanctuary to a spiritual beacon. Built on the tenets of devotion, service, and spiritual education, the temple has served devotees worldwide, fostering a sanctuary for inner peace, traditional rituals, and community welfare.",
  mission: "To preserve and promote spiritual heritage, encourage devotional practices (Bhakti), and serve humanity through cultural outreach, charitable initiatives (Annadan), and educational programs.",
  vision: "To create a harmonious global community rooted in divine love, selfless service, and spiritual consciousness, accessible to devotees anytime and anywhere.",
  address: "Shree Swaminarayan Complex Nsimbiziwoome, Bukoto, Kampala, Uganda",
  phone: "+256 414 555 108",
  email: "connect@skssitemplekampala.org",
  darshanTimings: {
    morning: "5:30 AM - 11:00 AM",
    evening: "4:00 PM - 8:30 PM",
    aarti: [
      { time: "6:00 AM", name: "Mangala Aarti" },
      { time: "7:00 AM", name: "Shringar Aarti" },
      { time: "6:45 PM", name: "Sandhya Aarti" }
    ]
  },
  liveStreamUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" // Standard mock embeddable video url (using YouTube embed layout format)
};
