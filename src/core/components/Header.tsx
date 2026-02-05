import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Link, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "../contexts/ThemeColors";
import Icon, { IconName } from "./Icon";

type HeaderProps = {
    title: string;
    showBackButton?: boolean;
    rightComponents?: React.ReactNode[];
};

export const Header: React.FC<HeaderProps> = ({
    title,
    showBackButton = false,
    rightComponents = [],
}) => {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();

    const handleBackPress = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace("/");
        }
    };

    return (
        <View
            style={{ paddingTop: insets.top, backgroundColor: colors.background }}
            className="w-full pb-2 flex-row justify-between px-6"
        >
            <View className="flex-row items-center flex-1">
                {showBackButton && (
                    <TouchableOpacity onPress={handleBackPress} className="mr-4 py-4">
                        <Icon name="ArrowLeft" size={24} color={colors.icon} />
                    </TouchableOpacity>
                )}

                <View className="py-4">
                    <Text className="text-lg font-bold" style={{ color: colors.text }}>
                        {title}
                    </Text>
                </View>
            </View>

            {rightComponents.length > 0 && (
                <View className="flex-row items-center justify-end flex-1">
                    {rightComponents.map((component, index) => (
                        <View key={index} className="ml-6">
                            {component}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

export default Header;
