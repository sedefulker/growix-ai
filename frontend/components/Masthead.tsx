"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TICKER_ITEMS = [
  { label: "TRENDYOL",          value: "2.4M Satıcı",  up: true  },
  { label: "HEPSİBURADA",       value: "1.1M Satıcı",  up: true  },
  { label: "N11",               value: "820K Satıcı",  up: false },
  { label: "TÜRKİYE E-TİCARET", value: "₺850 Milyar",  up: true  },
  { label: "GÜNLÜK SİPARİŞ",    value: "4.2M Adet",    up: true  },
  { label: "ORTALAMA SEPET",    value: "₺420",          up: false },
  { label: "İADE ORANI",        value: "%28",           up: false },
  { label: "AKTİF SATICI",      value: "500K+",         up: true  },
];

const DOUBLED = [...TICKER_ITEMS, ...TICKER_ITEMS];

export default function Masthead() {
  const pathname = usePathname();
  const now      = new Date();

  const dateStr = now.toLocaleDateString("tr-TR", {
    day: "2-digit", month: "long", year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("tr-TR", {
    hour: "2-digit", minute: "2-digit",
  });

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className="mh">
        {/* ── TOP BAR ── */}
        <div className="mh-top">
          <span className="mh-meta" aria-label="Tarih ve saat">
            {dateStr} · {timeStr}
          </span>
          <nav className="mh-nav" aria-label="Ana navigasyon">
            <Link
              href="/"
              className={`mh-link ${isActive("/") && !isActive("/dashboard") ? "mh-link--active" : ""}`}
            >
              Yeni Analiz
            </Link>
            <span className="mh-dot" aria-hidden="true">·</span>
            <Link
              href="/dashboard"
              className={`mh-link ${isActive("/dashboard") ? "mh-link--active" : ""}`}
            >
              Geçmiş Analizler
            </Link>
          </nav>
          <span className="mh-meta mh-meta--right" aria-hidden="true">
            TÜRKİYE · SATICI PLATFORMU
          </span>
        </div>

        {/* ── WORDMARK ── */}
        <div className="mh-brand" role="banner">
          <div className="mh-rule" aria-hidden="true" />
          <Link href="/" className="mh-wordmark" aria-label="Growix — Ana Sayfa">
            Grow<em>ix</em>
          </Link>
          <div className="mh-rule" aria-hidden="true" />
        </div>

        {/* ── TAGLINE ── */}
        <p className="mh-tagline">
          E-Ticaret Satıcıları İçin Yapay Zeka Destekli Karar İstihbaratı
        </p>

        {/* ── TICKER ── */}
        <div className="mh-ticker" role="marquee" aria-label="Piyasa verileri">
          <span className="mh-ticker-badge" aria-hidden="true">CANLI</span>
          <div className="mh-ticker-vp">
            <div className="mh-ticker-track" aria-hidden="true">
              {DOUBLED.map((item, i) => (
                <span key={i} className="mh-ticker-item">
                  {item.label}
                  <span className={item.up ? "mh-up" : "mh-dn"}>
                    {item.up ? "▲" : "▼"} {item.value}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <style>{`
        .mh {
          border-bottom: 3px double var(--border);
          background: var(--paper);
          position: sticky;
          top: 0;
          z-index: 100;
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
        .mh-meta--right { text-align: right; }

        .mh-nav {
          display: flex;
          align-items: center;
          gap: 10px;
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
          transition: color 150ms, border-color 150ms;
        }
        .mh-link:hover        { color: var(--red); }
        .mh-link--active      { color: var(--red); border-color: var(--red); }
        .mh-dot               { color: var(--border); font-size: 14px; }

        /* WORDMARK */
        .mh-brand {
          display: flex;
          align-items: center;
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
          text-decoration: none;
          transition: color 150ms;
        }
        .mh-wordmark:hover { color: var(--ink-2); }
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
        .mh-ticker-badge {
          background: var(--red);
          color: #fff;
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.12em;
          padding: 0 14px;
          height: 100%;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .mh-ticker-vp    { overflow: hidden; flex: 1; }
        .mh-ticker-track {
          display: flex;
          gap: 56px;
          padding-left: 32px;
          white-space: nowrap;
          animation: mh-scroll 36s linear infinite;
        }
        @keyframes mh-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .mh-ticker-item {
          font-family: var(--font-mono);
          font-size: 10px;
          color: #8A8278;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 0.04em;
        }
        .mh-up { color: #4E9B5E; }
        .mh-dn { color: #C85244; }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .mh-top    { padding: 10px 24px; }
          .mh-brand  { padding: 14px 24px 12px; gap: 20px; }
          .mh-tagline { display: none; }
          .mh-wordmark { font-size: 40px; }
          .mh-meta--right { display: none; }
        }
        @media (max-width: 600px) {
          .mh-meta:first-child { display: none; }
          .mh-link { padding: 4px 6px; font-size: 9px; }
          .mh-wordmark { font-size: 32px; }
        }
      `}</style>
    </>
  );
}