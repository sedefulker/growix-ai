"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getListingById } from "@/lib/api";
import type { ContentGenerationResponse } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ListingDetail({ params }: PageProps) {
  const [data, setData]         = useState<ContentGenerationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTone, setActiveTone] = useState<"sincere" | "professional" | "youthful">("sincere");
  const [copiedKey, setCopiedKey]   = useState<string | null>(null);

  const { id } = use(params);

  useEffect(() => {
    if (!id) return;
    getListingById(Number(id))
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const displayDescription = data
    ? activeTone === "sincere"
      ? data.tone_sincere
      : activeTone === "professional"
      ? data.tone_professional
      : data.tone_youthful
    : "";

  const now = new Date();
  const dateStr = now.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });

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
        .masthead-nav a:hover { color: var(--red); }
        .masthead-title-row { display: flex; align-items: center; justify-content: center; padding: 20px 0 16px; gap: 32px; }
        .masthead-rule { flex: 1; height: 1px; background: var(--border); }
        .masthead-wordmark { font-family: var(--font-display); font-size: 52px; font-weight: 900; letter-spacing: -2px; color: var(--ink); line-height: 1; }
        .masthead-wordmark span { color: var(--red); font-style: italic; }
        .masthead-tagline { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-3); text-align: center; padding-bottom: 12px; border-bottom: 1px solid var(--border-2); }

        /* SHELL */
        .shell { max-width: 1060px; margin: 0 auto; padding: 48px 48px 100px; }

        /* BREADCRUMB */
        .breadcrumb { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; font-family: var(--font-mono); font-size: 10px; color: var(--ink-4); letter-spacing: 0.06em; }
        .breadcrumb a { color: var(--ink-3); text-decoration: none; }
        .breadcrumb a:hover { color: var(--red); }
        .breadcrumb-sep { color: var(--border); }

        /* ARTICLE HEADER */
        .article-head { margin-bottom: 32px; padding-bottom: 28px; border-bottom: 3px double var(--border); }
        .article-kicker { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--red); margin-bottom: 14px; display: flex; align-items: center; gap: 12px; }
        .kicker-rule { flex: 1; height: 1px; background: var(--red); opacity: 0.3; }
        .article-title { font-family: var(--font-display); font-size: clamp(28px, 3.5vw, 44px); font-weight: 900; letter-spacing: -1px; line-height: 1.12; color: var(--ink); margin-bottom: 20px; }
        .article-byline { display: flex; align-items: center; gap: 24px; font-family: var(--font-mono); font-size: 10px; color: var(--ink-4); letter-spacing: 0.06em; }

        /* FIN STRIP */
        .fin-strip { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid var(--border); margin-bottom: 2px; }
        .fin-cell { padding: 18px 22px; border-right: 1px solid var(--border); }
        .fin-cell:last-child { border-right: none; }
        .fin-k { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-4); margin-bottom: 8px; }
        .fin-v { font-family: var(--font-display); font-size: 34px; font-weight: 800; color: var(--red); line-height: 1; }
        .fin-v.neutral { color: var(--ink); }

        /* ARTICLE BODY — 2 col */
        .article-body { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-top: 24px; }
        .article-body-full { grid-column: 1/-1; }

        /* BREAKDOWN */
        .breakdown { border: 1px solid var(--border); }
        .breakdown-head { padding: 10px 16px; border-bottom: 1px solid var(--border); background: var(--paper-2); display: flex; align-items: center; justify-content: space-between; }
        .breakdown-label { font-family: var(--font-mono); font-size: 9px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); }
        .breakdown-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--border-2); }
        .breakdown-row:last-child { border-bottom: none; }
        .br-key { font-size: 13px; color: var(--ink-2); font-weight: 400; }
        .br-val { font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: var(--ink); }
        .br-val.pos { color: var(--green); }
        .br-val.neg { color: var(--red); }
        .br-total { background: var(--ink); }
        .br-total .br-key { color: var(--paper-2); font-weight: 600; font-size: 12px; }
        .br-total .br-val { color: var(--paper); }

        /* CONTENT CARD */
        .content-card { border: 1px solid var(--border); }
        .content-head { padding: 10px 16px; border-bottom: 1px solid var(--border); background: var(--paper-2); display: flex; align-items: center; justify-content: space-between; }
        .content-label { font-family: var(--font-mono); font-size: 9px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); }
        .content-body { padding: 16px; }
        .content-copy { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-4); background: transparent; border: 1px solid var(--border); padding: 3px 8px; cursor: pointer; transition: color 0.12s, border-color 0.12s; }
        .content-copy:hover { color: var(--red); border-color: var(--red); }
        .content-copy.done { color: var(--gold); border-color: var(--gold); }

        .seo-title { font-family: var(--font-display); font-size: 20px; font-weight: 700; line-height: 1.3; color: var(--ink); }

        /* TONE */
        .tone-row { display: flex; gap: 2px; margin-bottom: 14px; }
        .tone-btn { flex: 1; padding: 7px; font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; background: var(--paper-2); color: var(--ink-4); border: 1px solid var(--border); cursor: pointer; transition: all 0.12s; }
        .tone-btn.on { background: var(--ink); color: var(--paper); border-color: var(--ink); }
        .body-text { font-size: 13px; line-height: 1.85; color: var(--ink-2); font-weight: 300; }

        /* TAGS */
        .tags-row { display: flex; flex-wrap: wrap; gap: 6px; }
        .tag-chip { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.06em; color: var(--ink-3); background: var(--paper-2); border: 1px solid var(--border); padding: 4px 10px; }

        /* LOGIC */
        .logic-box { border: 1px solid var(--border); border-left: 3px solid var(--gold); background: var(--gold-dim, #FBF7ED); padding: 16px 20px; margin-top: 2px; }
        .logic-k { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; }
        .logic-v { font-size: 13px; font-style: italic; color: var(--ink-2); line-height: 1.7; font-weight: 300; }

        /* STATE */
        .state-box { padding: 80px; text-align: center; }
        .state-title { font-family: var(--font-display); font-size: 28px; color: var(--ink-3); }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .shell { padding: 32px 24px 80px; }
          .masthead { padding: 0 24px; }
          .fin-strip { grid-template-columns: 1fr; }
          .fin-cell { border-right: none; border-bottom: 1px solid var(--border); }
          .article-body { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .masthead-wordmark { font-size: 38px; }
          .article-title { font-size: 26px; }
        }
      `}</style>

      {/* MASTHEAD */}
      <header className="masthead">
        <div className="masthead-top">
          <span className="masthead-meta">{dateStr} · TÜRKİYE</span>
          <nav className="masthead-nav">
            <Link href="/">Yeni Analiz</Link>
            <Link href="/dashboard">Geçmiş</Link>
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

      <main className="shell">
        {isLoading ? (
          <div className="state-box">
            <div className="state-title">Rapor Yükleniyor...</div>
          </div>
        ) : !data ? (
          <div className="state-box">
            <div className="state-title">Rapor Bulunamadı</div>
          </div>
        ) : (
          <>
            {/* BREADCRUMB */}
            <div className="breadcrumb">
              <Link href="/">Ana Sayfa</Link>
              <span className="breadcrumb-sep">/</span>
              <Link href="/dashboard">Geçmiş Analizler</Link>
              <span className="breadcrumb-sep">/</span>
              <span>Rapor #{data.id}</span>
            </div>

            {/* ARTICLE HEADER */}
            <div className="article-head">
              <div className="article-kicker">
                <span>{data.platform?.toUpperCase()} Pazar Yeri Analizi</span>
                <div className="kicker-rule" />
                <span>Rapor #{data.id}</span>
              </div>
              <h1 className="article-title">{data.seo_title}</h1>
              <div className="article-byline">
                <span>Growix AI · Otomatik Üretildi</span>
                <span>{dateStr}</span>
                <span>Net Kâr: {data.net_profit > 0 ? "+" : ""}{data.net_profit} ₺ / Adet</span>
              </div>
            </div>

            {/* FIN STRIP */}
            <div className="fin-strip">
              <div className="fin-cell">
                <div className="fin-k">Önerilen Liste Fiyatı</div>
                <div className="fin-v">{data.suggested_price} ₺</div>
              </div>
              <div className="fin-cell">
                <div className="fin-k">Birim Net Kâr</div>
                <div className={`fin-v ${data.net_profit <= 0 ? "neutral" : ""}`}>{data.net_profit} ₺</div>
              </div>
              <div className="fin-cell">
                <div className="fin-k">Net Kâr Marjı</div>
                <div className={`fin-v ${data.net_profit <= 0 ? "neutral" : ""}`}>%{data.profit_margin}</div>
              </div>
            </div>

            {/* LOGIC */}
            <div className="logic-box">
              <div className="logic-k">Yapay Zeka Fiyatlandırma Analizi</div>
              <div className="logic-v">{data.pricing_logic}</div>
            </div>

            {/* ARTICLE BODY */}
            <div className="article-body" style={{ marginTop: 24 }}>
              {/* BREAKDOWN */}
              <div className="breakdown">
                <div className="breakdown-head">
                  <span className="breakdown-label">Finansal Röntgen</span>
                </div>
                {[
                  { k: "Ürün Ham Maliyeti",      v: `${data.cost_price} ₺`,       cls: "" },
                  { k: "Platform Komisyonu",      v: `-${data.commission_amount} ₺`,cls: "neg" },
                  { k: "Kargo Gideri",            v: `-${data.cargo_cost} ₺`,       cls: "neg" },
                ].map((r) => (
                  <div key={r.k} className="breakdown-row">
                    <span className="br-key">{r.k}</span>
                    <span className={`br-val ${r.cls}`}>{r.v}</span>
                  </div>
                ))}
                <div className="breakdown-row br-total">
                  <span className="br-key">Satıcıya Kalan (Net)</span>
                  <span className="br-val">{data.net_profit} ₺</span>
                </div>
              </div>

              {/* TAGS */}
              <div className="content-card">
                <div className="content-head">
                  <span className="content-label">SEO Etiketleri</span>
                  <button
                    className={`content-copy ${copiedKey === "tags" ? "done" : ""}`}
                    onClick={() => copy(data.tags.join(", "), "tags")}
                  >
                    {copiedKey === "tags" ? "Kopyalandı" : "Kopyala"}
                  </button>
                </div>
                <div className="content-body">
                  <div className="tags-row">
                    {data.tags.map((tag) => (
                      <span key={tag} className="tag-chip">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* SEO TITLE */}
              <div className="content-card">
                <div className="content-head">
                  <span className="content-label">SEO Başlığı</span>
                  <button
                    className={`content-copy ${copiedKey === "title" ? "done" : ""}`}
                    onClick={() => copy(data.seo_title, "title")}
                  >
                    {copiedKey === "title" ? "Kopyalandı" : "Kopyala"}
                  </button>
                </div>
                <div className="content-body">
                  <div className="seo-title">{data.seo_title}</div>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="content-card article-body-full">
                <div className="content-head">
                  <span className="content-label">Satış Açıklaması</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="tone-row" style={{ marginBottom: 0 }}>
                      {(["sincere", "professional", "youthful"] as const).map((t) => (
                        <button
                          key={t}
                          className={`tone-btn ${activeTone === t ? "on" : ""}`}
                          onClick={() => setActiveTone(t)}
                        >
                          {t === "sincere" ? "Samimi" : t === "professional" ? "Kurumsal" : "Dinamik"}
                        </button>
                      ))}
                    </div>
                    <button
                      className={`content-copy ${copiedKey === "desc" ? "done" : ""}`}
                      onClick={() => copy(displayDescription, "desc")}
                    >
                      {copiedKey === "desc" ? "Kopyalandı" : "Kopyala"}
                    </button>
                  </div>
                </div>
                <div className="content-body">
                  <div className="body-text">{displayDescription}</div>
                </div>
              </div>
            </div>

            {/* FOOTER CTA */}
            <div style={{ marginTop: 32, padding: "16px 0", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Link href="/dashboard" style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)", textDecoration: "none" }}>
                ← Tüm Analizler
              </Link>
              <Link href="/" style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--red)", textDecoration: "none" }}>
                Yeni Analiz Oluştur →
              </Link>
            </div>
          </>
        )}
      </main>
    </>
  );
}