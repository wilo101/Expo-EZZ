import { Tabs } from "expo-router";
import { Home, Search, ShoppingBag, User } from "lucide-react-native";
import { View, Platform, StyleSheet, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import animated, { useAnimatedStyle, withSpring, withTiming, useSharedValue, ZoomIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Text } from "../../src/core/components/Text";

const AnimatedView = animated.createAnimatedComponent(View);

const TabBar = ({ state, descriptors, navigation }: any) => {
    return (
        <View style={styles.tabContainer}>
            {/* Background with gradient border effect */}
            <LinearGradient
                colors={['rgba(219, 172, 51, 0.3)', 'rgba(219, 172, 51, 0.1)', 'rgba(255,255,255,0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBorder}
            />
            <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
                <View style={styles.innerBackground} />
                <View style={styles.tabRow}>
                    {state.routes.map((route: any, index: number) => {
                        const { options } = descriptors[route.key];
                        const label = options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                                ? options.title
                                : route.name;

                        const isFocused = state.index === index;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                navigation.navigate(route.name);
                            }
                        };

                        return (
                            <TabIcon
                                key={index}
                                isFocused={isFocused}
                                onPress={onPress}
                                iconName={route.name}
                                label={label}
                            />
                        );
                    })}
                </View>
            </BlurView>
        </View>
    );
};

const TabIcon = ({ isFocused, onPress, iconName, label }: any) => {
    const scale = useSharedValue(isFocused ? 1 : 0);
    const iconScale = useSharedValue(isFocused ? 1.1 : 1);

    if (isFocused) {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
        iconScale.value = withSpring(1.1, { damping: 15 });
    } else {
        scale.value = withTiming(0, { duration: 200 });
        iconScale.value = withTiming(1, { duration: 200 });
    }

    const backgroundStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: scale.value,
    }));

    const iconAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: iconScale.value }],
    }));

    const getIcon = (color: string, size: number) => {
        switch (iconName) {
            case "index": return <Home color={color} size={size} strokeWidth={isFocused ? 2.5 : 1.5} />;
            case "search": return <Search color={color} size={size} strokeWidth={isFocused ? 2.5 : 1.5} />;
            case "cart": return <ShoppingBag color={color} size={size} strokeWidth={isFocused ? 2.5 : 1.5} />;
            case "profile": return <User color={color} size={size} strokeWidth={isFocused ? 2.5 : 1.5} />;
            default: return <Home color={color} size={size} strokeWidth={isFocused ? 2.5 : 1.5} />;
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.tabItem}
        >
            {/* Active Background Glow */}
            <AnimatedView style={[styles.activeBackground, backgroundStyle]}>
                <LinearGradient
                    colors={['rgba(219, 172, 51, 0.25)', 'rgba(219, 172, 51, 0.1)']}
                    style={styles.activeGradient}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                />
            </AnimatedView>

            {/* Icon */}
            <AnimatedView style={iconAnimStyle}>
                {getIcon(isFocused ? "#DBAC33" : "#808080", isFocused ? 24 : 22)}
            </AnimatedView>

            {/* Label */}
            <Text
                style={[
                    styles.label,
                    { color: isFocused ? "#DBAC33" : "#808080" }
                ]}
            >
                {label === "index" ? "Home" : label}
            </Text>

            {/* Active Indicator Line */}
            {isFocused && (
                <animated.View entering={ZoomIn.duration(200)} style={styles.activeLine} />
            )}
        </TouchableOpacity>
    );
};

export default function TabsLayout() {
    return (
        <Tabs
            tabBar={props => <TabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarStyle: { position: 'absolute' },
            }}
        >
            <Tabs.Screen name="index" options={{ title: "Home" }} />
            <Tabs.Screen name="search" options={{ title: "Search" }} />
            <Tabs.Screen name="cart" options={{ title: "Cart" }} />
            <Tabs.Screen name="profile" options={{ title: "Profile" }} />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabContainer: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 30 : 20,
        left: 24,
        right: 24,
        borderRadius: 28,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    gradientBorder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 28,
    },
    blurContainer: {
        width: '100%',
        height: 72,
        borderRadius: 28,
        overflow: 'hidden',
    },
    innerBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 15, 15, 0.85)',
    },
    tabRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    tabItem: {
        height: 56,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    activeBackground: {
        position: 'absolute',
        top: 4,
        left: 0,
        right: 0,
        bottom: 4,
        borderRadius: 20,
        overflow: 'hidden',
    },
    activeGradient: {
        flex: 1,
        borderRadius: 20,
    },
    label: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 4,
        letterSpacing: 0.3,
    },
    activeLine: {
        position: 'absolute',
        bottom: 0,
        width: 20,
        height: 3,
        borderRadius: 2,
        backgroundColor: '#DBAC33',
    },
});
