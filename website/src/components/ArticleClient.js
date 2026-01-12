'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
    ArrowLeft, Clock, Eye, Calendar, Tag, Share2,
    Twitter, Linkedin, Copy, Check, ChevronRight
} from 'lucide-react'
import { useState } from 'react'

export default function ArticleClient({ article, relatedArticles = [] }) {
    const [copied, setCopied] = useState(false)

    const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleShare = (platform) => {
        const text = `Check out: ${article.title}`
        const urls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        }
        window.open(urls[platform], '_blank')
    }

    return (

        <main className="min-h-screen bg-slate-50 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/blog" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                        <ArrowLeft size={18} />
                        <span className="text-sm font-bold">All Articles</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopyLink}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                        >
                            {copied ? <Check size={16} className="text-green-500 dark:text-green-400" /> : <Copy size={16} />}
                        </button>
                        <button
                            onClick={() => handleShare('twitter')}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                        >
                            <Twitter size={16} />
                        </button>
                        <button
                            onClick={() => handleShare('linkedin')}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                        >
                            <Linkedin size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <article className="max-w-4xl mx-auto px-6 py-12">
                {/* Article Header */}
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    {/* Tags */}
                    {article.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {article.tags.map(tag => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-purple-100 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white italic tracking-tight leading-tight mb-6">
                        {article.title}
                    </h1>

                    {article.excerpt && (
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">{article.excerpt}</p>
                    )}

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-6 text-slate-500 text-sm">
                        <span className="flex items-center gap-2">
                            <Calendar size={16} />
                            {new Date(article.published_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                        <span className="flex items-center gap-2">
                            <Clock size={16} />
                            {article.reading_time} min read
                        </span>
                        <span className="flex items-center gap-2">
                            <Eye size={16} />
                            {article.views || 0} views
                        </span>
                    </div>
                </motion.header>

                {/* Cover Image */}
                {article.cover_image && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="relative aspect-video rounded-2xl overflow-hidden mb-12 border border-slate-200 dark:border-slate-800"
                    >
                        <Image
                            src={article.cover_image}
                            alt={article.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </motion.div>
                )}

                {/* Article Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="prose prose-slate dark:prose-invert prose-lg max-w-none
            prose-headings:font-black prose-headings:italic prose-headings:tracking-tight
            prose-h2:text-2xl prose-h2:text-purple-600 dark:prose-h2:text-purple-400 prose-h2:mt-12 prose-h2:mb-4
            prose-h3:text-xl
            prose-p:leading-relaxed
            prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline
            prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-purple-600 dark:prose-code:text-purple-300
            prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-pre:border prose-pre:border-slate-800
            prose-blockquote:border-l-purple-500 prose-blockquote:bg-slate-100 dark:prose-blockquote:bg-slate-900/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
            prose-img:rounded-xl prose-img:border prose-img:border-slate-200 dark:prose-img:border-slate-800
            prose-li:marker:text-purple-500
          "
                    dangerouslySetInnerHTML={{ __html: article.content || '<p>No content yet.</p>' }}
                />

                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800"
                    >
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white italic mb-8">
                            Related <span className="text-purple-600 dark:text-purple-500">Articles</span>
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {relatedArticles.map(related => (
                                <Link key={related.id} href={`/blog/${related.slug}`}>
                                    <div className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all shadow-sm dark:shadow-none">
                                        {related.cover_image && (
                                            <div className="relative aspect-video overflow-hidden">
                                                <Image
                                                    src={related.cover_image}
                                                    alt={related.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                                                {related.title}
                                            </h3>
                                            <p className="text-slate-600 dark:text-slate-500 text-sm mt-2 line-clamp-2">
                                                {related.excerpt}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </motion.section>
                )}
            </article>
        </main>
    )
}
