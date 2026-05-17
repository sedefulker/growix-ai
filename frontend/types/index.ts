export interface ContentGenerationRequest {
  image: File | null;
  brief_description: string;
  cost_price: number;
  platform: "trendyol" | "hepsiburada" | "n11"; // Harika seçim!
}

export interface ContentGenerationResponse {
  id?: number;
  created_at?: string;

  // İçerik
  seo_title: string;
  base_description: string;
  tone_sincere: string;
  tone_professional: string;
  tone_youthful: string;
  tags: string[];

  // Finansal — AI tahmini
  suggested_price: number;
  estimated_profit: number;
  pricing_logic: string;

  // Finansal — Kâr motoru
  cost_price: number;
  commission_rate: number;    
  commission_amount: number;
  cargo_cost: number;
  net_profit: number;
  profit_margin: number;
  platform: "trendyol" | "hepsiburada" | "n11"; 

  // Opsiyonel
  market_position?: string;
  image_url?: string;
}

export type ProductListing = ContentGenerationResponse;