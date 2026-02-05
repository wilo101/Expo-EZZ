import { Pressable, View } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import Icon from "./Icon";

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";
    const translateX = useSharedValue(isDark ? 36 : 4);

    useEffect(() => {
        translateX.value = withSpring(isDark ? 36 : 4, {
            damping: 15,
            stiffness: 150,
        });
    }, [isDark]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    return (
        <Pressable
            onPress={toggleTheme}
            className={`w-20 h-10 p-1 flex-row rounded-full items-center justify-between relative ${isDark ? 'bg-zinc-800' : 'bg-gray-200'}`}
        >
            <View className="pl-2">
                <Icon name="Sun" size={16} color={isDark ? "#666" : "#FDB813"} />
            </View>
            <View className="pr-2">
                <Icon name="Moon" size={16} color={isDark ? "#FFF" : "#999"} />
            </View>

            <Animated.View
                style={[animatedStyle]}
                className={`w-8 h-8 rounded-full items-center justify-center flex flex-row absolute top-1 ${isDark ? 'bg-black' : 'bg-white'}`}
            />
        </Pressable>
    );
};

export default ThemeToggle;
