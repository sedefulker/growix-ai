// ── Temel e-ticaret analiz tipi 
export interface ContentGenerationResponse {
  id: number;
  seo_title: string;
  base_description: string;
  tone_sincere: string;
  tone_professional: string;
  tone_youthful: string;
  tags: string[];

  // Finansal
  suggested_price: number;
  estimated_profit: number;
  pricing_logic: string;
  cost_price: number;
  commission_amount: number;
  commission_rate?: number;
  cargo_cost: number;
  net_profit: number;
  profit_margin: number;
  platform: string;

  // Ajan verileri (SSE'den gelen tam analiz)
  trend?: TrendData;
  pricing?: PricingData;
  profit?: ProfitData;
  return_risk?: ReturnRiskData;
}

// ── Trend Ajanı 
export interface TrendInsight {
  signal: "hot" | "rising" | "stable" | "falling";
  emoji: string;
  text: string;
  competition_label: string;
  weekly_label: string;
}

export interface TrendData {
  keyword: string;
  category: string;
  trend_change: number;
  weekly_searches: number;
  competitor_count: number;
  competition_level: string;
  insight: TrendInsight;
  related_keywords: string[];
  data_source: string;
  from_cache?: boolean;
}

// ── Fiyat Ajanı 
export interface PricingData {
  optimal_price: number;
  min_price: number;
  strategy: "premium" | "market" | "competitive" | "floor";
  strategy_label: string;
  margin_at_optimal: number;
  net_profit_per_unit: number;
  commission_amount: number;
  cargo_cost: number;
}

// ── Kâr Ajanı 
export interface ProfitScenario {
  units: number;
  revenue: number;
  net_profit: number;
  margin: number;
}

export interface ProfitData {
  cost_price: number;
  optimal_price: number;
  commission_amount: number;
  cargo_cost: number;
  net_profit_per_unit: number;
  profit_margin: number;
  scenarios: ProfitScenario[];
  action: string;
}

// ── İade Risk Ajanı 
export type RiskLevel = "YÜKSEK" | "ORTA" | "DÜŞÜK";

export interface ReturnRisk {
  id: string;
  title: string;
  level: RiskLevel;
  category_tr: string;
  description: string;
  fix: string;
  return_rate_impact: number;
}

export interface ReturnRiskFinancialImpact {
  estimated_current_return_rate: number;
  estimated_after_fix_rate: number;
  monthly_savings_per_100: number;
  annual_savings_per_100: number;
}

export interface ReturnRiskData {
  risks: ReturnRisk[];
  overall_risk: RiskLevel;
  summary: string;
  financial_impact: ReturnRiskFinancialImpact;
  data_source: string;
}

// ── Ajan akış tipleri 
export type AgentStatus = "idle" | "running" | "done" | "error";

export interface AgentStep {
  id: number;
  label: string;
  status: AgentStatus;
}

// ── Platform 
export type PlatformKey = "trendyol" | "hepsiburada" | "n11";
export type ToneKey     = "sincere" | "professional" | "youthful";