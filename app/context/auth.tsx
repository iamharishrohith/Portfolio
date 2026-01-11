import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';

const MASTER_PIN = "270504";

type AuthContextType = {
    isAuthenticated: boolean;
    unlock: (pin: string) => boolean;
    lock: () => void;
    authenticateWithBiometrics: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    unlock: () => false,
    lock: () => { },
    authenticateWithBiometrics: async () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const segments = useSegments();
    const router = useRouter();

    // REMOVED: Check biometrics on mount (moved to pin.tsx to avoid nav race condition)
    // useEffect(() => {
    //     authenticateWithBiometrics();
    // }, []);

    const authenticateWithBiometrics = async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (hasHardware && isEnrolled) {
                const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: 'Authenticate to access Monarch System',
                    fallbackLabel: 'Use PIN',
                });

                if (result.success) {
                    setIsAuthenticated(true);
                    router.replace('/(tabs)');
                }
            }
        } catch (error) {
            console.log("Biometric Auth Failed", error);
        }
    };

    const unlock = (pin: string) => {
        if (pin === MASTER_PIN) {
            setIsAuthenticated(true);
            router.replace('/(tabs)');
            return true;
        }
        return false;
    };

    const lock = () => {
        setIsAuthenticated(false);
        router.replace('/pin');
    };

    useEffect(() => {
        const inAuthGroup = segments[0] === '(tabs)';

        if (!isAuthenticated && inAuthGroup) {
            // Give a small delay to allow biometrics to run first
            // But if we are clearly not authenticated, redirect.
            // Actually, let's strictly redirect if not auth, creating a loop if we are not careful
            // The biometrics check runs on mount, so it might race. 
            // Ideally pin screen handles the biometric trigger.
            // For now, simple redirect.
            router.replace('/pin');
        } else if (isAuthenticated && segments[0] === 'pin') {
            router.replace('/(tabs)');
        }
    }, [isAuthenticated, segments]);

    return (
        <AuthContext.Provider value={{ isAuthenticated, unlock, lock, authenticateWithBiometrics }}>
            {children}
        </AuthContext.Provider>
    );
}
