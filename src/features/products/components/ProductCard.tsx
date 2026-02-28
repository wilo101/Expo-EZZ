import { View, TouchableOpacity } from "react-native";
import { memo } from "react";
import { Image } from "expo-image";
import { Product } from "../types";
import { Text } from "../../../core/components/Text";
import { Heart, ShoppingBag } from "lucide-react-native";
import { useRouter } from "expo-router";

const ProductCardComponent = ({ product }: { product: Product }) => {
    const router = useRouter();

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
                // Haptics.selectionAsync(); // Optional: Nice touch on press
                router.push(`/product/${product.id}`);
            }}
            className="mb-8"
            style={{
                width: "48%",
            }}
        >
            <View className="relative w-full aspect-[3/4] rounded-[24px] overflow-hidden mb-3 border border-white/10 shadow-lg shadow-black/50">
                <Image
                    source={{ uri: product.images[0] }}
                    style={{ width: '100%', height: '100%', backgroundColor: '#1A1A1A' }}
                    contentFit="cover"
                    transition={500}
                    cachePolicy="memory-disk"
                />

                {/* Gradient Overlay for text readability at bottom */}
                <View className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Wishlist Button (Glass) */}
                <TouchableOpacity
                    className="absolute top-2 right-2 w-8 h-8 rounded-full items-center justify-center border border-white/20 bg-black/20 backdrop-blur-sm"
                >
                    <Heart size={14} color="white" />
                </TouchableOpacity>

                {/* New Badge (Gold) */}
                <View className="absolute top-2 left-2 px-2 py-1 bg-[#DBAC33]/90 rounded-md">
                    <Text className="text-black text-[8px] font-bold uppercase tracking-widest">NEW</Text>
                </View>
            </View>

            <View className="px-1">
                <Text variant="bold" className="text-white text-sm mb-1" numberOfLines={1}>
                    {product.name}
                </Text>
                <Text className="text-[#DBAC33] text-xs font-medium">
                    {product.currency} {product.price.toLocaleString()}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

// ⚡ Bolt: Wrapped ProductCard in React.memo to prevent unnecessary re-renders in FlatList
// Also removed manual Image.prefetch and synchronous console.log statements to prevent frame drops
export const ProductCard = memo(ProductCardComponent);
