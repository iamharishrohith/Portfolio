'use client'
import Link from 'next/link'
import { Ghost, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
            <div className="max-w-lg w-full text-center space-y-8">
                {/* 404 Icon */}
                <div className="relative mx-auto w-40 h-40">
                    <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="relative w-full h-full rounded-full border-4 border-purple-500/30 flex items-center justify-center bg-slate-900/80">
                        <Ghost size={72} className="text-purple-400 animate-bounce" />
                    </div>
                </div>

                {/* Error Code */}
                <div className="space-y-2">
                    <p className="text-purple-400 font-bold uppercase tracking-[0.3em] text-xs">
                        Error Code: 404
                    </p>
                    <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tight">
                        <span className="text-purple-500">SHADOW</span> REALM
                    </h1>
                    <p className="text-slate-400 text-sm max-w-md mx-auto mt-4">
                        The page you're looking for has been consumed by the shadows.
                        It may have been moved, deleted, or never existed in this dimension.
                    </p>
                </div>

                {/* Stats */}
                <div className="flex justify-center gap-8 text-center">
                    <div>
                        <p className="text-3xl font-black text-white">404</p>
                        <p className="text-slate-600 text-xs uppercase tracking-wider">Error</p>
                    </div>
                    <div className="w-px bg-slate-800" />
                    <div>
                        <p className="text-3xl font-black text-purple-400">0</p>
                        <p className="text-slate-600 text-xs uppercase tracking-wider">Results</p>
                    </div>
                    <div className="w-px bg-slate-800" />
                    <div>
                        <p className="text-3xl font-black text-slate-500">∞</p>
                        <p className="text-slate-600 text-xs uppercase tracking-wider">Shadows</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-purple-600/20 hover:shadow-purple-500/30"
                    >
                        <Home size={18} />
                        Return Home
                    </Link>
                    <button
                        onClick={() => typeof window !== 'undefined' && window.history.back()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all duration-300 border border-slate-700"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                </div>

                {/* System Status */}
                <div className="flex items-center justify-center gap-2 text-slate-600 text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    MONARCH SYSTEM: ACTIVE
                </div>
            </div>
        </div>
    )
}
