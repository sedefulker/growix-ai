"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import { getListingById } from "@/lib/api";
import type { ContentGenerationResponse } from "@/types";

type ToneKey = "sincere" | "professional" : "youthful";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ListingDetail({ params }: PageProps) {
  const [data, setData]     = useState<ContentGenerationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tone, setTone]     = useState<ToneKey>("sincere");
  const [copied, setCopied] = useState<string | null>(null);

  const { id } = use(params);

  useEffect(() => {
    if (!id) return;
    getListingById(Number(id))
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const activeDesc = data
    ? tone === "sincere"
      ? data.tone_sincere
      : tone === "professional"
      ? data.tone_professional
      : data.tone_youthful
    : "";

  const dateStr = new Date().toLocaleDateString("tr-TR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <>
      <style>{`
        .det-shell { max-width: 1060px; margin: 0 auto; padding: 48px 48px 100px; }

        /* BREADCRUMB */
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 36px;
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--ink-4);
          letter-spacing: 0.06em;
        }
        .breadcrumb a   { color: var(--ink-3); text-decoration: none; }
        .breadcrumb a:hover { color: var(--red); }
        .bc-sep { color: var(--border); }

        /* ARTICLE HEADER */
        .art-head {
          margin-bottom: 28px;
          padding-bottom: 24px;
          border-bottom: 3px double var(--border);
        }
        .art-kicker {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--red);
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .art-kicker-rule { flex: 1; height: 1px; background: var(--red); opacity: 0.2; }
        .art-title {
          font-family: var(--font-display);
          font-size: clamp(28px, 3.8vw, 46px);
          font-weight: 600;
          letter-spacing: -1px;
          line-height: 1.1;
          color: var(--ink);
          margin-bottom: 18px;
        }
        .art-byline {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 20px;
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--ink-4);
          letter-spacing: 0.06em;
        }
        .art-byline-sep { color: var(--border); }

        /* FIN STRIP */
        .fin-strip { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid var(--border); margin-bottom: 2px; }
        .fin-cell  { padding: 18px 22px; border-right: 1px solid var(--border); }
        .fin-cell:last-child { border-right: none; }
        .fin-k { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-4); margin-bottom: 8px; }
        .fin-v { font-family: var(--font-display); font-size: 36px; font-weight: 600; color: var(--red); line-height: 1; }
        .fin-v.neutral { color: var(--ink); }

        /* LOGIC BAR */
        .logic-bar {
          border: 1px solid var(--border);
          border-left: 3px solid var(--gold);
          border-top: none;
          background: var(--gold-dim);
          padding: 14px 18px;
          margin-bottom: 24px;
        }
        .logic-k { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold); margin-bottom: 6px; }
        .logic-v { font-size: 13px; font-style: italic; font-weight: 300; color: var(--ink-2); line-height: 1.7; }

        /* TWO COL BODY */
        .body-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
        .body-full { grid-column: 1/-1; }

        /* BREAKDOWN */
        .breakdown-table { width: 100%; border-collapse: collapse; }
        .breakdown-table tr { border-bottom: 1px solid var(--border-2); }
        .breakdown-table tr:last-child { border-bottom: none; }
        .breakdown-table td { padding: 11px 0; font-size: 13px; }
        .breakdown-table td:last-child { text-align: right; font-family: var(--font-mono); font-size: 13px; font-weight: 500; }
        .breakdown-table .total-row td { font-weight: 600; border-top: 2px solid var(--ink); padding-top: 13px; }
        .breakdown-table .total-row td:first-child { color: var(--ink); }
        .breakdown-table .total-row td:last-child  { color: var(--green); }
        .breakdown-table .neg td:last-child { color: var(--red); }

        .seo-title-text { font-family: var(--font-display); font-size: 20px; font-weight: 600; line-height: 1.35; color: var(--ink); }
        .body-text      { font-size: 13.5px; font-weight: 300; line-height: 1.85; color: var(--ink-2); }
        .tags-wrap      { display: flex; flex-wrap: wrap; gap: 7px; }

        /* FOOTER */
        .det-footer {
          margin-top: 32px;
          padding: 14px 0;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .det-footer a { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; transition: color 0.12s; }
        .det-footer a.back { color: var(--ink-3); }
        .det-footer a.back:hover { color: var(--ink); }
        .det-footer a.fwd  { color: var(--red); }
        .det-footer a.fwd:hover  { text-decoration: underline; }

        /* STATES */
        .state-box { padding: 80px; text-align: center; }
        .state-title { font-family: var(--font-display); font-size: 28px; font-weight: 600; color: var(--ink-3); }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .det-shell { padding: 32px 24px 80px; }
          .fin-strip  { grid-template-columns: 1fr; }
          .fin-cell   { border-right: none; border-bottom: 1px solid var(--border); }
          .body-grid  { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .art-title  { font-size: 26px; }
          .art-byline { gap: 10px; flex-direction: column; align-items: flex-start; }
          .art-byline-sep { display: none; }
        }
      `}</style>

      <Masthead />

      <main className="det-shell">
        {loading ? (
          <div className="state-box"><p className="state-title">Rapor Yükleniyor...</p></div>
        ) : !data ? (
          <div className="state-box"><p className="state-title">Rapor Bulunamadı</p></div>
        ) : (
          <>
            {/* BREADCRUMB */}
            <nav className="breadcrumb" aria-label="Sayfa konumu">
              <Link href="/">Ana Sayfa</Link>
              <span className="bc-sep" aria-hidden="true">/</span>
              <Link href="/dashboard">Geçmiş Analizler</Link>
              <span className="bc-sep" aria-hidden="true">/</span>
              <span>Rapor #{data.id}</span>
            </nav>

            {/* ARTICLE HEADER */}
            <div className="art-head">
              <div className="art-kicker">
                <span>{data.platform?.toUpperCase()} Pazar Yeri Analizi</span>
                <div className="art-kicker-rule" />
                <span>Rapor #{data.id}</span>
              </div>
              <h1 className="art-title">{data.seo_title}</h1>
              <div className="art-byline">
                <span>Growix AI · Otomatik Üretildi</span>
                <span className="art-byline-sep" aria-hidden="true">·</span>
                <span>{dateStr}</span>
                <span className="art-byline-sep" aria-hidden="true">·</span>
                <span>Net Kâr: {data.net_profit > 0 ? "+" : ""}{data.net_profit} ₺ / Adet</span>
              </div>
            </div>

            {/* FIN STRIP */}
            <div className="fin-strip">
              <div className="fin-cell">
                <p className="fin-k">Önerilen Liste Fiyatı</p>
                <p className="fin-v">{data.suggested_price} ₺</p>
              </div>
              <div className="fin-cell">
                <p className="fin-k">Birim Net Kâr</p>
                <p className={`fin-v ${data.net_profit <= 0 ? "neutral" : ""}`}>{data.net_profit} ₺</p>
              </div>
              <div className="fin-cell">
                <p className="fin-k">Net Kâr Marjı</p>
                <p className={`fin-v ${data.net_profit <= 0 ? "neutral" : ""}`}>%{data.profit_margin}</p>
              </div>
            </div>

            {/* LOGIC */}
            <div className="logic-bar">
              <p className="logic-k">Yapay Zeka Fiyatlandırma Analizi</p>
              <p className="logic-v">{data.pricing_logic}</p>
            </div>

            {/* BODY */}
            <div className="body-grid">
              {/* BREAKDOWN */}
              <div className="block">
                <div className="block-head">
                  <span className="mono-label">Finansal Röntgen</span>
                </div>
                <div className="block-body">
                  <table className="breakdown-table">
                    <tbody>
                      <tr>
                        <td>Ürün Ham Maliyeti</td>
                        <td>{data.cost_price} ₺</td>
                      </tr>
                      <tr className="neg">
                        <td>Platform Komisyonu</td>
                        <td>−{data.commission_amount} ₺</td>
                      </tr>
                      <tr className="neg">
                        <td>Kargo Gideri</td>
                        <td>−{data.cargo_cost} ₺</td>
                      </tr>
                      <tr className="total-row">
                        <td>Satıcıya Kalan (Net)</td>
                        <td>{data.net_profit} ₺</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TAGS */}
              <div className="block">
                <div className="block-head">
                  <span className="mono-label">SEO Etiketleri</span>
                  <button
                    className="copy-btn"
                    data-copied={copied === "tags" ? "" : undefined}
                    onClick={() => copyText(data.tags.join(", "), "tags")}
                  >
                    {copied === "tags" ? "Kopyalandı" : "Kopyala"}
                  </button>
                </div>
                <div className="block-body">
                  <div className="tags-wrap">
                    {data.tags.map((tag) => (
                      <span key={tag} className="tag-chip">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* SEO TITLE */}
              <div className="block body-full">
                <div className="block-head">
                  <span className="mono-label">SEO Başlığı</span>
                  <button
                    className="copy-btn"
                    data-copied={copied === "title" ? "" : undefined}
                    onClick={() => copyText(data.seo_title, "title")}
                  >
                    {copied === "title" ? "Kopyalandı" : "Kopyala"}
                  </button>
                </div>
                <div className="block-body">
                  <p className="seo-title-text">{data.seo_title}</p>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="block body-full">
                <div className="block-head">
                  <span className="mono-label">Satış Açıklaması</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="tone-tabs">
                      {(["sincere", "professional", "youthful"] as ToneKey[]).map((t) => (
                        <button key={t} className={`tone-tab ${tone === t ? "active" : ""}`} onClick={() => setTone(t)}>
                          {t === "sincere" ? "Samimi" : t === "professional" ? "Kurumsal" : "Dinamik"}
                        </button>
                      ))}
                    </div>
                    <button
                      className="copy-btn"
                      data-copied={copied === "desc" ? "" : undefined}
                      onClick={() => copyText(activeDesc, "desc")}
                    >
                      {copied === "desc" ? "Kopyalandı" : "Kopyala"}
                    </button>
                  </div>
                </div>
                <div className="block-body">
                  <p className="body-text">{activeDesc}</p>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="det-footer">
              <Link href="/dashboard" className="back">← Tüm Analizler</Link>
              <Link href="/" className="fwd">Yeni Analiz Oluştur →</Link>
            </div>
          </>
        )}
      </main>
    </>
  );
}