import type { Metadata } from "next";
import { Playfair_Display, IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700", "800", "900"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Growix — E-Ticaret Satıcı İstihbarat Platformu",
  description: "Türkiye'nin küçük e-ticaret satıcıları için yapay zeka destekli karar platformu.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${playfair.variable} ${mono.variable} ${jakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}