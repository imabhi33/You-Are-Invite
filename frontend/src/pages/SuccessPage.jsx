import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function SuccessPage() {
  const [search] = useSearchParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("inviteResult");
    if (raw) setResult(JSON.parse(raw));
  }, []);

  const slug = search.get("slug");
  const inviteUrl = result?.inviteUrl || (slug ? `${import.meta.env.VITE_APP_BASE_URL || "http://localhost:5173"}/${slug}` : "");
  const emailSent = result?.emailSent !== false;
  const emailError = result?.emailError;

  return (
    <main className="min-h-screen px-4 py-10">
      <section className="card mx-auto max-w-3xl p-8 text-center">
        <h1 className="font-script text-8xl text-wedding-gold">Invite Ready</h1>
        <p className="mt-2 text-wedding-cream/70">Save this link carefully</p>

        <div className="card mt-6 p-4 text-left">
          <code className="break-all text-wedding-cream/90">{inviteUrl || "No invite generated yet"}</code>
        </div>
        <p className={`mt-3 text-sm ${emailSent ? "text-emerald-300" : "text-yellow-200"}`}>
          {emailSent
            ? "Email sent successfully with invite and edit links."
            : (emailError || "Invite created, but email delivery failed.")}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button className="btn" onClick={() => inviteUrl && navigator.clipboard.writeText(inviteUrl)} disabled={!inviteUrl}>Copy Link</button>
          <Link to="/create" className="btn">Create Another</Link>
        </div>
      </section>
    </main>
  );
}
