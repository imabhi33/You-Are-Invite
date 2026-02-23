import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InviteTemplate from "../components/InviteTemplate";

export default function InvitePage() {
  const { slug } = useParams();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function run() {
      try {
        const base = import.meta.env.VITE_API_BASE_URL;
        const res = await fetch(`${base}/api/invitations/${slug}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Unable to load invite");
        setInvite(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [slug]);

  if (loading) return <main className="grid min-h-screen place-items-center text-wedding-gold">Loading...</main>;
  if (error) return <main className="grid min-h-screen place-items-center text-red-300">{error}</main>;

  return <InviteTemplate invite={invite} />;
}