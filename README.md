# Growix — Multi-Agent E-Commerce Decision Support System

Growix, e-ticaret satıcılarının operasyonel ve stratejik kararlarını optimize etmek için geliştirilmiş, yapay zeka destekli çok ajanlı (multi-agent) bir karar destek sistemidir. Kullanıcının yüklediği tek bir ürün görseli ve kısa açıklamadan yola çıkarak, arka planda paralel çalışan ajanlar vasıtasıyla derinlemesine pazar, fiyatlandırma ve risk analizleri gerçekleştirir.

## 🚀 Öne Çıkan Özellikler

* **Çok Ajanlı (Multi-Agent) Analiz Akışı:** Büyük dil modeli (LLM) entegrasyonu ile yapılandırılmış bağımsız yapay zeka ajanları; pazar analizi, SEO uyumlu içerik üretimi, fiyatlandırma, kâr projeksiyonu ve iade risk analizi görevlerini eşzamanlı ve koordineli olarak yürütür.
* **Gerçek Zamanlı Veri Akışı (SSE):** Arka planda çalışan yoğun yapay zeka ve veri işleme analizlerinin sonuçları, kullanıcının arayüzde bekleme süresini optimize etmek ve kesintisiz bir deneyim sunmak amacıyla Server-Sent Events (SSE) protokolü üzerinden anlık olarak istemciye aktarılır.
* **Gelişmiş Görsel ve Metin Analitiği:** Multimodal yapay zeka entegrasyonu sayesinde ürün görselleri ve ham metin verileri analiz edilerek, farklı tonlarda (profesyonel, samimi, dikkat çekici) pazarlama içerikleri ve optimize edilmiş fiyat önerileri üretilir.

## 🛠️ Teknolojik Yığın (Tech Stack)

### Backend & AI Katmanı
* **Dil & Framework:** Python, FastAPI (Asenkron mimari, yüksek performanslı API yönetimi)
* **Yapay Zeka (LLM):** Google Gemini 2.5 Flash API (Multimodal veri işleme)
* **Veritabanı:** PostgreSQL, Supabase

### Frontend Katmanı
* **Framework & Dil:** Next.js (App Router), TypeScript, React.js
* **Veri İletişimi:** Server-Sent Events (SSE) ile asenkron ve gerçek zamanlı veri senkronizasyonu

## 📐 Sistem Mimarisi

Sistem, istemciden (Frontend) gelen istekleri asenkron bir yapıda kabul eder. Süreç şu şekilde işler:

1.  **İstek Kabulü ve Doğrulama:** FastAPI backend katmanı, gelen görseli ve ürün bilgilerini doğrular.
2.  **Ajanların Dağıtımı (Orchestration):** Gemini altyapısı üzerinde kurgulanan 6 farklı ajan kendilerine atanan görevleri asenkron olarak tamamlar.
3.  **Canlı Veri Akışı:** Her bir ajanın tamamladığı analiz sonucu, tüm sürecin bitmesi beklenmeden SSE kanalı üzerinden anlık olarak Next.js arayüzüne basılır.

## 🔧 Kurulum ve Çalıştırma

### Gereksinimler
* Python 3.10+
* Node.js 18+
* Supabase Hesabı
* Gemini API Anahtarı

### 1. Backend Kurulumu
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows için: venv\Scripts\activate
pip install -r requirements.txt
