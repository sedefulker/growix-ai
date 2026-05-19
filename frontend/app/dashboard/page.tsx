"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import { getAllListings } from "@/lib/api";
import type { ContentGenerationResponse } from "@/types";

export default function Dashboard() {
  const [listings, setListings] = useState<ContentGenerationResponse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    getAllListings()
      .then(setListings)
      .catch((e) => setError(e.message || "Veriler yüklenemedi."))
      .finally(() => setLoading(false));
  }, []);

  // ── derived stats ───────────────────────────────────────────────────────────
  const profitable  = listings.filter((l) => l.net_profit > 0).length;
  const avgMargin   = listings.length
    ? (listings.reduce((s, l) => s + (l.profit_margin || 0), 0) / listings.length).toFixed(1)
    : "—";
  const totalProfit = listings.reduce((s, l) => s + (l.net_profit || 0), 0);

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .db-shell { max-width: 1280px; margin: 0 auto; padding: 52px 48px 100px; }

        /* HEADER */
        .db-head {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: end;
          padding-bottom: 20px;
          border-bottom: 3px double var(--border);
          margin-bottom: 2px;
          gap: 20px;
        }
        .db-kicker { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--red); margin-bottom: 8px; }
        .db-title  { font-family: var(--font-display); font-size: 52px; font-weight: 600; letter-spacing: -2px; line-height: 1; }
        .db-sub    { font-family: var(--font-mono); font-size: 10px; color: var(--ink-4); letter-spacing: 0.06em; margin-top: 10px; }

        .btn-new {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--paper);
          background: var(--ink);
          text-decoration: none;
          padding: 13px 22px;
          display: inline-block;
          transition: background 0.14s;
          white-space: nowrap;
        }
        .btn-new:hover { background: var(--red); }

        /* SUMMARY STRIP */
        .sum-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border: 1px solid var(--border);
          border-top: none;
          margin-bottom: 36px;
        }
        .sum-cell  { padding: 16px 20px; border-right: 1px solid var(--border); }
        .sum-cell:last-child { border-right: none; }
        .sum-k { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-4); margin-bottom: 6px; }
        .sum-v { font-family: var(--font-display); font-size: 28px; font-weight: 600; color: var(--ink); line-height: 1; }
        .sum-v.accent { color: var(--red); }

        /* TABLE */
        .db-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid var(--border);
        }
        .db-table thead th {
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink-3);
          padding: 10px 16px;
          text-align: left;
          background: var(--paper-2);
          border-bottom: 2px solid var(--border);
          border-right: 1px solid var(--border-2);
          white-space: nowrap;
        }
        .db-table thead th:last-child { border-right: none; }

        .db-table tbody tr {
          border-bottom: 1px solid var(--border-2);
          transition: background 0.1s;
        }
        .db-table tbody tr:last-child { border-bottom: none; }
        .db-table tbody tr:hover td  { background: var(--paper-2); }

        .db-table td {
          padding: 13px 16px;
          border-right: 1px solid var(--border-2);
          vertical-align: middle;
        }
        .db-table td:last-child { border-right: none; }

        .td-id      { font-family: var(--font-mono); font-size: 11px; color: var(--ink-4); font-weight: 500; }
        .td-title   { font-family: var(--font-display); font-size: 16px; font-weight: 600; color: var(--ink); line-height: 1.3; max-width: 340px; }
        .td-plat    { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-3); }
        .td-price   { font-family: var(--font-mono); font-size: 13px; font-weight: 500; color: var(--ink); white-space: nowrap; }
        .td-profit  { font-family: var(--font-mono); font-size: 13px; font-weight: 500; white-space: nowrap; }
        .td-profit.pos { color: var(--green); }
        .td-profit.neg { color: var(--red); }
        .td-margin  { font-family: var(--font-mono); font-size: 12px; color: var(--ink-3); }

        .status-pill {
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 3px 8px;
          display: inline-block;
          white-space: nowrap;
        }
        .status-pill.ok  { background: var(--green-dim); color: var(--green); }
        .status-pill.bad { background: var(--red-dim);   color: var(--red);   }

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

        /* EMPTY / ERROR */
        .state-box { padding: 80px 40px; text-align: center; border: 1px solid var(--border); }
        .state-title { font-family: var(--font-display); font-size: 28px; font-weight: 600; color: var(--ink-3); margin-bottom: 10px; }
        .state-body  { font-family: var(--font-mono); font-size: 11px; color: var(--ink-4); letter-spacing: 0.06em; }

        /* RESPONSIVE */
        @media (max-width: 1100px) {
          .db-shell  { padding: 36px 32px 80px; }
          .sum-strip { grid-template-columns: 1fr 1fr; }
          .sum-cell:nth-child(2) { border-right: none; }
          .sum-cell:nth-child(3) { border-top: 1px solid var(--border); }
          .sum-cell:nth-child(4) { border-top: 1px solid var(--border); border-right: none; }
          .db-table  { display: block; overflow-x: auto; }
        }
        @media (max-width: 720px) {
          .db-shell  { padding: 24px 20px 60px; }
          .db-head   { grid-template-columns: 1fr; gap: 20px; }
          .db-title  { font-size: 36px; }
          .sum-strip { grid-template-columns: 1fr; }
          .sum-cell  { border-right: none; border-bottom: 1px solid var(--border); }
        }
      `}</style>

      <Masthead />

      <main className="db-shell">
        {/* HEADER */}
        <div className="db-head">
          <div>
            <p className="db-kicker">Analiz Merkezi</p>
            <h1 className="db-title">Geçmiş<br />Analizler</h1>
            <p className="db-sub">
              Sistem tarafından işlenen tüm kâr projeksiyonları ve içerik raporları.
            </p>
          </div>
          <Link href="/" className="btn-new">+ Yeni Analiz Başlat</Link>
        </div>

        {/* SUMMARY */}
        {!loading && !error && listings.length > 0 && (
          <div className="sum-strip">
            {[
              { k: "Toplam Analiz",       v: String(listings.length), a: false },
              { k: "Kârlı Ürün",          v: String(profitable),      a: true  },
              { k: "Ort. Kâr Marjı",      v: `%${avgMargin}`,         a: false },
              { k: "Toplam Kâr Potans.",  v: `${totalProfit.toFixed(0)} ₺`, a: true },
            ].map((s) => (
              <div key={s.k} className="sum-cell">
                <p className="sum-k">{s.k}</p>
                <p className={`sum-v ${s.a ? "accent" : ""}`}>{s.v}</p>
              </div>
            ))}
          </div>
        )}

        {/* SECTION RULE */}
        <div className="section-rule">
          <div className="section-rule-line" />
          <span className="section-rule-label">Analiz Kaydı</span>
          <div className="section-rule-line" />
        </div>

        {/* STATES */}
        {loading ? (
          <div className="state-box">
            <p className="state-title">Yükleniyor</p>
            <p className="state-body">Veritabanı taranıyor...</p>
          </div>
        ) : error ? (
          <div className="state-box err-bar" role="alert" style={{ textAlign: "left" }}>
            <p className="state-title" style={{ color: "var(--red)", fontSize: 18 }}>Bağlantı Hatası</p>
            <p className="state-body">{error}</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="state-box">
            <p className="state-title">Henüz Analiz Yok</p>
            <p className="state-body">İlk analizinizi oluşturmak için <Link href="/" style={{ color: "var(--red)" }}>ana sayfaya</Link> gidin.</p>
          </div>
        ) : (
          <table className="db-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Ürün Başlığı</th>
                <th>Platform</th>
                <th>Önr. Fiyat</th>
                <th>Net Kâr</th>
                <th>Marj</th>
                <th>Durum</th>
                <th>Detay</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((item) => (
                <tr key={item.id}>
                  <td><span className="td-id">#{item.id}</span></td>
                  <td><div className="td-title">{item.seo_title}</div></td>
                  <td><span className="td-plat">{item.platform}</span></td>
                  <td><span className="td-price">{item.suggested_price} ₺</span></td>
                  <td>
                    <span className={`td-profit ${item.net_profit > 0 ? "pos" : "neg"}`}>
                      {item.net_profit > 0 ? "+" : ""}{item.net_profit} ₺
                    </span>
                  </td>
                  <td><span className="td-margin">%{item.profit_margin}</span></td>
                  <td>
                    <span className={`status-pill ${item.net_profit > 0 ? "ok" : "bad"}`}>
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