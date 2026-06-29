export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  avatarUrl: string;
  rating: number;
}

export const mockTestimonials: Testimonial[] = [
  {
    id: "test-1",
    name: "Dr. Arvind Subramanian",
    role: "Lifetime Member",
    text: "The Sri Radhe Krishna Mandir ERP has revolutionized how my family connects with the temple. From booking annual sevas to downloading tax exemptions, the experience is incredibly seamless and elegant. Truly a model for modern spiritual administration.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    rating: 5
  },
  {
    id: "test-2",
    name: "Meenakshi Iyengar",
    role: "Regular Devotee",
    text: "Even while traveling abroad, I can join the live Darshan and sponsor a Pooja for my children's birthdays. The system is easy to use, responsive, and the digital receipts are generated instantly. May the Lord bless this team.",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    rating: 5
  },
  {
    id: "test-3",
    name: "Pranav Goenka",
    role: "Donor & Supporter",
    text: "Booking the Radhe Krishna Hall for my daughter's wedding was very stress-free. The availability calendar is transparent, the deposit tracking is clear, and the staff are helpful. Outstanding platform design!",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    rating: 5
  }
];
