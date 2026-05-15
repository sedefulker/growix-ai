import { ContentGenerationResponse } from "@/types";

export async function generateContentListing(
    image: File,
    briefDescription: string
): Promise<ContentGenerationResponse> {
    const formData = new FormData();
    formData.append("image", image);
    formData.append("brief_description", briefDescription);

    const response = await fetch("http://localhost:8000/api/v1/content/generate-listing", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        // Backend'den dönen HTTPException detaylarını yakalıyoruz
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Sunucu ile iletişim kurulamadı.");
    }

    return response.json();
}