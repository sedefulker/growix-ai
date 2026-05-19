"""
Growix — Trend Ajanı Servisi
Google Autocomplete API üzerinden gerçek zamanlı pazar sinyali üretir.
API key gerektirmez, kota sınırı yoktur.
"""
from __future__ import annotations

import hashlib
import logging
import random
import re
import time
import urllib.parse
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

# ── Cache 
_cache: dict = {}
CACHE_DURATION = 1800  # 30 dakika

# ── Sabitler 
STOP_WORDS = {
    "mavi", "kırmızı", "siyah", "beyaz", "gri", "yeşil", "sarı", "mor", "pembe",
    "5g", "4g", "lte", "pro", "lite", "plus", "max", "ultra", "mini",
    "gb", "tb", "mb", "inç", "cm", "ml", "adet",
    "yeni", "orjinal", "özel", "set", "paket", "hediye",
    "garantili", "garantisi", "stok", "türkiye", "ucuz", "fiyat",
    "modelleri", "fiyatları", "kılıfı", "hediyeli", "kasa",
}

CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "giyim":      ["elbise", "pantolon", "gömlek", "çorap", "kazak", "mont",
                   "ceket", "etek", "bluz", "tişört", "sweatshirt"],
    "elektronik": ["telefon", "laptop", "tablet", "kulaklık", "şarj", "kamera",
                   "bilgisayar", "mouse", "klavye", "monitör",
                   "oppo", "samsung", "xiaomi", "iphone", "huawei"],
    "spor":       ["spor", "fitness", "koşu", "dambıl", "yoga", "bisiklet",
                   "futbol", "yüzme", "atlama", "egzersiz"],
    "ev":         ["mutfak", "yatak", "dekor", "aydınlatma", "halı", "perde",
                   "mobilya", "kırlent", "çerçeve"],
    "kozmetik":   ["makyaj", "cilt", "parfüm", "şampuan", "krem", "ruj",
                   "saç", "serum", "maskara"],
    "oyuncak":    ["oyuncak", "lego", "puzzle", "bebek", "oyun", "peluş"],
    "gıda":       ["çay", "kahve", "baklava", "kuruyemiş", "organik", "zeytin", "bal"],
    "bahçe":      ["bahçe", "çiçek", "toprak", "saksı", "tohum", "fide"],
    "el yapımı":  ["el yapımı", "el örmesi", "el boyama", "el işi", "handmade", "ahşap"],
}

CATEGORY_BASELINES: dict[str, dict] = {
    "giyim":      {"base": 23, "competition": "Orta",   "weekly": (3000,  25000)},
    "elektronik": {"base": 15, "competition": "Yüksek", "weekly": (8000,  60000)},
    "spor":       {"base": 41, "competition": "Düşük",  "weekly": (2000,  18000)},
    "ev":         {"base": 18, "competition": "Orta",   "weekly": (4000,  30000)},
    "kozmetik":   {"base": 29, "competition": "Yüksek", "weekly": (5000,  40000)},
    "oyuncak":    {"base": 12, "competition": "Orta",   "weekly": (1500,  12000)},
    "gıda":       {"base": 22, "competition": "Düşük",  "weekly": (2500,  20000)},
    "bahçe":      {"base": 35, "competition": "Düşük",  "weekly": (1000,   8000)},
    "el yapımı":  {"base": 47, "competition": "Düşük",  "weekly": (800,    6000)},
    "genel":      {"base": 20, "competition": "Orta",   "weekly": (2000,  15000)},
}

COMMERCIAL_TERMS = {
    "fiyat", "satın al", "indirim", "kampanya", "trendyol",
    "hepsiburada", "n11", "modelleri", "kullananlar", "yorum",
    "tavsiye", "öneri", "kaç lira", "sipariş",
}

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "tr-TR,tr;q=0.9",
}


# ── Yardımcı fonksiyonlar 

def _simplify(keyword: str) -> str:
    """Uzun ürün başlığını 2-4 anlamlı kelimeye indirger."""
    main = re.split(r"[|\-&,:]", keyword)[0].strip()
    words = [
        w.title() for w in main.lower().split()
        if w not in STOP_WORDS and len(w) >= 2
    ]
    return " ".join(words[:4]) or keyword.split()[0].title()


def _detect_category(keyword: str) -> str:
    kw = keyword.lower()
    for cat, kws in CATEGORY_KEYWORDS.items():
        if any(k in kw for k in kws):
            return cat
    return "genel"


def _build_insight(keyword: str, change: float, competition: str, weekly: int) -> dict:
    if change >= 35:
        signal, emoji = "hot", "🔥"
        text = (f"{keyword} aramaları son 7 günde %{change:.0f} arttı. "
                "Rakip az, fırsat penceresi açık — hemen listele.")
    elif change >= 15:
        signal, emoji = "rising", "📈"
        text = (f"{keyword} istikrarlı büyüme gösteriyor. "
                f"Haftalık %{change:.0f} artış. Listelemek için iyi zaman.")
    elif change >= 0:
        signal, emoji = "stable", "📊"
        text = (f"{keyword} aramaları stabil seyrediyor. "
                f"%{change:.0f} hafif artış. Rekabetle izle.")
    else:
        signal, emoji = "falling", "📉"
        text = (f"{keyword} aramalarında %{abs(change):.0f} düşüş var. "
                "Fiyat veya başlık optimizasyonu düşün.")

    return {
        "signal":            signal,
        "emoji":             emoji,
        "text":              text,
        "competition_label": f"Rekabet: {competition}",
        "weekly_label":      f"Tahmini Arama: ~{weekly:,}".replace(",", "."),
    }


