import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import OpeningCurtain from "../components/OpeningCurtain";
import InviteTemplate from "../components/InviteTemplate";
import { api, uploadToCloudinary } from "../lib/api";

const GALLERY_SLOTS = 3;
const createDefaultImageSetting = () => ({ x: 50, y: 50, zoom: 1 });
const COVER_FALLBACK = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80";
const ZOOM_STEP = 0.1;
const PAN_STEP = 4;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const defaultEvents = [
  { title: "Welcome Session", dateLabel: "15 Dec 2026, 11:00 AM", location: "Delhi", description: "Guest arrival and opening." },
  { title: "Main Event", dateLabel: "15 Dec 2026, 6:00 PM", location: "Delhi", description: "Main invite program." },
  { title: "After Party", dateLabel: "15 Dec 2026, 8:00 PM", location: "Delhi", description: "Food, music and celebration." }
];

const defaultForm = {
  groomName: "Rahul",
  brideName: "Neha",
  eventDate: "2026-12-15",
  venue: "Delhi",
  theme: "royal",
  email: "",
  coverImageUrl: "",
  galleryUrls: Array.from({ length: GALLERY_SLOTS }, () => ""),
  events: defaultEvents,
  imageFit: "cover",
  imagePosition: "center",
  imageSettings: {
    cover: createDefaultImageSetting(),
    gallery: Array.from({ length: GALLERY_SLOTS }, () => createDefaultImageSetting())
  }
};

