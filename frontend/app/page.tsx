"use client";

import { useState, useMemo } from "react";
import { generateContentListing } from "@/lib/api";
import type { ContentGenerationResponse } from "@/types";

export default function Home() {
  const [selectedFile, setSelectedFile]         = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]             = useState<string | null>(null);
  const [briefDescription, setBriefDescription] = useState("");
  const [costPrice, setCostPrice]               = useState("");
  const [platform, setPlatform]                 = useState<"trendyol" | "hepsiburada" | "n11">("trendyol");
  const [isGenerating, setIsGenerating]         = useState(false);
  const [generationResult, setGenerationResult] = useState<ContentGenerationResponse | null>(null);
  const [errorMessage, setErrorMessage]         = useState<string | null>(null);
  const [activeToneTab, setActiveToneTab]       = useState<"sincere" | "professional" | "youthful">("sincere");
  const [copiedFieldKey, setCopiedFieldKey]     = useState<string | null>(null);
  const [isDragging, setIsDragging]             = useState(false);

  // useRef KALDIRILDI — artık label kullanıyoruz

  const handleFileSelection = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Lütfen geçerli bir resim dosyası yükleyin.");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setGenerationResult(null);
    setErrorMessage(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelection(file);
  };

  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop      = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelection(file);
  };

  const handleGenerateSubmit = async () => {
    if (!selectedFile || !briefDescription.trim() || !costPrice) return;
    setIsGenerating(true);
    setErrorMessage(null);
    setGenerationResult(null);
    try {
      const response = await generateContentListing(
        selectedFile,
        briefDescription,
        parseFloat(costPrice),
        platform,
      );
      setGenerationResult(response);
    } catch (error: any) {
      setErrorMessage(error.message || "İçerik üretilirken hata oluştu.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFieldKey(key);
    setTimeout(() => setCopiedFieldKey(null), 1800);
  };

  const displayDescription = useMemo(() => {
    if (!generationResult) return "";
    if (activeToneTab === "sincere")      return generationResult.tone_sincere;
    if (activeToneTab === "professional") return generationResult.tone_professional;
    return generationResult.tone_youthful;
  }, [generationResult, activeToneTab]);

  const isFormReady = !!selectedFile && briefDescription.trim().length > 0 && costPrice.length > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Instrument+Sans:wght@400;500;600&display=swap');

        :root {
          --ink: #0A0A0A; --ink-2: #3A3A3A; --ink-3: #7A7A7A; --ink-4: #B0B0B0;
          --surface: #FAFAF8; --surface-2: #F2F1EE;
          --green: #1C6641; --green-light: #EBF5EF; --green-mid: #2D9A5F;
          --border: #E0DFDB; --radius: 8px;
          --font-display: 'Syne', sans-serif;
          --font-body: 'Instrument Sans', sans-serif;
          --shadow-sm: 0 2px 8px rgba(0,0,0,0.04);
          --shadow-md: 0 8px 24px rgba(0,0,0,0.06);
        }

        *, *::before, *::after { box-sizing: border-box; }
        body { font-family: var(--font-body); background: var(--surface); color: var(--ink); margin: 0; padding: 0; overflow-x: hidden; }

        .nav { position: fixed; top: 0; width: 100%; height: 64px; display: flex; align-items: center; justify-content: space-between; padding: 0 5%; background: rgba(250,250,248,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); z-index: 100; }
        .nav-logo { font-family: var(--font-display); font-weight: 800; font-size: 20px; display: flex; align-items: center; gap: 8px; }
        .nav-dot { width: 8px; height: 8px; background: var(--green-mid); border-radius: 50%; }

        .hero { max-width: 1200px; margin: 0 auto; padding: 120px 5% 60px; display: grid; grid-template-columns: 1fr 460px; gap: 64px; align-items: start; }
        .hero-title { font-family: var(--font-display); font-size: clamp(34px, 4.5vw, 52px); font-weight: 800; line-height: 1.1; letter-spacing: -1.5px; margin: 0 0 20px; }
        .hero-title span { color: var(--green-mid); }
        .hero-desc { color: var(--ink-2); line-height: 1.75; font-size: 15px; margin-bottom: 36px; max-width: 460px; }

        .form-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-md); overflow: hidden; }
        .form-header { padding: 16px 22px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; font-family: var(--font-display); font-size: 13px; font-weight: 700; background: #fafafa; letter-spacing: 0.04em; }
        .form-body { padding: 22px; display: flex; flex-direction: column; gap: 16px; }

        /* ── UPLOAD: label KULLANIYORUZ, onClick YOK ── */
        .upload-label {
          display: block;
          border: 2px dashed var(--border);
          border-radius: 6px;
          padding: 32px 16px;
          text-align: center;
          cursor: pointer;
          background: var(--surface-2);
          transition: all 0.18s ease;
        }
        .upload-label:hover,
        .upload-label.dragging {
          border-color: var(--green-mid);
          background: var(--green-light);
        }
        .preview-img { width: 100%; height: 190px; object-fit: cover; border-radius: 6px; display: block; }

        .field-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--ink-3); display: block; margin-bottom: 6px; }
        .field-input, .field-select, .field-textarea {
          width: 100%; padding: 11px 13px;
          border: 1px solid var(--border); border-radius: 6px;
          font-family: var(--font-body); font-size: 13px;
          background: var(--surface-2); color: var(--ink);
          outline: none; transition: border-color 0.18s, background 0.18s;
          appearance: none;
        }
        .field-input:focus, .field-select:focus, .field-textarea:focus {
          border-color: var(--green-mid); background: #fff;
          box-shadow: 0 0 0 3px var(--green-light);
        }
        .field-textarea { resize: none; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .btn { width: 100%; padding: 14px; background: var(--ink); color: #fff; border: none; border-radius: 6px; font-family: var(--font-display); font-size: 13px; font-weight: 700; letter-spacing: 0.06em; cursor: pointer; transition: all 0.18s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn:hover:not(:disabled) { background: var(--green); }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .spinner { width: 13px; height: 13px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.65s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .err { color: #e11d48; font-size: 12px; background: #ffe4e6; padding: 10px 14px; border-radius: 6px; font-weight: 500; }

        .results { max-width: 1200px; margin: 0 auto; padding: 0 5% 100px; }
        .results-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; flex-wrap: wrap; gap: 10px; }
        .results-title { font-family: var(--font-display); font-size: 28px; margin: 0; }
        .results-id { font-size: 12px; color: var(--ink-3); font-weight: 600; }

        .fin-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
        .fin-card { background: var(--green-light); border: 1px solid #C2E4CF; padding: 20px; border-radius: var(--radius); }
        .fin-val { font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--green); }
        .fin-lbl { font-size: 11px; font-weight: 600; color: var(--green-mid); text-transform: uppercase; margin-top: 4px; letter-spacing: 0.04em; }

        .strategy-card { background: var(--surface-2); border: 1px dashed var(--border); padding: 20px 24px; border-radius: var(--radius); margin-bottom: 16px; }

        .output-card { background: #fff; border: 1px solid var(--border); padding: 24px; border-radius: var(--radius); margin-bottom: 14px; position: relative; box-shadow: var(--shadow-sm); }
        .output-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--ink-3); display: block; margin-bottom: 12px; }
        .copy-btn { position: absolute; top: 20px; right: 20px; font-size: 11px; font-weight: 700; cursor: pointer; color: var(--green-mid); background: var(--green-light); padding: 4px 10px; border-radius: 4px; border: none; transition: 0.15s; }
        .copy-btn:hover { background: var(--green-mid); color: #fff; }

        .tone-tabs { display: flex; gap: 6px; margin-bottom: 16px; background: var(--surface-2); padding: 5px; border-radius: 8px; flex-wrap: wrap; }
        .tone-tab { flex: 1; min-width: 90px; padding: 8px; font-size: 12px; font-weight: 600; border: none; border-radius: 6px; cursor: pointer; transition: 0.15s; background: transparent; color: var(--ink-3); }
        .tone-tab.active { background: #fff; color: var(--ink); box-shadow: 0 2px 6px rgba(0,0,0,0.06); }

        .tag { display: inline-block; padding: 5px 12px; background: var(--green-light); color: var(--green); border: 1px solid #C2E4CF; border-radius: 20px; font-size: 12px; margin: 4px 5px 4px 0; font-weight: 600; }

        @media (max-width: 1024px) {
          .hero { grid-template-columns: 1fr; gap: 36px; padding-top: 96px; }
          .fin-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
          .hero { padding: 86px 20px 40px; }
          .nav { padding: 0 20px; }
          .hero-title { font-size: 30px; }
          .fin-grid { grid-template-columns: 1fr; }
          .field-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <nav className="nav">
        <div className="nav-logo">
          GROWIX <span className="nav-dot" />
        </div>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--green)", letterSpacing: "0.08em" }}>
          AI SATIŞ PLATFORMU
        </span>
      </nav>

      <main>
        <section className="hero">
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--green)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "18px" }}>
              E-Ticaret Zekası
            </div>
            <h1 className="hero-title">
              Veriyle karar ver,<br />
              <span>kârla</span> büyü.
            </h1>
            <p className="hero-desc">
              Ürün görselinizi yükleyin, maliyetinizi girin. Growix platform komisyonunu,
              kargo maliyetini ve pazar rekabetini analiz ederek net kâr hesabı
              ve SEO uyumlu içerik üretir.
            </p>
            <div style={{ display: "flex", gap: "32px", borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
              {[
                { val: "1.5s", lbl: "Analiz Süresi" },
                { val: "3",    lbl: "İçerik Tonu"  },
                { val: "%35+", lbl: "Hedef Kâr Marjı" },
              ].map((m) => (
                <div key={m.lbl}>
                  <div style={{ fontSize: "26px", fontWeight: 800, fontFamily: "var(--font-display)" }}>{m.val}</div>
                  <div style={{ fontSize: "11px", color: "var(--ink-3)", marginTop: "3px" }}>{m.lbl}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-card">
            <div className="form-header">
              YENİ ANALİZ
              <div style={{ width: 7, height: 7, background: "var(--green-mid)", borderRadius: "50%" }} />
            </div>

            <div className="form-body">

              {/* ── UPLOAD: input label İÇİNDE, onClick YOK ── */}
              <div>
                <span className="field-label">Ürün Görseli</span>
                <label
                  className={`upload-label ${isDragging ? "dragging" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    style={{ display: "none" }}
                  />
                  {previewUrl ? (
                    <img src={previewUrl} alt="Önizleme" className="preview-img" />
                  ) : (
                    <>
                      <div style={{ fontSize: "22px", marginBottom: "10px" }}>📸</div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink-2)" }}>
                        Görsel yükle veya sürükle
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--ink-4)", marginTop: "5px" }}>
                        PNG · JPG · WEBP · Maks 5MB
                      </div>
                    </>
                  )}
                </label>
              </div>

              {/* AÇIKLAMA */}
              <div>
                <label className="field-label" htmlFor="brief">Ürün Kısa Tanımı</label>
                <textarea
                  id="brief"
                  className="field-textarea"
                  placeholder="Ürünün öne çıkan özelliğini yazın (Ör: El dokuması %100 yün çorap)"
                  rows={3}
                  value={briefDescription}
                  onChange={(e) => setBriefDescription(e.target.value)}
                />
              </div>

              {/* MALİYET + PLATFORM */}
              <div className="field-row">
                <div>
                  <label className="field-label" htmlFor="cost">Ürün Maliyeti (₺)</label>
                  <input
                    id="cost"
                    type="number"
                    className="field-input"
                    placeholder="Ör: 85"
                    min={0}
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="platform">Platform</label>
                  <select
                    id="platform"
                    className="field-select"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as typeof platform)}
                  >
                    <option value="trendyol">Trendyol (%15)</option>
                    <option value="hepsiburada">Hepsiburada (%14)</option>
                    <option value="n11">n11 (%12)</option>
                  </select>
                </div>
              </div>

              <button
                className="btn"
                onClick={handleGenerateSubmit}
                disabled={isGenerating || !isFormReady}
              >
                {isGenerating
                  ? <><div className="spinner" />Analiz Ediliyor</>
                  : "Strateji Oluştur"}
              </button>

              {errorMessage && <div className="err">{errorMessage}</div>}
            </div>
          </div>
        </section>

        {generationResult && (
          <section className="results">
            <div className="results-head">
              <h2 className="results-title">Analiz Raporu</h2>
              <span className="results-id">#{generationResult.id || "—"}</span>
            </div>

            <div className="fin-grid">
              {[
                { val: `${generationResult.suggested_price} ₺`, lbl: "Önerilen Fiyat"    },
                { val: `${generationResult.net_profit} ₺`,      lbl: "Net Kâr / Adet"    },
                { val: `%${generationResult.profit_margin}`,    lbl: "Kâr Marjı"         },
                { val: `${generationResult.estimated_profit} ₺`,lbl: "20 Satış Tahmini"  },
              ].map((c) => (
                <div key={c.lbl} className="fin-card">
                  <div className="fin-val">{c.val}</div>
                  <div className="fin-lbl">{c.lbl}</div>
                </div>
              ))}
            </div>

            <div className="strategy-card">
              <span className="output-label">Maliyet Dökümü</span>
              <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", marginBottom: "12px" }}>
                {[
                  { lbl: "Ürün Maliyeti",      val: `${generationResult.cost_price} ₺`       },
                  { lbl: "Platform Komisyonu", val: `${generationResult.commission_amount} ₺` },
                  { lbl: "Kargo",              val: `${generationResult.cargo_cost} ₺`        },
                ].map((r) => (
                  <div key={r.lbl}>
                    <div style={{ fontSize: "11px", color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{r.lbl}</div>
                    <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: "var(--font-display)", marginTop: "2px" }}>{r.val}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: "13px", fontStyle: "italic", color: "var(--ink-2)", lineHeight: 1.7, margin: 0 }}>
                {generationResult.pricing_logic}
              </p>
            </div>

            <div className="output-card">
              <button className="copy-btn" onClick={() => copyToClipboard(generationResult.seo_title, "title")}>
                {copiedFieldKey === "title" ? "✓ Kopyalandı" : "Kopyala"}
              </button>
              <span className="output-label">SEO Uyumlu Başlık</span>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700 }}>
                {generationResult.seo_title}
              </div>
            </div>

            <div className="output-card">
              <button className="copy-btn" onClick={() => copyToClipboard(displayDescription, "desc")}>
                {copiedFieldKey === "desc" ? "✓ Kopyalandı" : "Kopyala"}
              </button>
              <span className="output-label">Satış Açıklaması</span>
              <div className="tone-tabs">
                {(["sincere", "professional", "youthful"] as const).map((t) => (
                  <button
                    key={t}
                    className={`tone-tab ${activeToneTab === t ? "active" : ""}`}
                    onClick={() => setActiveToneTab(t)}
                  >
                    {t === "sincere" ? "Samimi" : t === "professional" ? "Kurumsal" : "Dinamik"}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: "14px", lineHeight: 1.8, color: "var(--ink-2)" }}>
                {displayDescription}
              </div>
            </div>

            <div className="output-card">
              <span className="output-label">Anahtar Kelimeler</span>
              <div style={{ marginTop: "8px" }}>
                {generationResult.tags.map((tag, i) => (
                  <span key={i} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}