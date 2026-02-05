import { View, Dimensions, StyleSheet, Platform } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from "react-native-reanimated";
import { Text } from "../../src/core/components/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, CreditCard, Info } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as Haptics from "expo-haptics";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CREDIT_CARD_MM = 85.60; // Standard ID-1 card width

export default function RingSizerScreen() {
    const router = useRouter();
    // Default calibration: Assume ~350px is card width initially (approx for many phones)
    // In a real app, we might save this calibration value to SecureStore
    const cardPx = useSharedValue(SCREEN_WIDTH * 0.85);
    const circlePx = useSharedValue(150); // Initial ring size

    const [diameterMm, setDiameterMm] = useState(0);
    const [usSize, setUsSize] = useState("-");

    const calculateSize = (cPx: number, refPx: number) => {
        const mm = (cPx / refPx) * CREDIT_CARD_MM;
        setDiameterMm(parseFloat(mm.toFixed(1)));

        // Simple US Size lookup (approximate)
        // Size 5 = 15.7mm, Size 10 = 19.8mm, approx +0.82mm per size
        let size = (mm - 11.6) / 0.82;
        if (size < 3) size = 3;
        if (size > 14) size = 14;
        setUsSize(size.toFixed(1));
    };

    // Gesture for calibrating Card Size (Top Slider)
    const cardPan = Gesture.Pan()
        .onChange((e) => {
            cardPx.value += e.changeX;
            // Limit range (min 100px, max screen width)
            if (cardPx.value < 100) cardPx.value = 100;
            if (cardPx.value > SCREEN_WIDTH - 20) cardPx.value = SCREEN_WIDTH - 20;
            runOnJS(calculateSize)(circlePx.value, cardPx.value);
        });

    // Gesture for adjusting Ring Circle (Bottom Slider)
    const ringPan = Gesture.Pan()
        .onChange((e) => {
            circlePx.value += e.changeX / 2; // Slower sensitivity for precision
            if (circlePx.value < 50) circlePx.value = 50;
            if (circlePx.value > 300) circlePx.value = 300;
            runOnJS(calculateSize)(circlePx.value, cardPx.value);
        })
        .onEnd(() => {
            runOnJS(Haptics.selectionAsync)();
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
        <SafeAreaView className="flex-1 bg-black">
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center border-b border-white/10">
                <ArrowLeft color="white" size={24} onPress={() => router.back()} />
                <Text variant="heading" className="text-white text-xl ml-4">Ring Sizer</Text>
            </View>

            <View className="flex-1 px-6 justify-between py-8">

                {/* 1. Calibration Section */}
                <View>
                    <View className="flex-row items-center mb-4">
                        <CreditCard color="#C0C0C0" size={20} className="mr-2" />
                        <Text className="text-gray-300 font-bold">Step 1: Calibrate</Text>
                    </View>
                    <Text className="text-gray-500 text-sm mb-4">
                        Place a standard credit card on the screen and drag the slider until the blue box matches its width exactly.
                    </Text>

                    <View className="items-center mb-4">
                        <Animated.View
                            style={[
                                { height: 54, backgroundColor: "#3b82f6", borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
                                cardStyle
                            ]}
                        >
                            <Text className="text-white font-bold opacity-50">Standard Card</Text>
                        </Animated.View>
                    </View>

                    <GestureDetector gesture={cardPan}>
                        <View className="bg-surface h-12 rounded-full justify-center items-center border border-white/10">
                            <Text className="text-white font-bold">Drag to Resize Card Box ↔</Text>
                        </View>
                    </GestureDetector>
                </View>

                {/* 2. Ring Measurement Section */}
                <View>
                    <View className="flex-row items-center mb-4 mt-8">
                        <View className="w-5 h-5 rounded-full border-2 border-primary mr-2" />
                        <Text className="text-gray-300 font-bold">Step 2: Measure</Text>
                    </View>
                    <Text className="text-gray-500 text-sm mb-4">
                        Place your ring on the circle below. Drag the slider until the white circle fills the inside of your ring.
                    </Text>

                    <View className="items-center h-40 justify-center mb-4 relative">
                        {/* Crosshair lines for centering */}
                        <View className="absolute w-full h-[1px] bg-white/10" />
                        <View className="absolute h-full w-[1px] bg-white/10" />

                        <Animated.View
                            style={[
                                { borderColor: "white", borderWidth: 2, backgroundColor: "rgba(255,255,255,0.1)" },
                                ringStyle
                            ]}
                        />
                    </View>

                    <GestureDetector gesture={ringPan}>
                        <View className="bg-primary h-14 rounded-full justify-center items-center">
                            <Text className="text-black font-bold text-lg">Adjust Ring Size ↔</Text>
                        </View>
                    </GestureDetector>
                </View>

                {/* Result Display */}
                <View className="bg-surface p-6 rounded-2xl border border-white/10 items-center">
                    <Text className="text-gray-400 text-sm uppercase tracking-widest mb-1">Estimated Size</Text>
                    <Text variant="heading" className="text-white text-4xl mb-1">US {usSize}</Text>
                    <Text className="text-primary">{diameterMm} mm Diameter</Text>
                </View>

            </View>
        </SafeAreaView>
    );
}
