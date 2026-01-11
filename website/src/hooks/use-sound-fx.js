"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { safeStorage } from '../lib/safe-storage'

// Sound configuration - files should be in /public/sounds/
const SOUNDS = {
    hover: "/sounds/hover.mp3",
    click: "/sounds/click.wav",
    levelUp: "/sounds/level-ip.mp3",
    boot: "/sounds/boot_sequence_loading.wav",
    bgm: "/sounds/bgm.mp3"
}

// Custom hook that handles missing sound files gracefully
function useSafeSound(url, options = {}) {
    const audioRef = useRef(null)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        if (typeof window === 'undefined') return

        const audio = new Audio()
        audio.volume = options.volume || 0.5
        audio.loop = options.loop || false

        audio.addEventListener('canplaythrough', () => {
            setIsLoaded(true)
        })

        audio.addEventListener('error', () => {
            console.log(`Sound file not found: ${url}`)
            setIsLoaded(false)
        })

        audio.src = url
        audioRef.current = audio

        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }
        }
    }, [url, options.volume, options.loop])

    const play = useCallback(() => {
        if (isLoaded && audioRef.current) {
            try {
                // Ensure audio context is running (resumes if browser suspended it)
                const playPromise = audioRef.current.play()
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log("Audio playback delayed until user interaction.")
                    })
                }
            } catch (e) { }
        }
    }, [isLoaded])

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause()
            if (!options.loop) audioRef.current.currentTime = 0
        }
    }, [options.loop])

    return [play, stop]
}

export function useSoundFx() {
    const [isMuted, setIsMuted] = useState(false)
    const [isMusicMuted, setIsMusicMuted] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const savedMute = safeStorage.getItem("monarch_system_muted")
        const savedMusicMute = safeStorage.getItem("monarch_system_music_muted")

        if (savedMute !== null) setIsMuted(JSON.parse(savedMute))
        if (savedMusicMute !== null) setIsMusicMuted(JSON.parse(savedMusicMute))
    }, [])

    const toggleMute = () => {
        setIsMuted(prev => {
            const newState = !prev
            safeStorage.setItem("monarch_system_muted", JSON.stringify(newState))
            return newState
        })
    }

    const toggleMusic = () => {
        setIsMusicMuted(prev => {
            const newState = !prev
            safeStorage.setItem("monarch_system_music_muted", JSON.stringify(newState))
            return newState
        })
    }

    // Sound hooks
    const [playHoverSound] = useSafeSound(SOUNDS.hover, { volume: 0.25 })
    const [playClickSound] = useSafeSound(SOUNDS.click, { volume: 0.5 })
    const [playLevelUpSound] = useSafeSound(SOUNDS.levelUp, { volume: 0.6 })
    const [playBootSound, stopBootSound] = useSafeSound(SOUNDS.boot, { volume: 0.4, loop: true })
    const [playBgmSound, stopBgmSound] = useSafeSound(SOUNDS.bgm, { volume: 0.3, loop: true })

    const playHover = useCallback(() => {
        if (mounted && !isMuted) playHoverSound()
    }, [mounted, isMuted, playHoverSound])

    const playClick = useCallback(() => {
        if (mounted && !isMuted) playClickSound()
    }, [mounted, isMuted, playClickSound])

    const playLevelUp = useCallback(() => {
        if (mounted && !isMuted) playLevelUpSound()
    }, [mounted, isMuted, playLevelUpSound])

    const playBoot = useCallback(() => {
        if (mounted && !isMuted) playBootSound()
    }, [mounted, isMuted, playBootSound])

    const stopBoot = useCallback(() => {
        if (mounted) stopBootSound()
    }, [mounted, stopBootSound])

    const playBgm = useCallback(() => {
        if (mounted && !isMusicMuted) playBgmSound()
    }, [mounted, isMusicMuted, playBgmSound])

    const stopBgm = useCallback(() => {
        if (mounted) stopBgmSound()
    }, [mounted, stopBgmSound])

    // Auto-play/stop BGM based on mute state
    useEffect(() => {
        if (mounted) {
            if (!isMusicMuted) {
                playBgmSound()
            } else {
                stopBgmSound()
            }
        }
    }, [mounted, isMusicMuted, playBgmSound, stopBgmSound])

    return {
        playHover,
        playClick,
        playLevelUp,
        playBoot,
        stopBoot,
        playBgm,
        stopBgm,
        isMuted,
        isMusicMuted,
        toggleMute,
        toggleMusic
    }
}
