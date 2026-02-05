import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
    useFonts,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import {
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, persistOptions } from "../src/core/api/queryClient";
import { ThemeProvider } from "../src/core/contexts/ThemeContext";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        "PlayfairDisplay-Regular": PlayfairDisplay_400Regular,
        "PlayfairDisplay-Bold": PlayfairDisplay_700Bold,
        "Montserrat-Regular": Montserrat_400Regular,
        "Montserrat-Medium": Montserrat_500Medium,
        "Montserrat-SemiBold": Montserrat_600SemiBold,
        "Montserrat-Bold": Montserrat_700Bold,
    });

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={persistOptions}
            onSuccess={() => {
                console.log("✅ Query Cache Restored!");
            }}
        >
            <ThemeProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <SafeAreaProvider>
                        <Stack
                            screenOptions={{
                                headerShown: false,
                                contentStyle: { backgroundColor: "#0F0F0F" },
                            }}
                        >
                            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                            <Stack.Screen name="browse" options={{ headerShown: false }} />
                            <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
                            <Stack.Screen name="gamification/spin-wheel" options={{ headerShown: false }} />
                            <Stack.Screen name="tools/ring-sizer" options={{ headerShown: false }} />
                        </Stack>
                    </SafeAreaProvider>
                </GestureHandlerRootView>
            </ThemeProvider>
        </PersistQueryClientProvider>
    );
}
