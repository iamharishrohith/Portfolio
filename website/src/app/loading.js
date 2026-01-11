import { Loader2 } from 'lucide-react'

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            <div className="relative">
                <div className="absolute inset-0 blur-xl bg-purple-500/20 animate-pulse rounded-full"></div>
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin relative z-10" />
            </div>
            <h2 className="mt-8 text-xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 animate-pulse">
                SYNCING DATA...
            </h2>
            <p className="text-gray-500 mt-2 font-mono text-xs uppercase tracking-tighter">
                Establishing uplink to system database
            </p>
        </div>
    )
}
