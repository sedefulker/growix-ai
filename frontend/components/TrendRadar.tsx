"use client";

import { useEffect, useState } from "react";
import type { TrendData, TrendInsight } from "@/types";

interface TrendRadarProps {
  keyword: string;
}

const SIGNAL_CONFIG: Record<TrendInsight["signal"], {
  borderLeft: string;
  dotColor: string;
  textColor: string;
  bg: string;
  label: string;
}> = {
  hot:     { borderLeft: "var(--red)",   dotColor: "var(--red)",   textColor: "var(--red)",   bg: "var(--red-dim)",   label: "Yüksek Talep" },
  rising:  { borderLeft: "var(--green)", dotColor: "var(--green)", textColor: "var(--green)", bg: "var(--green-dim)", label: "Yükselen Trend" },
  stable:  { borderLeft: "var(--amber)", dotColor: "var(--amber)", textColor: "var(--amber)", bg: "var(--amber-dim)", label: "Stabil Pazar" },
  falling: { borderLeft: "var(--ink-3)", dotColor: "var(--ink-3)", textColor: "var(--ink-3)", bg: "var(--paper-2)",   label: "Düşen Trend" },
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function TrendRadar({ keyword }: TrendRadarProps) {
  const [data, setData]       = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!keyword || keyword.trim().length < 2) return;

    let mounted = true;
    const ctrl  = new AbortController();

    setLoading(true);
    setError(null);

    fetch(
      `${API_BASE}/trends/analyze/${encodeURIComponent(keyword.trim())}`,
      { signal: ctrl.signal }
    )
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<TrendData>;
      })
      .then((json) => { if (mounted) setData(json); })
      .catch((e)   => { if (mounted && e.name !== "AbortError") setError("Pazar verisi alınamadı."); })
      .finally(()  => { if (mounted) setLoading(false); });

    return () => { mounted = false; ctrl.abort(); };
  }, [keyword]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="tr tr--loading">
        <div className="tr-head">
          <div className="tr-head-left">
            <span className="tr-pulse" aria-hidden="true" />
            <span className="mono-label">Pazar Radarı</span>
          </div>
          <span className="tr-source">Analiz ediliyor...</span>
        </div>
        <div className="tr-skeleton" aria-busy="true" aria-label="Yükleniyor" />
      </div>
    );
  }

  // ── Error / empty ──
  if (error || !data) {
    return (
      <div className="tr tr--empty">
        <div className="tr-head">
          <div className="tr-head-left">
            <span className="tr-dot" style={{ background: "var(--ink-4)" }} aria-hidden="true" />
            <span className="mono-label">Pazar Radarı</span>
          </div>
        </div>
        <p className="tr-empty-msg">{error ?? "Anahtar kelime bekleniyor..."}</p>
      </div>
    );
  }

  const cfg        = SIGNAL_CONFIG[data.insight.signal];
  const isPositive = data.trend_change >= 0;
  const changeStr  = `${isPositive ? "+" : ""}${data.trend_change}%`;

  return (
    <>
      <div className="tr" style={{ borderLeftColor: cfg.borderLeft }}>
        {/* HEAD */}
        <div className="tr-head">
          <div className="tr-head-left">
            <span
              className={`tr-dot ${data.insight.signal === "hot" || data.insight.signal === "rising" ? "tr-dot--pulse" : ""}`}
              style={{ background: cfg.dotColor }}
              aria-hidden="true"
            />
            <span className="mono-label">Pazar Radarı</span>
            <span className="tr-signal-badge" style={{ color: cfg.textColor, borderColor: cfg.borderLeft }}>
              {cfg.label}
            </span>
          </div>
          <span className="tr-source">
            {data.data_source === "google_autocomplete_live"
              ? "● Google Canlı"
              : "● Pazar Analizi"}
          </span>
        </div>

        {/* BODY */}
        <div className="tr-body">
          {/* Change + keyword */}
          <div className="tr-primary">
            <div
              className="tr-change num"
              style={{ color: isPositive ? cfg.textColor : "var(--ink-3)" }}
              aria-label={`Trend değişimi ${changeStr}`}
            >
              {changeStr}
            </div>
            <div className="tr-keyword">{data.keyword.toUpperCase()}</div>
          </div>

          {/* Insight text */}
          <p className="tr-insight">
            <span aria-hidden="true">{data.insight.emoji}</span>{" "}
            {data.insight.text}
          </p>

          {/* Metrics grid */}
          <div className="tr-metrics">
            <TrMetric
              label="Haftalık Hacim"
              value={`~${data.weekly_searches.toLocaleString("tr-TR")}`}
            />
            <TrMetric
              label="Aktif Rakip"
              value={String(data.competitor_count)}
            />
            <TrMetric
              label="Rekabet"
              value={data.competition_level}
              color={
                data.competition_level === "Düşük"
                  ? "var(--green)"
                  : data.competition_level === "Yüksek"
                  ? "var(--red)"
                  : "var(--amber)"
              }
            />
          </div>

          {/* Related keywords */}
          {data.related_keywords.length > 0 && (
            <div className="tr-related">
              <span className="mono-label" style={{ fontSize: 8 }}>
                Tüketici Arama Niyeti
              </span>
              <div className="tr-tags">
                {data.related_keywords.map((kw) => (
                  <span key={kw} className="tag-chip" style={{ fontSize: 10 }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .tr {
          border: 1px solid var(--border);
          border-left: 3px solid var(--border);
          background: var(--paper);
          transition: border-left-color 300ms;
        }

        /* HEAD */
        .tr-head {
          padding: 9px 14px;
          border-bottom: 1px solid var(--border-2);
          background: var(--paper-2);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .tr-head-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Dot */
        .tr-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
        }
        .tr-dot--pulse {
          animation: tr-ripple 2s ease-out infinite;
        }
        @keyframes tr-ripple {
          0%   { box-shadow: 0 0 0 0 currentColor; }
          70%  { box-shadow: 0 0 0 5px transparent; }
          100% { box-shadow: 0 0 0 0 transparent; }
        }

        .tr-signal-badge {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 2px 7px;
          border: 1px solid currentColor;
        }

        .tr-source {
          font-family: var(--font-mono);
          font-size: 9px;
          color: var(--ink-4);
          letter-spacing: 0.05em;
        }

        /* LOADING */
        .tr--loading .tr-head,
        .tr--empty   .tr-head {
          background: var(--paper-2);
        }
        .tr-skeleton {
          height: 80px;
          background: linear-gradient(90deg, var(--paper-2) 25%, var(--paper-3) 50%, var(--paper-2) 75%);
          background-size: 200% 100%;
          animation: tr-shimmer 1.5s infinite;
        }
        @keyframes tr-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .tr-empty-msg {
          padding: 24px 14px;
          font-size: 12px;
          color: var(--ink-4);
          font-style: italic;
        }

        /* BODY */
        .tr-body { padding: 14px; }

        .tr-primary {
          display: flex;
          align-items: baseline;
          gap: 14px;
          margin-bottom: 10px;
        }
        .tr-change {
          font-size: 36px;
          font-weight: 600;
          line-height: 1;
          letter-spacing: -1px;
        }
        .tr-keyword {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.08em;
          color: var(--ink-4);
          line-height: 1.4;
          max-width: 200px;
        }

        .tr-insight {
          font-size: 13px;
          font-weight: 300;
          line-height: 1.65;
          color: var(--ink-2);
          margin-bottom: 14px;
          font-style: italic;
        }

        /* METRICS */
        .tr-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-top: 1px solid var(--border-2);
          border-left: 1px solid var(--border-2);
        }

        /* RELATED */
        .tr-related {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px dashed var(--border-2);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .tr-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
      `}</style>
    </>
  );
}

function TrMetric({ label, value, color }: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div style={{
      padding: "10px 12px",
      borderRight: "1px solid var(--border-2)",
      borderBottom: "1px solid var(--border-2)",
    }}>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        color: "var(--ink-4)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        marginBottom: 5,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontVariantNumeric: "tabular-nums",
        fontSize: 16,
        fontWeight: 600,
        color: color ?? "var(--ink)",
        letterSpacing: "-0.02em",
      }}>
        {value}
      </div>
    </div>
  );
}