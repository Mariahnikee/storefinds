import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { X, Menu, Search, UserRound } from "lucide-react";
import client from "../../client";

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

function AnnouncementBar() {
  const [closed, setClosed] = useState(false);
  const msg =
    "Same Day delivery on orders placed before 10am · Free shipping on orders ₦100k & Above (Anywhere in Nigeria)";
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
        paddingRight: "4.5rem",
      }}
    >
      <div className="announcement-track">
        <span>{msg}</span>
        <span>{msg}</span>
        <span>{msg}</span>
      </div>

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
          color: "#fff",
          zIndex: 3,
          transition: "0.25s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(255,255,255,0.22)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
        }
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
        .announcement-track span { padding-right: 5rem; }
        @keyframes scroll-left {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      client
        .fetch(
          `*[_type == "shopMkProduct" && title match $q + "*"]{
            title, slug, price, "imageUrl": images[0].asset->url
          }[0...6]`,
          { q: query },
        )
        .then((data) => {
          setResults(data);
          setOpen(true);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={ref}
      style={{ position: "relative", width: "100%", maxWidth: 420 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: p.beige,
          borderRadius: 999,
          padding: "0 1rem",
          gap: "0.5rem",
          border: `1px solid ${p.taupe}`,
          transition: "border 0.2s",
        }}
      >
        <Search size={15} color={p.muted} strokeWidth={2} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          style={{
            background: "none",
            border: "none",
            outline: "none",
            width: "100%",
            padding: "0.6rem 0",
            fontSize: "0.8rem",
            color: p.charcoal,
          }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: p.muted,
              display: "flex",
            }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* DROPDOWN */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              left: 0,
              right: 0,
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
              border: `1px solid ${p.taupe}55`,
              overflow: "visible",
              zIndex: 9999,
            }}
          >
            {loading && (
              <p
                style={{
                  padding: "1rem",
                  fontSize: "0.8rem",
                  color: p.muted,
                  textAlign: "center",
                }}
              >
                Searching…
              </p>
            )}

            {!loading && results.length === 0 && (
              <p
                style={{
                  padding: "1rem",
                  fontSize: "0.8rem",
                  color: p.muted,
                  textAlign: "center",
                }}
              >
                No products found for "{query}"
              </p>
            )}

            {!loading &&
              results.map((item) => (
                <div
                  key={item.slug.current}
                  onClick={() => {
                    navigate(`/product/${item.slug.current}`);
                    setQuery("");
                    setOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.65rem 1rem",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = p.beige)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      objectFit: "cover",
                      background: p.beige,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: p.charcoal,
                        margin: 0,
                      }}
                    >
                      {item.title}
                    </p>
                    <p
                      style={{
                        fontSize: "0.78rem",
                        color: p.burgundy,
                        fontWeight: 700,
                        margin: 0,
                      }}
                    >
                      ₦{item.price?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SocialLinks() {
  const links = [
    {
      label: "Instagram",
      href: "https://www.instagram.com/storefinds?igsh=MTJuajF6cThsbTMxYw%3D%3D&utm_source=qr",
      icon: (
        <img
          src="/ig.png"
          alt="Instagram"
          width="16"
          height="16"
          style={{ display: "block" }}
        />
      ),
    },
    {
      label: "Tik Tok",
      href: "https://www.tiktok.com/@storefinds",
      icon: (
        <img
          src="/tiktok.png"
          alt="TikTok"
          width="16"
          height="16"
          style={{ display: "block" }}
        />
      ),
    },
    {
      label: "Facebook",
      href: "https://www.facebook.com/share/1BXLcV3aNX/?mibextid=wwXIfr",
      icon: (
        <img
          src="/fb.png"
          alt="Facebook"
          width="20"
          height="20"
          style={{ display: "block" }}
        />
      ),
    },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: p.beige,
            border: `1px solid ${p.taupe}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: p.burgundy,
            transition: "0.2s ease",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = p.burgundy;
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.borderColor = p.burgundy;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = p.beige;
            e.currentTarget.style.color = p.burgundy;
            e.currentTarget.style.borderColor = p.taupe;
          }}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}

export default function Navbar() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <>
      <AnnouncementBar />

      <nav
        style={{
          background: "#fff",
          borderBottom: `1px solid ${p.taupe}55`,
          position: "sticky",
          top: 0,
          zIndex: 1000,
          overflow: "visible",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 1.25rem",
            height: 66,
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
          }}
        >
          {/* LOGO */}
          <Link
            to="/"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.4rem",
              fontWeight: 800,
              color: p.burgundy,
              textDecoration: "none",
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <img
              src="/logo.png"
              alt="Shop MK Finds Logo"
              style={{
                width: 80,
                height: "auto",
                margin: "1rem 0",
                objectFit: "contain",
              }}
            />
          </Link>

          {/* SEARCH — desktop */}
          <div
            className="desktop-search"
            style={{ flex: 1, display: "flex", justifyContent: "center" }}
          >
            <SearchBar />
          </div>

          {/* SOCIAL — desktop */}
          <div className="desktop-social" style={{ flexShrink: 0 }}>
            <SocialLinks />
          </div>
          <Link to="/login" aria-label="Your account" title="Your account" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: p.burgundy, textDecoration: "none", fontSize: "0.8rem", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>
            <UserRound size={18} />
            <span>Account</span>
          </Link>

          {/* MOBILE ICONS */}
          <div
  className="mobile-icons"
  style={{
    display: "none",
    alignItems: "center",
    gap: "0.4rem",
    marginLeft: "auto",
  }}
>
  <button
    onClick={() => setMobileSearchOpen((v) => !v)}
    style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      color: p.charcoal,
      display: "flex",
    }}
  >
    <Search size={20} />
  </button>

  <SocialLinks />
  <Link to="/login" aria-label="Your account" title="Your account" style={{ width: 34, height: 34, borderRadius: "50%", background: p.beige, border: `1px solid ${p.taupe}`, display: "flex", alignItems: "center", justifyContent: "center", color: p.burgundy, flexShrink: 0 }}>
    <UserRound size={18} />
  </Link>
</div>
        </div>

        {/* MOBILE SEARCH BAR */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                borderTop: `1px solid ${p.taupe}55`,
                padding: "0.75rem 1.25rem",
                position: "relative",
                zIndex: 9999,
              }}
            >
              <SearchBar />
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          @media (max-width: 768px) {
            .desktop-search { display: none !important; }
            .desktop-social { display: none !important; }
            .mobile-icons { display: flex !important; }
          }
        `}</style>
      </nav>
    </>
  );
}
