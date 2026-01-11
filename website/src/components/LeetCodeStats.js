'use client'

import { useState, useEffect } from 'react'
import { Code2, Trophy, Target, Zap, ExternalLink, Activity, Terminal } from 'lucide-react'

export default function LeetCodeStats({ username = 'iamharishrohith' }) {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchLeetCodeStats() {
            try {
                setLoading(true)
                const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`)
                if (!res.ok) throw new Error('Failed to fetch LeetCode data')
                const data = await res.json()

                if (data.status === 'error') throw new Error(data.message)

                setStats(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchLeetCodeStats()
    }, [username])

    if (loading) {
        return (
            <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-4" />
                <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    if (error || !stats) {
        return null
    }

    const statItems = [
        { label: 'Total Solved', value: stats.totalSolved, icon: Code2, color: 'text-blue-500 dark:text-blue-400' },
        { label: 'Ranking', value: stats.ranking, icon: Trophy, color: 'text-amber-500 dark:text-amber-400' },
        { label: 'Acceptance', value: `${stats.acceptanceRate}%`, icon: Target, color: 'text-green-500 dark:text-green-400' },
        { label: 'Hard Solved', value: stats.hardSolved, icon: Zap, color: 'text-red-500 dark:text-red-400' },
    ]

    return (
        <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm dark:shadow-none h-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                        <Terminal size={20} className="text-amber-600 dark:text-amber-500" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">LeetCode Status</p>
                        <p className="text-slate-900 dark:text-white font-bold">@{username}</p>
                    </div>
                </div>
                <a
                    href={`https://leetcode.com/${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    <ExternalLink size={16} />
                </a>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                {statItems.map(item => (
                    <div
                        key={item.label}
                        className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl p-4 hover:border-amber-500/30 transition-colors"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <item.icon size={14} className={item.color} />
                            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                {item.label}
                            </span>
                        </div>
                        <p className="text-xl font-black text-slate-900 dark:text-white truncate">
                            {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Difficulty Bars */}
            <div className="space-y-3 pt-2">
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <span>Easy</span>
                        <span className="text-green-500">{stats.easySolved} / {stats.totalEasy}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${(stats.easySolved / stats.totalEasy) * 100}%` }}
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <span>Medium</span>
                        <span className="text-amber-500">{stats.mediumSolved} / {stats.totalMedium}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${(stats.mediumSolved / stats.totalMedium) * 100}%` }}
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <span>Hard</span>
                        <span className="text-red-500">{stats.hardSolved} / {stats.totalHard}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${(stats.hardSolved / stats.totalHard) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
