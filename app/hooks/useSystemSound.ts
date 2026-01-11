import { Audio } from 'expo-av';
import { useCallback, useEffect, useState } from 'react';

// You would ideally bundle these sound files in your assets or use URLs.
// For this MVP, we will try to use a simple "bleep" if available or just setup the structure.
// Since we don't have custom .mp3 files in the project yet, we will just prepare the hook
// and potentially use a default system sound or just log for now if files are missing.
// To make it "feel" real, I'll assume we might add assets later.
// For now, let's try to mock it or use a very simple setup.
// Actually, without assets, Audio.Sound.createAsync will fail.
// So we will just stub this to be ready for assets.

export function useSystemSound() {
    const [sound, setSound] = useState<Audio.Sound>();

    async function playSound(type: 'click' | 'success' | 'error' | 'dungeon_entry') {
        // In a real app, you'd map these types to require('./assets/sounds/click.mp3')
        // For now, we will just log the intention.
        console.log(`[System Sound] Playing: ${type}`);

        // Example implementation if we had files:
        // const { sound } = await Audio.Sound.createAsync(require('./assets/click.mp3'));
        // setSound(sound);
        // await sound.playAsync();
    }

    useEffect(() => {
        return sound
            ? () => {
                console.log('Unloading Sound');
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    return { playSound };
}
