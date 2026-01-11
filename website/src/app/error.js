'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error)
    }, [error])

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl max-w-lg w-full backdrop-blur-sm">
                <AlertTriangle size={48} className="text-red-500 mx-auto mb-6" />

                <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-4 text-red-400">
                    System Malfunction
                </h2>

                <div className="bg-black/50 p-4 rounded-lg mb-6 text-left overflow-auto max-h-48 border border-white/5">
                    <code className="text-xs text-red-300 font-mono break-all">
                        {error.message || "Unknown System Error"}
                        {error.digest && <div className="mt-2 text-slate-500">Digest: {error.digest}</div>}
                    </code>
                </div>

                <button
                    onClick={
                        // Attempt to recover by trying to re-render the segment
                        () => reset()
                    }
                    className="flex items-center justify-center gap-2 w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase rounded-xl transition-all"
                >
                    <RefreshCw size={18} />
                    Reboot System
                </button>
            </div>
        </div>
    )
}
