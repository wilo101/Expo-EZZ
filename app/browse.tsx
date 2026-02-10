import { View, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, ListRenderItem } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../src/core/components/Text";
import { ArrowLeft, Search } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState, useMemo, useCallback } from "react";
import { useProducts } from "../src/features/products/hooks/useProducts";
import { useCollections } from "../src/features/products/hooks/useCollections";
import { ProductCard } from "../src/features/products/components/ProductCard";
import { Product } from "../src/features/products/types";

export default function BrowseScreen() {
    const router = useRouter();
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

    const { data: products, isLoading: productsLoading } = useProducts({
        order: '{"created_at":"desc"}',
        limit: 50,
        ...(selectedCategoryId ? { category_id: selectedCategoryId } : {})
    });
    const { data: collections, isLoading: colsLoading } = useCollections();

    // No client-side filtering needed anymore
    const displayProducts = products || [];

    const renderItem: ListRenderItem<Product> = useCallback(({ item }) => (
        <ProductCard product={item} />
    ), []);

    const keyExtractor = useCallback((item: Product) => item.id, []);

    const ListHeaderComponent = useMemo(() => (
        <View className="px-6 mb-4">
            <Text className="text-gray-500 font-montserrat uppercase text-[10px] tracking-widest">
                Found {displayProducts.length} items
            </Text>
        </View>
    ), [displayProducts.length]);

    const ListEmptyComponent = useMemo(() => (
        <View className="py-20 items-center">
            <Text className="text-gray-600">No products found in this category.</Text>
        </View>
    ), []);

    if (productsLoading || colsLoading) {
        return (
            <View className="flex-1 bg-background justify-center items-center">
                <ActivityIndicator color="#C0C0C0" size="large" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background">
            <SafeAreaView edges={["top"]} className="px-6 py-4 bg-background border-b border-white/5">
                {/* Header ... */}
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-surface rounded-2xl items-center justify-center border border-white/5"
                    >
                        <ArrowLeft color="#C0C0C0" size={24} />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text variant="heading" className="text-xl tracking-[4px]">SHOP</Text>
                        <Text className="text-[8px] text-primary tracking-[2px] uppercase -mt-1 font-bold">Jewelry House</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push("/search")}
                        className="w-12 h-12 bg-surface rounded-2xl items-center justify-center border border-white/5"
                    >
                        <Search color="#C0C0C0" size={22} />
                    </TouchableOpacity>
                </View>

                {/* Categories */}
                <View className="mt-4">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setSelectedCategoryId(null);
                            }}
                            className={`px-6 h-12 rounded-2xl mr-3 items-center justify-center border ${!selectedCategoryId ? 'bg-primary border-primary' : 'bg-surface border-white/5'}`}
                        >
                            <Text variant="bold" className={`${!selectedCategoryId ? 'text-black' : 'text-gray-500'} uppercase text-[10px] tracking-widest`}>All Pieces</Text>
                        </TouchableOpacity>
                        {collections?.map((col: any) => (
                            <TouchableOpacity
                                key={col.id}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setSelectedCategoryId(col.id);
                                }}
                                className={`px-6 h-12 rounded-2xl mr-3 items-center justify-center border ${selectedCategoryId === col.id ? 'bg-primary border-primary' : 'bg-surface border-white/5'}`}
                            >
                                <Text variant="bold" className={`${selectedCategoryId === col.id ? 'text-black' : 'text-gray-500'} uppercase text-[10px] tracking-widest`}>
                                    {col.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </SafeAreaView>

            <FlatList
                data={displayProducts}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 24 }}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
                ListHeaderComponent={ListHeaderComponent}
                ListEmptyComponent={ListEmptyComponent}
                initialNumToRender={6}
                maxToRenderPerBatch={6}
                windowSize={5}
                removeClippedSubviews={true}
            />
        </View>
    );
}
