import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface SystemBackgroundProps {
    children: React.ReactNode;
    intensity?: number;
}

export const SystemBackground: React.FC<SystemBackgroundProps> = ({ children, intensity = 0 }) => {
    return (
        <View style={styles.container}>
            <LinearGradient
                // Dark "Solo Leveling" System Palette
                // Deep Blue/Black -> Purple Glow -> Dark Slate
                colors={['#020617', '#0f172a', '#1e1b4b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.background}
            />

            {/* Ambient Purple Glow */}
            <LinearGradient
                colors={['transparent', 'rgba(124, 58, 237, 0.05)', 'transparent']}
                style={[styles.background, { opacity: 0.6 }]}
                start={{ x: 0.3, y: 0 }}
                end={{ x: 0.8, y: 0.8 }}
            />

            {intensity > 0 ? (
                <BlurView intensity={intensity} tint="dark" style={styles.container}>
                    {children}
                </BlurView>
            ) : (
                <View style={styles.container}>{children}</View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
});
