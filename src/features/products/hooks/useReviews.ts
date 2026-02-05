import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../core/api/apiClient";
import { QUERY_CONFIG } from "../../../core/config/query";

export interface Review {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
    avatarUrl?: string;
}

const mapApiReviewToReview = (apiReview: any): Review => ({
    id: (apiReview.id || apiReview._id || "").toString(),
    userName: apiReview.customerName || apiReview.author || "Guest User",
    rating: apiReview.rating || 5,
    comment: apiReview.comment || apiReview.body || "",
    date: apiReview.createdAt || new Date().toISOString(),
    avatarUrl: apiReview.avatarUrl,
});

export const useReviews = (productId?: string) => {
    return useQuery({
        queryKey: productId ? ["reviews", productId] : ["reviews"],
        queryFn: async () => {
            const endpoint = productId ? `/reviews?product_id=${productId}` : "/reviews";
            const { data } = await apiClient.get(endpoint);
            const list = Array.isArray(data) ? data : data.data || data.reviews || [];
            return list.map(mapApiReviewToReview);
        },
        refetchInterval: QUERY_CONFIG.REAL_TIME_SYNC_INTERVAL,
    });
};
