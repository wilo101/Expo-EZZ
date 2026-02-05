import { View, ScrollView, TouchableOpacity, FlatList, Dimensions, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../src/core/components/Text";
import { ArrowLeft, Heart, Star, ChevronRight, Plus, Minus, Share2, AlertCircle, ShoppingBag, Camera } from "lucide-react-native";
import { useState } from "react";
import { useCartStore } from "../../src/core/api/cartStore";
import { useProduct } from "../../src/features/products/hooks/useProducts";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export default function ProductDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { data: product, isLoading, error } = useProduct(id as string);
    const addToCart = useCartStore((state) => state.addToCart);

    const [activeImage, setActiveImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = () => {
        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            alert("Please select a size");
            return;
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        addToCart(product, quantity, selectedSize || undefined);
        router.back();
    };

    if (isLoading && !product) {
        return (
            <View className="flex-1 bg-[#0F0F0F] justify-center items-center">
                <ActivityIndicator color="#DBAC33" size="large" />
            </View>
        );
    }

    if (error || !product) {
        return (
            <View className="flex-1 bg-[#0F0F0F] justify-center items-center px-10">
                <AlertCircle color="#ef4444" size={48} className="mb-4" />
                <Text variant="heading" className="text-xl mb-2 text-center text-white">Product Not Found</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-6 bg-white/5 px-8 py-3 rounded-full border border-white/10">
                    <Text className="text-white">Return Home</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#0F0F0F]">
            {/* Full Screen Image Gallery */}
            <View className="h-[65%] w-full relative">
                <FlatList
                    data={product.images}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(e) => {
                        const index = Math.round(e.nativeEvent.contentOffset.x / width);
                        setActiveImage(index);
                    }}
                    renderItem={({ item }) => (
                        <View style={{ width, height: '100%' }}>
                            <Image
                                source={{ uri: item }}
                                style={{ width: '100%', height: '100%' }}
                                contentFit="cover"
                                transition={500}
                            />
                            <LinearGradient
                                colors={['rgba(0,0,0,0.6)', 'transparent', 'transparent', 'rgba(15,15,15,1)']}
                                style={StyleSheet.absoluteFill}
                                locations={[0, 0.2, 0.8, 1]}
                            />
                        </View>
                    )}
                    keyExtractor={(_, index) => index.toString()}
                />

                {/* Pagination Dots */}
                <View className="absolute bottom-10 left-0 right-0 flex-row justify-center space-x-2">
                    {product.images.map((_, index) => (
                        <View
                            key={index}
                            className={`h-1.5 rounded-full transition-all ${activeImage === index ? "w-6 bg-[#DBAC33]" : "w-1.5 bg-white/30"}`}
                        />
                    ))}
                </View>

                {/* Header Actions */}
                <SafeAreaView className="absolute top-0 left-0 right-0 px-6 pt-2 flex-row justify-between items-center z-50">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full items-center justify-center bg-black/20 backdrop-blur-md border border-white/10"
                    >
                        <ArrowLeft color="white" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center bg-black/20 backdrop-blur-md border border-white/10">
                        <Heart color="white" size={20} />
                    </TouchableOpacity>
                </SafeAreaView>
            </View>

            {/* Product Details Sheet (Glass) */}
            <Animated.View
                entering={FadeInUp.delay(200).springify()}
                className="flex-1 -mt-8 bg-[#0F0F0F] rounded-t-[32px] overflow-hidden"
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120, paddingTop: 32, paddingHorizontal: 24 }}
                >
                    <View className="flex-row justify-between items-start mb-2">
                        <Text variant="heading" className="text-3xl text-white flex-1 mr-4 leading-9">{product.name}</Text>
                        <View className="flex-row items-baseline">
                            <Text className="text-[#DBAC33] text-sm font-bold mr-1">{product.currency}</Text>
                            <Text variant="heading" className="text-2xl text-white">{product.price.toLocaleString()}</Text>
                        </View>
                    </View>

                    <Text className="text-gray-400 text-xs uppercase tracking-[2px] mb-6">{product.material}</Text>

                    <Text variant="medium" className="text-gray-300 text-sm leading-6 mb-8 text-justify opacity-80">
                        {product.description || "A masterpiece of sterling silver, meticulously handcrafted to bring timeless elegance to your collection. Each curve and detail reflects our heritage of luxury jewelry making since 1994."}
                    </Text>

                    {/* Sizes */}
                    {product.sizes && product.sizes.length > 0 && (
                        <View className="mb-8">
                            <Text className="text-white text-xs font-bold uppercase tracking-widest mb-4">Select Size</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {product.sizes.map((size) => (
                                    <TouchableOpacity
                                        key={size}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            setSelectedSize(size);
                                        }}
                                        className={`mr-3 w-12 h-12 rounded-full items-center justify-center border ${selectedSize === size
                                                ? "bg-[#DBAC33] border-[#DBAC33]"
                                                : "bg-white/5 border-white/10"
                                            }`}
                                    >
                                        <Text className={selectedSize === size ? "text-black font-bold" : "text-gray-400"}>
                                            {size}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                </ScrollView>

                {/* Bottom Action Bar (Glass) */}
                <BlurView intensity={40} tint="dark" className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 border-t border-white/5">
                    <View className="flex-row items-center gap-4">
                        {/* Quantity Stepper */}
                        <View className="h-14 bg-white/5 rounded-full flex-row items-center px-4 border border-white/10">
                            <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                                <Minus size={18} color="#888" />
                            </TouchableOpacity>
                            <Text className="text-white font-bold mx-4 text-lg">{quantity}</Text>
                            <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                                <Plus size={18} color="#white" />
                            </TouchableOpacity>
                        </View>

                        {/* Add Button */}
                        <TouchableOpacity
                            onPress={handleAddToCart}
                            activeOpacity={0.9}
                            className="flex-1 h-14 bg-[#DBAC33] rounded-full items-center justify-center shadow-lg shadow-[#DBAC33]/20"
                        >
                            <Text className="text-[#3E2C00] font-bold text-sm tracking-widest uppercase">Add to Cart</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </Animated.View>
        </View>
    );
}
