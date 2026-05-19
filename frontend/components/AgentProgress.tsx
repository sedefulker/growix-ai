"use client";

import type { AgentStep } from "@/types";

interface AgentProgressProps {
  steps: AgentStep[];
}

const STATUS_CONFIG = {
  idle:    { icon: "○", color: "var(--ink-4)",  bg: "transparent" },
  running: { icon: "◎", color: "var(--amber)",  bg: "var(--amber-dim)" },
  done:    { icon: "●", color: "var(--green)",  bg: "var(--green-dim)" },
  error:   { icon: "✕", color: "var(--red)",    bg: "var(--red-dim)" },
} as const;

export default function AgentProgress({ steps }: AgentProgressProps) {
  const doneCount  = steps.filter((s) => s.status === "done").length;
  const hasError   = steps.some((s) => s.status === "error");
  const allDone    = doneCount === steps.length;
  const activeStep = steps.find((s) => s.status === "running");

  const statusText = hasError
    ? "Hata oluştu"
    : allDone
    ? `${doneCount}/${steps.length} tamamlandı`
    : activeStep
    ? `${activeStep.label} çalışıyor...`
    : "Başlatılıyor";

  return (
    <>
      <div className="ap" role="status" aria-live="polite" aria-label="Ajan akış durumu">
        <div className="ap-head">
          <span className="mono-label">Ajan Akışı</span>
          <span className="ap-status-text">{statusText}</span>
        </div>

        <div className="ap-track">
          {steps.map((step, idx) => {
            const cfg = STATUS_CONFIG[step.status];
            const isPrev = steps[idx - 1]?.status === "done";
            return (
              <div
                key={step.id}
                className={`ap-step ap-step--${step.status}`}
                aria-label={`${step.label}: ${step.status}`}
              >
                {/* Connector */}
                {idx > 0 && (
                  <div
                    className={`ap-conn ${isPrev || step.status === "done" ? "ap-conn--active" : ""}`}
                    aria-hidden="true"
                  />
                )}

                {/* Node */}
                <div className="ap-node" aria-hidden="true">
                  <span className={`ap-icon ap-icon--${step.status}`}>
                    {cfg.icon}
                  </span>
                </div>

                {/* Label */}
                <div className="ap-info">
                  <span className="ap-num">Ajan {step.id}</span>
                  <span className="ap-label">{step.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .ap {
          border: 1px solid var(--border);
          background: var(--paper-2);
          margin-bottom: 16px;
        }

        .ap-head {
          padding: 9px 16px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--paper-3);
        }

        .ap-status-text {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.08em;
          color: var(--ink-4);
        }

        /* TRACK */
        .ap-track {
          display: flex;
          align-items: flex-start;
          padding: 14px 16px;
          position: relative;
        }

        /* STEP */
        .ap-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
          gap: 5px;
        }

        /* CONNECTOR */
        .ap-conn {
          position: absolute;
          top: 10px;
          right: calc(50% + 11px);
          left: calc(-50% + 11px);
          height: 1px;
          background: var(--border-2);
          z-index: 0;
          transition: background 300ms;
        }
        .ap-conn--active { background: var(--green); }

        /* NODE */
        .ap-node {
          position: relative;
          z-index: 1;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--paper-2);
        }

        /* ICON */
        .ap-icon {
          font-family: var(--font-mono);
          font-size: 15px;
          line-height: 1;
          color: var(--ink-4);
          display: block;
          transition: color 200ms;
        }
        .ap-icon--running {
          color: var(--amber);
          animation: ap-pulse 1.2s ease-in-out infinite;
        }
        .ap-icon--done  { color: var(--green); }
        .ap-icon--error { color: var(--red); }

        @keyframes ap-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.9); }
        }

        /* INFO */
        .ap-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          text-align: center;
        }
        .ap-num {
          font-family: var(--font-mono);
          font-size: 8px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-4);
        }
        .ap-label {
          font-family: var(--font-mono);
          font-size: 9px;
          color: var(--ink-3);
          max-width: 64px;
          line-height: 1.3;
        }
        .ap-step--running .ap-label { color: var(--amber); font-weight: 500; }
        .ap-step--done    .ap-label { color: var(--ink-2); }
        .ap-step--error   .ap-label { color: var(--red); }

        /* MOBILE */
        @media (max-width: 600px) {
          .ap-track   { flex-direction: column; gap: 8px; padding: 12px 16px; }
          .ap-step    { flex-direction: row; align-items: center; gap: 10px; }
          .ap-info    { align-items: flex-start; text-align: left; }
          .ap-conn    { display: none; }
          .ap-step    { flex: none; }
        }
      `}</style>
    </>
  );
}