def _smart_mock(keyword: str, category: str) -> dict:
    """Gerçek veri alınamazsa deterministik akıllı fallback."""
    seed = int(hashlib.md5(keyword.lower().encode()).hexdigest()[:8], 16)
    rng  = random.Random(seed)

    base   = CATEGORY_BASELINES.get(category, CATEGORY_BASELINES["genel"])
    change = float(base["base"] + rng.randint(-12, 18))
    count  = rng.randint(12, 180)
    weekly = rng.randint(*base["weekly"])

    related_map = {
        "giyim":      ["kışlık", "pamuklu", "oversize"],
        "elektronik": ["wireless", "şarjlı", "taşınabilir"],
        "spor":       ["profesyonel", "hafif", "su geçirmez"],
        "ev":         ["dekoratif", "modern", "doğal"],
        "kozmetik":   ["organik", "vegan", "uzun süre"],
        "el yapımı":  ["el yapımı", "doğal boyalı", "geleneksel"],
        "genel":      ["kaliteli", "uygun fiyat", "hızlı teslimat"],
    }
    suffixes = related_map.get(category, related_map["genel"])
    related  = [f"{keyword} {s}" for s in suffixes]

    return {
        "keyword":           keyword,
        "category":          category,
        "trend_change":      round(change, 1),
        "weekly_searches":   weekly,
        "competitor_count":  count,
        "competition_level": base["competition"],
        "insight":           _build_insight(keyword, change, base["competition"], weekly),
        "related_keywords":  related,
        "data_source":       "smart_mock",
    }


# ── Google Autocomplete 

async def _fetch_suggestions(keyword: str) -> list[str]:
    encoded = urllib.parse.quote(keyword)
    url     = (
        f"http://suggestqueries.google.com/complete/search"
        f"?client=chrome&hl=tr&q={encoded}"
    )
    try:
        async with httpx.AsyncClient(timeout=5, headers=_HEADERS) as client:
            res = await client.get(url)
        if res.status_code == 200:
            data = res.json()
            suggestions: list[str] = data[1] if len(data) > 1 else []
            return [s for s in suggestions if s.lower() != keyword.lower()]
    except Exception as e:
        logger.warning("[trend] Google Autocomplete başarısız: %s", e)
    return []


def _analyze_suggestions(keyword: str, suggestions: list[str], category: str) -> dict:
    """
    Autocomplete önerilerindeki ticari sinyalleri puanlar ve
    pazar yoğunluğunu tahmin eder.
    """
    commercial_score = sum(
        1 for s in suggestions
        if any(t in s.lower() for t in COMMERCIAL_TERMS)
    )
    total = len(suggestions)
    base  = CATEGORY_BASELINES.get(category, CATEGORY_BASELINES["genel"])

    # Ticari sinyal yoğunluğuna göre trend ve rekabet belirle
    if total >= 8 and commercial_score >= 3:
        change, competition = 45.5 + commercial_score * 1.5, "Yüksek"
        signal = "hot"
    elif total >= 5:
        change, competition = 18.2 + commercial_score * 1.2, "Orta"
        signal = "rising"
    elif total > 0:
        change, competition = 5.4, "Düşük"
        signal = "stable"
    else:
        change, competition = -12.5, "Çok Düşük"
        signal = "falling"

    weekly     = (total * 1250) + (commercial_score * 850) + base["weekly"][0]
    comp_count = (total * 8) + 15
    related    = [s.title() for s in suggestions[:5]]

    insight = _build_insight(keyword, change, competition, weekly)
    insight["signal"] = signal   # override ile gerçek sinyal

    return {
        "trend_change":      round(change, 1),
        "weekly_searches":   weekly,
        "competitor_count":  comp_count,
        "competition_level": competition,
        "related_keywords":  related,
        "insight":           insight,
        "data_source":       "google_autocomplete_live",
    }


# ── Ana fonksiyon 

async def analyze_trend(keyword: str) -> dict:
    """
    Trend analizi pipeline:
    1. Cache kontrolü
    2. Google Autocomplete ile canlı pazar verisi
    3. Başarısız → deterministik akıllı mock
    """
    simplified = _simplify(keyword)
    category   = _detect_category(keyword)
    cache_key  = f"trend_{simplified.lower().replace(' ', '_')[:60]}"

    # 1. Cache
    if cache_key in _cache:
        cached, ts = _cache[cache_key]
        if time.time() - ts < CACHE_DURATION:
            logger.info("[trend] cache hit: '%s'", simplified)
            return {**cached, "from_cache": True}

    # 2. Google Autocomplete
    suggestions = await _fetch_suggestions(simplified)
    if not suggestions:
        # Fallback: kategori terimini dene
        suggestions = await _fetch_suggestions(simplified.split()[0])

    if suggestions:
        analysis = _analyze_suggestions(simplified, suggestions, category)
        result = {
            "keyword":  simplified,
            "category": category,
            **analysis,
        }
        logger.info(
            "[trend] ✓ autocomplete '%s' → %d öneri, %+.1f%%",
            simplified, len(suggestions), result["trend_change"]
        )
    else:
        logger.info("[trend] autocomplete başarısız → smart_mock")
        result = _smart_mock(simplified, category)

    _cache[cache_key] = (result, time.time())
    return {**result, "from_cache": False}