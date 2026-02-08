import { View, ScrollView, TouchableOpacity, TextInput, Switch, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../src/core/components/Text";
import { useCartStore } from "../src/core/api/cartStore";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ArrowLeft, Gift, Banknote, CreditCard, Smartphone, Building, ChevronRight, MapPin, User, Phone, Mail, FileText, Check, Truck } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Image } from "expo-image";

type PaymentMethod = "cash" | "online" | "mobile_wallet" | "bank_transfer";

interface CheckoutForm {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    country: string;
    city: string;
    region: string;
    district: string;
    addressLine1: string;
    notes: string;
}

const PAYMENT_METHODS = [
    { id: "cash" as PaymentMethod, label: "Cash on Delivery", labelAr: "الدفع عند الاستلام", icon: Banknote, description: "Pay when your order arrives" },
    { id: "online" as PaymentMethod, label: "Credit/Debit Card", labelAr: "بطاقة ائتمان", icon: CreditCard, description: "Pay securely with your card" },
    { id: "mobile_wallet" as PaymentMethod, label: "Mobile Wallet", labelAr: "محفظة إلكترونية", icon: Smartphone, description: "Vodafone Cash, Orange Money, etc." },
    { id: "bank_transfer" as PaymentMethod, label: "Bank Transfer", labelAr: "تحويل بنكي", icon: Building, description: "Direct bank transfer" },
];

const EGYPTIAN_CITIES = [
    "Cairo", "Alexandria", "Giza", "Shubra El-Kheima", "Port Said",
    "Suez", "Luxor", "Mansoura", "El-Mahalla El-Kubra", "Tanta",
    "Asyut", "Ismailia", "Fayyum", "Zagazig", "Aswan", "Damietta",
    "Damanhur", "Minya", "Beni Suef", "Qena", "Sohag", "Hurghada",
    "6th of October", "Sheikh Zayed", "New Cairo", "Maadi", "Nasr City",
    "Heliopolis", "Dokki", "Mohandessin", "Zamalek"
];

