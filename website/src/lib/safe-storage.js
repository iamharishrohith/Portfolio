
const isClient = typeof window !== 'undefined'

export const safeStorage = {
    getItem: (key) => {
        if (!isClient) return null
        try {
            return window.localStorage.getItem(key)
        } catch (e) {
            return null
        }
    },
    setItem: (key, value) => {
        if (!isClient) return
        try {
            window.localStorage.setItem(key, value)
        } catch (e) {
            // No-op
        }
    },
    removeItem: (key) => {
        if (!isClient) return
        try {
            window.localStorage.removeItem(key)
        } catch (e) {
            // No-op
        }
    }
}
