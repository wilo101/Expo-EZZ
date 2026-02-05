import { View, TextInput, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../src/core/components/Text";
import { Search as SearchIcon, X, AlertCircle } from "lucide-react-native";
import { useState, useEffect } from "react";
import apiClient from "../../src/core/api/apiClient";
import { ProductCard } from "../../src/features/products/components/ProductCard";
import { Product } from "../../src/features/products/types";

export default function SearchScreen() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleSearch = async (text: string) => {
        setQuery(text);
        if (text.length < 2) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        setError(false);
        try {
            const { data } = await apiClient.get(`/products/search/${encodeURIComponent(text)}`);
            const list = Array.isArray(data) ? data : data.data || data.products || [];

            // Simple mapping for search results
            const mapped = list.map((p: any) => ({
                id: (p.id || p._id || "").toString(),
                name: p.name || p.title || "Product",
                price: (p.defaultVariant?.priceCents || 0) / 100,
                currency: p.currency || "EGP",
                images: p.thumbUrls || [p.thumbUrl || "https://placeholder.com/prod.jpg"],
                category: p.category || "",
                material: p.material || "925 Silver",
            }));

            setResults(mapped);
        } catch (err) {
            console.error("Search error:", err);
            setError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-background px-6">
            <SafeAreaView edges={["top"]} className="py-4">
                <Text variant="heading" className="text-3xl mb-6">Discovery</Text>
                <View className="flex-row bg-surface h-14 rounded-2xl items-center px-4 border border-gray-800">
                    <SearchIcon color="#C0C0C0" size={20} />
                    <TextInput
                        value={query}
                        onChangeText={handleSearch}
                        placeholder="Search for silver jewelry..."
                        placeholderTextColor="#555"
                        className="flex-1 ml-3 text-white font-montserrat"
                        autoFocus
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch("")}>
                            <X color="#555" size={20} />
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator color="#C0C0C0" size="large" />
                </View>
            ) : error ? (
                <View className="flex-1 justify-center items-center">
                    <AlertCircle color="#ef4444" size={40} className="mb-4" />
                    <Text className="text-gray-500">Could not complete search</Text>
                </View>
            ) : results.length > 0 ? (
                <FlatList
                    data={results}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: "space-between" }}
                    renderItem={({ item }) => <ProductCard product={item as any} />}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                />
            ) : (
                <View className="flex-1 justify-center items-center opacity-40">
                    <SearchIcon color="#555" size={80} strokeWidth={1} />
                    <Text className="text-gray-500 mt-4 text-center">
                        {query.length > 0 ? "No products found" : "Try searching for 'Ring' or 'Necklace'"}
                    </Text>
                </View>
            )}
        </View>
    );
}
