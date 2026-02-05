export interface Product {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    currency: string;
    images: string[];
    arModelUrl?: string;
    sizes?: string[];
    material: string;
    inStock: boolean;
    websiteProductId?: string;
    createdAt: string;
    updatedAt: string;
}
