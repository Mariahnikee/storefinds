import React from "react";
import { Mail, MapPin, MessageCircle } from "lucide-react";

const palette = { charcoal: "#1f1f1f", softBrown: "#c7a17a", burgundy: "#6D213C", burgundyLight: "#8B2D4F" };
const WHATSAPP_URL = "https://wa.me/2349134254444";

function Footer() {
  return (
    <footer id="contact" style={{ background: palette.charcoal, color: "#fff", padding: "3.5rem 1.25rem 2rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "3rem", alignItems: "start", marginBottom: "2.5rem" }}>
          <div>
            <img src="/logo.png" alt="Shop MK Finds Logo" style={{ width: 80, height: "auto", marginBottom: "1rem", objectFit: "contain" }} />
            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.9, maxWidth: 320, margin: 0 }}>
              Curated aesthetic home decor and lifestyle finds for the modern Nigerian home.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: "1.4rem" }}>
              {[{ label: "Instagram", href: "https://www.instagram.com/storefinds?igsh=MTJuajF6cThsbTMxYw%3D%3D&utm_source=qr", icon: "/ig.png" }, { label: "TikTok", href: "https://www.tiktok.com/@storefinds", icon: "/tiktok.png" }, { label: "Facebook", href: "https://www.facebook.com/share/1BXLcV3aNX/?mibextid=wwXIfr", icon: "/fb.png" }].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s ease", textDecoration: "none" }}>
                  <img src={s.icon} alt={s.label} style={{ width: 17, height: 17, objectFit: "contain" }} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontWeight: 700, marginBottom: "1rem", fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Contact</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}><span style={{ opacity: 0.7 }}><MapPin size={15} /></span><span>Lagos, Nigeria</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}><span style={{ opacity: 0.7 }}><Mail size={15} /></span><span>storefinds@gmail.com</span></div>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.6, textDecoration: "none" }}><span style={{ opacity: 0.7 }}><MessageCircle size={15} /></span><span>WhatsApp: +234 913 425 4444</span></a>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.5rem", marginTop: "2rem", display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: 18, textAlign: "center" }}>
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>© 2026 Shop MK Finds · All rights reserved.</p>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>Simple Finds, Better Living.</p>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>Designed & Powered by <a href="https://www.techlumedigital.dpdns.org" target="_blank" rel="noopener noreferrer" style={{ color: palette.burgundyLight, textDecoration: "none", fontWeight: 600 }}>Techlume Digital</a></p>
        </div>
      </div>

      <style>{`@media (max-width: 768px) { .footer-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; } footer { padding-bottom: calc(7rem + env(safe-area-inset-bottom)) !important; } }`}</style>
    </footer>
  );
}

export default Footer;
