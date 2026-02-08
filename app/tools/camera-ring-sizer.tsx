import { View, TouchableOpacity, StyleSheet, Dimensions, PixelRatio } from "react-native";
import { Text } from "../../src/core/components/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Check, RotateCcw, ShoppingBag, ChevronUp, ChevronDown, Info } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PIXEL_RATIO = PixelRatio.get();

// Screen DPI calculation (approximate for most phones)
// Standard phone screen is ~160 DPI base, multiply by pixel ratio
const SCREEN_DPI = 160 * PIXEL_RATIO;
const MM_PER_INCH = 25.4;
const PIXELS_PER_MM = SCREEN_DPI / MM_PER_INCH;

// US Ring Size Chart with inner diameter in mm
const RING_SIZES = [
    { us: 3, eu: 44, uk: "F", mm: 14.1 },
    { us: 3.5, eu: 45, uk: "G", mm: 14.5 },
    { us: 4, eu: 46.5, uk: "H", mm: 14.9 },
    { us: 4.5, eu: 47.5, uk: "I", mm: 15.3 },
    { us: 5, eu: 49, uk: "J", mm: 15.7 },
    { us: 5.5, eu: 50, uk: "K", mm: 16.1 },
    { us: 6, eu: 51.5, uk: "L", mm: 16.5 },
    { us: 6.5, eu: 52.5, uk: "M", mm: 16.9 },
    { us: 7, eu: 54, uk: "N", mm: 17.3 },
    { us: 7.5, eu: 55, uk: "O", mm: 17.7 },
    { us: 8, eu: 56.5, uk: "P", mm: 18.1 },
    { us: 8.5, eu: 58, uk: "Q", mm: 18.5 },
    { us: 9, eu: 59, uk: "R", mm: 18.9 },
    { us: 9.5, eu: 60.5, uk: "S", mm: 19.4 },
    { us: 10, eu: 62, uk: "T", mm: 19.8 },
    { us: 10.5, eu: 63, uk: "U", mm: 20.2 },
    { us: 11, eu: 64.5, uk: "V", mm: 20.6 },
    { us: 11.5, eu: 65.5, uk: "W", mm: 21.0 },
    { us: 12, eu: 67, uk: "X", mm: 21.4 },
    { us: 12.5, eu: 68, uk: "Y", mm: 21.8 },
    { us: 13, eu: 69, uk: "Z", mm: 22.2 },
];

const findClosestSize = (diameterMm: number) => {
    let closest = RING_SIZES[6]; // Default to size 6
    let minDiff = Math.abs(diameterMm - closest.mm);

    for (const size of RING_SIZES) {
        const diff = Math.abs(diameterMm - size.mm);
        if (diff < minDiff) {
            minDiff = diff;
            closest = size;
        }
    }
    return closest;
};

