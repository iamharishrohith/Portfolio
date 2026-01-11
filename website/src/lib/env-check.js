const REQUIRED_ENV_VARS = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

export function validateEnv() {
    const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);

    if (missing.length > 0) {
        const error = `Missing required environment variables: ${missing.join(', ')}`;
        console.error(`[ENV VALIDATION] ${error}`);
        if (process.env.NODE_ENV === 'production') {
            // In production, we might want to throw or handle this gracefully
            // For now, just logging to help with Vercel/Self-hosted debugging
        }
        return { valid: false, missing };
    }

    return { valid: true };
}
