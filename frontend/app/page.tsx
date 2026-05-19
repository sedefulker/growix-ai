"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import { generateContentListing } from "@/lib/api";
import type { ContentGenerationResponse } from "@/types";

type ToneKey     = "sincere" | "professional" | "youthful";
type PlatformKey = "trendyol" | "hepsiburada" | "n11";

const PLATFORM_LABELS: Record<PlatformKey, string> = {
  trendyol:    "Trendyol — %15 komisyon",
  hepsiburada: "Hepsiburada — %14 komisyon",
  n11:         "n11 — %12 komisyon",
};

export default function Home() {
  const [file, setFile]               = useState<File | null>(null);
  const [preview, setPreview]         = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [costPrice, setCostPrice]     = useState("");
  const [platform, setPlatform]       = useState<PlatformKey>("trendyol");
  const [generating, setGenerating]   = useState(false);
  const [result, setResult]           = useState<ContentGenerationResponse | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [tone, setTone]               = useState<ToneKey>("sincere");
  const [copied, setCopied]           = useState<string | null>(null);
  const [dragging, setDragging]       = useState(false);
  const [step, setStep]               = useState<1 | 2 | 3>(1);

  // ── handlers ────────────────────────────────────────────────────────────────

  const selectFile = (f: File) => {
    if (!f.type.startsWith("image/")) { setError("Geçerli bir görsel dosyası seçin."); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
    setStep(2);
  };

  const onFileChange  = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) selectFile(f); };
  const onDrop        = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) selectFile(f); };
  const onDragOver    = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave   = () => setDragging(false);

  const onSubmit = async () => {
    if (!file || !description.trim() || !costPrice) return;
    setGenerating(true);
    setError(null);
    setResult(null);
    try {
      const res = await generateContentListing(file, description, parseFloat(costPrice), platform);
      setResult(res);
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Analiz başarısız. Lütfen tekrar deneyin.");
    } finally {
      setGenerating(false);
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const activeDesc = useMemo(() => {
    if (!result) return "";
    return tone === "sincere" ? result.tone_sincere : tone === "professional" ? result.tone_professional : result.tone_youthful;
  }, [result, tone]);

  const isReady = !!file && description.trim().length > 0 && costPrice.length > 0;

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        /* ── PAGE LAYOUT ── */
        .home-grid {
          max-width: 1280px;
          margin: 0 auto;
          padding: 52px 48px 80px;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 0;
          align-items: start;
        }

        /* ── LEFT ── */
        .left { padding-right: 52px; border-right: 1px solid var(--border); }

        .lead-eyebrow {
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--red);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .lead-eyebrow::before, .lead-eyebrow::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--red);
          opacity: 0.25;
        }

        .lead-headline {
          font-family: var(--font-display);
          font-size: clamp(40px, 4.2vw, 64px);
          font-weight: 600;
          line-height: 1.08;
          letter-spacing: -1px;
          color: var(--ink);
          margin-bottom: 22px;
        }
        .lead-headline em { font-style: italic; color: var(--red); }

        .lead-body {
          font-size: 14.5px;
          font-weight: 300;
          line-height: 1.8;
          color: var(--ink-2);
          max-width: 500px;
          margin-bottom: 44px;
          padding-bottom: 36px;
          border-bottom: 1px solid var(--border-2);
        }

        /* STATS */
        .stats-row { display: flex; gap: 0; margin-bottom: 40px; }
        .stat {
          padding: 0 28px 0 0;
          margin-right: 28px;
          border-right: 1px solid var(--border-2);
        }
        .stat:last-child { border-right: none; margin-right: 0; }
        .stat-n {
          font-family: var(--font-display);
          font-size: 36px;
          font-weight: 600;
          color: var(--ink);
          line-height: 1;
          margin-bottom: 5px;
        }
        .stat-l { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-4); }

        /* STEPS */
        .steps { display: flex; border: 1px solid var(--border); }
        .step-item {
          flex: 1;
          padding: 12px 16px;
          border-right: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 10px;
          transition: background 0.15s;
        }
        .step-item:last-child { border-right: none; }
        .step-item.done   { background: var(--paper-2); }
        .step-item.active { background: var(--ink); }

        .step-num {
          width: 22px; height: 22px;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 500;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--ink-4);
        }
        .step-item.done   .step-num { border-color: var(--red);  color: var(--red);  }
        .step-item.active .step-num { border-color: #fff;        color: #fff;        }

        .step-label {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-4);
        }
        .step-item.active .step-label { color: #C8C2B0; }

        /* ── RIGHT / FORM ── */
        .right { padding-left: 44px; position: sticky; top: 24px; }

        .form-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          padding-bottom: 14px;
          border-bottom: 2px solid var(--ink);
          margin-bottom: 22px;
        }
        .form-title { font-family: var(--font-display); font-size: 24px; font-weight: 600; color: var(--ink); }
        .form-sub   { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-4); }

        /* UPLOAD */
        .upload-zone {
          display: block;
          border: 1px solid var(--border);
          background: var(--paper-2);
          cursor: pointer;
          margin-bottom: 18px;
          transition: border-color 0.14s, background 0.14s;
        }
        .upload-zone:hover, .upload-zone.drag { border-color: var(--red); background: var(--red-dim); }
        .upload-zone.drag { outline: 2px dashed var(--red); outline-offset: -4px; }

        .upload-inner { padding: 28px 16px; text-align: center; }
        .upload-icon {
          width: 38px; height: 38px;
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 12px;
        }
        .upload-icon svg { width: 16px; height: 16px; stroke: var(--ink-3); }
        .upload-p { font-size: 13px; font-weight: 500; color: var(--ink-2); margin-bottom: 4px; }
        .upload-s { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-4); }

        .preview-img  { width: 100%; height: 196px; object-fit: cover; display: block; }
        .preview-meta {
          padding: 8px 12px;
          background: var(--ink);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .preview-name   { font-family: var(--font-mono); font-size: 10px; color: #9E998F; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .preview-change { font-family: var(--font-mono); font-size: 10px; color: var(--red-2); cursor: pointer; flex-shrink: 0; margin-left: 8px; }

        /* FIELDS */
        .field         { margin-bottom: 15px; }
        .field-label   { font-family: var(--font-mono); font-size: 9px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-3); display: block; margin-bottom: 6px; }
        .field-row     { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 15px; }

        .field-input, .field-select, .field-textarea {
          width: 100%;
          padding: 10px 12px;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 300;
          color: var(--ink);
          background: var(--paper);
          border: 1px solid var(--border);
          outline: none;
          transition: border-color 0.12s, background 0.12s;
          appearance: none;
        }
        .field-input:focus, .field-select:focus, .field-textarea:focus {
          border-color: var(--ink);
          background: #fff;
        }
        .field-textarea { resize: none; line-height: 1.65; }

        /* SUBMIT */
        .submit-btn {
          width: 100%;
          padding: 13px 16px;
          background: var(--ink);
          color: var(--paper);
          border: none;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.14s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .submit-btn:hover:not(:disabled) { background: var(--red); }
        .submit-btn:disabled { opacity: 0.28; cursor: not-allowed; }

        /* ── RESULTS ── */
        .results {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 48px 100px;
        }

        .results-head {
          border-top: 3px double var(--border);
          padding: 22px 0;
          margin-bottom: 2px;
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: end;
          gap: 20px;
        }
        .results-kicker { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--red); margin-bottom: 8px; }
        .results-title  { font-family: var(--font-display); font-size: 40px; font-weight: 600; letter-spacing: -1px; line-height: 1; }
        .results-meta   { font-family: var(--font-mono); font-size: 10px; color: var(--ink-4); letter-spacing: 0.06em; text-align: right; line-height: 1.9; }

        /* FIN STRIP */
        .fin-strip { display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid var(--border); margin-bottom: 2px; }
        .fin-cell  { padding: 18px 22px; border-right: 1px solid var(--border); }
        .fin-cell:last-child { border-right: none; }
        .fin-k { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-4); margin-bottom: 8px; }
        .fin-v { font-family: var(--font-display); font-size: 32px; font-weight: 600; color: var(--ink); line-height: 1; }
        .fin-v.accent { color: var(--red); }

        /* BREAKDOWN STRIP */
        .breakdown-strip {
          display: grid;
          grid-template-columns: repeat(3, auto) 1fr;
          border: 1px solid var(--border);
          border-top: none;
          background: var(--paper-2);
          margin-bottom: 20px;
        }
        .bc { padding: 12px 18px; border-right: 1px solid var(--border); }
        .bc:last-child { border-right: none; }
        .bc-k { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-4); margin-bottom: 5px; }
        .bc-v { font-family: var(--font-mono); font-size: 13px; font-weight: 500; color: var(--ink-2); }
        .bc-logic { font-size: 12px; font-weight: 300; font-style: italic; color: var(--ink-3); line-height: 1.65; padding-top: 2px; }

        /* OUTPUT GRID */
        .out-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-bottom: 2px; }
        .out-full { grid-column: 1/-1; }

        .seo-title-text { font-family: var(--font-display); font-size: 22px; font-weight: 600; line-height: 1.3; color: var(--ink); }
        .body-text      { font-size: 13.5px; font-weight: 300; line-height: 1.85; color: var(--ink-2); }
        .tags-wrap      { display: flex; flex-wrap: wrap; gap: 7px; }

        /* CTA FOOTER */
        .result-footer {
          margin-top: 20px;
          padding: 14px 18px;
          border: 1px solid var(--border);
          background: var(--paper-2);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .result-footer-note { font-family: var(--font-mono); font-size: 10px; color: var(--ink-4); letter-spacing: 0.06em; }
        .result-footer-link { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--red); text-decoration: none; }
        .result-footer-link:hover { text-decoration: underline; }

        /* RESPONSIVE */
        @media (max-width: 1100px) {
          .home-grid   { grid-template-columns: 1fr; padding: 36px 32px 60px; }
          .left        { padding-right: 0; border-right: none; border-bottom: 1px solid var(--border); padding-bottom: 40px; margin-bottom: 40px; }
          .right       { padding-left: 0; position: static; }
          .results     { padding: 0 32px 80px; }
          .fin-strip   { grid-template-columns: 1fr 1fr; }
          .fin-cell:nth-child(2) { border-right: none; }
          .fin-cell:nth-child(3) { border-top: 1px solid var(--border); }
          .fin-cell:nth-child(4) { border-top: 1px solid var(--border); border-right: none; }
          .breakdown-strip { grid-template-columns: 1fr 1fr; }
          .bc:nth-child(2) { border-right: none; }
          .bc:nth-child(3) { border-top: 1px solid var(--border); }
          .bc:nth-child(4) { border-top: 1px solid var(--border); border-right: none; grid-column: 1/-1; }
        }
        @media (max-width: 640px) {
          .home-grid   { padding: 24px 20px 60px; }
          .results     { padding: 0 20px 60px; }
          .lead-headline { font-size: 36px; }
          .stats-row   { flex-wrap: wrap; gap: 16px; }
          .stat        { border-right: none; margin: 0; }
          .steps       { flex-direction: column; }
          .step-item   { border-right: none; border-bottom: 1px solid var(--border); }
          .fin-strip   { grid-template-columns: 1fr; }
          .fin-cell    { border-right: none; border-bottom: 1px solid var(--border); }
          .out-grid    { grid-template-columns: 1fr; }
          .field-row   { grid-template-columns: 1fr; }
          .results-head { grid-template-columns: 1fr; }
          .results-title { font-size: 30px; }
          .breakdown-strip { grid-template-columns: 1fr; }
          .bc { border-right: none; border-bottom: 1px solid var(--border); }
        }
      `}</style>

      <Masthead />

      <main>
        {/* ── TWO COLUMN ── */}
        <div className="home-grid">

          {/* LEFT — EDITORIAL */}
          <div className="left">
            <p className="lead-eyebrow">Baş Makale · Satıcı İstihbaratı</p>

            <h1 className="lead-headline">
              Veriyle karar ver,<br />
              <em>kârla</em> büyü.
            </h1>

            <p className="lead-body">
              Türkiye'nin 500.000 küçük e-ticaret satıcısı her gün sezgiyle karar veriyor.
              Growix, ürün görselinizi ve maliyetinizi alarak platform komisyonunu, kargo
              giderini ve rakip fiyatlarını analiz eder — saniyeler içinde, net kâr hesabı
              ve SEO uyumlu içerikle.
            </p>

            <div className="stats-row">
              {[
                { n: "1.5s",  l: "Ortalama Analiz Süresi" },
                { n: "3",     l: "İçerik Tonu Seçeneği"  },
                { n: "%35+",  l: "Hedef Net Kâr Marjı"   },
              ].map((s) => (
                <div key={s.l} className="stat">
                  <div className="stat-n">{s.n}</div>
                  <div className="stat-l">{s.l}</div>
                </div>
              ))}
            </div>

            <div className="section-rule">
              <div className="section-rule-line" />
              <span className="section-rule-label">Analiz Adımları</span>
              <div className="section-rule-line" />
            </div>

            <div className="steps">
              {[
                { n: "01", l: "Görsel Yükle"  },
                { n: "02", l: "Bilgi Gir"     },
                { n: "03", l: "Rapor Al"      },
              ].map((p, i) => {
                const s = i + 1;
                const cls = step > s ? "done" : step === s ? "active" : "";
                return (
                  <div key={p.n} className={`step-item ${cls}`}>
                    <span className="step-num">{step > s ? "✓" : p.n}</span>
                    <span className="step-label">{p.l}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT — FORM */}
          <div className="right">
            <div className="form-head">
              <div className="form-title">Yeni Analiz</div>
              <div className="form-sub">Platform Raporu</div>
            </div>

            {/* UPLOAD */}
            <label
              className={`upload-zone ${dragging ? "drag" : ""}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <input type="file" accept="image/*" onChange={onFileChange} style={{ display: "none" }} />
              {preview ? (
                <>
                  <img src={preview} alt="Ürün görseli önizlemesi" className="preview-img" />
                  <div className="preview-meta">
                    <span className="preview-name">{file?.name}</span>
                    <span className="preview-change">Değiştir</span>
                  </div>
                </>
              ) : (
                <div className="upload-inner">
                  <div className="upload-icon">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p className="upload-p">Ürün görselini yükleyin veya sürükleyin</p>
                  <p className="upload-s">PNG · JPG · WEBP · Maks 5MB</p>
                </div>
              )}
            </label>

            {/* DESCRIPTION */}
            <div className="field">
              <label className="field-label" htmlFor="desc">Ürün Kısa Tanımı</label>
              <textarea
                id="desc"
                className="field-textarea"
                rows={3}
                placeholder="Öne çıkan özelliği yazın (Ör: El dokuması %100 yün çorap)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* COST + PLATFORM */}
            <div className="field-row">
              <div>
                <label className="field-label" htmlFor="cost">Ürün Maliyeti (₺)</label>
                <input
                  id="cost"
                  type="number"
                  className="field-input"
                  placeholder="Örn: 85"
                  min={0}
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label" htmlFor="platform">Platform</label>
                <select id="platform" className="field-select" value={platform} onChange={(e) => setPlatform(e.target.value as PlatformKey)}>
                  {(Object.entries(PLATFORM_LABELS) as [PlatformKey, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* SUBMIT */}
            <button className="submit-btn" onClick={onSubmit} disabled={generating || !isReady} aria-busy={generating}>
              {generating ? <><div className="spinner" aria-hidden="true" /> Analiz Ediliyor</> : "— Raporu Oluştur —"}
            </button>

            {error && <div className="err-bar" role="alert">{error}</div>}
          </div>
        </div>

        {/* ── RESULTS ── */}
        {result && (
          <div className="results">
            <div className="results-head">
              <div>
                <p className="results-kicker">Analiz Raporu · {platform.toUpperCase()}</p>
                <h2 className="results-title">Finansal Röntgen</h2>
              </div>
              <div className="results-meta">
                Kayıt #{result.id || "—"}<br />
                {new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}
              </div>
            </div>

            {/* FIN STRIP */}
            <div className="fin-strip">
              {[
                { k: "Önerilen Fiyat",   v: `${result.suggested_price} ₺`, a: true  },
                { k: "Net Kâr / Adet",   v: `${result.net_profit} ₺`,      a: true  },
                { k: "Kâr Marjı",        v: `%${result.profit_margin}`,    a: false },
                { k: "20 Satış Tahmini", v: `${result.estimated_profit} ₺`,a: true  },
              ].map((c) => (
                <div key={c.k} className="fin-cell">
                  <p className="fin-k">{c.k}</p>
                  <p className={`fin-v ${c.a ? "accent" : ""}`}>{c.v}</p>
                </div>
              ))}
            </div>

            {/* BREAKDOWN */}
            <div className="breakdown-strip">
              {[
                { k: "Ürün Maliyeti",      v: `${result.cost_price} ₺`       },
                { k: "Komisyon",           v: `${result.commission_amount} ₺` },
                { k: "Kargo",              v: `${result.cargo_cost} ₺`        },
              ].map((r) => (
                <div key={r.k} className="bc">
                  <p className="bc-k">{r.k}</p>
                  <p className="bc-v">{r.v}</p>
                </div>
              ))}
              <div className="bc">
                <p className="bc-k">Yapay Zeka Notu</p>
                <p className="bc-logic">{result.pricing_logic}</p>
              </div>
            </div>

            {/* OUTPUT BLOCKS */}
            <div className="out-grid">
              {/* SEO TITLE */}
              <div className="block out-full">
                <div className="block-head">
                  <span className="mono-label">SEO Başlığı</span>
                  <button className="copy-btn" data-copied={copied === "title" ? "" : undefined} onClick={() => copyText(result.seo_title, "title")}>
                    {copied === "title" ? "Kopyalandı" : "Kopyala"}
                  </button>
                </div>
                <div className="block-body">
                  <p className="seo-title-text">{result.seo_title}</p>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="block out-full">
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
                    <button className="copy-btn" data-copied={copied === "desc" ? "" : undefined} onClick={() => copyText(activeDesc, "desc")}>
                      {copied === "desc" ? "Kopyalandı" : "Kopyala"}
                    </button>
                  </div>
                </div>
                <div className="block-body">
                  <p className="body-text">{activeDesc}</p>
                </div>
              </div>

              {/* TAGS */}
              <div className="block out-full">
                <div className="block-head">
                  <span className="mono-label">Anahtar Kelimeler</span>
                  <button className="copy-btn" data-copied={copied === "tags" ? "" : undefined} onClick={() => copyText(result.tags.join(", "), "tags")}>
                    {copied === "tags" ? "Kopyalandı" : "Kopyala"}
                  </button>
                </div>
                <div className="block-body">
                  <div className="tags-wrap">
                    {result.tags.map((tag, i) => <span key={i} className="tag-chip">{tag}</span>)}
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER CTA */}
            <div className="result-footer">
              <span className="result-footer-note">Veritabanına kaydedildi · #{result.id}</span>
              <Link href="/dashboard" className="result-footer-link">Tüm Analizleri Görüntüle →</Link>
            </div>
          </div>
        )}
      </main>
    </>
  );
}