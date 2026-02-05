import { View, Dimensions, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { Text } from "../../src/core/components/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Gift, Star } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    runOnJS,
    withSpring
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as SecureStore from "expo-secure-store";
import Svg, { Path, G, Text as SvgText, TSpan, Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import ConfettiCannon from "react-native-confetti-cannon";

const { width } = Dimensions.get("window");
const WHEEL_SIZE = width * 0.9;
const RADIUS = WHEEL_SIZE / 2;
const SEGMENTS = [
    { label: "10% OFF", color: "#DBAC33", text: "#000" },
    { label: "Bad Luck", color: "#1A1A1A", text: "#666" },
    { label: "Free Ship", color: "#DBAC33", text: "#000" },
    { label: "5% OFF", color: "#1A1A1A", text: "#FFF" },
    { label: "Try Again", color: "#333333", text: "#888" },
    { label: "15% OFF", color: "#DBAC33", text: "#000" },
    { label: "No Luck", color: "#1A1A1A", text: "#666" },
    { label: "50 Points", color: "#DBAC33", text: "#000" },
];
const SEGMENT_ANGLE = 360 / SEGMENTS.length;

export default function SpinWheelScreen() {
    const router = useRouter();
    const rotation = useSharedValue(0);
    const [spinning, setSpinning] = useState(false);
    const [canSpin, setCanSpin] = useState<boolean | null>(null);
    const confettiRef = useRef<any>(null);

    useEffect(() => {
        checkDailyLimit();
    }, []);

    const checkDailyLimit = async () => {
        const lastSpin = await SecureStore.getItemAsync("last_spin_date");
        const today = new Date().toDateString();
        // Reset for demo purposes if needed, otherwise strict enforcement
        if (lastSpin === today) {
            setCanSpin(false);
        } else {
            setCanSpin(true);
        }
    };

    const makeSectorPath = (index: number) => {
        const startAngle = (index * SEGMENT_ANGLE * Math.PI) / 180;
        const endAngle = ((index + 1) * SEGMENT_ANGLE * Math.PI) / 180;

        const x1 = RADIUS + RADIUS * Math.cos(startAngle);
        const y1 = RADIUS + RADIUS * Math.sin(startAngle);
        const x2 = RADIUS + RADIUS * Math.cos(endAngle);
        const y2 = RADIUS + RADIUS * Math.sin(endAngle);

        return `M${RADIUS},${RADIUS} L${x1},${y1} A${RADIUS},${RADIUS} 0 0,1 ${x2},${y2} Z`;
    };

    const handleSpin = () => {
        if (!canSpin) return;

        setSpinning(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        // Random logic
        const randomIndex = Math.floor(Math.random() * SEGMENTS.length);
        // We want the POINTER (at 270deg / top-ish visually depending on rotation) to land on sector.
        // SVG starts at 0deg triggers East. 
        // Let's simplify: Rotate huge amount + offset.

        // Calculate stop angle to align the chosen segment with the pointer at the top (270 degrees)
        // Segment center angle relative to 0
        const segmentCenter = (randomIndex * SEGMENT_ANGLE) + (SEGMENT_ANGLE / 2);

        // We want (FinalRotation + SegmentCenter) % 360 = 270 (Top position)
        // FinalRotation = 270 - SegmentCenter + FullSpins
        // Adding extra spins
        const spinCount = 5 + Math.random() * 2;
        const finalAngle = (360 * spinCount) + (270 - segmentCenter);

        rotation.value = withTiming(finalAngle, {
            duration: 4000,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }, (finished) => {
            if (finished) {
                runOnJS(handleResult)(SEGMENTS[randomIndex]);
            }
        });
    };

    const handleResult = async (result: typeof SEGMENTS[0]) => {
        setSpinning(false);
        await SecureStore.setItemAsync("last_spin_date", new Date().toDateString());
        setCanSpin(false);

        if (result.color === "#DBAC33") {
            // Winning segment logic
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            confettiRef.current?.start();
            Alert.alert("🎉 Congratulations!", `You won: ${result.label}`, [{ text: "Awesome!" }]);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert("😢 Hard Luck", "Better luck next time!", [{ text: "OK" }]);
        }
    };

    const wheelStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }]
    }));

    return (
        <SafeAreaView className="flex-1 bg-[#0F0F0F]" edges={['top']}>
            {/* Background Gradient */}
            <LinearGradient
                colors={["rgba(219, 172, 51, 0.1)", "transparent"]}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.5 }}
            />

            <ConfettiCannon
                count={200}
                origin={{ x: -10, y: 0 }}
                autoStart={false}
                ref={confettiRef}
                fadeOut={true}
            />

            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center bg-white/5 rounded-full"
                >
                    <ArrowLeft color="white" size={20} />
                </TouchableOpacity>
                <View className="items-center">
                    <Text variant="bold" className="text-primary text-xs uppercase tracking-[4px]">Ezz Rewards</Text>
                    <Text variant="heading" className="text-white text-xl">Daily Fortune</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Main Content */}
            <View className="flex-1 items-center justify-center relative">

                {/* Pointer (Z-Index High) */}
                <View className="absolute z-50 top-[15%] shadow-xl shadow-black">
                    <View className="w-8 h-10 bg-white items-center justify-end pb-1 rounded-b-full shadow-lg border-2 border-primary">
                        <View className="w-1 h-3 bg-gray-300 rounded-full" />
                    </View>
                    {/* Shadow for pointer */}
                    <View className="absolute -z-10 top-2 left-1 w-8 h-10 bg-black/50 rounded-b-full blur-sm" />
                </View>

                {/* Outer Rim */}
                <View className="shadow-2xl shadow-primary/30 rounded-full">
                    <LinearGradient
                        colors={["#DBAC33", "#F2D06B", "#B88A1F"]}
                        style={{
                            width: WHEEL_SIZE + 20,
                            height: WHEEL_SIZE + 20,
                            borderRadius: (WHEEL_SIZE + 20) / 2,
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: "#DBAC33",
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.5,
                            shadowRadius: 20,
                            elevation: 10
                        }}
                    >
                        {/* Inner Rim (Dark) */}
                        <View
                            style={{
                                width: WHEEL_SIZE + 8,
                                height: WHEEL_SIZE + 8,
                                borderRadius: (WHEEL_SIZE + 8) / 2,
                                backgroundColor: "#0F0F0F",
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {/* The Wheel */}
                            <Animated.View style={[{ width: WHEEL_SIZE, height: WHEEL_SIZE }, wheelStyle]}>
                                <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
                                    <G>
                                        {SEGMENTS.map((seg, i) => {
                                            const angle = (i * SEGMENT_ANGLE) + (SEGMENT_ANGLE / 2); // Center of segment

                                            // Text Setup
                                            // Position: Radius * 0.7 from center
                                            const textRadius = RADIUS * 0.65;
                                            const textAngleRad = (angle * Math.PI) / 180;
                                            const textX = RADIUS + textRadius * Math.cos(textAngleRad);
                                            const textY = RADIUS + textRadius * Math.sin(textAngleRad);

                                            return (
                                                <G key={i}>
                                                    <Path
                                                        d={makeSectorPath(i)}
                                                        fill={seg.color}
                                                        stroke="#0F0F0F"
                                                        strokeWidth="2"
                                                    />
                                                    {/* Text Rotation logic is tricky in SVG. 
                                                        We need to rotate text perpendicular to the radius.
                                                        Or just horizontal if possible? No, radial looks better.
                                                        Rotation = angle + 90?
                                                    */}
                                                    <G
                                                        x={textX}
                                                        y={textY}
                                                        rotation={(angle + 90)} // Rotate to face outward
                                                        origin={`${textX}, ${textY}`}
                                                    >
                                                        <SvgText
                                                            fill={seg.text}
                                                            fontSize="14"
                                                            fontWeight="bold"
                                                            textAnchor="middle"
                                                            alignmentBaseline="middle"
                                                        >
                                                            {seg.label}
                                                        </SvgText>
                                                    </G>
                                                </G>
                                            )
                                        })}
                                        {/* Center Hub */}
                                        <Circle cx={RADIUS} cy={RADIUS} r={35} fill="#111" stroke="#DBAC33" strokeWidth={4} />
                                        <Circle cx={RADIUS} cy={RADIUS} r={10} fill="#DBAC33" />
                                    </G>
                                </Svg>
                            </Animated.View>
                        </View>
                    </LinearGradient>
                </View>
            </View>

            {/* Controls */}
            <View className="px-8 pb-10 w-full items-center">
                <Text className="text-gray-400 text-center mb-6 font-medium">
                    {canSpin
                        ? "Test your luck today and win exclusive prizes!"
                        : "You've used your daily luck. Come back tomorrow!"}
                </Text>

                <TouchableOpacity
                    onPress={handleSpin}
                    disabled={spinning || !canSpin}
                    activeOpacity={0.8}
                    className="w-full shadow-lg shadow-primary/20"
                >
                    <LinearGradient
                        colors={canSpin ? ["#DBAC33", "#B88A1F"] : ["#333", "#222"]}
                        className="h-16 rounded-2xl items-center justify-center flex-row border border-white/10"
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {spinning ? (
                            <Text variant="bold" className="text-[#3E2C00] text-lg uppercase tracking-widest">Spinning...</Text>
                        ) : (
                            <>
                                <Gift size={22} color={canSpin ? "#3E2C00" : "#666"} strokeWidth={2.5} className="mr-3" />
                                <Text variant="bold" className={`${canSpin ? "text-[#3E2C00]" : "text-gray-500"} text-lg uppercase tracking-widest`}>
                                    {canSpin ? "Spin Now" : "Come Back Tomorrow"}
                                </Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
