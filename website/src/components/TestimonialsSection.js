'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Quote, ChevronLeft, ChevronRight, Linkedin, ExternalLink } from 'lucide-react'

export default function TestimonialsSection({ testimonials = [] }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    // Auto-advance testimonials
    useEffect(() => {
        if (!isAutoPlaying || testimonials.length <= 1) return
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % testimonials.length)
        }, 6000)
        return () => clearInterval(timer)
    }, [isAutoPlaying, testimonials.length])

    if (testimonials.length === 0) {
        return null
    }

    const currentTestimonial = testimonials[currentIndex]

    const goToNext = () => {
        setIsAutoPlaying(false)
        setCurrentIndex(prev => (prev + 1) % testimonials.length)
    }

    const goToPrev = () => {
        setIsAutoPlaying(false)
        setCurrentIndex(prev => (prev - 1 + testimonials.length) % testimonials.length)
    }

    return (
        <div className="relative">
            {/* Background glow */}
            <div className="absolute inset-0 bg-purple-500/5 rounded-3xl blur-3xl" />

            <div className="relative bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 md:p-12 shadow-sm dark:shadow-none">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-purple-500 dark:text-purple-400 font-bold uppercase tracking-[0.2em] text-xs mb-1">
                            Client Testimonials
                        </p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white italic">
                            MISSION <span className="text-purple-500">REPORTS</span>
                        </h3>
                    </div>
                    <Quote size={40} className="text-purple-500/20" />
                </div>

                {/* Testimonial Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Rating */}
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={18}
                                    className={i < (currentTestimonial.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}
                                />
                            ))}
                        </div>

                        {/* Quote */}
                        <blockquote className="text-lg md:text-xl text-slate-700 dark:text-slate-300 italic leading-relaxed">
                            "{currentTestimonial.content}"
                        </blockquote>

                        {/* Author */}
                        <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                            {currentTestimonial.author_avatar ? (
                                <img
                                    src={currentTestimonial.author_avatar}
                                    alt={currentTestimonial.author_name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/30"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center">
                                    <span className="text-purple-500 dark:text-purple-400 font-bold text-lg">
                                        {currentTestimonial.author_name?.charAt(0)}
                                    </span>
                                </div>
                            )}
                            <div className="flex-1">
                                <p className="font-bold text-slate-900 dark:text-white">{currentTestimonial.author_name}</p>
                                <p className="text-slate-500 text-sm">
                                    {currentTestimonial.author_title}
                                    {currentTestimonial.author_company && (
                                        <span> @ {currentTestimonial.author_company}</span>
                                    )}
                                </p>
                            </div>
                            {currentTestimonial.author_linkedin && (
                                <a
                                    href={currentTestimonial.author_linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                >
                                    <Linkedin size={18} />
                                </a>
                            )}
                        </div>

                        {/* Project Reference */}
                        {currentTestimonial.project_name && (
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-600 text-xs">
                                <span>Project:</span>
                                <span className="text-purple-500 dark:text-purple-400 font-bold">{currentTestimonial.project_name}</span>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                {testimonials.length > 1 && (
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex gap-2">
                            {testimonials.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setIsAutoPlaying(false)
                                        setCurrentIndex(idx)
                                    }}
                                    className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex
                                        ? 'bg-purple-500 w-6'
                                        : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                                        }`}
                                />
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={goToPrev}
                                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={goToNext}
                                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
