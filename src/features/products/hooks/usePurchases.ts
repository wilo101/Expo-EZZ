import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../core/api/apiClient";

export interface Purchase {
    id: string;
    orderNumber: string;
    date: string;
    total: number;
    currency: string;
    status: "Pending" | "Processing" | "Completed" | "Cancelled";
    itemsCount: number;
}

const mapApiPurchaseToPurchase = (p: any): Purchase => ({
    id: (p.id || p._id || "").toString(),
    orderNumber: p.orderNumber || p.number || `#${Math.floor(Math.random() * 10000)}`,
    date: p.createdAt || p.date || new Date().toISOString(),
    total: (p.totalCents || 0) / 100,
    currency: p.currency || "EGP",
    status: p.status || "Pending",
    itemsCount: p.items?.length || 0,
});

export const usePurchases = () => {
    return useQuery({
        queryKey: ["purchases"],
        queryFn: async () => {
            const { data } = await apiClient.get("/purchases");
            const list = Array.isArray(data) ? data : data.data || data.purchases || [];
            return list.map(mapApiPurchaseToPurchase);
        },
    });
};
