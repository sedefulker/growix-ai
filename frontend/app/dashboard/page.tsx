"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllListings } from "@/lib/api";
import type { ContentGenerationResponse } from "@/types";

export default function Dashboard() {
  const [listings, setListings] = useState<ContentGenerationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    getAllListings()
      .then(setListings)
      .catch((e) => setError(e.message || "Veriler yüklenemedi."))
      .finally(() => setIsLoading(false));
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });

  const totalProfit = listings.reduce((s, l) => s + (l.net_profit || 0), 0);
  const avgMargin   = listings.length
    ? (listings.reduce((s, l) => s + (l.profit_margin || 0), 0) / listings.length).toFixed(1)
    : "—";
  const profitable  = listings.filter((l) => l.net_profit > 0).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&family=IBM+Plex+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

        :root {
          --paper:    #F4EFE4;
          --paper-2:  #EDE7D8;
          --paper-3:  #E4DCCA;
          --ink:      #0F0E0C;
          --ink-2:    #2C2A26;
          --ink-3:    #6B6760;
          --ink-4:    #A8A49C;
          --red:      #B5341A;
          --red-dim:  #F5E8E4;
          --gold:     #8B6914;
          --green:    #2A6B3A;
          --green-dim:#E8F4EC;
          --border:   #C8C2B4;
          --border-2: #DDD8CE;
          --font-display: 'Playfair Display', serif;
          --font-mono:    'IBM Plex Mono', monospace;
          --font-body:    'Plus Jakarta Sans', sans-serif;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--font-body); background: var(--paper); color: var(--ink); -webkit-font-smoothing: antialiased; }

        /* MASTHEAD */
        .masthead { border-bottom: 3px double var(--border); padding: 0 48px; }
        .masthead-top { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-2); }
        .masthead-meta { font-family: var(--font-mono); font-size: 10px; color: var(--ink-4); letter-spacing: 0.06em; }
        .masthead-nav { display: flex; gap: 24px; }
        .masthead-nav a { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); text-decoration: none; transition: color 0.12s; }
        .masthead-nav a:hover, .masthead-nav a.active { color: var(--red); }
        .masthead-title-row { display: flex; align-items: center; justify-content: center; padding: 20px 0 16px; gap: 32px; }
        .masthead-rule { flex: 1; height: 1px; background: var(--border); }
        .masthead-wordmark { font-family: var(--font-display); font-size: 52px; font-weight: 900; letter-spacing: -2px; color: var(--ink); line-height: 1; }
        .masthead-wordmark span { color: var(--red); font-style: italic; }
        .masthead-tagline { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-3); text-align: center; padding-bottom: 12px; border-bottom: 1px solid var(--border-2); }

        /* TICKER */
        .ticker { border-bottom: 1px solid var(--border); background: var(--ink); overflow: hidden; height: 28px; display: flex; align-items: center; }
        .ticker-label { background: var(--red); color: #fff; font-family: var(--font-mono); font-size: 9px; font-weight: 600; letter-spacing: 0.1em; padding: 0 12px; height: 100%; display: flex; align-items: center; flex-shrink: 0; }
        .ticker-track { display: flex; gap: 48px; animation: ticker-run 30s linear infinite; white-space: nowrap; padding-left: 32px; }
        @keyframes ticker-run { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ticker-item { font-family: var(--font-mono); font-size: 10px; color: #C8C2B4; display: flex; align-items: center; gap: 8px; letter-spacing: 0.04em; }
        .t-up { color: #5BA85A; } .t-dn { color: #D45C4A; }

        /* PAGE */
        .shell { max-width: 1320px; margin: 0 auto; padding: 48px 48px 80px; }

        /* DASHBOARD HEADER */
        .dash-head { display: grid; grid-template-columns: 1fr auto; align-items: end; margin-bottom: 0; padding-bottom: 20px; border-bottom: 3px double var(--border); }
        .dash-kicker { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--red); margin-bottom: 8px; }
        .dash-title { font-family: var(--font-display); font-size: 48px; font-weight: 900; letter-spacing: -1.5px; line-height: 1; }
        .dash-sub { font-family: var(--font-mono); font-size: 11px; color: var(--ink-3); letter-spacing: 0.04em; margin-top: 10px; }
        .btn-new { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--paper); background: var(--ink); text-decoration: none; padding: 12px 20px; display: inline-block; transition: background 0.12s; }
        .btn-new:hover { background: var(--red); }

        /* SUMMARY STRIP */
        .summary-strip { display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid var(--border); border-top: none; margin-bottom: 32px; }
        .sum-cell { padding: 16px 20px; border-right: 1px solid var(--border); }
        .sum-cell:last-child { border-right: none; }
        .sum-k { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-4); margin-bottom: 6px; }
        .sum-v { font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--ink); line-height: 1; }
        .sum-v.red { color: var(--red); }

        /* SECTION RULE */
        .section-rule { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .sr-line { flex: 1; height: 1px; background: var(--border); }
        .sr-label { font-family: var(--font-mono); font-size: 9px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-3); }

        /* LISTING TABLE */
        .listing-table { width: 100%; border-collapse: collapse; border: 1px solid var(--border); }
        .listing-table th {
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink-3);
          padding: 10px 16px;
          text-align: left;
          background: var(--paper-2);
          border-bottom: 1px solid var(--border);
          border-right: 1px solid var(--border-2);
          white-space: nowrap;
        }
        .listing-table th:last-child { border-right: none; }
        .listing-table tr { border-bottom: 1px solid var(--border-2); transition: background 0.1s; }
        .listing-table tr:last-child { border-bottom: none; }
        .listing-table tr:hover td { background: var(--paper-2); }
        .listing-table td {
          padding: 14px 16px;
          border-right: 1px solid var(--border-2);
          vertical-align: middle;
        }
        .listing-table td:last-child { border-right: none; }

        .td-id { font-family: var(--font-mono); font-size: 11px; color: var(--ink-4); font-weight: 500; }
        .td-title { font-family: var(--font-display); font-size: 15px; font-weight: 600; color: var(--ink); line-height: 1.3; max-width: 360px; }
        .td-platform { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-3); }
        .td-price { font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: var(--ink); }
        .td-profit { font-family: var(--font-mono); font-size: 13px; font-weight: 600; }
        .td-profit.pos { color: var(--green); }
        .td-profit.neg { color: var(--red); }
        .td-margin { font-family: var(--font-mono); font-size: 12px; color: var(--ink-3); }

        .pill {
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 3px 8px;
          display: inline-block;
        }
        .pill-profit { background: var(--green-dim); color: var(--green); }
        .pill-loss   { background: var(--red-dim);   color: var(--red);   }

        .td-action a {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--red);
          text-decoration: none;
          white-space: nowrap;
        }
        .td-action a:hover { text-decoration: underline; }

        /* EMPTY & LOADING */
        .state-box { padding: 60px; text-align: center; border: 1px solid var(--border); }
        .state-box-title { font-family: var(--font-display); font-size: 24px; font-weight: 700; color: var(--ink-3); margin-bottom: 12px; }
        .state-box-sub { font-family: var(--font-mono); font-size: 11px; color: var(--ink-4); letter-spacing: 0.06em; }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
          .shell { padding: 32px 24px 60px; }
          .masthead { padding: 0 24px; }
          .summary-strip { grid-template-columns: 1fr 1fr; }
          .sum-cell:nth-child(2) { border-right: none; }
          .sum-cell:nth-child(3) { border-top: 1px solid var(--border); }
          .sum-cell:nth-child(4) { border-top: 1px solid var(--border); border-right: none; }
          .listing-table { display: block; overflow-x: auto; }
        }
        @media (max-width: 640px) {
          .masthead-wordmark { font-size: 38px; }
          .dash-head { grid-template-columns: 1fr; gap: 16px; }
          .dash-title { font-size: 36px; }
          .summary-strip { grid-template-columns: 1fr; }
          .sum-cell { border-right: none; border-bottom: 1px solid var(--border); }
        }
      `}</style>

      {/* MASTHEAD */}
      <header className="masthead">
        <div className="masthead-top">
          <span className="masthead-meta">{dateStr} · TÜRKİYE</span>
          <nav className="masthead-nav">
            <Link href="/">Yeni Analiz</Link>
            <Link href="/dashboard" className="active">Geçmiş</Link>
          </nav>
          <span className="masthead-meta">SATICI İSTİHBARAT PLATFORMU</span>
        </div>
        <div className="masthead-title-row">
          <div className="masthead-rule" />
          <div className="masthead-wordmark">Grow<span>ix</span></div>
          <div className="masthead-rule" />
        </div>
        <p className="masthead-tagline">E-Ticaret Satıcıları İçin Yapay Zeka Destekli Karar İstihbaratı</p>
      </header>

      {/* TICKER */}
      <div className="ticker">
        <span className="ticker-label">CANLI</span>
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div className="ticker-track">
            {[
              { l: "TRENDYOL", v: "2.4M", d: "up" }, { l: "HEPSİBURADA", v: "1.1M", d: "up" },
              { l: "N11", v: "820K", d: "dn" }, { l: "TÜRKİYE E-TİCARET", v: "₺850B", d: "up" },
              { l: "TRENDYOL", v: "2.4M", d: "up" }, { l: "HEPSİBURADA", v: "1.1M", d: "up" },
              { l: "N11", v: "820K", d: "dn" }, { l: "TÜRKİYE E-TİCARET", v: "₺850B", d: "up" },
            ].map((item, i) => (
              <span key={i} className="ticker-item">
                {item.l} <span className={item.d === "up" ? "t-up" : "t-dn"}>
                  {item.d === "up" ? "▲" : "▼"} {item.v}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <main className="shell">
        {/* HEADER */}
        <div className="dash-head">
          <div>
            <div className="dash-kicker">Analiz Merkezi</div>
            <h1 className="dash-title">Geçmiş Analizler</h1>
            <p className="dash-sub">Sistem tarafından işlenen tüm kâr projeksiyonları ve içerik raporları.</p>
          </div>
          <Link href="/" className="btn-new">+ Yeni Analiz</Link>
        </div>

        {/* SUMMARY */}
        {!isLoading && !error && listings.length > 0 && (
          <div className="summary-strip">
            {[
              { k: "Toplam Analiz",      v: String(listings.length),         cls: ""    },
              { k: "Kârlı Ürün",         v: String(profitable),              cls: "red" },
              { k: "Ort. Kâr Marjı",     v: `%${avgMargin}`,                cls: ""    },
              { k: "Toplam Kâr Potans.", v: `${totalProfit.toFixed(0)} ₺`,  cls: "red" },
            ].map((s) => (
              <div key={s.k} className="sum-cell">
                <div className="sum-k">{s.k}</div>
                <div className={`sum-v ${s.cls}`}>{s.v}</div>
              </div>
            ))}
          </div>
        )}

        {/* TABLE */}
        <div className="section-rule">
          <div className="sr-line" />
          <span className="sr-label">Analiz Kaydı</span>
          <div className="sr-line" />
        </div>

        {isLoading ? (
          <div className="state-box">
            <div className="state-box-title">Kayıtlar Yükleniyor</div>
            <div className="state-box-sub">Veritabanı taranıyor...</div>
          </div>
        ) : error ? (
          <div className="state-box" style={{ borderColor: "var(--red)", background: "var(--red-dim)" }}>
            <div className="state-box-title" style={{ color: "var(--red)" }}>Bağlantı Hatası</div>
            <div className="state-box-sub">{error}</div>
          </div>
        ) : listings.length === 0 ? (
          <div className="state-box">
            <div className="state-box-title">Henüz Analiz Yok</div>
            <div className="state-box-sub">İlk analizinizi oluşturmak için ana sayfaya gidin.</div>
          </div>
        ) : (
          <table className="listing-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Ürün Başlığı</th>
                <th>Platform</th>
                <th>Önr. Fiyat</th>
                <th>Net Kâr</th>
                <th>Kâr Marjı</th>
                <th>Durum</th>
                <th>Detay</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((item) => (
                <tr key={item.id}>
                  <td><span className="td-id">#{item.id}</span></td>
                  <td><div className="td-title">{item.seo_title}</div></td>
                  <td><span className="td-platform">{item.platform}</span></td>
                  <td><span className="td-price">{item.suggested_price} ₺</span></td>
                  <td>
                    <span className={`td-profit ${item.net_profit > 0 ? "pos" : "neg"}`}>
                      {item.net_profit > 0 ? "+" : ""}{item.net_profit} ₺
                    </span>
                  </td>
                  <td><span className="td-margin">%{item.profit_margin}</span></td>
                  <td>
                    <span className={`pill ${item.net_profit > 0 ? "pill-profit" : "pill-loss"}`}>
                      {item.net_profit > 0 ? "Kârlı" : "Zararlı"}
                    </span>
                  </td>
                  <td className="td-action">
                    <Link href={`/dashboard/${item.id}`}>Raporu Gör →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  );
}