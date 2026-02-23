import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { formatDate, parseTargetDate } from "../lib/date";

const createDefaultImageSetting = () => ({ x: 50, y: 50, zoom: 1 });
const COVER_FALLBACK = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80";

function normalizeImageSetting(setting) {
  return {
    x: typeof setting?.x === "number" ? setting.x : 50,
    y: typeof setting?.y === "number" ? setting.y : 50,
    zoom: typeof setting?.zoom === "number" ? setting.zoom : 1
  };
}

function PetalsEffect() {
  const [petals, setPetals] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPetals((prev) => [
        ...prev.slice(-35),
        {
          id: `${Date.now()}_${Math.random()}`,
          left: `${Math.random() * 100}%`,
          size: `${Math.random() * 9 + 5}px`,
          duration: `${Math.random() * 8 + 10}s`,
          delay: `${Math.random() * 2}s`
        }
      ]);
    }, 380);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="petal"
          style={{
            left: petal.left,
            width: petal.size,
            height: petal.size,
            animationDuration: petal.duration,
            animationDelay: petal.delay
          }}
        />
      ))}
    </div>
  );
}

function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({});
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    function tick() {
      const parsedTarget = parseTargetDate(targetDate);
      if (!parsedTarget || Number.isNaN(parsedTarget.getTime())) {
        setExpired(true);
        setTimeLeft({});
        return;
      }

      const diff = parsedTarget.getTime() - Date.now();
      if (diff <= 0) {
        setExpired(true);
        setTimeLeft({});
        return;
      }

      setExpired(false);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const keys = Object.keys(timeLeft);
  return (
    <div className="mx-auto grid max-w-xl grid-cols-2 gap-4 md:grid-cols-4">
      {keys.length === 0 ? (
        <p className="col-span-full text-center font-serif text-4xl text-wedding-gold">
          {expired ? "Event date has passed" : "The Event Is Here"}
        </p>
      ) : (
        keys.map((key) => (
          <div key={key} className="card p-3 text-center">
            <p className="m-0 text-3xl font-bold text-wedding-gold">{String(timeLeft[key]).padStart(2, "0")}</p>
            <p className="m-0 text-xs uppercase tracking-[0.25em] text-wedding-cream/70">{key}</p>
          </div>
        ))
      )}
    </div>
  );
}

function InviteGallery({ galleryUrls = [], gallerySettings = [] }) {
  const fallback = [
    "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80"
  ];
  const images = Array.from({ length: 3 }, (_, idx) => galleryUrls?.[idx] || fallback[idx]);

  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-xs uppercase tracking-[0.35em] text-wedding-gold/70">Memory Lane</p>
        <h2 className="text-center font-script text-5xl text-wedding-gold sm:text-6xl md:text-7xl">Our Moments</h2>

        <div className="mt-8 flex flex-wrap items-start justify-center gap-6">
          {images.map((src, idx) => {
            const setting = normalizeImageSetting(gallerySettings[idx]);
            return (
            <motion.div
              key={`${src}_${idx}`}
              initial={{ opacity: 0, y: 35, rotate: idx % 2 ? 2 : -2 }}
              whileInView={{ opacity: 1, y: 0, rotate: idx % 2 ? 1 : -1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.1 }}
              className="bg-white p-3 shadow-2xl"
              style={{ width: idx === 1 ? "min(90vw,430px)" : "min(90vw,320px)" }}
            >
              <div className="h-[390px] w-full overflow-hidden bg-black/25">
                <img
                  src={src}
                  alt="memory"
                  className="h-full w-full object-cover"
                  style={{
                    objectPosition: `${setting.x}% ${setting.y}%`,
                    transform: `scale(${setting.zoom})`,
                    transformOrigin: "center center"
                  }}
                />
              </div>
            </motion.div>
          );
          })}
        </div>
      </div>
    </section>
  );
}

