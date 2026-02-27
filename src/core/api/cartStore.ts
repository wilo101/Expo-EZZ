import { create } from "zustand";
import { Product } from "../../features/products/types";

export interface CartItem extends Product {
    quantity: number;
    selectedSize?: string;
}

interface CartState {
    items: CartItem[];
    addToCart: (product: Product, quantity: number, size?: string) => void;
    removeFromCart: (productId: string, size?: string) => void;
    updateQuantity: (productId: string, quantity: number, size?: string) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],

    addToCart: (product, quantity, size) => {
        const items = get().items;
        const existingItemIndex = items.findIndex(
            (item) => item.id === product.id && item.selectedSize === size
        );

        if (existingItemIndex > -1) {
            const newItems = [...items];
            newItems[existingItemIndex].quantity += quantity;
            set({ items: newItems });
        } else {
            set({ items: [...items, { ...product, quantity, selectedSize: size }] });
        }
    },

    removeFromCart: (productId, size) => {
        set({
            items: get().items.filter(
                (item) => !(item.id === productId && item.selectedSize === size)
            ),
        });
    },

    updateQuantity: (productId, quantity, size) => {
        const items = get().items.map((item) => {
            if (item.id === productId && item.selectedSize === size) {
                return { ...item, quantity: Math.max(1, quantity) };
            }
            return item;
        });
        set({ items });
    },

    clearCart: () => set({ items: [] }),

    getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
    },

    getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
    },
}));
