import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../core/api/apiClient";
import { QUERY_CONFIG } from "../../../core/config/query";

export interface Collection {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    itemCount: number;
}

const parseCollectionImage = (apiCol: any): string => {
    // 1. Try 'image' field (string or object)
    if (apiCol.image) {
        if (typeof apiCol.image === "string" && apiCol.image.length > 0) return apiCol.image;
        if (typeof apiCol.image === "object") {
            if (apiCol.image.url) return apiCol.image.url.toString();
            if (apiCol.image.src) return apiCol.image.src.toString();
        }
    }

    // 2. Try 'thumbUrl'
    if (apiCol.thumbUrl && typeof apiCol.thumbUrl === "string") return apiCol.thumbUrl;

    // 3. Try 'cover' or 'imageUrl'
    if (apiCol.cover && typeof apiCol.cover === "string") return apiCol.cover;
    if (apiCol.imageUrl && typeof apiCol.imageUrl === "string") return apiCol.imageUrl;

    return "https://placeholder.com/collection.jpg";
};

const mapApiCollectionToCollection = (apiCol: any): Collection => ({
    id: (apiCol.id || apiCol._id || "").toString(),
    name: apiCol.name || apiCol.title || "Collection",
    description: apiCol.description || "",
    imageUrl: parseCollectionImage(apiCol),
    itemCount: apiCol.productsCount || apiCol.product_count || 0,
});

export const useCollections = () => {
    return useQuery({
        queryKey: ["collections"],
        queryFn: async () => {
            const { data } = await apiClient.get("/collections");
            const list = Array.isArray(data) ? data : data.data || data.collections || [];
            return list.map(mapApiCollectionToCollection);
        },
        refetchInterval: QUERY_CONFIG.REAL_TIME_SYNC_INTERVAL,
    });
};
