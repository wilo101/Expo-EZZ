import { View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../src/core/components/Text";
import { Settings, CreditCard, Heart, MapPin, LogOut, ChevronRight, Package, Clock } from "lucide-react-native";
import { usePurchases } from "../../src/features/products/hooks/usePurchases";

export default function ProfileScreen() {
    const { data: purchases, isLoading } = usePurchases();

    const menuItems = [
        { icon: Heart, label: "My Wishlist" },
        { icon: MapPin, label: "Shipping Address" },
        { icon: Settings, label: "Settings" },
    ];

    return (
        <View className="flex-1 bg-background">
            <SafeAreaView edges={["top"]} className="px-6 py-4">
                <Text variant="heading" className="text-3xl">My Account</Text>
            </SafeAreaView>

            <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
                <View className="items-center my-8">
                    <View className="w-24 h-24 rounded-full border-2 border-primary p-1 mb-4 shadow-xl">
                        <Image
                            source={{ uri: "https://ui-avatars.com/api/?name=Guest+User&background=C0C0C0&color=000" }}
                            className="w-full h-full rounded-full"
                            transition={500}
                        />
                    </View>
                    <Text variant="heading" className="text-2xl">Sara Mohamed</Text>
                    <Text className="text-gray-500">Premium Member Since 2024</Text>
                </View>

                {/* Quick Stats / Recent Order */}
                <View className="mb-8">
                    <Text variant="heading" className="text-xl mb-4">Recent Orders</Text>
                    {isLoading ? (
                        <ActivityIndicator color="#C0C0C0" />
                    ) : (
                        <View className="bg-surface rounded-3xl p-6 border border-gray-800">
                            {purchases && purchases.length > 0 ? (
                                <View className="flex-row items-center justify-between">
                                    <View>
                                        <Text variant="bold" className="text-white text-lg">{purchases[0].orderNumber}</Text>
                                        <View className="flex-row items-center mt-1">
                                            <Clock size={12} color="#555" />
                                            <Text className="text-gray-500 text-xs ml-1">
                                                {new Date(purchases[0].date).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="bg-primary/20 px-3 py-1 rounded-full border border-primary/30">
                                        <Text className="text-primary text-xs font-bold">{purchases[0].status}</Text>
                                    </View>
                                </View>
                            ) : (
                                <View className="items-center py-4">
                                    <Package color="#333" size={40} />
                                    <Text className="text-gray-600 mt-2">No orders yet</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                <View className="bg-surface rounded-[32px] overflow-hidden border border-gray-800">
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={item.label}
                            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                            className={`flex-row items-center justify-between p-5 ${index !== menuItems.length - 1 ? 'border-b border-gray-800' : ''}`}
                        >
                            <View className="flex-row items-center">
                                <item.icon color="#C0C0C0" size={20} />
                                <Text variant="medium" className="ml-4 text-white">{item.label}</Text>
                            </View>
                            <ChevronRight color="#333" size={20} />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)}
                    className="mt-8 bg-red-500/10 h-14 rounded-2xl flex-row items-center justify-center border border-red-500/20"
                >
                    <LogOut color="#ef4444" size={20} />
                    <Text variant="bold" className="ml-2 text-red-500">LOGOUT</Text>
                </TouchableOpacity>

                <View className="mt-12 items-center pb-10">
                    <Text variant="heading" className="text-gray-800 tracking-[8px] mb-2 font-black">EZZ SILVER</Text>
                    <Text className="text-gray-700 text-[10px] uppercase font-bold">Version 2.0.0 (Expo & NativeWind)</Text>
                </View>
            </ScrollView>
        </View>
    );
}
