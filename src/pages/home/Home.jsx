import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Van,
  MessageCircleCheck,
  HeartHandshake,
  Star,
  Mail,
  X,
} from "lucide-react";
import ShopPage from "./ShopPage";

const WHATSAPP_URL =
  "https://wa.me/2349134254444?text=Hi%20MK%20Finds!%20I%27d%20like%20to%20order.";

const p = {
  burgundy: "#6D213C",
  burgundyLight: "#8B2D4F",
  burgundyPale: "#F5E8EE",
  cream: "#FAF7F2",
  beige: "#F0EAE0",
  taupe: "#D6CDBE",
  offWhite: "#FDFBF8",
  charcoal: "#2C2C2A",
  muted: "#7A7570",
  softBrown: "#B09080",
};

/* ── Shared fade-up ── */
function FadeUp({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.68, delay, ease: [0.22, 1, 0.36, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ANNOUNCEMENT BAR*/
function AnnouncementBar() {
  const [closed, setClosed] = useState(false);

  const msg =
    "Same Day delivery on orders placed before 10am · Free shipping on orders ₦130k & Above (Anywhere in Nigeria)";

  if (closed) return null;

  return (
    <div
      style={{
        background: p.burgundy,
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        height: 38,
        display: "flex",
        alignItems: "center",
        paddingLeft: "1rem",
        paddingRight: "4.5rem", // creates space for X button
      }}
    >
      {/* Infinite Marquee */}
      <div className="announcement-track">
        <span>{msg}</span>
        <span>{msg}</span>
        <span>{msg}</span>
      </div>

      {/* Close Button */}
      <button
        onClick={() => setClosed(true)}
        aria-label="Close announcement"
        style={{
          position: "absolute",
          right: 20,
          top: "50%",
          transform: "translateY(-50%)",
          background: "rgba(255,255,255,0.12)",
          border: "none",
          width: 32,
          height: 23,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#000000",
          zIndex: 3,
          transition: "0.25s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.22)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.12)";
        }}
      >
        <X size={13} strokeWidth={2.5} />
      </button>

      <style>{`
        .announcement-track {
          display: flex;
          width: max-content;
          white-space: nowrap;
          animation: scroll-left 22s linear infinite;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        .announcement-track span {
          padding-right: 5rem;
        }

        @keyframes scroll-left {
          0% {
            transform: translateX(0%);
          }

          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

/* HERO  */
function Hero() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth <= 640,
  );

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <section
      style={{
        background: p.cream,
        padding: isMobile ? "1rem 1.25rem 0 1.25rem" : "1rem 3rem",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          gap: isMobile ? "1rem" : "2.5rem",
        }}
      >
        {/* LEFT — copy */}
        <div
          style={{
            flex: "1 1 0",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: isMobile ? "center" : "flex-start",
            textAlign: isMobile ? "center" : "left",
          }}
        >
          {/* <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            style={{
              display: "inline-block",
              fontSize: "0.62rem",
              fontWeight: 700,
              color: p.burgundy,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            Lifestyle brand · Lagos, Nigeria
          </motion.span> */}

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.72,
              delay: 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: isMobile ? "2rem" : "clamp(1.8rem, 3.8vw, 3rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              color: p.charcoal,
              margin: "0 0 0.6rem",
              letterSpacing: "-0.02em",
            }}
          >
            Simple Finds,{" "}
            <span style={{ color: p.burgundy }}>Better Living.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            style={{
              fontSize: isMobile ? "0.85rem" : "clamp(0.82rem, 1.5vw, 0.95rem)",
              color: p.muted,
              lineHeight: 1.7,
              margin: "0",
              maxWidth: isMobile ? "100%" : 420,
            }}
          >
            Thoughtfully sourced decor and lifestyle essentials for your home,
            workspace & everyday life.
          </motion.p>
        </div>

        {/* RIGHT — image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          style={{
            flex: isMobile ? "none" : "0 0 44%",
            width: isMobile ? "100%" : "44%",
            borderRadius: "8px",
            overflow: "hidden",
            aspectRatio: isMobile ? "18/5" : "5/3",
            maxHeight: isMobile ? "280px" : "180px",
            position: "relative",
          }}
        >
          <motion.img
            src="/homeimg1.png"
            alt="Aesthetic lifestyle finds"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.32) 0%, transparent 55%)",
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}

/* REVIEWS */
const reviews = [
  {
    name: "Chidinma O.",
    location: "Abuja",
    text: "I ordered the LED set and it arrived in 2 days! The quality is amazing and MK responds really fast on WhatsApp. Will definitely order again",
    stars: 5,
  },
  {
    name: "Tolu A.",
    location: "Lagos",
    text: "My room transformation is complete thanks to MK Finds. Everything looks exactly like the photos no disappointments!",
    stars: 5,
  },
  {
    name: "Funmi B.",
    location: "Port Harcourt",
    text: "The candle set smells incredible. My mum even asked where I got it Top tier curation, 10/10!",
    stars: 5,
  },
];

function Reviews() {
  return (
    <section
      style={{ background: p.cream, padding: "0 0 3rem 0", overflow: "hidden" }}
    >
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        {/* Title */}
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                color: p.burgundy,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              What They're Saying
            </span>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.4rem",
                fontWeight: 800,
                color: p.charcoal,
                marginTop: "0.3rem",
              }}
            >
              Customer Love
            </h2>
          </div>
        </FadeUp>

        {/* Marquee */}
        <div style={{ overflow: "hidden", position: "relative" }}>
          <div className="marquee">
            {[...reviews, ...reviews].map((r, i) => (
              <div
                key={i}
                style={{
                  flex: "0 0 auto",
                  background: "#fff",
                  border: `1px solid ${p.taupe}33`,
                  borderRadius: 12,
                  padding: "0.8rem 1rem",
                  marginRight: 12,
                  minWidth: 220,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                }}
              >
                {/* stars */}
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#F59E0B",
                    marginBottom: 6,
                  }}
                >
                  {"★".repeat(r.stars)}
                </div>

                {/* text */}
                <p
                  style={{
                    fontSize: "0.72rem",
                    color: p.charcoal,
                    lineHeight: 1.4,
                    fontStyle: "italic",
                    marginBottom: 8,
                  }}
                >
                  {r.text.slice(0, 90)}...
                </p>

                {/* name */}
                <div
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: p.charcoal,
                  }}
                >
                  — {r.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS animation */}
      <style>{`
        .marquee {
          display: flex;
          width: max-content;
          animation: scroll 30s linear infinite;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}

/* ROOT */
export default function HomePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, 'Helvetica Neue', sans-serif; background: #FAF7F2; -webkit-font-smoothing: antialiased; }
        html { scroll-behavior: smooth; }

        /* scrollbar hide for category tabs */
        .cat-scroll::-webkit-scrollbar { display: none; }

        /* ── HERO: side-by-side on all sizes, image shrinks on mobile ── */
        .hero-row {
          flex-direction: row !important;
          align-items: center;
        }
        .hero-img-wrap {
          flex: 0 0 42% !important;
          max-width: 42% !important;
        }

        /* product grid: 2 cols on mobile, 4 on desktop */
        .product-grid {
          grid-template-columns: repeat(2, 1fr) !important;
        }
        @media (min-width: 640px) {
          .product-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (min-width: 1024px) {
          .product-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .hero-img-wrap { flex: 0 0 44% !important; max-width: 44% !important; }
        }

        /* footer columns */
        .footer-inner { flex-direction: column; }
        @media (min-width: 640px) {
          .footer-inner { flex-direction: row; }
        }
      `}</style>
      <main>
        <Hero />
        <ShopPage />
        <Reviews />
      </main>
    </>
  );
}
