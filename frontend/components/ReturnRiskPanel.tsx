"use client";

import type { ReturnRiskData, RiskLevel } from "@/types";

interface ReturnRiskPanelProps {
  data: ReturnRiskData;
  productPrice?: number;
}

const RISK_CONFIG: Record<RiskLevel, {
  bg: string;
  border: string;
  color: string;
  abbr: string;
}> = {
  YÜKSEK: { bg: "var(--red-dim)",   border: "var(--red)",   color: "var(--red)",   abbr: "Y" },
  ORTA:   { bg: "var(--amber-dim)", border: "var(--amber)", color: "var(--amber)", abbr: "O" },
  DÜŞÜK:  { bg: "var(--green-dim)", border: "var(--green)", color: "var(--green)", abbr: "D" },
};

const OVERALL_CONFIG: Record<RiskLevel, { bg: string; color: string; label: string }> = {
  YÜKSEK: { bg: "var(--red)",   color: "#fff",           label: "Yüksek İade Riski" },
  ORTA:   { bg: "var(--amber)", color: "#fff",           label: "Orta İade Riski"   },
  DÜŞÜK:  { bg: "var(--green)", color: "#fff",           label: "Düşük İade Riski"  },
};

export default function ReturnRiskPanel({ data, productPrice }: ReturnRiskPanelProps) {
  const fi       = data.financial_impact;
  const overall  = OVERALL_CONFIG[data.overall_risk];

  const highRisks   = data.risks.filter((r) => r.level === "YÜKSEK");
  const medRisks    = data.risks.filter((r) => r.level === "ORTA");
  const lowRisks    = data.risks.filter((r) => r.level === "DÜŞÜK");
  const sortedRisks = [...highRisks, ...medRisks, ...lowRisks];

  return (
    <>
      <div className="rrp">
        {/* ── MASTHEAD ── */}
        <div className="rrp-head">
          <div className="rrp-head-left">
            <span className="mono-label">İade Risk Analizi</span>
            <span
              className="rrp-badge"
              style={{ background: overall.bg, color: overall.color }}
            >
              {overall.label}
            </span>
          </div>
          <span className="rrp-source">Growix Ajan 6 · Gemini Vision</span>
        </div>

        {/* ── FINANCIAL IMPACT STRIP ── */}
        <div className="rrp-impact">
          <div className="rrp-impact-cell rrp-impact-cell--accent">
            <div className="mono-label" style={{ marginBottom: 6, color: "var(--paper-3)" }}>
              Mevcut İade Oranı
            </div>
            <div className="rrp-big-num" aria-label={`Mevcut iade oranı %${fi.estimated_current_return_rate}`}>
              %{fi.estimated_current_return_rate}
            </div>
          </div>
          <div className="rrp-impact-arrow" aria-hidden="true">→</div>
          <div className="rrp-impact-cell">
            <div className="mono-label" style={{ marginBottom: 6 }}>
              Düzeltme Sonrası
            </div>
            <div className="rrp-big-num rrp-big-num--green" aria-label={`Tahmini iade oranı %${fi.estimated_after_fix_rate}`}>
              %{fi.estimated_after_fix_rate}
            </div>
          </div>
          <div className="rrp-impact-divider" aria-hidden="true" />
          <div className="rrp-impact-cell">
            <div className="mono-label" style={{ marginBottom: 6 }}>
              Aylık Tasarruf <span style={{ color: "var(--ink-4)" }}>(100 satış)</span>
            </div>
            <div className="rrp-big-num rrp-big-num--green">
              {fi.monthly_savings_per_100.toLocaleString("tr-TR")} ₺
            </div>
          </div>
          <div className="rrp-impact-cell">
            <div className="mono-label" style={{ marginBottom: 6 }}>
              Yıllık Tasarruf
            </div>
            <div className="rrp-big-num rrp-big-num--green">
              {fi.annual_savings_per_100.toLocaleString("tr-TR")} ₺
            </div>
          </div>
        </div>

        {/* ── SUMMARY ── */}
        {data.summary && (
          <div className="rrp-summary">
            <p>{data.summary}</p>
          </div>
        )}

        {/* ── RISK LIST ── */}
        {sortedRisks.length > 0 ? (
          <div className="rrp-risks">
            {sortedRisks.map((risk, idx) => {
              const cfg = RISK_CONFIG[risk.level];
              return (
                <div
                  key={risk.id}
                  className="rrp-risk"
                  style={{ borderLeftColor: cfg.border }}
                >
                  {/* Risk header */}
                  <div className="rrp-risk-head">
                    <div className="rrp-risk-head-left">
                      <span
                        className="rrp-risk-level"
                        style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
                        aria-label={`Risk seviyesi: ${risk.level}`}
                      >
                        {risk.level}
                      </span>
                      <h3 className="rrp-risk-title">
                        <span className="rrp-risk-idx" aria-hidden="true">#{idx + 1}</span>
                        {risk.title}
                      </h3>
                    </div>
                    <div className="rrp-risk-impact" aria-label={`İade oranı etkisi: %${risk.return_rate_impact}`}>
                      <span className="mono-label" style={{ fontSize: 8 }}>Etki</span>
                      <span className="num" style={{ fontSize: 16, fontWeight: 600, color: cfg.color }}>
                        −{risk.return_rate_impact}%
                      </span>
                    </div>
                  </div>

                  {/* Risk body */}
                  <div className="rrp-risk-body">
                    <div className="rrp-risk-desc">
                      <span className="mono-label" style={{ fontSize: 8, marginBottom: 4, display: "block" }}>
                        Sorun
                      </span>
                      <p>{risk.description}</p>
                    </div>
                    <div className="rrp-risk-fix">
                      <span className="mono-label" style={{ fontSize: 8, marginBottom: 4, display: "block", color: "var(--green)" }}>
                        Düzeltme
                      </span>
                      <p>{risk.fix}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rrp-empty">
            <span style={{ fontSize: 20 }}>✅</span>
            <p>Belirgin iade riski tespit edilmedi. Listeleme kalitesi iyi görünüyor.</p>
          </div>
        )}
      </div>

      <style>{`
        .rrp {
          border: 1px solid var(--border);
          background: var(--paper);
        }

        /* HEAD */
        .rrp-head {
          padding: 9px 16px;
          border-bottom: 1px solid var(--border);
          background: var(--paper-2);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .rrp-head-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .rrp-badge {
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 3px 9px;
        }
        .rrp-source {
          font-family: var(--font-mono);
          font-size: 9px;
          color: var(--ink-4);
          letter-spacing: 0.05em;
        }

        /* IMPACT STRIP */
        .rrp-impact {
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr 1fr;
          align-items: center;
          border-bottom: 1px solid var(--border);
        }
        .rrp-impact-cell {
          padding: 14px 16px;
          border-right: 1px solid var(--border-2);
        }
        .rrp-impact-cell:last-child { border-right: none; }
        .rrp-impact-cell--accent {
          background: var(--ink);
          border-right: 1px solid #333;
        }
        .rrp-impact-cell--accent .mono-label { color: #666; }
        .rrp-impact-arrow {
          padding: 0 12px;
          font-family: var(--font-mono);
          font-size: 14px;
          color: var(--border);
          border-right: 1px solid var(--border-2);
        }
        .rrp-impact-divider {
          width: 1px;
          height: 40px;
          background: var(--border-2);
          margin: auto;
        }

        .rrp-big-num {
          font-family: var(--font-mono);
          font-variant-numeric: tabular-nums;
          font-size: 24px;
          font-weight: 600;
          color: var(--paper);
          letter-spacing: -0.03em;
          line-height: 1;
        }
        .rrp-big-num--green { color: var(--green); }

        /* SUMMARY */
        .rrp-summary {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-2);
          background: var(--paper-2);
          font-size: 13px;
          font-weight: 300;
          font-style: italic;
          color: var(--ink-3);
          line-height: 1.6;
        }

        /* RISKS */
        .rrp-risks { border-top: 1px solid var(--border-2); }

        .rrp-risk {
          border-bottom: 1px solid var(--border-2);
          border-left: 3px solid var(--border);
          transition: border-left-color 200ms;
        }
        .rrp-risk:last-child { border-bottom: none; }

        .rrp-risk-head {
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          background: var(--paper-2);
          border-bottom: 1px solid var(--border-2);
        }
        .rrp-risk-head-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .rrp-risk-level {
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 2px 7px;
          border: 1px solid currentColor;
          flex-shrink: 0;
        }
        .rrp-risk-title {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
          line-height: 1.3;
        }
        .rrp-risk-idx {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--ink-4);
          margin-right: 8px;
        }
        .rrp-risk-impact {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
          flex-shrink: 0;
        }

        .rrp-risk-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }
        .rrp-risk-desc,
        .rrp-risk-fix {
          padding: 12px 16px;
          font-size: 12.5px;
          font-weight: 300;
          line-height: 1.65;
          color: var(--ink-2);
        }
        .rrp-risk-desc { border-right: 1px solid var(--border-2); }
        .rrp-risk-fix  { background: var(--green-dim); }

        /* EMPTY */
        .rrp-empty {
          padding: 32px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          color: var(--ink-3);
          font-weight: 300;
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .rrp-impact {
            grid-template-columns: 1fr 1fr;
            gap: 0;
          }
          .rrp-impact-arrow  { display: none; }
          .rrp-impact-divider{ display: none; }
          .rrp-impact-cell   { border-bottom: 1px solid var(--border-2); }
        }
        @media (max-width: 640px) {
          .rrp-impact { grid-template-columns: 1fr; }
          .rrp-risk-body { grid-template-columns: 1fr; }
          .rrp-risk-desc { border-right: none; border-bottom: 1px solid var(--border-2); }
        }
      `}</style>
    </>
  );
}