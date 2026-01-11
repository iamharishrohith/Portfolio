import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Home } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface FloatingHomeButtonProps {
    position?: 'left' | 'right';
}

export default function FloatingHomeButton({ position = 'left' }: FloatingHomeButtonProps) {
    const router = useRouter();

    return (
        <TouchableOpacity
            style={[styles.button, position === 'right' ? styles.right : styles.left]}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.8}
        >
            <Home size={22} color="#fff" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        bottom: 30,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#7C3AED',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 100,
    },
    left: {
        left: 20,
    },
    right: {
        right: 20,
    },
});
