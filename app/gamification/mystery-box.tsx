
import { View, TouchableOpacity, Alert, StyleSheet, Dimensions } from "react-native";
import { Text } from "../../src/core/components/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Gift, Package } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withSequence,
    withRepeat,
    ZoomIn,
    FadeIn
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as SecureStore from "expo-secure-store";
import { LinearGradient } from "expo-linear-gradient";
import ConfettiCannon from "react-native-confetti-cannon";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get("window");

const REWARDS = [
    { id: '10_off', label: "10% OFF", code: "MYSTERY10", type: 'win', color: '#DBAC33' },
    { id: '5_off', label: "5% OFF", code: "MYSTERY5", type: 'win', color: '#C0C0C0' },
    { id: 'free_ship', label: "Free Shipping", code: "FREESHIP", type: 'win', color: '#1C6E7A' },
    { id: 'hard_luck', label: "Better Luck Next Time", code: null, type: 'loss', color: '#666' },
];

export default function MysteryBoxScreen() {
    const router = useRouter();
    const [selectedBox, setSelectedBox] = useState<number | null>(null);
    const [revealedReward, setRevealedReward] = useState<typeof REWARDS[0] | null>(null);
    const [canPlay, setCanPlay] = useState<boolean | null>(null);
    const confettiRef = useRef<any>(null);

    // Box Animations
    const scale1 = useSharedValue(1);
    const scale2 = useSharedValue(1);
    const scale3 = useSharedValue(1);
    const rotation1 = useSharedValue(0);
    const rotation2 = useSharedValue(0);
    const rotation3 = useSharedValue(0);

    const scales = [scale1, scale2, scale3];
    const rotations = [rotation1, rotation2, rotation3];

    useEffect(() => {
        checkDailyLimit();
    }, []);

    const checkDailyLimit = async () => {
        const lastPlay = await SecureStore.getItemAsync("last_mystery_play_date");
        const today = new Date().toDateString();
        // Reset for testing if needed
        if (lastPlay === today) {
            setCanPlay(false);
        } else {
            setCanPlay(true);
        }
    };

    const handleBoxPress = async (index: number) => {
        if (!canPlay || selectedBox !== null) return;

        setSelectedBox(index);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        // Shake animation
        rotations[index].value = withSequence(
            withTiming(-5, { duration: 50 }),
            withRepeat(withTiming(5, { duration: 100 }), 5, true),
            withTiming(0, { duration: 50 })
        );

        // Simulate opening delay
        setTimeout(() => {
            openBox(index);
        }, 1500);
    };

    const openBox = async (index: number) => {
        // Determine Reward
        const random = Math.random();
        let reward;
        if (random < 0.2) reward = REWARDS[0]; // 20% chance for 10% OFF
        else if (random < 0.5) reward = REWARDS[1]; // 30% chance for 5% OFF
        else if (random < 0.7) reward = REWARDS[2]; // 20% chance for Free Shipping
        else reward = REWARDS[3]; // 30% chance for Hard Luck

        setRevealedReward(reward);

        // Save state
        await SecureStore.setItemAsync("last_mystery_play_date", new Date().toDateString());
        setCanPlay(false);

        // Animation
        scales[index].value = withSpring(1.2);

        if (reward.type === 'win') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            confettiRef.current?.start();
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
    };

    const BoxItem = ({ index }: { index: number }) => {
        const isOpen = selectedBox === index && revealedReward;
        const isSelected = selectedBox === index;
        const isDisabled = selectedBox !== null && selectedBox !== index;

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [
                { scale: scales[index].value },
                { rotate: `${rotations[index].value}deg` }
            ],
            opacity: withTiming(isDisabled ? 0.5 : 1)
        }));

        return (
            <Animated.View style={animatedStyle} className="mb-8">
                <TouchableOpacity
                    onPress={() => handleBoxPress(index)}
                    activeOpacity={0.8}
                    disabled={selectedBox !== null}
                    className="items-center"
                >
                    <View className={`w-28 h-28 rounded-2xl items-center justify-center border-2 shadow-lg mb-4 ${isOpen
                            ? "bg-white/10 border-[#DBAC33] shadow-[#DBAC33]/50"
                            : "bg-white/5 border-white/10 shadow-black"
                        }`}>
                        {isOpen ? (
                            <Gift size={48} color="#DBAC33" />
                        ) : (
                            <Package size={48} color={isSelected ? "#DBAC33" : "#C0C0C0"} />
                        )}
                    </View>
                    <Text className={`text-xs font-bold uppercase tracking-widest ${isSelected ? "text-[#DBAC33]" : "text-gray-500"
                        }`}>
                        {isOpen ? "OPENED" : `BOX ${index + 1}`}
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-[#0F0F0F]" edges={['top']}>
            <LinearGradient
                colors={["rgba(219, 172, 51, 0.05)", "transparent"]}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.4 }}
            />

            <ConfettiCannon
                count={200}
                origin={{ x: -10, y: 0 }}
                autoStart={false}
                ref={confettiRef}
                fadeOut={true}
            />

            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between z-10">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center bg-white/5 rounded-full border border-white/10"
                >
                    <ArrowLeft color="white" size={20} />
                </TouchableOpacity>
                <View className="items-center">
                    <Text variant="bold" className="text-primary text-xs uppercase tracking-[4px]">Daily Reward</Text>
                    <Text variant="heading" className="text-white text-xl">Mystery Box</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <View className="flex-1 items-center justify-center px-6">

                {/* Intro Text */}
                {!revealedReward && (
                    <Animated.View entering={FadeIn.delay(200)} className="mb-12 items-center">
                        <Text variant="heading" className="text-3xl text-white text-center mb-2">
                            {canPlay ? "Pick a Box" : "Come Back Tomorrow"}
                        </Text>
                        <Text className="text-gray-400 text-center text-sm leading-6">
                            {canPlay
                                ? "One of these boxes contains a special discount.\nChoose wisely!"
                                : "You've already opened your box for today.\nTry your luck again tomorrow."}
                        </Text>
                    </Animated.View>
                )}

                {/* Boxes Grid */}
                <View className="flex-row flex-wrap justify-between w-full max-w-[340px]">
                    <BoxItem index={0} />
                    <BoxItem index={1} />
                    <BoxItem index={2} />
                </View>

                {/* Result Reveal */}
                {revealedReward && (
                    <Animated.View
                        entering={ZoomIn.springify()}
                        className="absolute inset-0 items-center justify-center bg-black/80 z-20"
                    >
                        <BlurView intensity={20} className="w-[85%] p-8 rounded-3xl border border-white/10 bg-[#1A1A1A] items-center">
                            <View className="w-20 h-20 rounded-full bg-white/5 items-center justify-center mb-6 border border-white/10">
                                <Gift size={40} color={revealedReward.color} />
                            </View>

                            <Text variant="heading" className="text-2xl text-white text-center mb-2">
                                {revealedReward.type === 'win' ? "Congratulations!" : "Hard Luck!"}
                            </Text>

                            <Text className="text-gray-300 text-center mb-8 text-lg font-medium">
                                {revealedReward.label}
                            </Text>

                            {revealedReward.code && (
                                <View className="bg-white/5 px-6 py-3 rounded-xl border border-[#DBAC33]/30 mb-8 border-dashed">
                                    <Text className="text-[#DBAC33] font-bold text-xl tracking-widest">
                                        {revealedReward.code}
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="w-full h-14 bg-white rounded-full items-center justify-center"
                            >
                                <Text className="text-black font-bold text-sm uppercase tracking-widest">
                                    Collect & Continue
                                </Text>
                            </TouchableOpacity>
                        </BlurView>
                    </Animated.View>
                )}
            </View>
        </SafeAreaView>
    );
}