export default function CheckoutScreen() {
    const router = useRouter();
    const { items, getTotalPrice, clearCart } = useCartStore();

    const [form, setForm] = useState<CheckoutForm>({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        country: "Egypt",
        city: "",
        region: "",
        district: "",
        addressLine1: "",
        notes: "",
    });

    const [isGift, setIsGift] = useState(false);
    const [giftMessage, setGiftMessage] = useState("");
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("cash");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCityPicker, setShowCityPicker] = useState(false);

    const updateForm = (key: keyof CheckoutForm, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const validateForm = (): boolean => {
        if (!form.firstName.trim()) {
            Alert.alert("Required", "Please enter your first name");
            return false;
        }
        if (!form.lastName.trim()) {
            Alert.alert("Required", "Please enter your last name");
            return false;
        }
        if (!form.phone.trim() || form.phone.length < 10) {
            Alert.alert("Required", "Please enter a valid phone number");
            return false;
        }
        if (!form.city.trim()) {
            Alert.alert("Required", "Please select your city");
            return false;
        }
        if (!form.addressLine1.trim()) {
            Alert.alert("Required", "Please enter your address");
            return false;
        }
        return true;
    };

    const handleSubmitOrder = async () => {
        if (!validateForm()) return;

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsSubmitting(true);

        // Build order message for WhatsApp
        const paymentMethodLabel = PAYMENT_METHODS.find(m => m.id === selectedPayment)?.label || selectedPayment;

        let orderMessage = `🛍️ *New Order from EZZ Silver App*\n\n`;
        orderMessage += `👤 *Customer Details:*\n`;
        orderMessage += `Name: ${form.firstName} ${form.lastName}\n`;
        orderMessage += `Phone: ${form.phone}\n`;
        if (form.email) orderMessage += `Email: ${form.email}\n`;
        orderMessage += `\n`;

        orderMessage += `📍 *Shipping Address:*\n`;
        orderMessage += `${form.addressLine1}\n`;
        if (form.district) orderMessage += `${form.district}, `;
        if (form.region) orderMessage += `${form.region}, `;
        orderMessage += `${form.city}, Egypt\n`;
        if (form.notes) orderMessage += `Notes: ${form.notes}\n`;
        orderMessage += `\n`;

        orderMessage += `📦 *Order Items:*\n`;
        items.forEach((item, index) => {
            orderMessage += `${index + 1}. ${item.name}`;
            if (item.selectedSize) orderMessage += ` (Size: ${item.selectedSize})`;
            orderMessage += ` x${item.quantity} - ${item.price * item.quantity} EGP\n`;
        });
        orderMessage += `\n`;

        orderMessage += `💰 *Total: ${getTotalPrice()} EGP*\n`;
        orderMessage += `💳 Payment: ${paymentMethodLabel}\n`;

        if (isGift) {
            orderMessage += `\n🎁 *This is a Gift Order*\n`;
            if (giftMessage) orderMessage += `Gift Message: ${giftMessage}\n`;
        }

        orderMessage += `\n📱 Ordered via EZZ Silver Mobile App`;

        // Store's WhatsApp number (from website)
        const storeWhatsAppNumber = "201550048748"; // +20 155 004 8748

        // Encode message for URL
        const encodedMessage = encodeURIComponent(orderMessage);
        const whatsappUrl = `https://wa.me/${storeWhatsAppNumber}?text=${encodedMessage}`;

        try {
            const { Linking } = await import("react-native");
            const canOpen = await Linking.canOpenURL(whatsappUrl);

            if (canOpen) {
                await Linking.openURL(whatsappUrl);

                // Clear cart after opening WhatsApp
                setTimeout(() => {
                    clearCart();
                    setIsSubmitting(false);

                    Alert.alert(
                        "Order Sent! 🎉",
                        "Your order has been sent via WhatsApp. Our team will confirm your order shortly.",
                        [{ text: "OK", onPress: () => router.replace("/") }]
                    );
                }, 1000);
            } else {
                throw new Error("Cannot open WhatsApp");
            }
        } catch (error) {
            setIsSubmitting(false);
            Alert.alert(
                "WhatsApp not available",
                "Please install WhatsApp to place orders, or contact us at +20 155 004 8748",
                [{ text: "OK" }]
            );
        }
    };

    if (items.length === 0) {
        return (
            <View className="flex-1 bg-[#0F0F0F] justify-center items-center px-10">
                <Text variant="heading" className="text-2xl mb-2 text-center text-white">Your Cart is Empty</Text>
                <Text className="text-gray-500 text-center mb-6">Add some items to checkout</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-[#DBAC33] px-8 py-3 rounded-full"
                >
                    <Text className="text-black font-bold">Go Shopping</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#0F0F0F]">
            {/* Header */}
            <SafeAreaView edges={["top"]} className="px-5 pt-2 pb-4 border-b border-white/5">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ArrowLeft color="white" size={24} />
                    </TouchableOpacity>
                    <Text variant="heading" className="text-2xl text-white">Checkout</Text>
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 200 }}
                >
                    {/* Order Summary */}
                    <Animated.View entering={FadeInDown.delay(100)} className="px-5 py-6 border-b border-white/5">
                        <Text className="text-gray-400 text-xs uppercase tracking-widest mb-4">Order Summary</Text>
                        {items.map((item, index) => (
                            <View key={`${item.id}-${item.selectedSize}`} className="flex-row items-center mb-3">
                                <Image
                                    source={{ uri: item.images[0] }}
                                    style={{ width: 50, height: 50, borderRadius: 12 }}
                                    contentFit="cover"
                                />
                                <View className="flex-1 ml-3">
                                    <Text className="text-white text-sm" numberOfLines={1}>{item.name}</Text>
                                    <Text className="text-gray-500 text-xs">
                                        Qty: {item.quantity} {item.selectedSize ? `• Size: ${item.selectedSize}` : ""}
                                    </Text>
                                </View>
                                <Text className="text-[#DBAC33] font-bold">{item.price * item.quantity} EGP</Text>
                            </View>
                        ))}
                        <View className="flex-row justify-between mt-4 pt-4 border-t border-white/10">
                            <Text className="text-white font-bold">Total</Text>
                            <Text className="text-[#DBAC33] font-bold text-lg">{getTotalPrice()} EGP</Text>
                        </View>
                    </Animated.View>

                    {/* Contact Information */}
                    <Animated.View entering={FadeInDown.delay(200)} className="px-5 py-6 border-b border-white/5">
                        <View className="flex-row items-center mb-4">
                            <User size={18} color="#DBAC33" />
                            <Text className="text-white text-sm font-bold uppercase tracking-wider ml-2">Contact Information</Text>
                        </View>

                        <View className="flex-row gap-3 mb-4">
                            <TextInput
                                placeholder="First Name *"
                                placeholderTextColor="#666"
                                value={form.firstName}
                                onChangeText={(v) => updateForm("firstName", v)}
                                className="flex-1 bg-white/5 rounded-xl px-4 py-4 text-white border border-white/10"
                            />
                            <TextInput
                                placeholder="Last Name *"
                                placeholderTextColor="#666"
                                value={form.lastName}
                                onChangeText={(v) => updateForm("lastName", v)}
                                className="flex-1 bg-white/5 rounded-xl px-4 py-4 text-white border border-white/10"
                            />
                        </View>

                        <View className="flex-row items-center bg-white/5 rounded-xl px-4 border border-white/10 mb-4">
                            <Phone size={18} color="#666" />
                            <TextInput
                                placeholder="Phone Number *"
                                placeholderTextColor="#666"
                                value={form.phone}
                                onChangeText={(v) => updateForm("phone", v)}
                                keyboardType="phone-pad"
                                className="flex-1 py-4 ml-3 text-white"
                            />
                        </View>

                        <View className="flex-row items-center bg-white/5 rounded-xl px-4 border border-white/10">
                            <Mail size={18} color="#666" />
                            <TextInput
                                placeholder="Email (optional)"
                                placeholderTextColor="#666"
                                value={form.email}
                                onChangeText={(v) => updateForm("email", v)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                className="flex-1 py-4 ml-3 text-white"
                            />
                        </View>
                    </Animated.View>

                    {/* Shipping Address */}
                    <Animated.View entering={FadeInDown.delay(300)} className="px-5 py-6 border-b border-white/5">
                        <View className="flex-row items-center mb-4">
                            <MapPin size={18} color="#DBAC33" />
                            <Text className="text-white text-sm font-bold uppercase tracking-wider ml-2">Shipping Address</Text>
                        </View>

                        {/* Country - Fixed */}
                        <View className="bg-white/5 rounded-xl px-4 py-4 border border-white/10 mb-4 flex-row justify-between items-center">
                            <Text className="text-white">🇪🇬 Egypt</Text>
                        </View>

                        {/* City Picker */}
                        <TouchableOpacity
                            onPress={() => setShowCityPicker(!showCityPicker)}
                            className="bg-white/5 rounded-xl px-4 py-4 border border-white/10 mb-4 flex-row justify-between items-center"
                        >
                            <Text className={form.city ? "text-white" : "text-gray-500"}>
                                {form.city || "Select City *"}
                            </Text>
                            <ChevronRight size={18} color="#666" />
                        </TouchableOpacity>

                        {showCityPicker && (
                            <Animated.View entering={FadeInDown} className="bg-white/5 rounded-xl border border-white/10 mb-4 max-h-48">
                                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                                    {EGYPTIAN_CITIES.map(city => (
                                        <TouchableOpacity
                                            key={city}
                                            onPress={() => {
                                                updateForm("city", city);
                                                setShowCityPicker(false);
                                                Haptics.selectionAsync();
                                            }}
                                            className="px-4 py-3 border-b border-white/5 flex-row justify-between items-center"
                                        >
                                            <Text className="text-white">{city}</Text>
                                            {form.city === city && <Check size={16} color="#DBAC33" />}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </Animated.View>
                        )}

                        <View className="flex-row gap-3 mb-4">
                            <TextInput
                                placeholder="Region"
                                placeholderTextColor="#666"
                                value={form.region}
                                onChangeText={(v) => updateForm("region", v)}
                                className="flex-1 bg-white/5 rounded-xl px-4 py-4 text-white border border-white/10"
                            />
                            <TextInput
                                placeholder="District"
                                placeholderTextColor="#666"
                                value={form.district}
                                onChangeText={(v) => updateForm("district", v)}
                                className="flex-1 bg-white/5 rounded-xl px-4 py-4 text-white border border-white/10"
                            />
                        </View>

                        <TextInput
                            placeholder="Street Address *"
                            placeholderTextColor="#666"
                            value={form.addressLine1}
                            onChangeText={(v) => updateForm("addressLine1", v)}
                            className="bg-white/5 rounded-xl px-4 py-4 text-white border border-white/10 mb-4"
                        />

                        <View className="flex-row items-start bg-white/5 rounded-xl px-4 border border-white/10">
                            <FileText size={18} color="#666" style={{ marginTop: 16 }} />
                            <TextInput
                                placeholder="Order Notes (optional)"
                                placeholderTextColor="#666"
                                value={form.notes}
                                onChangeText={(v) => updateForm("notes", v)}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                className="flex-1 py-4 ml-3 text-white min-h-[80px]"
                            />
                        </View>
                    </Animated.View>

                    {/* Gift Option */}
                    <Animated.View entering={FadeInDown.delay(400)} className="px-5 py-6 border-b border-white/5">
                        <TouchableOpacity
                            onPress={() => {
                                setIsGift(!isGift);
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                            className="flex-row items-center justify-between"
                        >
                            <View className="flex-row items-center">
                                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isGift ? "bg-[#DBAC33]" : "bg-white/10"}`}>
                                    <Gift size={20} color={isGift ? "#000" : "#666"} />
                                </View>
                                <View>
                                    <Text className="text-white font-bold">Send as Gift 🎁</Text>
                                    <Text className="text-gray-500 text-xs">Add a personal message</Text>
                                </View>
                            </View>
                            <Switch
                                value={isGift}
                                onValueChange={setIsGift}
                                trackColor={{ false: "#333", true: "#DBAC33" }}
                                thumbColor="#fff"
                            />
                        </TouchableOpacity>

                        {isGift && (
                            <Animated.View entering={FadeInDown} className="mt-4">
                                <TextInput
                                    placeholder="Write your gift message here... 💝"
                                    placeholderTextColor="#666"
                                    value={giftMessage}
                                    onChangeText={setGiftMessage}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    className="bg-white/5 rounded-xl px-4 py-4 text-white border border-[#DBAC33]/30 min-h-[100px]"
                                />
                            </Animated.View>
                        )}
                    </Animated.View>

                    {/* Payment Methods */}
                    <Animated.View entering={FadeInDown.delay(500)} className="px-5 py-6">
                        <View className="flex-row items-center mb-4">
                            <CreditCard size={18} color="#DBAC33" />
                            <Text className="text-white text-sm font-bold uppercase tracking-wider ml-2">Payment Method</Text>
                        </View>

                        {PAYMENT_METHODS.map((method, index) => (
                            <TouchableOpacity
                                key={method.id}
                                onPress={() => {
                                    setSelectedPayment(method.id);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                                className={`flex-row items-center p-4 rounded-2xl mb-3 border-2 ${selectedPayment === method.id
                                    ? "bg-[#DBAC33]/10 border-[#DBAC33]"
                                    : "bg-white/5 border-white/10"
                                    }`}
                            >
                                <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${selectedPayment === method.id ? "bg-[#DBAC33]" : "bg-white/10"
                                    }`}>
                                    <method.icon size={22} color={selectedPayment === method.id ? "#000" : "#888"} />
                                </View>
                                <View className="flex-1">
                                    <Text className={`font-bold ${selectedPayment === method.id ? "text-[#DBAC33]" : "text-white"}`}>
                                        {method.label}
                                    </Text>
                                    <Text className="text-gray-500 text-xs">{method.description}</Text>
                                </View>
                                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selectedPayment === method.id ? "border-[#DBAC33] bg-[#DBAC33]" : "border-white/30"
                                    }`}>
                                    {selectedPayment === method.id && <Check size={14} color="#000" />}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </Animated.View>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Action Bar */}
            <BlurView intensity={80} tint="dark" className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4 border-t border-white/5">
                <View className="flex-row justify-between items-center mb-4">
                    <View>
                        <Text className="text-gray-400 text-xs">Total Amount</Text>
                        <Text className="text-[#DBAC33] text-2xl font-bold">{getTotalPrice()} EGP</Text>
                    </View>
                    <View className="flex-row items-center bg-white/5 px-3 py-1.5 rounded-full">
                        <Truck size={14} color="#22c55e" />
                        <Text className="text-green-500 text-xs font-bold ml-1">Free Shipping</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleSubmitOrder}
                    disabled={isSubmitting}
                    className={`h-14 rounded-2xl flex-row items-center justify-center ${isSubmitting ? "bg-gray-600" : "bg-[#DBAC33]"
                        }`}
                    style={{
                        shadowColor: "#DBAC33",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8,
                    }}
                >
                    {isSubmitting ? (
                        <Text className="text-white font-bold">Processing...</Text>
                    ) : (
                        <>
                            <Text className="text-black font-bold text-lg mr-2">PLACE ORDER</Text>
                            <ChevronRight size={20} color="#000" />
                        </>
                    )}
                </TouchableOpacity>
            </BlurView>
        </View>
    );
}