function EventsTimeline({ events = [], fallbackVenue }) {
  const items = events?.length
    ? events
    : [
        {
          title: "Main Event",
          dateLabel: "6:00 PM",
          location: fallbackVenue,
          description: "Featured program"
        },
        {
          title: "Celebration",
          dateLabel: "8:00 PM",
          location: fallbackVenue,
          description: "Music and refreshments"
        }
      ];

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-script text-5xl text-wedding-gold sm:text-6xl md:text-7xl">Event Schedule</h2>
        <div className="relative mt-10">
          <div className="absolute left-1/2 top-0 hidden h-full w-[1px] -translate-x-1/2 bg-wedding-gold/30 md:block" />
          <div className="space-y-6">
            {items.slice(0, 4).map((event, i) => (
              <motion.div
                key={`${event.title}_${i}`}
                initial={{ opacity: 0, x: i % 2 ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`card p-5 md:w-[46%] ${i % 2 ? "md:ml-auto" : ""}`}
              >
                <h3 className="font-serif text-3xl text-wedding-gold sm:text-4xl">{event.title || "Event"}</h3>
                <p className="text-lg text-wedding-cream">{event.dateLabel || "Time TBA"}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-wedding-cream/60">{event.location || fallbackVenue}</p>
                <p className="mt-2 text-wedding-cream/70">{event.description || "Celebration"}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function VenueMap({ venue }) {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(venue || "Event Venue")}&output=embed`;

  return (
    <section className="px-4 py-16">
      <div className="card mx-auto max-w-6xl p-5">
        <h2 className="text-center font-script text-5xl text-wedding-gold sm:text-6xl">Venue</h2>
        <p className="text-center uppercase tracking-[0.28em] text-wedding-cream/70">{venue}</p>
        <div className="mt-4 overflow-hidden rounded-2xl border border-wedding-gold/35">
          <iframe title="map" src={mapSrc} width="100%" height="340" loading="lazy" className="border-0" />
        </div>
      </div>
    </section>
  );
}

export default function InviteTemplate({ invite, previewMode = false }) {
  const dateLabel = useMemo(() => formatDate(invite?.eventDate), [invite?.eventDate]);
  const heroImage = invite?.coverImageUrl || COVER_FALLBACK;
  const coverSetting = normalizeImageSetting(invite?.imageSettings?.cover || createDefaultImageSetting());
  const gallerySettings = Array.from({ length: 3 }, (_, idx) =>
    normalizeImageSetting(invite?.imageSettings?.gallery?.[idx] || createDefaultImageSetting())
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-wedding-dark text-wedding-cream">
      <PetalsEffect />

      <section className="relative grid min-h-[88vh] place-items-center px-4 py-20">
        <div className="absolute inset-0 opacity-25">
          <img
            src={heroImage}
            alt="cover"
            className="h-full w-full grayscale"
            style={{
              objectFit: "cover",
              objectPosition: `${coverSetting.x}% ${coverSetting.y}%`,
              transform: `scale(${coverSetting.zoom})`,
              transformOrigin: "center center"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-wedding-dark" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-20 text-center"
        >
          <p className="text-xs tracking-[0.5em] text-wedding-gold/80">YOU ARE INVITED</p>
          <h1 className="font-script text-[clamp(64px,11vw,140px)] leading-[0.8] text-wedding-gold">{invite?.groomName || "Rahul"}</h1>
          <h1 className="font-script text-[clamp(64px,11vw,140px)] leading-[0.8] text-[#f4dfb0]">& {invite?.brideName || "Neha"}</h1>
          <p className="mt-5 font-serif text-5xl text-wedding-gold">{dateLabel}</p>
          <p className="mt-2 text-xl uppercase tracking-[0.35em]">{invite?.venue || "Venue"}</p>
        </motion.div>
      </section>

      <section className="px-4 py-16">
        <h2 className="mb-6 text-center font-script text-5xl text-wedding-gold sm:text-6xl md:text-7xl">Countdown</h2>
        <Countdown targetDate={invite?.eventDate} />
      </section>

      <InviteGallery
        galleryUrls={invite?.galleryUrls}
        gallerySettings={gallerySettings}
      />
      <EventsTimeline events={invite?.events} fallbackVenue={invite?.venue} />
      <VenueMap venue={invite?.venue} />

      {previewMode && (
        <div className="fixed bottom-4 right-4 z-30 rounded-full border border-wedding-gold/40 bg-wedding-dark/60 px-3 py-1 text-sm text-wedding-cream/90 backdrop-blur">
          Preview Mode
        </div>
      )}
    </div>
  );
}
