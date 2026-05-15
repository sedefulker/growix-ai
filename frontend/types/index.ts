// backend'den (ProductListingResponse) dönen JSON verisinin TypeScript arayüzü

export interface ContentGenerationRequest {
    image: File;
    brief_description: string;
}

export interface ContentGenerationResponse {
    seo_title: string;
    base_description: string;
    tone_sincere: string;
    tone_professional: string;
    tone_youthful: string;
    tags: string[];
}