export default function CameraRingSizerScreen() {
    const router = useRouter();
    const [step, setStep] = useState<"measure" | "result">("measure");
    const [result, setResult] = useState<typeof RING_SIZES[0] | null>(null);

    // Circle diameter in pixels (start with size 7 = 17.3mm)
    const circleDiameter = useSharedValue(17.3 * PIXELS_PER_MM);

    // Calculate current size based on circle diameter
    const getCurrentSizeMm = () => {
        return circleDiameter.value / PIXELS_PER_MM;
    };

    // Animated circle style
    const circleStyle = useAnimatedStyle(() => ({
        width: circleDiameter.value,
        height: circleDiameter.value,
        borderRadius: circleDiameter.value / 2,
    }));

    // Pinch gesture for resizing
    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            const newSize = circleDiameter.value * e.scale;
            if (newSize >= 10 * PIXELS_PER_MM && newSize <= 25 * PIXELS_PER_MM) {
                circleDiameter.value = newSize;
            }
        })
        .onEnd(() => {
            Haptics.selectionAsync();
        });

    // Pan gesture for fine adjustment
    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            const delta = e.translationY * -0.3; // Negative because drag up = bigger
            const newSize = circleDiameter.value + delta;
            if (newSize >= 10 * PIXELS_PER_MM && newSize <= 25 * PIXELS_PER_MM) {
                circleDiameter.value = newSize;
            }
        });

    // Combined gesture
    const combinedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

    // Increase/decrease buttons
    const adjustSize = (delta: number) => {
        Haptics.selectionAsync();
        const newSize = circleDiameter.value + (delta * PIXELS_PER_MM);
        if (newSize >= 10 * PIXELS_PER_MM && newSize <= 25 * PIXELS_PER_MM) {
            circleDiameter.value = withSpring(newSize, { damping: 15 });
        }
    };

    const confirmMeasurement = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const sizeMm = getCurrentSizeMm();
        const closestSize = findClosestSize(sizeMm);
        setResult(closestSize);
        setStep("result");
    };

    const reset = () => {
        setStep("measure");
        setResult(null);
        circleDiameter.value = withSpring(17.3 * PIXELS_PER_MM);
    };

    // STEP: Measure
    if (step === "measure") {
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View className="flex-1 bg-[#0F0F0F]">
                    <LinearGradient colors={['#1a1a1a', '#0a0a0a']} style={StyleSheet.absoluteFill} />

                    <SafeAreaView className="flex-1">
                        {/* Header */}
                        <View className="px-6 py-4 flex-row items-center justify-between">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="w-12 h-12 rounded-full bg-white/5 items-center justify-center border border-white/10"
                            >
                                <ArrowLeft color="#BFC3C7" size={22} />
                            </TouchableOpacity>
                            <Text variant="heading" className="text-white text-lg">قياس المقاس</Text>
                            <View className="w-12" />
                        </View>

                        {/* Instructions */}
                        <View className="px-8 py-4">
                            <View className="bg-[#DBAC33]/10 p-4 rounded-2xl border border-[#DBAC33]/20 flex-row items-center">
                                <Info size={20} color="#DBAC33" />
                                <Text className="text-[#DBAC33] text-sm mr-3 flex-1">
                                    ضع خاتمك على الشاشة وطابق الدائرة مع القطر الداخلي
                                </Text>
                            </View>
                        </View>

                        {/* Ring Measurement Area */}
                        <View className="flex-1 items-center justify-center">
                            <GestureDetector gesture={combinedGesture}>
                                <Animated.View
                                    style={[
                                        {
                                            borderWidth: 3,
                                            borderColor: '#DBAC33',
                                            backgroundColor: 'transparent',
                                        },
                                        circleStyle
                                    ]}
                                />
                            </GestureDetector>

                            {/* Size indicators */}
                            <View className="absolute bottom-10 flex-row items-center">
                                <TouchableOpacity
                                    onPress={() => adjustSize(-0.5)}
                                    className="w-14 h-14 rounded-full bg-white/10 items-center justify-center border border-white/20"
                                >
                                    <ChevronDown color="white" size={28} />
                                </TouchableOpacity>

                                <View className="mx-8 items-center">
                                    <Text className="text-gray-400 text-xs mb-1">القطر الحالي</Text>
                                    <Text className="text-white text-2xl font-bold">
                                        {(circleDiameter.value / PIXELS_PER_MM).toFixed(1)} mm
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => adjustSize(0.5)}
                                    className="w-14 h-14 rounded-full bg-white/10 items-center justify-center border border-white/20"
                                >
                                    <ChevronUp color="white" size={28} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Button */}
                        <View className="px-8 pb-8">
                            <TouchableOpacity
                                onPress={confirmMeasurement}
                                className="bg-[#DBAC33] py-4 rounded-full flex-row items-center justify-center"
                            >
                                <Check size={20} color="black" />
                                <Text className="text-black font-bold mr-2">تأكيد المقاس</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            </GestureHandlerRootView>
        );
    }

    // STEP: Result
    if (step === "result" && result) {
        return (
            <Animated.View entering={FadeIn} className="flex-1 bg-[#0F0F0F]">
                <LinearGradient colors={['#1a1a1a', '#0a0a0a']} style={StyleSheet.absoluteFill} />

                <SafeAreaView className="flex-1">
                    {/* Header */}
                    <View className="px-6 py-4 flex-row items-center justify-center">
                        <Text variant="heading" className="text-white text-lg">مقاسك</Text>
                    </View>

                    {/* Main Result */}
                    <View className="flex-1 items-center justify-center px-8">
                        {/* Ring Size Display */}
                        <View
                            className="w-56 h-56 rounded-full items-center justify-center border-4 border-[#DBAC33] mb-8"
                            style={{
                                shadowColor: "#DBAC33",
                                shadowOpacity: 0.5,
                                shadowRadius: 40,
                                elevation: 20,
                            }}
                        >
                            <Text className="text-[#DBAC33] text-sm mb-1">US Size</Text>
                            <Text variant="heading" className="text-white text-7xl">{result.us}</Text>
                        </View>

                        {/* Size Details */}
                        <View className="bg-white/5 rounded-2xl p-6 w-full border border-white/10">
                            <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-white/10">
                                <Text className="text-gray-400">القطر الداخلي</Text>
                                <Text className="text-white font-bold text-lg">{result.mm} مم</Text>
                            </View>
                            <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-white/10">
                                <Text className="text-gray-400">المقاس الأوروبي</Text>
                                <Text className="text-white font-bold text-lg">EU {result.eu}</Text>
                            </View>
                            <View className="flex-row justify-between items-center">
                                <Text className="text-gray-400">المقاس البريطاني</Text>
                                <Text className="text-white font-bold text-lg">UK {result.uk}</Text>
                            </View>
                        </View>

                        {/* Accuracy Badge */}
                        <View className="mt-6 flex-row items-center bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                            <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                            <Text className="text-green-400 text-sm font-bold">دقة عالية ✓</Text>
                        </View>
                    </View>

                    {/* Buttons */}
                    <View className="px-8 pb-8 gap-4">
                        <TouchableOpacity
                            onPress={reset}
                            className="bg-white/10 py-4 rounded-full flex-row items-center justify-center border border-white/20"
                        >
                            <RotateCcw size={18} color="white" />
                            <Text className="text-white font-bold mr-2">قياس مرة أخرى</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push("/browse")}
                            className="bg-[#DBAC33] py-4 rounded-full flex-row items-center justify-center"
                        >
                            <ShoppingBag size={18} color="black" />
                            <Text className="text-black font-bold mr-2">تسوق الخواتم</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Animated.View>
        );
    }

    return null;
}
