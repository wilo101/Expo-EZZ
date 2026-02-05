import { View, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, StyleSheet } from "react-native";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { Text } from "../../src/core/components/Text";
import { Search, ShoppingBag, Menu, AlertCircle, Gift, Sparkles, Camera } from "lucide-react-native";
import { ProductCard } from "../../src/features/products/components/ProductCard";
import { useProducts } from "../../src/features/products/hooks/useProducts";
import { useCollections } from "../../src/features/products/hooks/useCollections";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedScrollHandler,
    interpolate,
    Extrapolation
} from "react-native-reanimated";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get("window");
const HERO_HEIGHT = 450;

export default function HomeScreen() {
    const router = useRouter();
    const scrollY = useSharedValue(0);

    // Fetch products
    const { data: products, isLoading: productsLoading, error: productsError, refetch } = useProducts({
        order: '{"created_at":"desc"}',
        limit: 10
    });
    const { data: collections, isLoading: colsLoading } = useCollections();

    // Parallax Scroll Handler
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    // Animated Header Style (Fades in background)
    const headerStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scrollY.value, [0, 200], [0, 1], Extrapolation.CLAMP);
        return {
            backgroundColor: `rgba(15, 15, 15, ${opacity * 0.9})`,
            borderBottomWidth: 1,
            borderBottomColor: `rgba(255, 255, 255, ${opacity * 0.05})`,
        };
    });

    // Parallax Hero Animation
    const heroImageStyle = useAnimatedStyle(() => {
        const translateY = interpolate(scrollY.value, [0, HERO_HEIGHT], [0, HERO_HEIGHT / 2], Extrapolation.CLAMP);
        const scale = interpolate(scrollY.value, [-HERO_HEIGHT, 0], [1.5, 1], Extrapolation.CLAMP);
        return {
            transform: [{ translateY }, { scale }]
        };
    });

    const heroContentStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scrollY.value, [0, HERO_HEIGHT / 2], [1, 0], Extrapolation.CLAMP);
        const translateY = interpolate(scrollY.value, [0, HERO_HEIGHT / 2], [0, 50], Extrapolation.CLAMP);
        return {
            opacity,
            transform: [{ translateY }]
        };
    });

    return (
        <View className="flex-1 bg-[#0F0F0F]">

            {/* Custom Header (Fixed) */}
            <Animated.View
                className="absolute top-0 left-0 right-0 z-50 pt-[50px] pb-4 px-6 flex-row justify-between items-center"
                style={headerStyle}
            >
                <TouchableOpacity className="w-10 h-10 items-center justify-center bg-white/5 rounded-full backdrop-blur-md">
                    <Menu color="#DBAC33" size={20} />
                </TouchableOpacity>

                <View className="items-center">
                    <Image
                        source={require("../../assets/images/header-logo.png")}
                        style={{ width: 140, height: 50 }}
                        contentFit="contain"
                    />
                </View>

                <TouchableOpacity
                    className="w-10 h-10 items-center justify-center bg-white/5 rounded-full backdrop-blur-md border border-white/10"
                    onPress={() => router.push("/cart")}
                >
                    <ShoppingBag color="#C0C0C0" size={18} />
                    <View className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#DBAC33] rounded-full" />
                </TouchableOpacity>
            </Animated.View>

            <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Parallax Hero Section */}
                <View style={{ height: HERO_HEIGHT, overflow: 'hidden' }}>
                    <Animated.View style={[StyleSheet.absoluteFill, heroImageStyle]}>
                        <Image
                            source={{ uri: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=2075&auto=format&fit=crop" }}
                            className="w-full h-full"
                            contentFit="cover"
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(15,15,15,0.2)', '#0F0F0F']}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0.5, y: 0.4 }}
                            end={{ x: 0.5, y: 1 }}
                        />
                    </Animated.View>

                    <Animated.View style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end', padding: 24, paddingBottom: 60 }, heroContentStyle]}>
                        <View className="flex-row items-center mb-4">
                            <View className="w-10 h-[1px] bg-[#DBAC33] mr-3" />
                            <Text className="text-[#DBAC33] text-xs font-bold uppercase tracking-[4px]">New Collection</Text>
                        </View>
                        <Text variant="heading" className="text-5xl text-white mb-3">
                            Ethereal{"\n"}Gold & Silver
                        </Text>
                        <Text className="text-gray-300 text-sm mb-8 leading-6 max-w-[80%]">
                            Discover the fusion of timeless elegance and modern design in our latest handcrafted pieces.
                        </Text>

                        <TouchableOpacity
                            onPress={() => router.push("/browse")}
                            activeOpacity={0.9}
                        >
                            <BlurView intensity={20} className="self-start px-8 py-4 rounded-full border border-[#DBAC33] flex-row items-center overflow-hidden">
                                <Text variant="bold" className="text-white tracking-widest text-xs mr-2">EXPLORE NOW</Text>
                                <Sparkles size={14} color="#DBAC33" />
                            </BlurView>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                {/* Hero Tools Section (Trust & Engagement) */}
                <View className="px-6 mt-[-40px] z-10 mb-8 gap-4">

                    {/* 1. Ring Size Finder (Primary Trust Builder) */}
                    <BlurView intensity={20} className="rounded-3xl overflow-hidden border border-white/10">
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                router.push("/tools/ring-sizer");
                            }}
                            className="p-1"
                        >
                            <LinearGradient
                                colors={["rgba(255,255,255,0.03)", "rgba(255,255,255,0.01)"]}
                                className="p-5"
                            >
                                <View className="flex-row items-center justify-between mb-4">
                                    <View className="bg-[#1C6E7A]/20 px-3 py-1 rounded-full border border-[#1C6E7A]/30">
                                        <Text className="text-[#1C6E7A] text-[10px] uppercase font-bold tracking-widest">Precision Tool</Text>
                                    </View>
                                    <View className="w-8 h-8 rounded-full bg-white/5 items-center justify-center border border-white/10">
                                        <View className="w-4 h-4 rounded-full border-2 border-[#1C6E7A]" />
                                    </View>
                                </View>
                                <Text variant="heading" className="text-white text-2xl mb-2">Find Your Perfect{"\n"}Ring Size</Text>
                                <Text className="text-gray-400 text-xs leading-5">Measure your finger accurately in seconds using our digital sizing tool.</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </BlurView>

                    <View className="flex-row gap-4">
                        {/* 2. Silver Challenge */}
                        <BlurView intensity={20} className="flex-1 rounded-3xl overflow-hidden border border-white/10">
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => router.push("/gamification/silver-challenge")}
                                className="p-4 h-40 justify-between"
                            >
                                <LinearGradient colors={["rgba(255,255,255,0.03)", "transparent"]} style={StyleSheet.absoluteFill} />
                                <Gift color="#BFC3C7" size={24} />
                                <View>
                                    <Text variant="bold" className="text-white text-lg mb-1">Silver Reward</Text>
                                    <Text className="text-gray-400 text-[10px]">Unlock exclusive discount</Text>
                                </View>
                            </TouchableOpacity>
                        </BlurView>

                        {/* 3. Custom Request */}
                        <BlurView intensity={20} className="flex-1 rounded-3xl overflow-hidden border border-white/10">
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => router.push("/custom-request")}
                                className="p-4 h-40 justify-between"
                            >
                                <LinearGradient colors={["rgba(255,255,255,0.03)", "transparent"]} style={StyleSheet.absoluteFill} />
                                <Camera color="#BFC3C7" size={24} />
                                <View>
                                    <Text variant="bold" className="text-white text-lg mb-1">Inspired By You</Text>
                                    <Text className="text-gray-400 text-[10px]">Upload your design</Text>
                                </View>
                            </TouchableOpacity>
                        </BlurView>
                    </View>

                </View>

                {/* Collections (Circles) */}
                <View className="mb-12">
                    <View className="px-6 mb-6 flex-row justify-between items-end">
                        <Text variant="heading" className="text-2xl text-white">Categories</Text>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24 }}
                    >
                        {colsLoading ? (
                            <ActivityIndicator color="#DBAC33" />
                        ) : (
                            collections?.map((col: any) => (
                                <TouchableOpacity
                                    key={col.id}
                                    className="mr-6 items-center"
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        router.push("/browse");
                                    }}
                                >
                                    <View className="w-[72px] h-[72px] rounded-full border border-[#DBAC33]/30 p-1 mb-2">
                                        <Image
                                            source={{ uri: col.imageUrl }}
                                            className="w-full h-full rounded-full"
                                            contentFit="cover"
                                        />
                                    </View>
                                    <Text variant="bold" className="text-gray-300 text-[10px] uppercase tracking-wider">
                                        {col.name}
                                    </Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </View>

                {/* Custom Jewelry Banner */}
                <View className="px-6 mb-12">
                    <View className="rounded-[32px] overflow-hidden relative h-[300px]">
                        <Image
                            source={{ uri: "https://images.unsplash.com/photo-1601121141461-9d62206eb89a?q=80&w=2070&auto=format&fit=crop" }}
                            className="absolute inset-0 w-full h-full"
                            contentFit="cover"
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                            style={StyleSheet.absoluteFill}
                        />
                        <View className="absolute bottom-0 left-0 right-0 p-8">
                            <Text className="text-[#DBAC33] text-xs font-bold uppercase tracking-[4px] mb-2">Personalized</Text>
                            <Text variant="heading" className="text-3xl text-white mb-4">Engrave Your{"\n"}Love Story</Text>
                            <TouchableOpacity className="bg-white self-start px-6 py-3 rounded-full">
                                <Text className="text-black font-bold text-xs uppercase tracking-widest">Create Custom</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* New Arrivals Grid */}
                <View className="px-6 flex-row justify-between items-center mb-6">
                    <Text variant="heading" className="text-2xl text-white">Latest Drops</Text>
                    <TouchableOpacity onPress={() => router.push("/browse")}>
                        <Text className="text-[#DBAC33] text-xs font-bold uppercase tracking-widest">View All</Text>
                    </TouchableOpacity>
                </View>

                {productsLoading ? (
                    <ActivityIndicator color="#DBAC33" size="large" className="mt-10" />
                ) : (
                    <View className="px-6 flex-row flex-wrap justify-between">
                        {products?.map((item: any) => (
                            <ProductCard key={item.id} product={item} />
                        ))}
                    </View>
                )}

            </Animated.ScrollView>
        </View>
    );
}
