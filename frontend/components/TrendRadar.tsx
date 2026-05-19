"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TICKER_ITEMS = [
  { label: "TRENDYOL",          value: "2.4M Satıcı",  dir: "up" },
  { label: "HEPSİBURADA",       value: "1.1M Satıcı",  dir: "up" },
  { label: "N11",               value: "820K Satıcı",  dir: "dn" },
  { label: "TÜRKİYE E-TİCARET", value: "₺850 Milyar",  dir: "up" },
  { label: "GÜNLÜK SİPARİŞ",    value: "4.2M Adet",    dir: "up" },
  { label: "ORTALAMA SEPET",    value: "₺420",          dir: "dn" },
  { label: "İADE ORANI",        value: "%8.2",          dir: "dn" },
  { label: "AKTİF SATICI",      value: "500K+",         dir: "up" },
];

const DOUBLED = [...TICKER_ITEMS, ...TICKER_ITEMS];

export default function Masthead() {
  const pathname = usePathname();
  const now      = new Date();
  const dateStr  = now.toLocaleDateString("tr-TR", {
    day: "2-digit", month: "long", year: "numeric",
  });
  const timeStr  = now.toLocaleTimeString("tr-TR", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <header className="mh-root">
      {/* ── TOP BAR ── */}
      <div className="mh-top">
        <span className="mh-meta">{dateStr} · {timeStr}</span>

        <nav className="mh-nav" aria-label="Ana navigasyon">
          <Link href="/"          className={`mh-link ${pathname === "/"          ? "mh-link-active" : ""}`}>Yeni Analiz</Link>
          <span className="mh-nav-sep" aria-hidden="true">·</span>
          <Link href="/dashboard" className={`mh-link ${pathname === "/dashboard" ? "mh-link-active" : ""}`}>Geçmiş Analizler</Link>
        </nav>

        <span className="mh-meta">TÜRKİYE · SATICI PLATFORMU</span>
      </div>

      {/* ── WORDMARK ── */}
      <div className="mh-brand-row" role="banner">
        <div className="mh-rule" />
        <div className="mh-wordmark">
          Grow<em>ix</em>
        </div>
        <div className="mh-rule" />
      </div>

      {/* ── TAGLINE ── */}
      <p className="mh-tagline">
        E-Ticaret Satıcıları İçin Yapay Zeka Destekli Karar İstihbaratı
      </p>

      {/* ── TICKER ── */}
      <div className="mh-ticker" aria-hidden="true">
        <span className="mh-ticker-label">CANLI</span>
        <div className="mh-ticker-viewport">
          <div className="mh-ticker-track">
            {DOUBLED.map((item, i) => (
              <span key={i} className="mh-ticker-item">
                {item.label}
                <span className={item.dir === "up" ? "mh-up" : "mh-dn"}>
                  {item.dir === "up" ? "▲" : "▼"} {item.value}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .mh-root {
          border-bottom: 3px double var(--border);
          background: var(--paper);
        }

        /* TOP BAR */
        .mh-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 48px;
          border-bottom: 1px solid var(--border-2);
        }
        .mh-meta {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--ink-4);
          letter-spacing: 0.06em;
        }
        .mh-nav {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .mh-link {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-3);
          text-decoration: none;
          padding: 4px 10px;
          border: 1px solid transparent;
          transition: color 0.12s, border-color 0.12s;
        }
        .mh-link:hover { color: var(--red); }
        .mh-link-active {
          color: var(--red);
          border-color: var(--red);
        }
        .mh-nav-sep { color: var(--border); font-size: 12px; }

        /* WORDMARK */
        .mh-brand-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 32px;
          padding: 18px 48px 14px;
        }
        .mh-rule { flex: 1; height: 1px; background: var(--border); }
        .mh-wordmark {
          font-family: var(--font-display);
          font-size: 56px;
          font-weight: 700;
          letter-spacing: -2px;
          color: var(--ink);
          line-height: 1;
        }
        .mh-wordmark em { font-style: italic; color: var(--red); }

        /* TAGLINE */
        .mh-tagline {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ink-4);
          text-align: center;
          padding: 0 48px 12px;
          border-bottom: 1px solid var(--border-2);
        }

        /* TICKER */
        .mh-ticker {
          background: var(--ink);
          height: 28px;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        .mh-ticker-label {
          background: var(--red);
          color: #fff;
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.1em;
          padding: 0 14px;
          height: 100%;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .mh-ticker-viewport { overflow: hidden; flex: 1; }
        .mh-ticker-track {
          display: flex;
          gap: 56px;
          animation: mh-scroll 32s linear infinite;
          white-space: nowrap;
          padding-left: 32px;
        }
        @keyframes mh-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .mh-ticker-item {
          font-family: var(--font-mono);
          font-size: 10px;
          color: #9E998F;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 0.04em;
        }
        .mh-up { color: #5BA85A; }
        .mh-dn { color: #D45C4A; }

        @media (max-width: 900px) {
          .mh-top    { padding: 10px 24px; }
          .mh-brand-row { padding: 14px 24px 12px; gap: 20px; }
          .mh-tagline   { padding: 0 24px 10px; display: none; }
          .mh-wordmark  { font-size: 40px; }
          .mh-meta:last-child { display: none; }
        }
        @media (max-width: 600px) {
          .mh-meta:first-child { display: none; }
          .mh-nav { gap: 8px; }
          .mh-link { padding: 4px 6px; font-size: 9px; }
          .mh-wordmark { font-size: 32px; }
        }
      `}</style>
    </header>
  );
}