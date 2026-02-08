import { View, ScrollView, TouchableOpacity, FlatList, Dimensions, ActivityIndicator, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../src/core/components/Text";
import { ArrowLeft, Heart, Star, Plus, Minus, AlertCircle, ShoppingBag, Share2, Truck, Shield, RotateCcw } from "lucide-react-native";
import { useState, useRef, useEffect } from "react";
import { useCartStore } from "../../src/core/api/cartStore";
import { useProduct } from "../../src/features/products/hooks/useProducts";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Check } from "lucide-react-native";
import Animated, {
    FadeInDown,
    FadeInUp,
    useSharedValue,
    useAnimatedStyle,
    useAnimatedScrollHandler,
    interpolate,
    Extrapolation
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const IMAGE_HEIGHT = height * 0.55;

export default function ProductDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { data: product, isLoading, error } = useProduct(id as string);
    const addToCart = useCartStore((state) => state.addToCart);

    const [activeImage, setActiveImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showAddedToCart, setShowAddedToCart] = useState(false);

    // Parallax scroll value
    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    // Parallax effect for image
    const imageAnimatedStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            scrollY.value,
            [-100, 0, 300],
            [-50, 0, 150],
            Extrapolation.CLAMP
        );
        const scale = interpolate(
            scrollY.value,
            [-100, 0],
            [1.2, 1],
            Extrapolation.CLAMP
        );
        return {
            transform: [{ translateY }, { scale }],
        };
    });

    // Header opacity based on scroll
    const headerAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [0, 200],
            [0, 1],
            Extrapolation.CLAMP
        );
        return {
            backgroundColor: `rgba(15, 15, 15, ${opacity})`,
        };
    });

    const handleAddToCart = () => {
        if (!product) return;

        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            alert("Please select a size");
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        addToCart(product, quantity, selectedSize || undefined);

        // Show success animation instead of navigating back
        setShowAddedToCart(true);
        setTimeout(() => {
            setShowAddedToCart(false);
        }, 2000);
    };

    const toggleFavorite = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsFavorite(!isFavorite);
    };

    if (isLoading && !product) {
        return (
            <View className="flex-1 bg-[#0F0F0F] justify-center items-center">
                <View className="w-16 h-16 rounded-full bg-[#DBAC33]/10 items-center justify-center mb-4">
                    <ActivityIndicator color="#DBAC33" size="large" />
                </View>
                <Text className="text-gray-400">Loading product...</Text>
            </View>
        );
    }

    if (error || !product) {
        return (
            <View className="flex-1 bg-[#0F0F0F] justify-center items-center px-10">
                <AlertCircle color="#ef4444" size={48} />
                <Text variant="heading" className="text-xl mb-2 text-center text-white mt-4">Product Not Found</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-6 bg-white/5 px-8 py-3 rounded-full border border-white/10">
                    <Text className="text-white">Return Home</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#0F0F0F]">
            {/* Fixed Image with Parallax */}
            <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
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
                        <View style={{ width, height: IMAGE_HEIGHT }}>
                            <Image
                                source={{ uri: item }}
                                style={{ width: '100%', height: '100%' }}
                                contentFit="cover"
                                transition={400}
                            />
                        </View>
                    )}
                    keyExtractor={(_, index) => index.toString()}
                />
                <LinearGradient
                    colors={['rgba(0,0,0,0.3)', 'transparent', 'transparent', 'rgba(15,15,15,1)']}
                    style={StyleSheet.absoluteFill}
                    locations={[0, 0.1, 0.6, 1]}
                    pointerEvents="none"
                />
            </Animated.View>

            {/* Header with animated background */}
            <Animated.View style={[styles.header, headerAnimatedStyle]}>
                <SafeAreaView className="flex-row justify-between items-center px-5 pt-2">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-11 h-11 rounded-full items-center justify-center bg-black/30 backdrop-blur-xl border border-white/10"
                    >
                        <ArrowLeft color="white" size={20} />
                    </TouchableOpacity>

                    <View className="flex-row gap-3">
                        <TouchableOpacity className="w-11 h-11 rounded-full items-center justify-center bg-black/30 backdrop-blur-xl border border-white/10">
                            <Share2 color="white" size={18} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={toggleFavorite}
                            className={`w-11 h-11 rounded-full items-center justify-center border ${isFavorite ? "bg-red-500/20 border-red-500/50" : "bg-black/30 border-white/10"
                                }`}
                        >
                            <Heart color={isFavorite ? "#ef4444" : "white"} size={18} fill={isFavorite ? "#ef4444" : "none"} />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Animated.View>

            {/* Scrollable Content */}
            <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: IMAGE_HEIGHT - 40 }}
                bounces={true}
            >
                {/* Content Sheet */}
                <View className="bg-[#0F0F0F] rounded-t-[32px] border-t border-white/10 min-h-screen">
                    {/* Drag Handle */}
                    <View className="items-center pt-4 pb-6">
                        <View className="w-10 h-1 rounded-full bg-white/20" />
                    </View>

                    <View className="px-6 pb-40">
                        {/* Image Pagination */}
                        <View className="flex-row justify-center gap-2 mb-6">
                            {product.images.map((_: any, index: number) => (
                                <View
                                    key={index}
                                    className={`h-1.5 rounded-full ${activeImage === index ? "w-6 bg-[#DBAC33]" : "w-1.5 bg-white/30"
                                        }`}
                                />
                            ))}
                        </View>

                        {/* Price & Rating Row */}
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-baseline gap-1">
                                <Text className="text-[#DBAC33] text-sm font-bold">{product.currency}</Text>
                                <Text variant="heading" className="text-3xl text-white">{product.price.toLocaleString()}</Text>
                            </View>
                            <View className="flex-row items-center bg-white/5 px-3 py-1.5 rounded-full">
                                <Star size={14} color="#DBAC33" fill="#DBAC33" />
                                <Text className="text-white text-sm font-bold ml-1">4.9</Text>
                                <Text className="text-gray-500 text-xs ml-1">(128)</Text>
                            </View>
                        </View>

                        {/* Product Name */}
                        <Text variant="heading" className="text-2xl text-white leading-8 mb-2">{product.name}</Text>

                        {/* Material Badge */}
                        <View className="flex-row mb-6">
                            <View className="bg-[#DBAC33]/10 px-3 py-1 rounded-full border border-[#DBAC33]/20">
                                <Text className="text-[#DBAC33] text-xs font-bold uppercase tracking-wider">{product.material || "925 Sterling Silver"}</Text>
                            </View>
                        </View>

                        {/* Description */}
                        <Text className="text-gray-400 text-sm leading-6 mb-8">
                            {product.description || "A masterpiece of sterling silver, meticulously handcrafted to bring timeless elegance to your collection. Each curve and detail reflects our heritage of luxury jewelry making since 1994."}
                        </Text>

                        {/* Sizes */}
                        {product.sizes && product.sizes.length > 0 && (
                            <Animated.View entering={FadeInDown.delay(300)} className="mb-8">
                                <View className="flex-row justify-between items-center mb-4">
                                    <Text className="text-white text-sm font-bold uppercase tracking-wider">Select Size</Text>
                                    <TouchableOpacity>
                                        <Text className="text-[#DBAC33] text-xs">Size Guide</Text>
                                    </TouchableOpacity>
                                </View>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {product.sizes.map((size: string) => (
                                        <TouchableOpacity
                                            key={size}
                                            onPress={() => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                setSelectedSize(size);
                                            }}
                                            className={`mr-3 w-14 h-14 rounded-2xl items-center justify-center border-2 ${selectedSize === size
                                                ? "bg-[#DBAC33] border-[#DBAC33]"
                                                : "bg-white/5 border-white/10"
                                                }`}
                                        >
                                            <Text className={`text-sm font-bold ${selectedSize === size ? "text-black" : "text-gray-400"}`}>
                                                {size}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </Animated.View>
                        )}

                        {/* Features */}
                        <View className="bg-white/5 rounded-3xl p-5 border border-white/5">
                            <Text className="text-white text-sm font-bold uppercase tracking-wider mb-4">Why Choose Us</Text>

                            <View className="flex-row items-center mb-4">
                                <View className="w-10 h-10 rounded-full bg-[#DBAC33]/10 items-center justify-center mr-4">
                                    <Truck size={18} color="#DBAC33" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-bold text-sm">Free Delivery</Text>
                                    <Text className="text-gray-500 text-xs">On orders over EGP 500</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center mb-4">
                                <View className="w-10 h-10 rounded-full bg-[#DBAC33]/10 items-center justify-center mr-4">
                                    <Shield size={18} color="#DBAC33" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-bold text-sm">Authenticity Guaranteed</Text>
                                    <Text className="text-gray-500 text-xs">100% genuine 925 sterling silver</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full bg-[#DBAC33]/10 items-center justify-center mr-4">
                                    <RotateCcw size={18} color="#DBAC33" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-bold text-sm">Easy Returns</Text>
                                    <Text className="text-gray-500 text-xs">14-day return policy</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Animated.ScrollView>

            {/* Bottom Action Bar */}
            <BlurView intensity={60} tint="dark" style={styles.bottomBar}>
                <View style={styles.bottomBarInner}>
                    {/* Quantity Stepper */}
                    <View className="h-14 bg-white/5 rounded-2xl flex-row items-center px-3 border border-white/10">
                        <TouchableOpacity
                            onPress={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-8 h-8 rounded-full bg-white/5 items-center justify-center"
                        >
                            <Minus size={16} color="#888" />
                        </TouchableOpacity>
                        <Text className="text-white font-bold mx-4 text-lg w-6 text-center">{quantity}</Text>
                        <TouchableOpacity
                            onPress={() => setQuantity(quantity + 1)}
                            className="w-8 h-8 rounded-full bg-white/5 items-center justify-center"
                        >
                            <Plus size={16} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Add Button */}
                    <TouchableOpacity
                        onPress={handleAddToCart}
                        activeOpacity={0.9}
                        disabled={showAddedToCart}
                        className={`flex-1 h-14 rounded-2xl flex-row items-center justify-center ml-4 ${showAddedToCart ? "bg-green-500" : "bg-[#DBAC33]"
                            }`}
                        style={styles.addButton}
                    >
                        {showAddedToCart ? (
                            <>
                                <Check size={18} color="#FFF" />
                                <Text className="text-white font-bold text-sm ml-2 uppercase tracking-wider">Added!</Text>
                            </>
                        ) : (
                            <>
                                <ShoppingBag size={18} color="#000" />
                                <Text className="text-black font-bold text-sm ml-2 uppercase tracking-wider">Add to Cart</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </BlurView>

            {/* Success Toast */}
            {showAddedToCart && (
                <Animated.View
                    entering={FadeInUp.duration(300).springify()}
                    className="absolute top-20 left-6 right-6 z-[200]"
                >
                    <BlurView intensity={80} tint="dark" className="rounded-2xl overflow-hidden border border-green-500/30">
                        <View className="flex-row items-center px-5 py-4 bg-green-500/10">
                            <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center mr-4">
                                <Check size={20} color="#FFF" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-white font-bold">Added to Cart!</Text>
                                <Text className="text-gray-400 text-xs">{quantity}x {product.name.substring(0, 25)}...</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => router.push("/cart")}
                                className="bg-white/10 px-4 py-2 rounded-full"
                            >
                                <Text className="text-white text-xs font-bold">View Cart</Text>
                            </TouchableOpacity>
                        </View>
                    </BlurView>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    imageContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: IMAGE_HEIGHT,
        zIndex: 0,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingBottom: 32,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    bottomBarInner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButton: {
        shadowColor: "#DBAC33",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
