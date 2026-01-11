import Constants from 'expo-constants';

export const validateEnv = () => {
    const requiredEnvs = [
        'EXPO_PUBLIC_SUPABASE_URL',
        'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    ];

    const missing = requiredEnvs.filter(env => !process.env[env]);

    if (missing.length > 0) {
        const errorMsg = `[Env Failure] Missing required environment variables: ${missing.join(', ')}`;
        console.error(errorMsg);
        // In Expo, we might want to alert if in DEV but just log if in PROD
        if (__DEV__) {
            alert(errorMsg);
        }
        return false;
    }
    return true;
};