export default function CreatePage() {
  const navigate = useNavigate();
  const [opened, setOpened] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(defaultForm);
  const [selectedImageTarget, setSelectedImageTarget] = useState("cover");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [modalEmail, setModalEmail] = useState("");

  const onChange = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const onEventChange = (idx, key, value) => {
    setForm((prev) => ({
      ...prev,
      events: prev.events.map((event, i) => (i === idx ? { ...event, [key]: value } : event))
    }));
  };

  const getSelectedImageSetting = () => {
    if (selectedImageTarget === "cover") {
      return form.imageSettings?.cover || createDefaultImageSetting();
    }
    const galleryIndex = Number(selectedImageTarget.replace("gallery-", ""));
    return form.imageSettings?.gallery?.[galleryIndex] || createDefaultImageSetting();
  };

  const getSelectedImageSrc = () => {
    if (selectedImageTarget === "cover") {
      return form.coverImageUrl || COVER_FALLBACK;
    }
    const galleryIndex = Number(selectedImageTarget.replace("gallery-", ""));
    return form.galleryUrls?.[galleryIndex] || "";
  };

  const updateSelectedImageSetting = (key, value) => {
    setForm((prev) => {
      if (selectedImageTarget === "cover") {
        return {
          ...prev,
          imageSettings: {
            ...prev.imageSettings,
            cover: { ...(prev.imageSettings?.cover || createDefaultImageSetting()), [key]: value }
          }
        };
      }

      const galleryIndex = Number(selectedImageTarget.replace("gallery-", ""));
      const nextGallerySettings = Array.from({ length: GALLERY_SLOTS }, (_, i) => {
        const existing = prev.imageSettings?.gallery?.[i];
        return existing ? { ...existing } : createDefaultImageSetting();
      });
      nextGallerySettings[galleryIndex] = {
        ...nextGallerySettings[galleryIndex],
        [key]: value
      };

      return {
        ...prev,
        imageSettings: {
          ...prev.imageSettings,
          gallery: nextGallerySettings
        }
      };
    });
  };

  const nudgeSelectedImage = (dx, dy) => {
    const current = getSelectedImageSetting();
    updateSelectedImageSetting("x", clamp(current.x + dx, 0, 100));
    updateSelectedImageSetting("y", clamp(current.y + dy, 0, 100));
  };

  const zoomSelectedImage = (delta) => {
    const current = getSelectedImageSetting();
    updateSelectedImageSetting("zoom", clamp(Number((current.zoom + delta).toFixed(2)), 1, 3));
  };

  const resetSelectedImage = () => {
    updateSelectedImageSetting("x", 50);
    updateSelectedImageSetting("y", 50);
    updateSelectedImageSetting("zoom", 1);
  };

  async function uploadCover(file) {
    setError("");
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError("Image should be under 5MB");

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      onChange("coverImageUrl", url);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  async function uploadGalleryAt(index, file) {
    setError("");
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError("Image should be under 5MB");

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm((prev) => {
        const nextGalleryUrls = Array.from({ length: GALLERY_SLOTS }, (_, i) => prev.galleryUrls?.[i] || "");
        nextGalleryUrls[index] = url;
        return { ...prev, galleryUrls: nextGalleryUrls };
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  function validateRequiredFields() {
    if (!form.groomName || !form.brideName || !form.eventDate || !form.venue) {
      setError("Please fill required fields");
      return false;
    }
    return true;
  }

  async function createInvite(emailToUse) {
    setError("");

    if (!EMAIL_PATTERN.test(emailToUse)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        email: emailToUse,
        galleryUrls: form.galleryUrls,
        events: form.events.filter((e) => e.title || e.dateLabel || e.location || e.description)
      };

      const saved = await api("/api/invitations/create", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      localStorage.setItem("inviteResult", JSON.stringify(saved));
      navigate(`/success?slug=${saved.slug}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setError("");
    if (!validateRequiredFields()) return;

    const emailToUse = (form.email || "").trim();
    if (!emailToUse) {
      setModalEmail("");
      setShowEmailModal(true);
      return;
    }

    await createInvite(emailToUse);
  }

  async function submitEmailModal() {
    const emailToUse = modalEmail.trim();
    if (!EMAIL_PATTERN.test(emailToUse)) {
      setError("Please enter a valid email address.");
      return;
    }

    onChange("email", emailToUse);
    setShowEmailModal(false);
    await createInvite(emailToUse);
  }

  return (
    <main className="min-h-screen px-4 py-5">
      {!opened && <OpeningCurtain onOpen={() => setOpened(true)} />}

      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/80">
          <button className="btn fixed right-4 top-4 z-[55]" onClick={() => setShowPreview(false)}>Close Preview</button>
          <div className="h-screen overflow-auto">
            <InviteTemplate invite={form} previewMode />
          </div>
        </div>
      )}

      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            className="fixed inset-0 z-[60] grid place-items-center bg-black/70 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="card w-full max-w-md p-5"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.24 }}
            >
              <p className="section-title">Delivery Email</p>
              <h3 className="mt-2 font-serif text-3xl text-wedding-gold">Receive Your Links</h3>
              <p className="mt-1 text-sm text-wedding-cream/75">
                Enter your email to receive your invitation link.
              </p>
              <div className="mt-4">
                <label className="label">Email Address</label>
                <input
                  className="input"
                  type="email"
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="tool-btn"
                  onClick={() => setShowEmailModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={submitEmailModal}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Continue"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="card p-5">
          <h1 className="font-serif text-3xl text-wedding-gold sm:text-4xl md:text-5xl">Create Invitation</h1>
          <p className="mt-1 text-wedding-cream/70">Everything updates instantly in the live preview on the right.</p>

          <div className="mt-5 grid gap-5">
            <div className="card grid gap-4 p-4">
              <p className="section-title">Basic Details</p>
              <label className="label">Groom Name *</label>
              <input className="input" value={form.groomName} onChange={(e) => onChange("groomName", e.target.value)} />
              <label className="label">Bride Name *</label>
              <input className="input" value={form.brideName} onChange={(e) => onChange("brideName", e.target.value)} />
              <label className="label">Event Date *</label>
              <input type="date" className="input" value={form.eventDate} onChange={(e) => onChange("eventDate", e.target.value)} />
              <label className="label">Venue *</label>
              <input className="input" value={form.venue} onChange={(e) => onChange("venue", e.target.value)} />
            </div>

            <div className="card grid gap-3 p-4">
              <p className="section-title">Photo Uploads</p>
              <label className="label">Cover Photo</label>
              <input className="input" type="file" accept="image/*" onChange={(e) => uploadCover(e.target.files?.[0])} />
              <label className="label">Gallery Image 1</label>
              <input className="input" type="file" accept="image/*" onChange={(e) => uploadGalleryAt(0, e.target.files?.[0])} />
              <label className="label">Gallery Image 2</label>
              <input className="input" type="file" accept="image/*" onChange={(e) => uploadGalleryAt(1, e.target.files?.[0])} />
              <label className="label">Gallery Image 3</label>
              <input className="input" type="file" accept="image/*" onChange={(e) => uploadGalleryAt(2, e.target.files?.[0])} />
            </div>

            <div className="card grid gap-3 p-4">
              <p className="section-title">Image Placement</p>
              <label className="label">Select Image</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`selector-btn ${selectedImageTarget === "cover" ? "selector-btn-active" : ""}`}
                  onClick={() => setSelectedImageTarget("cover")}
                >
                  Cover Photo
                </button>
                <button
                  type="button"
                  className={`selector-btn ${selectedImageTarget === "gallery-0" ? "selector-btn-active" : ""}`}
                  onClick={() => setSelectedImageTarget("gallery-0")}
                >
                  Gallery 1
                </button>
                <button
                  type="button"
                  className={`selector-btn ${selectedImageTarget === "gallery-1" ? "selector-btn-active" : ""}`}
                  onClick={() => setSelectedImageTarget("gallery-1")}
                >
                  Gallery 2
                </button>
                <button
                  type="button"
                  className={`selector-btn ${selectedImageTarget === "gallery-2" ? "selector-btn-active" : ""}`}
                  onClick={() => setSelectedImageTarget("gallery-2")}
                >
                  Gallery 3
                </button>
              </div>

              {selectedImageTarget !== "cover" && !getSelectedImageSrc() ? (
                <p className="rounded-xl border border-wedding-gold/25 bg-black/15 px-3 py-2 text-sm text-wedding-cream/70">
                  Upload this gallery image first, then adjust it.
                </p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-wedding-gold/25 bg-black/20 p-2">
                  <img
                    src={getSelectedImageSrc()}
                    alt="selected_preview"
                    className="h-36 w-full rounded-md object-cover"
                    style={{
                      objectPosition: `${getSelectedImageSetting().x}% ${getSelectedImageSetting().y}%`,
                      transform: `scale(${getSelectedImageSetting().zoom})`,
                      transformOrigin: "center center"
                    }}
                  />
                </div>
              )}

              <div className="grid gap-3 rounded-xl border border-wedding-gold/20 bg-black/10 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-wedding-cream/80">Zoom</span>
                  <div className="flex items-center gap-2">
                    <button type="button" className="tool-btn" onClick={() => zoomSelectedImage(-ZOOM_STEP)}>-</button>
                    <span className="w-16 text-center text-sm text-wedding-cream/85">{getSelectedImageSetting().zoom.toFixed(2)}x</span>
                    <button type="button" className="tool-btn" onClick={() => zoomSelectedImage(ZOOM_STEP)}>+</button>
                  </div>
                </div>

                <div className="grid place-items-center gap-2">
                  <button type="button" className="tool-btn" onClick={() => nudgeSelectedImage(0, -PAN_STEP)}>Up</button>
                  <div className="flex items-center gap-2">
                    <button type="button" className="tool-btn" onClick={() => nudgeSelectedImage(-PAN_STEP, 0)}>Left</button>
                    <button type="button" className="tool-btn" onClick={() => resetSelectedImage()}>Center</button>
                    <button type="button" className="tool-btn" onClick={() => nudgeSelectedImage(PAN_STEP, 0)}>Right</button>
                  </div>
                  <button type="button" className="tool-btn" onClick={() => nudgeSelectedImage(0, PAN_STEP)}>Down</button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-wedding-cream/70">X: {Math.round(getSelectedImageSetting().x)}% | Y: {Math.round(getSelectedImageSetting().y)}%</span>
                  <button type="button" className="text-xs uppercase tracking-[0.2em] text-wedding-gold/90" onClick={resetSelectedImage}>
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <p className="section-title">Events</p>
              <div className="grid gap-2">
                {form.events.slice(0, 4).map((event, index) => (
                  <div key={`event_${index}`} className="card p-3">
                    <input className="input mb-2" placeholder="Title" value={event.title} onChange={(e) => onEventChange(index, "title", e.target.value)} />
                    <input className="input mb-2" placeholder="Date/time" value={event.dateLabel} onChange={(e) => onEventChange(index, "dateLabel", e.target.value)} />
                    <input className="input mb-2" placeholder="Location" value={event.location} onChange={(e) => onEventChange(index, "location", e.target.value)} />
                    <input className="input" placeholder="Description" value={event.description} onChange={(e) => onEventChange(index, "description", e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-4">
              <label className="label">Email (required)</label>
              <input className="input" type="email" value={form.email} onChange={(e) => onChange("email", e.target.value)} />
              <p className="mt-2 text-xs text-wedding-cream/70">Your invitation link will be delivered to this email.</p>
            </div>
          </div>

          {error && <p className="mt-3 text-red-300">{error}</p>}

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn w-full sm:w-auto" onClick={() => setShowPreview(true)} disabled={uploading}>Preview Full Webpage</button>
            <button className="btn w-full sm:w-auto" onClick={handleGenerate} disabled={loading || uploading}>
              {loading ? "Generating..." : "Generate Invite Link"}
            </button>
          </div>
        </section>

        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card h-[68vh] overflow-hidden lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]"
        >
          <div className="border-b border-wedding-gold/25 px-4 py-3">
            <p className="text-xs tracking-[0.35em] text-wedding-gold/70">LIVE FULL PREVIEW</p>
            <p className="mt-1 text-xs text-wedding-cream/70">Scroll here to preview the complete invitation design.</p>
          </div>
          <div className="h-[calc(100%-64px)] overflow-y-auto">
            <InviteTemplate invite={form} previewMode />
          </div>
        </motion.aside>
      </div>
    </main>
  );
}
