import { View, Dimensions, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, runOnJS, withSpring } from "react-native-reanimated";
import { Text } from "../../src/core/components/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, CreditCard, Info, ChevronUp, ChevronDown, Check } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CREDIT_CARD_MM = 85.60; // Standard ID-1 card width

export default function RingSizerScreen() {
    const router = useRouter();
    const cardPx = useSharedValue(SCREEN_WIDTH * 0.85);
    const circlePx = useSharedValue(150);
    const [step, setStep] = useState(1); // 1 = Calibrate, 2 = Measure

    const [diameterMm, setDiameterMm] = useState(0);
    const [usSize, setUsSize] = useState("-");

    const calculateSize = (cPx: number, refPx: number) => {
        const mm = (cPx / refPx) * CREDIT_CARD_MM;

        // Only trigger haptic if value effectively changes by 0.1mm (debounce feeling)
        const newMm = parseFloat(mm.toFixed(1));
        if (newMm !== diameterMm) {
            Haptics.selectionAsync();
        }

        setDiameterMm(newMm);

        // Simple US Size lookup (approximate)
        let size = (mm - 11.6) / 0.82;
        if (size < 3) size = 3;
        if (size > 14) size = 14;
        setUsSize(size.toFixed(1));
    };

    // Gesture for calibrating Card Size
    const cardPan = Gesture.Pan()
        .onChange((e) => {
            cardPx.value += e.changeX;
            if (cardPx.value < 100) cardPx.value = 100;
            if (cardPx.value > SCREEN_WIDTH - 20) cardPx.value = SCREEN_WIDTH - 20;
            runOnJS(calculateSize)(circlePx.value, cardPx.value);
        });

    // Gesture for adjusting Ring Circle
    const ringPan = Gesture.Pan()
        .onChange((e) => {
            circlePx.value += e.changeX / 2;
            if (circlePx.value < 50) circlePx.value = 50;
            if (circlePx.value > 300) circlePx.value = 300;
            runOnJS(calculateSize)(circlePx.value, cardPx.value);
        });

    const cardStyle = useAnimatedStyle(() => ({
        width: cardPx.value,
    }));

    const ringStyle = useAnimatedStyle(() => ({
        width: circlePx.value,
        height: circlePx.value,
        borderRadius: circlePx.value / 2,
    }));

    return (
        <View className="flex-1 bg-[#0F0F0F]">
            <LinearGradient
                colors={['#1c1c1c', '#000000']}
                style={StyleSheet.absoluteFill}
            />
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center justify-between z-50">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-white/5 items-center justify-center border border-white/10"
                    >
                        <ArrowLeft color="#BFC3C7" size={20} />
                    </TouchableOpacity>
                    <Text variant="heading" className="text-[#BFC3C7] text-lg tracking-[2px]">PRECISION SIZER</Text>
                    <View className="w-10" />
                </View>

                {/* Content Area */}
                <View className="flex-1 justify-center items-center relative">

                    {/* Step 1: Calibration UI */}
                    {step === 1 && (
                        <View className="w-full items-center">
                            <Text className="text-[#1C6E7A] text-xs font-bold uppercase tracking-[4px] mb-2">Calibration</Text>
                            <Text variant="heading" className="text-white text-3xl mb-8 text-center px-10">
                                Match the card
                            </Text>
                            <Text className="text-gray-400 text-sm mb-12 text-center px-10 leading-6 max-w-sm">
                                Place a standard credit/ID card on the screen. Drag the box edges until they match the card width exactly.
                            </Text>

                            {/* Calibration Box */}
                            <Animated.View
                                style={[
                                    {
                                        height: CREDIT_CARD_MM * 2.5, // Visual scale 
                                        backgroundColor: '#1C6E7A', // Turquoise
                                        borderRadius: 12,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        shadowColor: "#1C6E7A",
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: 0.4,
                                        shadowRadius: 20,
                                        opacity: 0.9,
                                        borderWidth: 1,
                                        borderColor: '#60A5B1'
                                    },
                                    cardStyle
                                ]}
                            >
                                <View className="absolute top-4 left-4 w-12 h-8 bg-black/20 rounded" />
                                <Text className="text-[#0F292E] font-bold text-lg opacity-80 tracking-widest">STANDARD CARD</Text>
                            </Animated.View>

                            {/* Slider Handle */}
                            <GestureDetector gesture={cardPan}>
                                <View className="mt-16 w-[80%] h-16 bg-[#1A1A1A] rounded-full flex-row items-center justify-between px-6 border border-white/5 relative overflow-hidden">
                                    <View className="absolute inset-0 items-center justify-center">
                                        <View className="w-1 h-4 bg-white/10 rounded-full" />
                                    </View>
                                    <ChevronDown color="#555" size={20} className="rotate-90" />
                                    <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest">Slide to Resize</Text>
                                    <ChevronDown color="#555" size={20} className="-rotate-90" />
                                </View>
                            </GestureDetector>

                            <TouchableOpacity
                                onPress={() => {
                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                    setStep(2);
                                }}
                                className="mt-8 bg-white px-8 py-3 rounded-full"
                            >
                                <Text className="text-black font-bold text-sm tracking-widest uppercase">Next: Measure Ring</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Step 2: Measurement UI */}
                    {step === 2 && (
                        <View className="w-full items-center justify-center flex-1">
                            <View className="absolute top-0 items-center">
                                <Text className="text-[#1C6E7A] text-xs font-bold uppercase tracking-[4px] mb-2">Measurement</Text>
                                <View className="flex-row items-baseline">
                                    <Text variant="heading" className="text-white text-6xl">{usSize}</Text>
                                    <Text className="text-gray-400 text-lg ml-2 font-light">US</Text>
                                </View>
                                <Text className="text-gray-500 text-sm font-mono mt-1 tracking-widest">{diameterMm} MM DIAMETER</Text>
                            </View>

                            {/* Measurement Circle */}
                            <View className="w-full h-[400px] justify-center items-center relative">
                                {/* Grid Lines (Precision feel) */}
                                <View className="absolute w-[1px] h-full bg-[#1C6E7A]/20" />
                                <View className="absolute h-[1px] w-full bg-[#1C6E7A]/20" />

                                {/* The Measured Ring */}
                                <Animated.View
                                    style={[
                                        {
                                            borderWidth: 2,
                                            borderColor: '#F2F2F2', // Silver
                                            backgroundColor: 'rgba(28, 110, 122, 0.15)', // Subtle Turquoise Fill
                                            shadowColor: "#1C6E7A",
                                            shadowOffset: { width: 0, height: 0 },
                                            shadowOpacity: 0.6,
                                            shadowRadius: 30,
                                        },
                                        ringStyle
                                    ]}
                                />

                                {/* Inner Helper Text */}
                                <View className="absolute top-[65%] opacity-40">
                                    <Text className="text-white text-[10px] uppercase tracking-[3px]">Fit to Inner Edge</Text>
                                </View>
                            </View>

                            {/* Slider Handle */}
                            <GestureDetector gesture={ringPan}>
                                <View className="absolute bottom-10 w-[80%] h-16 bg-[#1A1A1A] rounded-full flex-row items-center justify-between px-6 border border-white/5 shadow-2xl shadow-black">
                                    <View className="absolute inset-0 items-center justify-center pointer-events-none">
                                        <View className="w-16 h-1 bg-white/10 rounded-full" />
                                    </View>
                                    <ChevronDown color="#555" size={20} className="rotate-90" />
                                    <Text className="text-white font-bold text-xs uppercase tracking-widest">Adjust Size</Text>
                                    <ChevronDown color="#555" size={20} className="-rotate-90" />
                                </View>
                            </GestureDetector>

                            <TouchableOpacity
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setStep(1); // Recalibrate
                                }}
                                className="absolute bottom-[-20px]"
                            >
                                <Text className="text-gray-600 text-[10px] uppercase tracking-widest underline">Recalibrate</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                </View>
            </SafeAreaView>
        </View>
    );
}
