import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../core/api/apiClient";
import { QUERY_CONFIG } from "../../../core/config/query";
import { Product } from "../types";

// Stable constants to prevent unnecessary re-renders
const FALLBACK_DATE = new Date(0).toISOString();
const PLACEHOLDER_IMAGES = ["https://placeholder.com/prod.jpg"];
const EMPTY_ARRAY: string[] = [];

const parseProductImages = (apiProduct: any): string[] => {
    const imageUrls: string[] = [];
    const seenUrls = new Set<string>();

    // Helper to clean URL to high-res version
    const getHighResUrl = (url: string): string => {
        if (!url || typeof url !== 'string') return "";
        // Remove common low-res suffixes like _thumb, _small, _medium, _100x100, etc.
        // Also remove query parameters like ?width=200
        let cleanUrl = url.split('?')[0];

        // Regex to strip dimension suffixes (e.g., _200x200, _thumb, _small)
        // Adjust these patterns based on what the actual API returns if known,
        // but these are common standard patterns.
        cleanUrl = cleanUrl.replace(/(_thumb|_small|_medium|_large|_\d+x\d+)(\.[a-zA-Z]+)$/i, '$2');

        return cleanUrl;
    };

    const addUrl = (rawUrl: string) => {
        const highRes = getHighResUrl(rawUrl);
        if (highRes && highRes.length > 5 && !seenUrls.has(highRes)) {
            seenUrls.add(highRes);
            imageUrls.push(highRes);
        }
    };

    // Priority 0: 'imagesUrls' (The most comprehensive source found in debugging)
    // Structure: [{ id: 123, urls: ["url1", "url2", ...] }, ...]
    if (Array.isArray(apiProduct.imagesUrls)) {
        apiProduct.imagesUrls.forEach((entry: any) => {
            if (entry && Array.isArray(entry.urls) && entry.urls.length > 0) {
                // Usually the first URL is the original/main one
                addUrl(entry.urls[0]);
            }
        });
    }

    // Priority 1: 'images' array (usually contains the full list)
    if (Array.isArray(apiProduct.images)) {
        apiProduct.images.forEach((img: any) => {
            if (typeof img === "string") addUrl(img);
            else if (img && typeof img === "object") {
                addUrl(img.url || img.src || img.imageUrl || "");
            }
        });
    }

    // Priority 2: Single fields (if not already covered by images array)
    // Sometimes 'image' or 'main_image' is distinct or the only field present
    const singleFields = ["image", "main_image", "image_url", "thumbUrl", "imageUrl"];
    singleFields.forEach(field => {
        if (typeof apiProduct[field] === "string") {
            addUrl(apiProduct[field]);
        }
    });

    // Priority 3: 'thumbUrls' array (as fallback)
    // Only use if we haven't found enough images yet (or merge if truly unique)
    if (Array.isArray(apiProduct.thumbUrls)) {
        apiProduct.thumbUrls.forEach((url: any) => {
            if (typeof url === "string") addUrl(url);
        });
    }

    return imageUrls.length > 0 ? imageUrls : PLACEHOLDER_IMAGES;
};

const parseProductSizes = (apiProduct: any): string[] => {
    // 1. sizes array
    if (Array.isArray(apiProduct.sizes)) return apiProduct.sizes.map((s: any) => s.toString());

    // 2. available_sizes array
    if (Array.isArray(apiProduct.available_sizes)) return apiProduct.available_sizes.map((s: any) => s.toString());

    // 3. variants array
    if (Array.isArray(apiProduct.variants)) {
        const variants = apiProduct.variants
            .map((v: any) => v.size?.toString() || "")
            .filter((s: string) => s.length > 0);
        return variants.length > 0 ? variants : EMPTY_ARRAY;
    }

    return EMPTY_ARRAY;
};

const mapApiProductToProduct = (apiProduct: any): Product => {
    // ID: Try multiple fields to ensure navigation works
    const id = (apiProduct.id || apiProduct._id || apiProduct.product_id || "").toString();

    // Price: Extract from defaultVariant or direct fields (match Flutter logic)
    let price = 0;
    const defaultVariant = apiProduct.defaultVariant || {};

    if (defaultVariant.discountedPriceCents && defaultVariant.discountedPriceCents > 0) {
        price = defaultVariant.discountedPriceCents / 100;
    } else if (defaultVariant.priceCents && defaultVariant.priceCents > 0) {
        price = defaultVariant.priceCents / 100;
    } else if (apiProduct.discountedPriceCents && apiProduct.discountedPriceCents > 0) {
        // Fallback to root level priceCents
        price = apiProduct.discountedPriceCents / 100;
    } else if (apiProduct.priceCents && apiProduct.priceCents > 0) {
        price = apiProduct.priceCents / 100;
    } else {
        // Fallback to direct price fields
        let directPrice = apiProduct.price || apiProduct.selling_price || apiProduct.sale_price || 0;
        if (typeof directPrice === "string") {
            // Remove commas and other non-numeric chars except dot
            directPrice = directPrice.replace(/[^0-9.]/g, '');
            price = parseFloat(directPrice) || 0;
        } else {
            price = directPrice;
        }
    }

    return {
        id,
        name: apiProduct.name || apiProduct.title || apiProduct.product_name || "Unknown Product",
        description: apiProduct.description || apiProduct.desc || apiProduct.details || "",
        category: apiProduct.category || apiProduct.category_name || "uncategorized",
        price,
        currency: apiProduct.currency || "EGP",
        images: parseProductImages(apiProduct),
        material: apiProduct.material || apiProduct.metal_type || "925 Sterling Silver",
        inStock: defaultVariant.quantity > 0 || apiProduct.inStock === true || (apiProduct.quantity && apiProduct.quantity > 0),
        createdAt: apiProduct.createdAt || apiProduct.created_at || FALLBACK_DATE,
        updatedAt: apiProduct.updatedAt || apiProduct.updated_at || FALLBACK_DATE,
        sizes: parseProductSizes(apiProduct),
    };
};

export const useProducts = (params?: Record<string, any>) => {
    return useQuery({
        queryKey: ["products", params],
        queryFn: async () => {
            const { data } = await apiClient.get("/products", { params });

            // The API structure usually wraps products in a list/data field
            let productsList: any[] = [];
            if (Array.isArray(data)) {
                productsList = data;
            } else if (data.data && Array.isArray(data.data.products)) {
                productsList = data.data.products;
            } else if (data.data && Array.isArray(data.data)) {
                productsList = data.data;
            } else if (data.products && Array.isArray(data.products)) {
                productsList = data.products;
            }

            return productsList.map(mapApiProductToProduct);
        },
        staleTime: QUERY_CONFIG.STALE_TIME,
        refetchInterval: QUERY_CONFIG.REAL_TIME_SYNC_INTERVAL,
    });
};

export const useProduct = (id: string) => {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: ["product", id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/products/${id}`);
            const apiProduct = data.data || data.product || data;
            return mapApiProductToProduct(apiProduct);
        },
        enabled: !!id,
        initialData: () => {
            // Checks all 'products' queries to find this specific product
            const allProductsQueries = queryClient.getQueriesData({ queryKey: ["products"] });

            for (const [key, data] of allProductsQueries) {
                const product = (data as Product[])?.find((p) => p.id === id);
                if (product) return product;
            }
            return undefined;
        },
        staleTime: QUERY_CONFIG.STALE_TIME,
        refetchInterval: QUERY_CONFIG.REAL_TIME_SYNC_INTERVAL,
    });
};
