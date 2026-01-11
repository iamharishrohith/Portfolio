/**
 * Universal polyfill for localStorage to prevent SSR crashes.
 * Included at the top of entry points to ensure global availability.
 */
const noopStorage = {
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { },
    clear: () => { },
    key: () => null,
    length: 0
};

if (typeof global !== 'undefined') {
    try {
        if (!global.localStorage || typeof global.localStorage.getItem !== 'function') {
            Object.defineProperty(global, 'localStorage', {
                value: noopStorage,
                writable: true,
                configurable: true
            });
        }
    } catch (e) {
        // Already defined
    }
}

if (typeof window !== 'undefined') {
    try {
        if (!window.localStorage || typeof window.localStorage.getItem !== 'function') {
            Object.defineProperty(window, 'localStorage', {
                value: noopStorage,
                writable: true,
                configurable: true
            });
        }
    } catch (e) {
        // Already defined
    }
}
