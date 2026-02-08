import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../core/api/apiClient";
import { QUERY_CONFIG } from "../../../core/config/query";
import { Product } from "../types";

const parseProductImages = (apiProduct: any): string[] => {
    const imageUrls: string[] = [];
    const seenBaseNames = new Set<string>();

    // Helper to extract base filename for deduplication
    // e.g. "http://site.com/img_thumb.jpg" -> "img"
    const getBaseName = (url: string): string => {
        if (!url) return "";
        const parts = url.split('/');
        const filename = parts[parts.length - 1].split('?')[0];
        // Remove extension
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
        // Remove common size suffixes to treat "img_thumb" and "img" as same
        return nameWithoutExt.replace(/(_thumb|_small|_medium|_large|_\d+x\d+)$/i, '');
    };

    // Helper to clean URL - only removes query parameters
    const getCleanUrl = (url: string): string => {
        if (!url || typeof url !== 'string') return "";

        // Remove query parameters only (e.g., ?width=200)
        // Do NOT try to strip _thumb/_small suffixes as this causes 404s
        // Trust the API to provide the correct image URL
        return url.split('?')[0];
    };

    const addUrl = (rawUrl: string) => {
        if (!rawUrl || typeof rawUrl !== 'string') return;

        const cleanUrl = getCleanUrl(rawUrl);
        const baseName = getBaseName(cleanUrl);

        // If we haven't seen this image base name before, add it
        if (baseName && baseName.length > 2 && !seenBaseNames.has(baseName)) {
            seenBaseNames.add(baseName);
            imageUrls.push(cleanUrl);
        }
    };

    // Priority 0: 'imagesUrls' (Detailed object structure)
    // Structure: [{ id: 123, urls: [thumb, medium, large, original] }, ...]
    // We want the LAST url (highest quality) not the first (thumbnail)
    if (Array.isArray(apiProduct.imagesUrls)) {
        apiProduct.imagesUrls.forEach((entry: any) => {
            if (entry && Array.isArray(entry.urls) && entry.urls.length > 0) {
                // Pick the LAST url (typically highest resolution)
                const highestQualityUrl = entry.urls[entry.urls.length - 1];
                addUrl(highestQualityUrl);
            }
        });
    }

    // Priority 1: 'images' array (Standard list)
    // Only process if we haven't found enough images yet? 
    // Usually these are consistent, so we can append, but deduplication deals with overlap.
    if (Array.isArray(apiProduct.images)) {
        apiProduct.images.forEach((img: any) => {
            if (typeof img === "string") addUrl(img);
            else if (img && typeof img === "object") {
                addUrl(img.url || img.src || img.imageUrl || "");
            }
        });
    }

    // STOP if we have found images from the main arrays. 
    // This prevents adding lower-quality fallbacks (like single fields or thumbs) that are likely duplicates.
    if (imageUrls.length > 0) return imageUrls;

    // Priority 2: Single fields (Fallback if no arrays)
    // Include thumbUrl as it's often the only field in list responses
    const singleFields = ["main_image", "image", "imageUrl", "image_url", "thumbUrl"];
    for (const field of singleFields) {
        if (typeof apiProduct[field] === "string" && apiProduct[field]) {
            addUrl(apiProduct[field]);
            // If we found a main image, stop. Don't look for thumbs.
            if (imageUrls.length > 0) return imageUrls;
        }
    }

    // Priority 3: Collections of variants (Last Resort)
    if (imageUrls.length === 0 && Array.isArray(apiProduct.variants)) {
        apiProduct.variants.forEach((variant: any) => {
            if (variant.image) addUrl(variant.image);
            if (variant.imageUrl) addUrl(variant.imageUrl);
        });
    }

    return imageUrls.length > 0 ? imageUrls : ["https://placeholder.com/prod.jpg"];
};

const parseProductSizes = (apiProduct: any): string[] => {
    // 1. sizes array
    if (Array.isArray(apiProduct.sizes)) return apiProduct.sizes.map((s: any) => s.toString());

    // 2. available_sizes array
    if (Array.isArray(apiProduct.available_sizes)) return apiProduct.available_sizes.map((s: any) => s.toString());

    // 3. variants array
    if (Array.isArray(apiProduct.variants)) {
        return apiProduct.variants
            .map((v: any) => v.size?.toString() || "")
            .filter((s: string) => s.length > 0);
    }

    return [];
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
    } else if (apiProduct.variants && Array.isArray(apiProduct.variants) && apiProduct.variants.length > 0) {
        // Fallback: Check first variant if defaultVariant is null
        const firstVariant = apiProduct.variants[0];
        if (firstVariant.discountedPriceCents > 0) price = firstVariant.discountedPriceCents / 100;
        else if (firstVariant.priceCents > 0) price = firstVariant.priceCents / 100;
        else if (firstVariant.price) {
            const vPrice = firstVariant.price.toString().replace(/[^0-9.]/g, '');
            price = parseFloat(vPrice) || 0;
        }
    }

    if (price === 0) {
        // Fallback to direct price fields at root
        // Check ALL potential price keys to capture any loose data
        const directPrice = apiProduct.price ||
            apiProduct.selling_price ||
            apiProduct.sale_price ||
            apiProduct.discountedPrice ||
            apiProduct.final_price || 0;

        if (typeof directPrice === "string") {
            const cleanString = directPrice.replace(/[^0-9.]/g, '');
            price = parseFloat(cleanString);
        } else {
            price = Number(directPrice);
        }
    }

    // Safety check: ensure price is a valid number
    if (isNaN(price)) price = 0;

    const images = parseProductImages(apiProduct);

    console.log(`[Price Debug] ID:${id} Name:"${apiProduct.name}" ParsedPrice:${price}`);
    console.log(`[Image Debug] ID:${id} ImagesFound:${images.length} FirstImage:${images[0]}`);

    if (images.length === 0 || images[0].includes("placeholder")) {
        // Log Full Object if no images found to see what fields are available
        console.log(`[Image Debug Missing] Raw JSON: ${JSON.stringify(apiProduct)}`);
    }

    return {
        id,
        name: apiProduct.name || apiProduct.title || apiProduct.product_name || "Unknown Product",
        description: apiProduct.description || apiProduct.desc || apiProduct.details || "",
        category: apiProduct.category || apiProduct.category_name || "uncategorized",
        price,
        currency: apiProduct.currency || "EGP",
        images,
        material: apiProduct.material || apiProduct.metal_type || "925 Sterling Silver",
        inStock: defaultVariant.quantity > 0 || apiProduct.inStock === true || (apiProduct.quantity && apiProduct.quantity > 0),
        createdAt: apiProduct.createdAt || apiProduct.created_at || new Date().toISOString(),
        updatedAt: apiProduct.updatedAt || apiProduct.updated_at || new Date().toISOString(),
        sizes: parseProductSizes(apiProduct),
    };
};

export const useProducts = (params?: Record<string, any>) => {
    return useQuery({
        queryKey: ["products", params],
        queryFn: async () => {
            console.log(`[API Debug] Fetching products with params:`, JSON.stringify(params));
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
