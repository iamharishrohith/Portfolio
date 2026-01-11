import React from 'react';
import { TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Home } from 'lucide-react-native';

export function FloatingHome() {
    const router = useRouter();

    return (
        <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            className={`absolute right-6 z-50 bg-purple-600 p-4 rounded-full shadow-lg shadow-purple-500/30 ${Platform.OS === 'ios' ? 'bottom-10' : 'bottom-6'}`}
            activeOpacity={0.8}
        >
            <Home size={24} color="white" />
        </TouchableOpacity>
    );
}
