import { View, TextInput, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../src/core/components/Text";
import { Search as SearchIcon, X, AlertCircle, Filter } from "lucide-react-native";
import { useState, useRef, useEffect } from "react";
import { ProductCard } from "../../src/features/products/components/ProductCard";
import { useProducts } from "../../src/features/products/hooks/useProducts";
import { useCollections } from "../../src/features/products/hooks/useCollections";
import * as Haptics from "expo-haptics";
import { useDebounce } from "../../src/core/hooks/useDebounce"; // Assuming this exists or I'll implement inline for now

export default function SearchScreen() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

    // Fetch Collections for Filters
    const { data: collections, isLoading: colsLoading } = useCollections();

    // Debounce search query to avoid excessive API calls
    const debouncedQuery = useDebounce(searchQuery, 500);

    // Construct Params
    const queryParams: any = {};
    if (debouncedQuery.length > 0) queryParams.q = debouncedQuery;
    // FIX: API Expects 'category_id', not 'collection_id'
    if (selectedCollectionId) queryParams.category_id = selectedCollectionId;

    // Default sorting
    if (!queryParams.q) queryParams.order = '{"created_at":"desc"}';

    // DEBUG LOGS
    console.log(`[Filter Debug] Selected Collection ID: ${selectedCollectionId}`);
    console.log(`[Filter Debug] Query Params being sent:`, JSON.stringify(queryParams));

    // Fetch Products based on filters
    // FORCE NEW QUERY KEY to ensure refetch happens on filter change
    const { data: products, isLoading: productsLoading, error, refetch } = useProducts(queryParams);

    // Effect to force refetch when filters change (Double Safety)
    useEffect(() => {
        refetch();
    }, [selectedCollectionId, debouncedQuery]);

    // Filter Chips Component
    const renderFilters = () => (
        <View className="mb-4">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 4 }}
            >
                {/* "All" Filter */}
                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedCollectionId(null);
                    }}
                    className={`mr-3 px-5 py-2 rounded-full border ${selectedCollectionId === null
                        ? "bg-[#1C6E7A] border-[#1C6E7A]"
                        : "bg-white/5 border-white/10"
                        }`}
                >
                    <Text className={selectedCollectionId === null ? "text-white font-bold" : "text-gray-400"}>
                        All
                    </Text>
                </TouchableOpacity>

                {/* Dynamic Collections */}
                {collections?.map((col) => (
                    <TouchableOpacity
                        key={col.id}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setSelectedCollectionId(selectedCollectionId === col.id ? null : col.id);
                        }}
                        className={`mr-3 px-5 py-2 rounded-full border ${selectedCollectionId === col.id
                            ? "bg-[#1C6E7A] border-[#1C6E7A]"
                            : "bg-white/5 border-white/10"
                            }`}
                    >
                        <Text className={selectedCollectionId === col.id ? "text-white font-bold" : "text-gray-400"}>
                            {col.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    return (
        <View className="flex-1 bg-[#0F0F0F] px-4">
            <SafeAreaView edges={["top"]} className="py-2">

                {/* Search Bar */}
                <View className="flex-row items-center justify-between mb-6 mt-2">
                    <Text variant="heading" className="text-3xl text-white">Browse</Text>
                </View>

                <View className="flex-row bg-[#1A1A1A] h-12 rounded-xl items-center px-4 border border-white/10 mb-6">
                    <SearchIcon color="#BFC3C7" size={18} />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search rings, necklaces..."
                        placeholderTextColor="#666"
                        className="flex-1 ml-3 text-white font-montserrat h-full"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <X color="#666" size={18} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filters */}
                {colsLoading ? (
                    <View className="h-10 mb-4 justify-center">
                        <ActivityIndicator size="small" color="#1C6E7A" />
                    </View>
                ) : (
                    renderFilters()
                )}

            </SafeAreaView>

            {/* Results Grid */}
            {productsLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator color="#F2F2F2" size="large" />
                </View>
            ) : error ? (
                <View className="flex-1 justify-center items-center opacity-50">
                    <AlertCircle color="#ef4444" size={40} className="mb-4" />
                    <Text className="text-gray-400">Something went wrong.</Text>
                </View>
            ) : products && products.length > 0 ? (
                <FlatList
                    data={products}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: "space-between", gap: 12 }}
                    renderItem={({ item }) => <ProductCard product={item} />}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            ) : (
                <View className="flex-1 justify-center items-center opacity-40">
                    <Filter color="#555" size={60} strokeWidth={1} />
                    <Text className="text-gray-500 mt-4 text-center">
                        {debouncedQuery || selectedCollectionId ? "No products found matching your filters." : "Start browsing our collection."}
                    </Text>
                </View>
            )}
        </View>
    );
}
