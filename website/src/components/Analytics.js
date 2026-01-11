'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function Analytics() {
    const pathname = usePathname();

    useEffect(() => {
        const logView = async () => {
            try {
                // Basic visitor info
                const userAgent = window.navigator.userAgent;
                const referrer = document.referrer;

                // Estimate basic device type
                const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
                const deviceType = isMobile ? 'mobile' : 'desktop';

                await supabase.from('analytics_events').insert({
                    event_type: 'page_view',
                    page_path: pathname,
                    referrer: referrer ? referrer.substring(0, 255) : null, // Truncate if too long
                    user_agent: userAgent ? userAgent.substring(0, 255) : null,
                    device_type: deviceType,
                    // Note: country and ip_hash are typically handled server-side or via Edge Functions
                    // to protect privacy and ensure accuracy. We'll skip them for client-side logging.
                });
            } catch (error) {
                console.error('Analytics error:', error);
            }
        };

        logView();
    }, [pathname]);

    return null;
}
