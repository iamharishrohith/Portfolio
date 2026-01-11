import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
    FadeInUp,
    FadeOutUp
} from 'react-native-reanimated';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onHide: () => void;
    visible: boolean;
}

const { width } = Dimensions.get('window');

export const Toast = ({ message, type, onHide, visible }: ToastProps) => {
    const translateY = useSharedValue(-100);

    useEffect(() => {
        if (visible) {
            translateY.value = withSpring(0, { damping: 15 });
            const timer = setTimeout(() => {
                hide();
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            translateY.value = withTiming(-100, { duration: 300 });
        }
    }, [visible]);

    const hide = () => {
        translateY.value = withTiming(-150, { duration: 300 }, (finished) => {
            if (finished) runOnJS(onHide)();
        });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle size={24} color="#10B981" />;
            case 'error': return <AlertCircle size={24} color="#EF4444" />;
            default: return <Info size={24} color="#3B82F6" />;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success': return 'border-emerald-500/50 bg-emerald-500/10 shadow-emerald-500/20';
            case 'error': return 'border-red-500/50 bg-red-500/10 shadow-red-500/20';
            default: return 'border-blue-500/50 bg-blue-500/10 shadow-blue-500/20';
        }
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={[animatedStyle]}
            className="absolute top-12 left-4 right-4 z-50 pointer-events-none"
        >
            <BlurView intensity={20} tint="dark" className="overflow-hidden rounded-2xl">
                <View className={`flex-row items-center p-4 rounded-2xl border ${getColors()} backdrop-blur-md shadow-lg`}>
                    {getIcon()}
                    <View className="flex-1 ml-3">
                        <Text className="text-white font-bold text-base capitalize">{type}</Text>
                        <Text className="text-slate-300 text-xs leading-4">{message}</Text>
                    </View>
                    <TouchableOpacity onPress={hide} className="p-1">
                        <X size={18} color="#64748b" />
                    </TouchableOpacity>
                </View>
            </BlurView>
        </Animated.View>
    );
};
