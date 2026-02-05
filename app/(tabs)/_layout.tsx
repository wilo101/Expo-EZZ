import { Tabs } from "expo-router";
import { Home, Search, ShoppingBag, User } from "lucide-react-native";
import { View, Platform, StyleSheet, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import animated, { useAnimatedStyle, withSpring, withTiming, useSharedValue, ZoomIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

const AnimatedIcon = animated.createAnimatedComponent(View);

const TabBar = ({ state, descriptors, navigation }: any) => {
    return (
        <View style={styles.tabContainer}>
            <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
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
    // Animation for the active indicator (Gold Glow)
    const scale = useSharedValue(0);

    if (isFocused) {
        scale.value = withSpring(1, { damping: 15 });
    } else {
        scale.value = withTiming(0);
    }

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: scale.value
    }));

    const getIcon = (color: string) => {
        const size = 24;
        switch (iconName) {
            case "index": return <Home color={color} size={size} />;
            case "search": return <Search color={color} size={size} />;
            case "cart": return <ShoppingBag color={color} size={size} />;
            case "profile": return <User color={color} size={size} />;
            default: return <Home color={color} size={size} />;
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={styles.tabItem}
        >
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                {/* Active Indicator Background */}
                <AnimatedIcon style={[StyleSheet.absoluteFillObject, styles.activeIndicator, animatedStyle]}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']} // Subtle Silver Shine
                        style={{ width: 50, height: 50, borderRadius: 25 }}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                </AnimatedIcon>

                {/* Icon */}
                <View style={{ marginBottom: 4 }}>
                    {getIcon(isFocused ? "#F2F2F2" : "#BFC3C7")}
                </View>

                {/* Active Dot (Turquoise Underline) */}
                {isFocused && (
                    <animated.View entering={ZoomIn} style={styles.activeDot} />
                )}
            </View>
        </TouchableOpacity>
    );
};

export default function TabsLayout() {
    return (
        <Tabs
            tabBar={props => <TabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarStyle: { position: 'absolute' }, // Required for BlurView to sit over content
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
        bottom: 25,
        left: 20,
        right: 20,
        borderRadius: 35,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    blurContainer: {
        width: '100%',
        height: 70,
        justifyContent: 'center',
    },
    tabRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    tabItem: {
        height: 60,
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeIndicator: {
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1,
    },
    activeDot: {
        width: 20, // Wider like a small underline
        height: 2,
        borderRadius: 1,
        backgroundColor: '#1C6E7A', // Turquoise
        marginTop: 4,
        position: 'absolute',
        bottom: 8
    }
});
