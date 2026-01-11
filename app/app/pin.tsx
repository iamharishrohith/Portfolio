import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/auth';
import { Stack } from 'expo-router';
import { useToast } from '@/context/ToastContext';
import { Delete, Lock, ScanFace, Shield, Zap, Crown } from 'lucide-react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSpring,
    withSequence,
    Easing,
    FadeIn,
    FadeInDown,
    FadeInUp,
    FadeOut
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export default function PinScreen() {
    const [pin, setPin] = useState('');
    const [splashPhase, setSplashPhase] = useState(0); // 0: logo, 1: text, 2: done
    const [isInitializing, setIsInitializing] = useState(true);
    const { unlock, authenticateWithBiometrics } = useAuth();
    const { showToast } = useToast();

    // Animated values for splash
    const logoScale = useSharedValue(0);
    const logoOpacity = useSharedValue(0);
    const glowOpacity = useSharedValue(0);
    const textOpacity = useSharedValue(0);
    const progressWidth = useSharedValue(0);

    useEffect(() => {
        // Premium splash animation sequence
        // Phase 1: Logo appears with scale
        logoScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 100 }));
        logoOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));

        // Phase 2: Glow pulse
        glowOpacity.value = withDelay(600, withSequence(
            withTiming(1, { duration: 300 }),
            withTiming(0.3, { duration: 500 }),
            withTiming(0.8, { duration: 300 })
        ));

        // Phase 3: Text fades in
        setTimeout(() => setSplashPhase(1), 800);
        textOpacity.value = withDelay(1000, withTiming(1, { duration: 600 }));

        // Phase 4: Progress bar
        progressWidth.value = withDelay(1200, withTiming(100, { duration: 1500, easing: Easing.out(Easing.cubic) }));

        // Phase 5: Complete
        const finalTimeout = setTimeout(() => {
            setIsInitializing(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            // Trigger biometrics after splash setup
            authenticateWithBiometrics();
        }, 3000);

        return () => clearTimeout(finalTimeout);
    }, []);

    const logoAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: logoScale.value }],
        opacity: logoOpacity.value,
    }));

    const glowAnimatedStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const textAnimatedStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
    }));

    const progressAnimatedStyle = useAnimatedStyle(() => ({
        width: `${progressWidth.value}%`,
    }));

    const handlePress = (num: string) => {
        if (pin.length < 6) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const newPin = pin + num;
            setPin(newPin);

            if (newPin.length === 6) {
                setTimeout(() => {
                    const success = unlock(newPin);
                    if (!success) {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                        showToast("Access Denied: Invalid Security Token", 'error');
                        setPin('');
                    }
                }, 100);
            }
        }
    };

    const handleDelete = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setPin(prev => prev.slice(0, -1));
    };

    const handleBiometric = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await authenticateWithBiometrics();
    };

    // Premium Splash Screen
    if (isInitializing) {
        return (
            <View className="flex-1 bg-black">
                <Stack.Screen options={{ headerShown: false }} />
                <StatusBar barStyle="light-content" />

                {/* Background gradient */}
                <LinearGradient
                    colors={['#000000', '#0f0a1e', '#1a0a2e', '#0f0a1e', '#000000']}
                    className="absolute inset-0"
                />

                {/* Animated glow effect */}
                <Animated.View
                    style={[glowAnimatedStyle]}
                    className="absolute inset-0 items-center justify-center"
                >
                    <View className="w-64 h-64 rounded-full bg-purple-600/20 blur-3xl" />
                </Animated.View>

                <View className="flex-1 justify-center items-center px-8">
                    {/* Animated Logo */}
                    <Animated.View style={[logoAnimatedStyle]} className="items-center mb-8">
                        <View className="relative">
                            {/* Outer ring */}
                            <View className="w-32 h-32 rounded-full border-2 border-purple-500/30 items-center justify-center">
                                {/* Inner ring */}
                                <View className="w-24 h-24 rounded-full border border-purple-500/50 items-center justify-center">
                                    {/* Core */}
                                    <LinearGradient
                                        colors={['#7C3AED', '#A855F7', '#7C3AED']}
                                        className="w-16 h-16 rounded-full items-center justify-center"
                                    >
                                        <Crown size={32} color="#ffffff" />
                                    </LinearGradient>
                                </View>
                            </View>
                            {/* Corner accents */}
                            <View className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-purple-500" />
                            <View className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-purple-500" />
                            <View className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-purple-500" />
                            <View className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-purple-500" />
                        </View>
                    </Animated.View>

                    {/* Brand Text */}
                    <Animated.View style={[textAnimatedStyle]} className="items-center">
                        <Text className="text-purple-400/60 font-mono text-[10px] tracking-[0.5em] uppercase mb-2">
                            SYSTEM // V5.0
                        </Text>
                        <Text className="text-white text-4xl font-black italic tracking-tight">
                            MONARCH <Text className="text-purple-500">OS</Text>
                        </Text>
                        <Text className="text-slate-500 font-medium text-xs mt-2 tracking-widest uppercase">
                            Shadow Monarch Protocol
                        </Text>
                    </Animated.View>

                    {/* Boot sequence text */}
                    <Animated.View style={[textAnimatedStyle]} className="mt-12 items-center">
                        <View className="flex-row items-center mb-4">
                            <Zap size={14} color="#A855F7" />
                            <Text className="text-purple-400 font-mono text-xs ml-2 tracking-widest">
                                INITIALIZING SYSTEM
                            </Text>
                        </View>

                        {/* Progress bar */}
                        <View className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <Animated.View
                                style={[progressAnimatedStyle]}
                                className="h-full bg-purple-600 rounded-full"
                            />
                        </View>

                        {/* Boot messages */}
                        <Text className="text-slate-600 font-mono text-[9px] mt-4 tracking-wider">
                            {splashPhase === 0 ? 'BOOT_SEQUENCE_INIT...' : 'LOADING_PROTOCOLS...'}
                        </Text>
                    </Animated.View>
                </View>

                {/* Version footer */}
                <Animated.View
                    style={[textAnimatedStyle]}
                    className="absolute bottom-8 left-0 right-0 items-center"
                >
                    <Text className="text-slate-700 font-mono text-[9px] tracking-widest">
                        © 2026 HARISH ROHITH • ALL RIGHTS RESERVED
                    </Text>
                </Animated.View>
            </View>
        );
    }

    // Auth Screen
    return (
        <SafeAreaView className="flex-1 bg-slate-950">
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />

            {/* Header Container */}
            <Animated.View
                entering={FadeInDown.duration(600).delay(100)}
                className="h-[35%] justify-center items-center px-6 z-10"
            >
                <View className="flex-row items-center mb-4">
                    <Shield size={16} color="#A855F7" />
                    <Text className="text-purple-500 font-bold tracking-[0.3em] uppercase ml-2 text-[10px]">
                        System Security // V5.0
                    </Text>
                </View>
                <Text className="text-white text-4xl font-black italic mb-2 text-center">
                    MONARCH <Text className="text-purple-600">OS</Text>
                </Text>
                <View className="bg-purple-900/30 px-4 py-1.5 rounded-full border border-purple-500/30">
                    <Text className="text-purple-300 font-mono text-[10px] uppercase tracking-widest">
                        Identity Verification Required
                    </Text>
                </View>

                {/* PIN Indicators */}
                <View className="flex-row space-x-4 mt-10 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Animated.View
                            key={i}
                            entering={FadeInUp.delay(i * 50).duration(300)}
                            className={`w-4 h-4 rounded-full border-2 ${i < pin.length
                                ? 'bg-purple-500 border-purple-500'
                                : 'bg-transparent border-slate-700'
                                }`}
                        />
                    ))}
                </View>
            </Animated.View>

            {/* Keypad Container */}
            <Animated.View
                entering={FadeInUp.duration(500).delay(200)}
                className="flex-1 justify-end pb-12 px-8 z-20"
            >
                <View className="flex-row flex-wrap justify-between">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <TouchableOpacity
                            key={num}
                            onPress={() => handlePress(num.toString())}
                            className="w-[30%] aspect-square justify-center items-center mb-4"
                            activeOpacity={0.7}
                        >
                            <View className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 justify-center items-center shadow-lg shadow-purple-900/10">
                                <Text className="text-white text-3xl font-bold font-mono">{num}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        onPress={handleBiometric}
                        className="w-[30%] aspect-square justify-center items-center mb-4"
                        activeOpacity={0.7}
                    >
                        <View className="w-20 h-20 rounded-full bg-purple-900/20 border border-purple-500/30 justify-center items-center">
                            <ScanFace size={28} color="#A855F7" />
                            <Text className="text-purple-400 text-[8px] font-bold mt-1 tracking-widest">BIOMETRIC</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handlePress('0')}
                        className="w-[30%] aspect-square justify-center items-center mb-4"
                        activeOpacity={0.7}
                    >
                        <View className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 justify-center items-center shadow-lg shadow-purple-900/10">
                            <Text className="text-white text-3xl font-bold font-mono">0</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleDelete}
                        className="w-[30%] aspect-square justify-center items-center mb-4"
                        activeOpacity={0.7}
                    >
                        <View className="w-20 h-20 rounded-full justify-center items-center">
                            <Delete size={28} color="#ef4444" />
                        </View>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
}
