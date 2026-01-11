"use client"

import { useState, useEffect } from "react"
import { safeStorage } from '../lib/safe-storage'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = "monarch_system_visitor_state"

const INITIAL_STATE = {
    level: 1, // Global (Supabase)
    xp: 0,    // Global (Supabase)
    awakened: false, // Local (Visitor)
}

export function useGameState(initialProfileData) {
    const [gameState, setGameState] = useState({
        level: initialProfileData?.level || 1,
        xp: initialProfileData?.xp || 0,
        awakened: false,
    })
    const [isLoaded, setIsLoaded] = useState(false)

    const setAwakened = (val) => {
        setGameState(prev => ({ ...prev, awakened: val }))
    }

    // import { safeStorage } from '../lib/safe-storage' // This line was moved to the top

    // ... (existing imports might need adjustment based on file content, but I'll trust the tool to match context)

    // 1. Load Local Visitor State (Awakened status)
    useEffect(() => {
        try {
            const saved = safeStorage.getItem(STORAGE_KEY)
            if (saved) {
                const parsed = JSON.parse(saved)
                setGameState(prev => ({ ...prev, awakened: parsed.awakened }))
            }
        } catch (error) {
            console.error("System Error: Failed to load local state", error)
        } finally {
            setIsLoaded(true)
        }
    }, [])

    // 2. Load Global Stats from Supabase (Level, XP)
    useEffect(() => {
        const fetchGlobalStats = async () => {
            try {
                // Fetch the main profile (assuming single user for now or first user)
                const { data, error } = await supabase
                    .from('profiles')
                    .select('level, xp')
                    .limit(1)
                    .single()

                if (data) {
                    setGameState(prev => ({
                        ...prev,
                        level: data.level || 1,
                        xp: data.xp || 0
                    }))
                }
            } catch (err) {
                console.error("Supabase Connection Error:", err)
            }
        }

        fetchGlobalStats()

        // Real-time Subscription
        const channel = supabase
            .channel('public:profiles')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
                const newData = payload.new
                if (newData) {
                    setGameState(prev => ({
                        ...prev,
                        level: newData.level || prev.level,
                        xp: newData.xp || prev.xp
                    }))
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    // 3. Persist Local State Only (Awakened)
    useEffect(() => {
        // Persist awakened status
        if (!isLoaded) return // Keep the original check for isLoaded
        // The instruction provided a new condition `if (newLevel >= 1)` and variable `newAwakened`.
        // To maintain syntactical correctness and avoid introducing undeclared variables,
        // I will apply the `safeStorage.setItem` change directly to the existing logic,
        // using `gameState.awakened` as it was originally.
        // If `newLevel` and `newAwakened` are intended, they must be defined elsewhere.
        try {
            safeStorage.setItem(STORAGE_KEY, JSON.stringify({
                awakened: gameState.awakened, // Using gameState.awakened as per original logic
                // We don't save level/xp locally to avoid cheating, only awakened status
                // But for valid "visitor" persistence we might want to saving a generated ID
            }))
        } catch (error) {
            console.error("System Error: Failed to save local state", error)
        }
    }, [gameState.awakened, isLoaded])

    const addXp = (amount) => {
        let leveledUp = false;
        setGameState(prev => {
            let newXp = prev.xp + amount;
            let newLevel = prev.level;

            // Tiered XP formula (Client-side mirrors xpCalculator.ts)
            // 1-10: 100, 11-20: 200, etc.
            const getXpNeeded = (lvl) => {
                const tier = Math.floor((lvl - 1) / 10) + 1;
                return tier * 100;
            };

            const xpNeeded = getXpNeeded(newLevel);

            if (newXp >= xpNeeded) {
                newXp = newXp - xpNeeded;
                newLevel += 1;
                leveledUp = true;
            }

            return {
                ...prev,
                level: newLevel,
                xp: newXp
            };
        });
        return { leveledUp };
    };

    return {
        level: gameState.level,
        xp: gameState.xp,
        awakened: gameState.awakened,
        isLoaded,
        setAwakened,
        addXp
    }
}
