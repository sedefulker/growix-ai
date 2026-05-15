"use client";

import { useState } from "react";
import { generateContentListing } from "@/lib/api";
import { ContentGenerationResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud, Sparkles, Tag, AlignLeft, Type } from "lucide-react";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [brief, setBrief] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ContentGenerationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await generateContentListing(image, brief);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8 md:p-12 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">İçerik Optimizasyon Ajanı</h1>
          <p className="text-slate-500">Ürün görselini yükleyin, yapay zeka SEO uyumlu listeleme verilerini saniyeler içinde üretsin.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form Action */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-indigo-600" />
                  Veri Girişi
                </CardTitle>
                <CardDescription>Ürününüzü en iyi tanımlayan görseli ve kısa notu ekleyin.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="image">Ürün Görseli</Label>
                    <Input 
                      id="image" 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files?.[0] || null)}
                      className="cursor-pointer file:text-slate-600 file:bg-slate-100 file:border-0 hover:file:bg-slate-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brief">Satıcı Notu</Label>
                    <Textarea 
                      id="brief" 
                      placeholder="Örn: Siyah oversize tişört, pamuklu..."
                      value={brief}
                      onChange={(e) => setBrief(e.target.value)}
                      className="resize-none min-h-[100px]"
                      required
                    />
                  </div>

                  {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

                  <Button type="submit" disabled={isLoading || !image} className="w-full bg-indigo-600 hover:bg-indigo-700">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Ajan Çalışıyor...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        İçerik Üret
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Bento Grid Results */}
          <div className="lg:col-span-8 min-h-[500px]">
            {!result ? (
              <div className="h-full border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-slate-50/50">
                <p className="text-slate-400 text-sm font-medium">Sonuçları görüntülemek için içerik üretin.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-min">
                
                {/* SEO Title - Span 2 Columns */}
                <Card className="md:col-span-2 border-slate-200 shadow-sm bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-500 font-medium uppercase tracking-wider flex items-center gap-2">
                      <Type className="w-4 h-4" /> SEO Başlığı
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-semibold text-slate-900">{result.seo_title}</p>
                  </CardContent>
                </Card>

                {/* Base Description */}
                <Card className="border-slate-200 shadow-sm bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-500 font-medium uppercase tracking-wider flex items-center gap-2">
                      <AlignLeft className="w-4 h-4" /> Teknik Açıklama (HTML)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="text-sm text-slate-700 prose prose-sm prose-slate"
                      dangerouslySetInnerHTML={{ __html: result.base_description }} 
                    />
                  </CardContent>
                </Card>

                {/* Tags & Professional Tone */}
                <div className="space-y-4">
                  <Card className="border-slate-200 shadow-sm bg-indigo-50 border-indigo-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-indigo-700 font-medium uppercase tracking-wider flex items-center gap-2">
                        <Tag className="w-4 h-4" /> Akıllı Etiketler
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      {result.tags.map((tag, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-700 text-xs font-medium rounded-md">
                          {tag}
                        </span>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 shadow-sm bg-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-slate-500 font-medium uppercase tracking-wider">
                        Kurumsal Ton
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700 leading-relaxed">{result.tone_professional}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Alternative Tones - Span 2 Columns */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-slate-200 shadow-sm bg-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-slate-500 font-medium uppercase tracking-wider">
                        Samimi Ton
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700 leading-relaxed">{result.tone_sincere}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 shadow-sm bg-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-slate-500 font-medium uppercase tracking-wider">
                        Genç / Dinamik Ton
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700 leading-relaxed">{result.tone_youthful}</p>
                    </CardContent>
                  </Card>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}