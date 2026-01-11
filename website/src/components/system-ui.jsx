"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { X, Info } from "lucide-react";

export function SystemWindow({ title, children, className, onClose, show = true, idLabel }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 10 }}
                    className={cn("system-window flex flex-col group/window", className)}
                >
                    {/* HUD Decoration Corners - Subtler for professional look */}
                    <div className="hud-corner hud-corner-tl opacity-20 group-hover/window:opacity-100 transition-opacity" />
                    <div className="hud-corner hud-corner-tr opacity-20 group-hover/window:opacity-100 transition-opacity" />
                    <div className="hud-corner hud-corner-bl opacity-20 group-hover/window:opacity-100 transition-opacity" />
                    <div className="hud-corner hud-corner-br opacity-20 group-hover/window:opacity-100 transition-opacity" />

                    {title && (
                        <div className="system-window-header relative">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-system-purple rounded-full animate-pulse" />
                                <span className="font-extrabold">{title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-[9px] text-system-purple/50 tracking-[0.4em] font-black hidden sm:block italic">{idLabel || "ID: SYSTEM_MODULE.v4"}</div>
                                {onClose && (
                                    <button onClick={onClose} className="hover:text-system-purple transition-colors ml-2 bg-slate-100 p-1 rounded-md">
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    <div className="p-6 flex-1 relative z-10">{children}</div>

                    {/* Subtle Bottom accent */}
                    <div className="absolute bottom-3 right-6 left-6 h-[1.5px] bg-gradient-to-r from-transparent via-system-purple/5 to-transparent rounded-full" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export function StatBar({ label, value, max = 100, color, showIcon }) {
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <div className="mb-6 group/stat">
            <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2">
                    {showIcon && <div className="w-1 h-3 bg-system-purple/40 rounded-full" />}
                    <span className="text-[10px] font-extrabold tracking-[0.15em] text-slate-500 uppercase italic group-hover/stat:text-system-purple transition-colors">
                        {label}
                    </span>
                </div>
                <div className="text-[10px] font-black text-system-purple tabular-nums px-2 py-0.5 rounded-md">
                    <span className="text-slate-900 dark:text-white text-sm">{value}</span> <span className="text-system-purple/40">/ {max}</span>
                </div>
            </div>
            <div className="stat-bar w-full">
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="stat-bar-fill"
                    style={color ? { background: color } : {}}
                />
            </div>
        </div>
    );
}

export function SystemNotification({ message, show, icon: Icon }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ x: 100, opacity: 0, scale: 0.9 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    exit={{ x: 100, opacity: 0, scale: 0.9 }}
                    className="fixed top-8 right-8 z-[200] max-w-[360px]"
                >
                    <div className="system-window p-4 bg-white border border-slate-200 shadow-2xl">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-system-purple/10 rounded-lg">
                                {Icon ? <Icon className="text-system-purple" size={20} /> : <Info className="text-system-purple" size={20} />}
                            </div>
                            <div className="space-y-1">
                                <div className="text-[9px] font-black text-system-purple/50 tracking-[0.2em] uppercase italic">System Core</div>
                                <div className="text-xs font-bold leading-relaxed uppercase text-slate-800">
                                    {message}
                                </div>
                            </div>
                        </div>
                        {/* Animated progress line */}
                        <motion.div
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 5, ease: "linear" }}
                            className="absolute bottom-0 left-0 h-1 bg-system-purple/30"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
