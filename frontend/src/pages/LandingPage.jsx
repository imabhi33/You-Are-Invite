import { Link } from "react-router-dom";
import InviteTemplate from "../components/InviteTemplate";
import BrandLogo from "../components/BrandLogo";

const sampleInvite = {
  groomName: "Rahul",
  brideName: "Neha",
  eventDate: "2026-12-15",
  venue: "Delhi",
  coverImageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80",
  galleryUrls: [
    "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80"
  ],
  events: [
    { title: "Welcome Session", dateLabel: "14 Dec 2026, 11:00 AM", location: "Delhi", description: "Opening and guest greetings." },
    { title: "Main Event", dateLabel: "15 Dec 2026, 6:00 PM", location: "Delhi", description: "Main invite schedule." },
    { title: "After Party", dateLabel: "16 Dec 2026, 8:00 PM", location: "Delhi", description: "Music and refreshments." }
  ]
};

export default function LandingPage() {
  return (
    <main className="relative min-h-screen">
      <div className="fixed left-0 right-0 top-0 z-40 border-b border-wedding-gold/20 bg-[#2b0f0f]/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <BrandLogo />
          <Link to="/create" className="btn">Customize Now</Link>
        </div>
      </div>

      <div className="pt-16">
        <InviteTemplate invite={sampleInvite} previewMode />
      </div>
    </main>
  );
}
