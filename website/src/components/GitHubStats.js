'use client'

import { useState, useEffect } from 'react'
import { Github, Star, GitFork, Users, Code2, Activity, ExternalLink } from 'lucide-react'

export default function GitHubStats({ username = 'harishrohith' }) {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchGitHubStats() {
            try {
                setLoading(true)

                // Fetch user data
                const userRes = await fetch(`https://api.github.com/users/${username}`)
                if (!userRes.ok) throw new Error('Failed to fetch GitHub data')
                const userData = await userRes.json()

                // Fetch repos to calculate total stars
                const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=stars`)
                const reposData = await reposRes.json()

                const totalStars = reposData.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0)
                const totalForks = reposData.reduce((acc, repo) => acc + (repo.forks_count || 0), 0)

                // Get top languages
                const languages = {}
                reposData.forEach(repo => {
                    if (repo.language) {
                        languages[repo.language] = (languages[repo.language] || 0) + 1
                    }
                })
                const topLanguages = Object.entries(languages)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([lang]) => lang)

                setStats({
                    publicRepos: userData.public_repos,
                    followers: userData.followers,
                    following: userData.following,
                    totalStars,
                    totalForks,
                    topLanguages,
                    avatarUrl: userData.avatar_url,
                    profileUrl: userData.html_url,
                    bio: userData.bio,
                })
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchGitHubStats()
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
        return null // Silently fail - don't break the page
    }

    const statItems = [
        { label: 'Repositories', value: stats.publicRepos, icon: Code2, color: 'text-blue-500 dark:text-blue-400' },
        { label: 'Total Stars', value: stats.totalStars, icon: Star, color: 'text-amber-500 dark:text-amber-400' },
        { label: 'Followers', value: stats.followers, icon: Users, color: 'text-purple-500 dark:text-purple-400' },
        { label: 'Total Forks', value: stats.totalForks, icon: GitFork, color: 'text-green-500 dark:text-green-400' },
    ]

    return (
        <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm dark:shadow-none">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        <Github size={20} className="text-slate-900 dark:text-white" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">GitHub Stats</p>
                        <p className="text-slate-900 dark:text-white font-bold">@{username}</p>
                    </div>
                </div>
                <a
                    href={stats.profileUrl}
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
                        className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl p-4 hover:border-purple-500/30 transition-colors"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <item.icon size={14} className={item.color} />
                            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                {item.label}
                            </span>
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                            {item.value.toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>

            {/* Top Languages */}
            {stats.topLanguages.length > 0 && (
                <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">
                        Top Languages
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {stats.topLanguages.map(lang => (
                            <span
                                key={lang}
                                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700"
                            >
                                {lang}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Contribution Graph Placeholder */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Activity size={14} />
                    <span>View full contribution history on GitHub</span>
                </div>
            </div>
        </div>
    )
}
