import { View, ScrollView, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../src/core/components/Text";
import { useCartStore } from "../../src/core/api/cartStore";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function CartScreen() {
    const router = useRouter();
    const { items, updateQuantity, removeFromCart, getTotalPrice } = useCartStore();

    if (items.length === 0) {
        return (
            <View className="flex-1 bg-background justify-center items-center px-10">
                <View className="w-20 h-20 bg-surface rounded-full items-center justify-center mb-6">
                    <ShoppingBag color="#555" size={40} />
                </View>
                <Text variant="heading" className="text-2xl mb-2 text-center">Your Cart is Empty</Text>
                <Text className="text-gray-500 text-center">Explore our luxury collection and find something beautiful.</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background">
            <SafeAreaView edges={["top"]} className="px-6 py-4">
                <Text variant="heading" className="text-3xl">My Cart</Text>
            </SafeAreaView>

            <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
                {items.map((item) => (
                    <View key={`${item.id}-${item.selectedSize}`} className="flex-row bg-surface rounded-3xl p-4 mb-4">
                        <Image
                            source={{ uri: item.images[0] }}
                            className="w-24 h-24 rounded-2xl bg-gray-800"
                            resizeMode="cover"
                        />
                        <View className="flex-1 ml-4 justify-between">
                            <View>
                                <View className="flex-row justify-between items-start">
                                    <Text variant="bold" className="text-white text-lg flex-1" numberOfLines={1}>
                                        {item.name}
                                    </Text>
                                    <TouchableOpacity onPress={() => removeFromCart(item.id, item.selectedSize)}>
                                        <Trash2 size={18} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                                <Text className="text-primary text-sm">
                                    {item.material} {item.selectedSize ? `• Size ${item.selectedSize}` : ""}
                                </Text>
                            </View>

                            <View className="flex-row justify-between items-end">
                                <Text variant="bold" className="text-xl">
                                    {item.price * item.quantity} <Text className="text-xs text-primary">{item.currency}</Text>
                                </Text>

                                <View className="flex-row bg-black/40 rounded-xl p-1 border border-gray-800">
                                    <TouchableOpacity
                                        onPress={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)}
                                        className="w-8 h-8 items-center justify-center"
                                    >
                                        <Minus size={16} color="white" />
                                    </TouchableOpacity>
                                    <View className="w-8 items-center justify-center">
                                        <Text variant="bold" className="text-white">{item.quantity}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                                        className="w-8 h-8 items-center justify-center"
                                    >
                                        <Plus size={16} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                ))}

                {/* Summary */}
                <View className="bg-surface rounded-3xl p-6 mb-10 mt-4 border border-gray-800">
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-400">Subtotal</Text>
                        <Text className="text-white font-bold">{getTotalPrice()} EGP</Text>
                    </View>
                    <View className="flex-row justify-between mb-4">
                        <Text className="text-gray-400">Shipping</Text>
                        <Text className="text-primary font-bold">Free</Text>
                    </View>
                    <View className="h-[1px] bg-gray-800 mb-4" />
                    <View className="flex-row justify-between mb-8">
                        <Text variant="heading" className="text-xl">Total</Text>
                        <Text variant="heading" className="text-xl text-primary">{getTotalPrice()} EGP</Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push("/checkout")}
                        className="bg-primary h-14 rounded-2xl flex-row items-center justify-center"
                    >
                        <Text variant="bold" className="text-black text-lg mr-2">CHECKOUT</Text>
                        <ArrowRight size={20} color="black" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

// Helper to fix missing icon import in this specific slide context if needed
import { ShoppingBag } from "lucide-react-native";
