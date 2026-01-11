'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
    ArrowLeft, Clock, Eye, Calendar, Tag, Search,
    BookOpen, Sparkles, ChevronRight
} from 'lucide-react'

export default function BlogClient({ articles = [] }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTag, setSelectedTag] = useState(null)

    // Get all unique tags
    const allTags = [...new Set(articles.flatMap(a => a.tags || []))]

    // Filter articles
    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesTag = !selectedTag || article.tags?.includes(selectedTag)
        return matchesSearch && matchesTag
    })

    const featuredArticle = filteredArticles[0]
    const otherArticles = filteredArticles.slice(1)

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                        <ArrowLeft size={18} />
                        <span className="text-sm font-bold">Back to Portfolio</span>
                    </Link>
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                        <BookOpen size={18} />
                        <span className="text-sm font-black italic uppercase tracking-wider">Knowledge Base</span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <p className="text-purple-600 dark:text-purple-400 font-bold uppercase tracking-[0.3em] text-xs mb-2">
                        Tech Articles & Insights
                    </p>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white italic tracking-tight">
                        SYSTEM <span className="text-purple-600 dark:text-purple-500">LOGS</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-4 max-w-xl mx-auto">
                        Deep dives into code architecture, development patterns, and lessons learned from building real systems.
                    </p>
                </motion.div>

                {/* Search & Tags */}
                <div className="mb-12 space-y-4">
                    <div className="relative max-w-xl mx-auto">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search articles..."
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors shadow-sm dark:shadow-none"
                        />
                    </div>

                    {allTags.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2">
                            <button
                                onClick={() => setSelectedTag(null)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${!selectedTag
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                                    }`}
                            >
                                All
                            </button>
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(tag)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${selectedTag === tag
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Articles Grid */}
                {filteredArticles.length === 0 ? (
                    <div className="text-center py-20">
                        <Sparkles size={48} className="mx-auto text-slate-400 dark:text-slate-700 mb-4" />
                        <h3 className="text-xl font-bold text-slate-500 italic">No articles yet</h3>
                        <p className="text-slate-500 dark:text-slate-600 text-sm mt-2">Check back soon for new content!</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Featured Article */}
                        {featuredArticle && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Link href={`/blog/${featuredArticle.slug}`}>
                                    <div className="group relative bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 shadow-sm dark:shadow-none">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {featuredArticle.cover_image && (
                                                <div className="relative aspect-video md:aspect-auto md:h-full overflow-hidden">
                                                    <Image
                                                        src={featuredArticle.cover_image}
                                                        alt={featuredArticle.title}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/50 dark:to-slate-950/80" />
                                                </div>
                                            )}
                                            <div className="p-8 flex flex-col justify-center">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="px-2 py-1 bg-purple-600 text-white text-[10px] font-black uppercase rounded">
                                                        Featured
                                                    </span>
                                                    {featuredArticle.tags?.[0] && (
                                                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 text-[10px] font-bold rounded">
                                                            {featuredArticle.tags[0]}
                                                        </span>
                                                    )}
                                                </div>
                                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white italic mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                    {featuredArticle.title}
                                                </h2>
                                                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                                                    {featuredArticle.excerpt}
                                                </p>
                                                <div className="flex items-center gap-4 text-slate-500 text-xs">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {featuredArticle.reading_time} min read
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Eye size={12} />
                                                        {featuredArticle.views || 0} views
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {new Date(featuredArticle.published_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )}

                        {/* Other Articles */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {otherArticles.map((article, idx) => (
                                <motion.div
                                    key={article.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + idx * 0.05 }}
                                >
                                    <Link href={`/blog/${article.slug}`}>
                                        <div className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 h-full flex flex-col shadow-sm dark:shadow-none">
                                            {article.cover_image && (
                                                <div className="relative aspect-video overflow-hidden">
                                                    <Image
                                                        src={article.cover_image}
                                                        alt={article.title}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>
                                            )}
                                            <div className="p-5 flex-1 flex flex-col">
                                                {article.tags?.[0] && (
                                                    <span className="self-start px-2 py-1 bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 text-[10px] font-bold rounded mb-3">
                                                        {article.tags[0]}
                                                    </span>
                                                )}
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                                                    {article.title}
                                                </h3>
                                                <p className="text-slate-600 dark:text-slate-500 text-sm line-clamp-2 flex-1">
                                                    {article.excerpt}
                                                </p>
                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                    <div className="flex items-center gap-3 text-slate-500 text-xs">
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={12} />
                                                            {article.reading_time}m
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Eye size={12} />
                                                            {article.views || 0}
                                                        </span>
                                                    </div>
                                                    <ChevronRight size={16} className="text-slate-400 dark:text-slate-600 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
