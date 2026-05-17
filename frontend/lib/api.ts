import { ContentGenerationResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function generateContentListing(
  image: File,
  briefDescription: string,
  costPrice: number,
  platform: string = "trendyol",
): Promise<ContentGenerationResponse> {
  const formData = new FormData();
  formData.append("image", image);
  formData.append("brief_description", briefDescription);
  formData.append("cost_price", costPrice.toString());
  formData.append("platform", platform);

  const response = await fetch(`${API_BASE_URL}/content/generate-listing`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "İçerik oluşturulurken hata oluştu.");
  }

  return response.json();
}

export async function getAllListings(): Promise<ContentGenerationResponse[]> {
  const response = await fetch(`${API_BASE_URL}/content/listings`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "Veriler yüklenirken hata oluştu.");
  }

  return response.json();
}

export async function getListingById(id: number): Promise<ContentGenerationResponse> {
  const response = await fetch(`${API_BASE_URL}/content/listings/${id}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "Analiz bulunamadı.");
  }

  return response.json();
}