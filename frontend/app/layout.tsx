import type { Metadata } from "next";
import { Cormorant_Garamond, JetBrains_Mono, Outfit } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Growix — E-Ticaret Satıcı İstihbarat Platformu",
  description: "Türkiye'nin küçük e-ticaret satıcıları için yapay zeka destekli 6 ajanlı karar platformu.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${cormorant.variable} ${jetbrains.variable} ${outfit.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <style>{`
          /* ────────────────────────────────────────────────────────────
             DESIGN TOKENS
          ──────────────────────────────────────────────────────────── */
          :root {
            /* Palette */
            --paper:      #F2EDE0;
            --paper-2:    #EAE3D2;
            --paper-3:    #E0D8C4;
            --ink:        #100F0C;
            --ink-2:      #28261F;
            --ink-3:      #605A50;
            --ink-4:      #9E9890;
            --red:        #A82E14;
            --red-dim:    #F3E8E4;
            --gold:       #846010;
            --gold-dim:   #F5EFE0;
            --green:      #245830;
            --green-dim:  #E3EFE6;
            --amber:      #C17D11;
            --amber-dim:  #FBF4E4;
            --border:     #C3BDB0;
            --border-2:   #D5CFC0;

            /* Typography */
            --font-display: 'Cormorant Garamond', 'Georgia', serif;
            --font-mono:    'JetBrains Mono', 'Menlo', 'Courier New', monospace;
            --font-body:    'Outfit', 'Helvetica Neue', sans-serif;

            /* Spacing (4px base) */
            --s-1: 4px;
            --s-2: 8px;
            --s-3: 12px;
            --s-4: 16px;
            --s-5: 20px;
            --s-6: 24px;
            --s-8: 32px;
            --s-10: 40px;
            --s-12: 48px;
          }

          /* ────────────────────────────────────────────────────────────
             RESET
          ──────────────────────────────────────────────────────────── */
          *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          html { scroll-behavior: smooth; }

          body {
            font-family: var(--font-body);
            background: var(--paper);
            color: var(--ink);
            min-height: 100vh;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          /* ────────────────────────────────────────────────────────────
             TYPOGRAPHY UTILITIES
          ──────────────────────────────────────────────────────────── */

          /* CRITICAL: All numeric values use tabular mono */
          .num {
            font-family: var(--font-mono);
            font-variant-numeric: tabular-nums;
            letter-spacing: -0.02em;
          }

          .display-text {
            font-family: var(--font-display);
            letter-spacing: -0.02em;
          }

          .mono-label {
            font-family: var(--font-mono);
            font-size: 9px;
            font-weight: 500;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--ink-3);
          }

          /* ────────────────────────────────────────────────────────────
             LAYOUT UTILITIES
          ──────────────────────────────────────────────────────────── */
          .sr-only {
            position: absolute;
            width: 1px; height: 1px;
            padding: 0; margin: -1px;
            overflow: hidden;
            clip: rect(0,0,0,0);
            white-space: nowrap;
            border: 0;
          }

          .section-rule {
            display: flex;
            align-items: center;
            gap: 14px;
            margin-bottom: var(--s-6);
          }
          .section-rule-line  { flex: 1; height: 1px; background: var(--border); }
          .section-rule-label {
            font-family: var(--font-mono);
            font-size: 9px;
            font-weight: 500;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--ink-4);
            white-space: nowrap;
          }

          /* ────────────────────────────────────────────────────────────
             BLOCK — Editorial card system (NO round corners, NO shadows)
          ──────────────────────────────────────────────────────────── */
          .block {
            border: 1px solid var(--border);
            background: var(--paper);
          }

          .block-head {
            padding: 9px var(--s-4);
            border-bottom: 1px solid var(--border-2);
            background: var(--paper-2);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--s-3);
          }

          .block-body { padding: var(--s-4); }

          /* ────────────────────────────────────────────────────────────
             COPY BUTTON
          ──────────────────────────────────────────────────────────── */
          .copy-btn {
            font-family: var(--font-mono);
            font-size: 9px;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--ink-4);
            background: transparent;
            border: 1px solid var(--border);
            padding: 3px 9px;
            cursor: pointer;
            transition: color 150ms, border-color 150ms;
            white-space: nowrap;
            flex-shrink: 0;
          }
          .copy-btn:hover { color: var(--red); border-color: var(--red); }
          .copy-btn[data-copied] { color: var(--gold); border-color: var(--gold); }

          /* ────────────────────────────────────────────────────────────
             TONE TABS
          ──────────────────────────────────────────────────────────── */
          .tone-tabs { display: flex; gap: 2px; }
          .tone-tab {
            padding: 5px 10px;
            font-family: var(--font-mono);
            font-size: 9px;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            background: var(--paper-2);
            color: var(--ink-4);
            border: 1px solid var(--border);
            cursor: pointer;
            transition: all 150ms;
          }
          .tone-tab:hover  { color: var(--ink-2); border-color: var(--ink-3); }
          .tone-tab.active { background: var(--ink); color: var(--paper); border-color: var(--ink); }

          /* ────────────────────────────────────────────────────────────
             TAG CHIP
          ──────────────────────────────────────────────────────────── */
          .tag-chip {
            font-family: var(--font-mono);
            font-size: 10px;
            letter-spacing: 0.04em;
            color: var(--ink-3);
            background: var(--paper-2);
            border: 1px solid var(--border);
            padding: 4px 10px;
            display: inline-block;
            transition: border-color 150ms, color 150ms;
          }
          .tag-chip:hover { border-color: var(--ink-3); color: var(--ink-2); }

          /* ────────────────────────────────────────────────────────────
             SPINNER
          ──────────────────────────────────────────────────────────── */
          .spinner {
            width: 12px; height: 12px;
            border: 1.5px solid rgba(243,237,224,0.25);
            border-top-color: var(--paper);
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
            flex-shrink: 0;
          }
          @keyframes spin { to { transform: rotate(360deg); } }

          /* ────────────────────────────────────────────────────────────
             ERROR BAR
          ──────────────────────────────────────────────────────────── */
          .err-bar {
            padding: 10px 14px;
            background: var(--red-dim);
            border: 1px solid var(--red);
            border-left: 3px solid var(--red);
            font-family: var(--font-mono);
            font-size: 11px;
            color: var(--red);
            letter-spacing: 0.03em;
            margin-top: var(--s-3);
          }

          /* ────────────────────────────────────────────────────────────
             STATUS PILLS
          ──────────────────────────────────────────────────────────── */
          .pill {
            font-family: var(--font-mono);
            font-size: 9px;
            font-weight: 500;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            padding: 3px 8px;
            display: inline-block;
            white-space: nowrap;
          }
          .pill-green  { background: var(--green-dim);  color: var(--green); }
          .pill-red    { background: var(--red-dim);    color: var(--red);   }
          .pill-amber  { background: var(--amber-dim);  color: var(--amber); }
          .pill-neutral{ background: var(--paper-2);    color: var(--ink-3); }
        `}</style>
        {children}
      </body>
    </html>
  );
}