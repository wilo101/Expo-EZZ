import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../core/api/apiClient";
import { QUERY_CONFIG } from "../../../core/config/query";

export interface Collection {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    itemCount: number;
    handle: string;
}

const extractImageFromHtml = (html: string): string => {
    if (!html) return "";
    const imgMatch = html.match(/src=["']([^"']+bucket\.zammit\.shop[^"']+)["']/);
    return imgMatch?.[1] || "";
};

const parseCollectionImage = (apiCol: any): string => {
    // 1. Try 'image' field
    if (apiCol.image) {
        if (typeof apiCol.image === "string" && apiCol.image.length > 0) return apiCol.image;
        if (typeof apiCol.image === "object" && apiCol.image.url) return apiCol.image.url;
    }

    // 2. Extract from description HTML
    const htmlImage = extractImageFromHtml(apiCol.description);
    if (htmlImage) return htmlImage;

    // 3. Try other fields
    if (apiCol.thumbUrl) return apiCol.thumbUrl;
    if (apiCol.cover) return apiCol.cover;

    return "";
};

export const useCollections = () => {
    return useQuery({
        queryKey: ["collections"],
        queryFn: async () => {
            // Get collections list
            const { data } = await apiClient.get("/collections");
            const list = Array.isArray(data) ? data : data.data || data.collections || [];

            // Main categories to show (prioritized)
            const mainCategoryNames = ["Men", "Women", "Pandora", "Gift Boxes", "Couples", "Best Sellers"];

            // Filter to main categories and Get full details for each to get images
            const mainCategories = list.filter((c: any) =>
                mainCategoryNames.includes(c.name) || mainCategoryNames.some(m => c.name?.includes(m))
            );

            // Fetch full details for each main category in parallel
            const detailedCollections = await Promise.all(
                mainCategories.slice(0, 6).map(async (col: any) => {
                    try {
                        const { data: detail } = await apiClient.get(`/collections/${col.id}`);
                        const fullData = detail.data || detail;
                        return {
                            id: col.id.toString(),
                            name: fullData.name || col.name,
                            description: fullData.description || "",
                            imageUrl: parseCollectionImage(fullData),
                            itemCount: fullData.productCount || col.productCount || 0,
                            handle: fullData.handle || col.handle || "",
                        };
                    } catch {
                        return {
                            id: col.id.toString(),
                            name: col.name,
                            description: "",
                            imageUrl: "",
                            itemCount: col.productCount || 0,
                            handle: col.handle || "",
                        };
                    }
                })
            );

            // Sort by main category order
            const sorted = detailedCollections.sort((a, b) => {
                const aIdx = mainCategoryNames.findIndex(m => a.name.includes(m));
                const bIdx = mainCategoryNames.findIndex(m => b.name.includes(m));
                return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
            });

            console.log("📂 Collections with images:", sorted);
            return sorted;
        },
        refetchInterval: QUERY_CONFIG.REAL_TIME_SYNC_INTERVAL,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });
};
