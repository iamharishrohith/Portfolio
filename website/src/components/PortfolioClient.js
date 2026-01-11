"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Target,
    Book,
    User,
    Mail,
    Github,
    Linkedin,
    ExternalLink,
    RefreshCw,
    Trophy,
    Award,
    Heart,
    Skull,
    ChevronRight,
    Layout,
    Cpu,
    Database,
    Globe,
    Command,
    Terminal,
    Code2,
    Sparkles,
    Brain,
    Bot,
    Network,
    Volume2,
    VolumeX,
    Sun,
    Moon,
    Download,
    Zap,
    Shield
} from "lucide-react"
import { SystemWindow, StatBar, SystemNotification } from "./system-ui"
import QRCodeCard from "./QRCodeCard"
import GitHubStats from "./GitHubStats"
import LeetCodeStats from "./LeetCodeStats"
import ResumeDownloadButton from "./ResumeDownloadButton"
import TestimonialsSection from "./TestimonialsSection"
import SkillTag from "./SkillTag"
import { cn } from "@/lib/utils"
// We will pass data as props, but mockData is still useful for initial states or fallbacks if needed
// though strictly we should rely on props.
import { useGameState } from "../hooks/use-game-state"
import { useSoundFx } from "../hooks/use-sound-fx"

// Helper for devicons
const getDevicon = (name) => {
    const iconMap = {
        'java': 'devicon-java-plain colored',
        'python': 'devicon-python-plain colored',
        'javascript': 'devicon-javascript-plain colored',
        'typescript': 'devicon-typescript-plain colored',
        'c': 'devicon-c-plain colored',
        'c++': 'devicon-cplusplus-plain colored',
        'html': 'devicon-html5-plain colored',
        'css': 'devicon-css3-plain colored',
        'sql': 'devicon-mysql-plain colored',
        'react': 'devicon-react-original colored',
        'node.js': 'devicon-nodejs-plain colored',
        'nodejs': 'devicon-nodejs-plain colored',
        'express.js': 'devicon-express-original',
        'expressjs': 'devicon-express-original',
        'fastify.js': 'devicon-fastify-plain',
        'fastifyjs': 'devicon-fastify-plain',
        'next.js': 'devicon-nextjs-plain',
        'nextjs': 'devicon-nextjs-plain',
        'tailwind': 'devicon-tailwindcss-plain colored',
        'bootstrap': 'devicon-bootstrap-plain colored',
        'mongodb': 'devicon-mongodb-plain colored',
        'postgresql': 'devicon-postgresql-plain colored',
        'firebase': 'devicon-firebase-plain colored',
        'supabase': 'devicon-supabase-plain colored',
        'git': 'devicon-git-plain colored',
        'github': 'devicon-github-original',
        'docker': 'devicon-docker-plain colored',
        'aws': 'devicon-amazonwebservices-original colored',
        'figma': 'devicon-figma-plain colored',
        'photoshop': 'devicon-photoshop-plain colored',
    };
    return iconMap[name?.toLowerCase()] || 'devicon-devicon-plain';
};

// Fallback data if props fail (should match structure of props)
const defaultProfile = {
    full_name: "Harish Rohith",
    current_level: 73,
    current_xp: 84,
    headline: "System Architect",
    bio: "The system is live.",
}

export default function PortfolioClient({
    initialProfile,
    projects = [],
    experiences = [],
    skills = [],
    education = [],
    certifications = [],
    achievements = [],
    testimonials = []
}) {
    // Use props or fallback
    const profileData = initialProfile || defaultProfile

    // Hooks
    const { level, xp, awakened, setAwakened, addXp } = useGameState(profileData)
    const { playHover, playClick, playLevelUp, isMuted, toggleMute } = useSoundFx()

    const [showNotification, setShowNotification] = useState(false)
    const [activeTab, setActiveTab] = useState("status")
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const [roleIndex, setRoleIndex] = useState(0)
    const [displayText, setDisplayText] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)
    const [likeCount, setLikeCount] = useState(0)
    const [darkMode, setDarkMode] = useState(true)

    // Roles for typing effect - could also be passed as prop or derived
    const roles = initialProfile?.headline
        ? [initialProfile.headline, "Full Stack Developer", "Mobile Architect"]
        : ["System Player", "Full Stack Dev", "Mobile Architect"]

    // Sound & Typing Effect
    useEffect(() => {
        if (roles.length === 0) return
        const typingSpeed = isDeleting ? 50 : 100
        const nextRoleIndex = (roleIndex + 1) % roles.length

        const handleTyping = () => {
            const currentRole = roles[roleIndex]

            if (!isDeleting) {
                setDisplayText(currentRole.substring(0, displayText.length + 1))
                if (displayText.length === currentRole.length) {
                    setTimeout(() => setIsDeleting(true), 2000)
                }
            } else {
                setDisplayText(currentRole.substring(0, displayText.length - 1))
                if (displayText.length === 0) {
                    setIsDeleting(false)
                    setRoleIndex(nextRoleIndex)
                }
            }
        }

        const timer = setTimeout(handleTyping, typingSpeed)
        return () => clearTimeout(timer)
    }, [displayText, isDeleting, roleIndex, roles])

    // Awakening Effect
    useEffect(() => {
        if (!awakened) {
            const timer = setTimeout(() => {
                setAwakened(true)
                playLevelUp()
                setShowNotification(true)
                setTimeout(() => setShowNotification(false), 5000)
            }, 1500)
            return () => clearTimeout(timer)
        }
    }, [awakened])

    // Mouse Follow
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    const handleAction = () => {
        const { leveledUp } = addXp(10)
        if (leveledUp) {
            playLevelUp()
            setShowNotification(true)
            setTimeout(() => setShowNotification(false), 4000)
        } else {
            playClick()
        }
    }

    return (
        <main className={cn(
            "min-h-screen relative font-sans overflow-hidden selection:bg-system-purple selection:text-white transition-colors duration-500",
            darkMode ? "dark bg-[#0a0a0a] text-slate-100" : "bg-slate-50 text-slate-900"
        )}>
            {/* Cinematic Background Layer */}
            <div className="perspective-grid opacity-20" />

            {/* Mouse Follow Glow */}
            <div
                className="fixed w-[800px] h-[800px] rounded-full pointer-events-none z-0 transition-transform duration-500 ease-out opacity-20"
                style={{
                    background: "radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)",
                    left: mousePos.x - 400,
                    top: mousePos.y - 400,
                }}
            />

            <SystemNotification
                show={showNotification}
                message={
                    level > 1
                        ? "ALERT: LEVEL UP ACHIEVED. ARCHITECT POTENTIAL INCREASING."
                        : "SYSTEM INITIALIZED. WELCOME, PLAYER HARISH ROHITH."
                }
                icon={level > 1 ? Trophy : Sparkles}
            />

            <AnimatePresence>
                {!awakened ? (
                    <motion.div
                        key="loading"
                        className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] z-[1000]"
                        exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-system-purple font-black tracking-[1em] text-lg italic mb-12 flex flex-col items-center"
                        >
                            <div className="text-slate-200 text-6xl mb-4 font-normal tracking-tighter opacity-10">CORE_INIT</div>
                            <span>[ SYSTEM AWAKENING ]</span>
                        </motion.div>
                        <div className="w-72 h-1 bg-slate-100 rounded-full relative overflow-hidden shadow-inner">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1.2, ease: "easeInOut" }}
                                className="absolute top-0 left-0 h-full bg-system-purple shadow-[0_0_15px_rgba(124,58,237,0.5)]"
                            />
                        </div>
                        <div className="mt-6 text-[11px] text-slate-400 font-bold uppercase tracking-[0.3em] animate-pulse">
                            Connecting to the Monarch's Archive...
                        </div>
                    </motion.div>
                ) : (
                    <div className="container mx-auto px-6 py-8 relative z-20">
                        {/* System Header Branding */}
                        <div className="relative z-10 w-full flex justify-center mb-6">
                            <div className="text-base md:text-lg font-black tracking-[0.6em] text-system-purple uppercase border-b-2 border-system-purple/50 pb-4 px-12 drop-shadow-[0_0_10px_rgba(124,58,237,0.5)]">MONARCH SYSTEM</div>
                        </div>

                        {/* HUD Header */}
                        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 relative">
                            <div className="flex flex-col lg:flex-row items-center lg:items-end gap-10 pb-12 border-b border-slate-200/60 dark:border-slate-800">

                                {/* Avatar Section */}
                                <div className="flex flex-col items-center gap-6 relative group animate-float">
                                    <div className="w-44 h-44 system-window !p-1 overflow-hidden relative border-2 border-system-purple shadow-[0_0_30px_rgba(124,58,237,0.3)] rounded-[2rem]">
                                        <img
                                            src={profileData.avatar_url || "https://github.com/shadcn.png"}
                                            alt={profileData.full_name}
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-full object-cover transition-all duration-700 scale-100 group-hover:scale-105 rounded-[1.8rem]"
                                        />
                                        <div className="absolute top-0 right-0 p-3">
                                            <div className="bg-system-purple text-white px-3 py-1 text-[10px] font-black italic rounded-md shadow-lg shadow-system-purple/20">
                                                RANK: S
                                            </div>
                                        </div>
                                    </div>

                                    {/* Level Indicator */}
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-2 min-w-[140px] rounded-xl shadow-xl flex flex-col items-center gap-1 -mt-14 relative z-10">
                                        <div className="text-[9px] font-black text-system-purple italic leading-none tracking-widest uppercase">
                                            LEVEL
                                        </div>
                                        <div className="text-2xl font-black italic leading-none text-slate-900 dark:text-white">{level}</div>
                                    </div>

                                    {/* Social Buttons */}
                                    <div className="flex gap-3 justify-center items-center">
                                        <a href={profileData.github_url || "#"} target="_blank" className="social-btn" rel="noreferrer"><Github size={18} /></a>
                                        <a href={profileData.linkedin_url || "#"} target="_blank" className="social-btn" rel="noreferrer"><Linkedin size={18} /></a>
                                        <button onClick={() => { setDarkMode(!darkMode); playClick(); }} className="social-btn">
                                            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                                        </button>
                                        <button onClick={() => { toggleMute(); playClick(); }} className="social-btn">
                                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Info Section */}
                                <div className="flex-1 text-center lg:text-left space-y-5 lg:pb-8">
                                    <div className="space-y-1">
                                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-widest italic system-text-glow leading-tight text-black dark:text-white whitespace-nowrap">
                                            {profileData.full_name?.toUpperCase()}
                                        </h1>
                                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium italic mt-2 tracking-wide">
                                            "As long as I'm Alive, There are infinite chances" — Monkey D. Luffy
                                        </p>
                                        <p className="text-sm md:text-base text-system-purple/90 font-bold italic tracking-widest uppercase mt-3 filter drop-shadow-lg">
                                            "{profileData.bio || 'Player loaded.'}"
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-[11px] font-black tracking-[0.3em] uppercase text-slate-400 italic min-h-[2rem]">
                                        <span className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full dark:text-slate-300">
                                            <Sparkles size={14} className="text-system-purple" />
                                            {displayText}
                                            <span className="animate-blink">|</span>
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-2">
                                        <button onClick={() => { setActiveTab("contact"); playClick(); }} className="btn-primary-system flex items-center gap-2 !px-6 !py-3 shadow-lg shadow-system-purple/20">
                                            <Mail size={18} /> Hire Me
                                        </button>
                                        <ResumeDownloadButton
                                            data={{
                                                profile: profileData,
                                                projects,
                                                experiences,
                                                skills,
                                                education,
                                                certifications
                                            }}
                                            className="btn-system flex items-center gap-2 !px-6 !py-3"
                                        />
                                        <div className="h-8 w-[1px] bg-slate-300 dark:bg-slate-700 mx-2" />
                                        <button onClick={() => { setLikeCount(prev => prev + 1); playClick(); }} className="group relative">
                                            <motion.div whileTap={{ scale: 1.5 }} className="relative z-10">
                                                <Heart size={28} className={cn("transition-colors duration-300", likeCount > 0 ? "fill-red-500 text-red-500" : "text-slate-400 dark:text-slate-600 hover:text-red-500")} />
                                            </motion.div>
                                            <span className="absolute -top-2 -right-3 text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                                                {likeCount}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* XP Widget */}
                                <div className="w-full lg:w-auto flex flex-row items-end gap-4">
                                    <div className="w-full lg:w-80 flex flex-col gap-4">
                                        <SystemWindow className="!p-4 bg-slate-100/50 dark:bg-slate-900/50 border-none shadow-none">
                                            <div className="flex justify-between items-end mb-3">
                                                <span className="text-[10px] font-black text-system-purple italic tracking-widest uppercase">Mana Progression</span>
                                                <span className="text-lg font-black italic text-slate-900 dark:text-white">{xp}%</span>
                                            </div>
                                            <div className="stat-bar w-full h-2">
                                                <motion.div
                                                    animate={{ width: `${xp}%` }}
                                                    className="stat-bar-fill shadow-[0_0_10px_rgba(124,58,237,0.3)]"
                                                />
                                            </div>
                                            <button onClick={handleAction} className="btn-primary-system w-full mt-6 flex items-center justify-center gap-2 py-4">
                                                Extraction Training <RefreshCw size={14} className={cn("transition-transform", xp > 0 && "animate-spin-slow")} />
                                            </button>
                                        </SystemWindow>
                                    </div>
                                </div>
                            </div>
                        </motion.header>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            {/* Navigation Column */}
                            <div className="lg:col-span-3 space-y-4">
                                <nav className="space-y-4">
                                    {[
                                        { id: "status", label: "Hunter Status", icon: User },
                                        { id: "shadows", label: "Experience", icon: Skull },
                                        { id: "quests", label: "Active Raids", icon: Target },
                                        { id: "uplink", label: "System Uplink", icon: Globe },
                                        { id: "skills", label: "Ability Tree", icon: Zap },
                                        { id: "certifications", label: "Certifications", icon: Award },
                                        { id: "contact", label: "Comms Link", icon: Mail },
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => { setActiveTab(item.id); playClick(); }}
                                            onMouseEnter={playHover}
                                            className={cn(
                                                "w-full group relative px-6 py-5 transition-all duration-300 flex items-center justify-between overflow-hidden rounded-xl",
                                                activeTab === item.id
                                                    ? "bg-system-purple text-white shadow-xl shadow-system-purple/20"
                                                    : "bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-100 dark:border-slate-800",
                                            )}
                                        >
                                            <div className="relative z-10 flex items-center gap-4 text-xs font-black uppercase tracking-[0.15em] italic">
                                                <item.icon size={18} className={cn("transition-transform group-hover:scale-110", activeTab === item.id && "animate-pulse")} />
                                                {item.label}
                                            </div>
                                            <ChevronRight size={16} className={cn("relative z-10 transition-transform opacity-0 group-hover:opacity-100 group-hover:translate-x-1", activeTab === item.id && "opacity-100")} />
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Dynamic Content */}
                            <div className="lg:col-span-9 min-h-[600px]">
                                <AnimatePresence mode="wait">
                                    {activeTab === "status" && (
                                        <motion.div key="status" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <SystemWindow title="HUNTER ATTRIBUTES" className="md:col-span-1 shadow-premium h-full" idLabel="SYS_ID: ATTRIBUTES">
                                                <div className="space-y-2">
                                                    <StatBar label="Architecture (Next.js)" value={98} showIcon />
                                                    <StatBar label="Backend Potency (Node/SQL)" value={94} showIcon />
                                                    <StatBar label="AI Integration" value={92} showIcon />
                                                    <StatBar label="Web3 Aptitude" value={85} showIcon color="#8b5cf6" />
                                                    <StatBar label="UI/UX Precision" value={96} showIcon />
                                                </div>
                                            </SystemWindow>

                                            <SystemWindow title="PLAYER BIO" className="md:col-span-1 shadow-premium h-full">
                                                <div className="space-y-6">
                                                    <div className="relative pl-6 border-l-2 border-system-purple/20 space-y-3">
                                                        <div className="absolute top-0 left-[-6px] w-3 h-3 rounded-full bg-system-purple" />
                                                        <div className="text-[10px] font-black text-system-purple uppercase italic tracking-widest">Self Awakening</div>
                                                        <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-200 italic font-medium">
                                                            {profileData.bio || '"Software Architect specializing in scalable systems."'}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-4 pt-4">
                                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">Education Log</div>
                                                        {education.map((edu, idx) => (
                                                            <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-system-purple/30 transition-colors">
                                                                <div className="text-[9px] text-slate-400 font-bold uppercase mb-1">{edu.year}</div>
                                                                <div className="text-xs font-black italic text-slate-900 dark:text-slate-200">{edu.degree}</div>
                                                                <div className="text-[10px] font-bold text-system-purple uppercase mt-1">{edu.institution}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </SystemWindow>

                                            <SystemWindow title="TROPHY CASE" className="md:col-span-2 shadow-premium">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {achievements.map((t, i) => (
                                                        <div key={i} className="flex gap-4 p-5 bg-white dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-system-purple transition-all hover:shadow-lg">
                                                            <div className="p-4 bg-system-purple/5 rounded-xl text-system-purple"><Trophy size={24} /></div>
                                                            <div className="space-y-2">
                                                                <div className="text-sm font-black italic text-slate-900 dark:text-white uppercase tracking-widest">{t.title}</div>
                                                                <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold leading-relaxed">{t.description}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </SystemWindow>

                                            <div className="md:col-span-2">
                                                <TestimonialsSection testimonials={testimonials} />
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === "quests" && (
                                        <motion.div key="quests" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="space-y-8">
                                            {projects.map((quest, i) => (
                                                <SystemWindow key={i} title={`RAID [${quest.raid_id}]: ${quest.title}`} className="shadow-premium" idLabel={`SYS_ID: ${quest.raid_id}`}>
                                                    <div className="flex flex-col md:flex-row gap-10">
                                                        <div className="w-full md:w-56 aspect-video bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800 group-hover:border-system-purple/50 transition-colors overflow-hidden relative shadow-2xl">
                                                            <Terminal size={48} className="text-slate-700 group-hover:text-system-purple transition-all group-hover:scale-125 group-hover:rotate-12" />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                                                            <div className="absolute bottom-3 left-3 px-3 py-1 bg-red-600 text-white text-[9px] font-black italic uppercase rounded-md shadow-lg shadow-red-600/30">
                                                                RANK: {quest.difficulty}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 space-y-6">
                                                            <p className="text-sm text-slate-500 leading-relaxed font-semibold uppercase italic tracking-wide">{quest.description}</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {quest.tags?.map((tag) => (
                                                                    <span key={tag} className="px-3 py-1 bg-slate-100 border border-slate-200 text-[9px] font-black italic tracking-widest text-system-purple uppercase rounded-lg">{tag}</span>
                                                                ))}
                                                            </div>
                                                            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                                                <div className="text-[10px] font-black text-slate-400 italic">CLEARED REWARD: <span className="text-yellow-600">{quest.reward}</span></div>
                                                                <a href={quest.github_link || "#"} target="_blank" className="flex items-center gap-2 text-xs font-black italic uppercase text-system-purple px-4 py-2 bg-system-purple/5 rounded-xl hover:bg-system-purple hover:text-white transition-all" rel="noreferrer">
                                                                    Open Gate <ExternalLink size={14} />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </SystemWindow>
                                            ))}
                                        </motion.div>
                                    )}

                                    {activeTab === "uplink" && (
                                        <motion.div key="uplink" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <SystemWindow title="GITHUB UPLINK" className="md:col-span-1 shadow-premium h-full" idLabel="SYS_ID: GITHUB">
                                                <GitHubStats username={profileData?.coding_stats?.github_username || "iamharishrohith"} />
                                            </SystemWindow>

                                            <SystemWindow title="LEETCODE STATUS" className="md:col-span-1 shadow-premium h-full" idLabel="SYS_ID: LEETCODE">
                                                <LeetCodeStats username={profileData?.coding_stats?.leetcode_username || "iamharishrohith"} />
                                            </SystemWindow>
                                        </motion.div>
                                    )}

                                    {activeTab === "skills" && (
                                        <motion.div key="skills" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                            <SystemWindow title="ABILITY TREE" className="shadow-premium" idLabel="SYS_ID: ABILITIES">
                                                <div className="space-y-4">
                                                    {[...new Set(skills.map(s => s.category))].map((category) => (
                                                        <div key={category} className="flex flex-wrap items-center gap-2">
                                                            <span className="text-[9px] font-black text-system-purple/70 uppercase tracking-widest italic shrink-0">{category}:</span>
                                                            {skills.filter(s => s.category === category).map((skill) => (
                                                                <SkillTag
                                                                    key={skill.id || skill.name}
                                                                    skill={skill}
                                                                    iconClass={getDevicon(skill.name)}
                                                                    playHover={playHover}
                                                                    playClick={playClick}
                                                                />
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>
                                            </SystemWindow>
                                        </motion.div>
                                    )}

                                    {activeTab === "certifications" && (
                                        <motion.div key="certifications" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                            <SystemWindow title="ACADEMIC & CERTIFICATIONS" className="shadow-premium" idLabel="SYS_ID: DIPLOMA">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {certifications.map((cert, i) => {
                                                        const Icon = { Network, Code2, Layout, Target, Database }[cert.icon_name] || Award
                                                        return (
                                                            <div key={i} className="flex gap-4 p-6 bg-white dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-system-purple transition-all shadow-sm group">
                                                                <div className="p-3 bg-system-purple/5 rounded-xl text-system-purple self-start"><Icon size={24} /></div>
                                                                <div className="space-y-1">
                                                                    <div className="text-[9px] font-black text-slate-400 dark:text-slate-300 uppercase tracking-widest italic">{cert.issuer}</div>
                                                                    <h4 className="text-sm font-black italic text-slate-900 dark:text-white uppercase leading-snug">{cert.title}</h4>
                                                                    <div className="text-[10px] font-bold text-system-purple uppercase bg-system-purple/5 px-2 py-1 rounded inline-block mt-2">{cert.date}</div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </SystemWindow>
                                        </motion.div>
                                    )}

                                    {activeTab === "shadows" && (
                                        <motion.div key="shadows" initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                                            <SystemWindow title="EXTRACTED EXPERIENCES" className="shadow-premium" idLabel="SYS_ID: CHRONICLE">
                                                <div className="space-y-12 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-100">
                                                    {experiences.map((job, i) => (
                                                        <div key={i} className="relative pl-24 group">
                                                            <div className="absolute left-6 top-1 w-5 h-5 rounded-full bg-white border-4 border-system-purple shadow-lg z-10 group-hover:scale-125 transition-transform" />
                                                            <div className="system-window p-8 bg-white border border-slate-100 group-hover:bg-slate-50 group-hover:border-system-purple/20 transition-colors shadow-premium">
                                                                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                                                                    <div>
                                                                        <h4 className="text-xl font-black italic text-slate-900 dark:text-white uppercase tracking-tighter">{job.role}</h4>
                                                                        <div className="text-xs font-bold text-system-purple uppercase italic tracking-[0.2em]">{job.company}</div>
                                                                    </div>
                                                                    <div className="text-[10px] font-black text-slate-400 dark:text-slate-300 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{job.duration}</div>
                                                                </div>
                                                                <p className="text-[13px] text-slate-500 dark:text-slate-300 font-medium leading-relaxed italic uppercase max-w-2xl">{job.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </SystemWindow>
                                        </motion.div>
                                    )}

                                    {activeTab === "contact" && (
                                        <motion.div key="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                                            <SystemWindow title="DIRECT CHANNEL" className="lg:col-span-2 shadow-premium" idLabel="SYS_ID: UPLINK">
                                                <div className="space-y-8">
                                                    <div className="space-y-4">
                                                        <h3 className="text-4xl font-extrabold italic tracking-tighter uppercase text-slate-900 leading-none">Open <span className="text-system-purple">Comms</span></h3>
                                                        <p className="text-[11px] text-slate-400 uppercase font-black leading-relaxed tracking-widest italic">ONLY WORTHY QUESTS WILL BE REVIEWED. STATE YOUR COORDINATES AND THE MISSION REWARDS.</p>
                                                    </div>
                                                    <div className="space-y-6 pt-6 border-t border-slate-100">
                                                        <div className="flex items-center gap-5 group cursor-pointer">
                                                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl group-hover:bg-system-purple group-hover:text-white transition-all"><Mail size={22} /></div>
                                                            <div>
                                                                <div className="text-[9px] font-black text-slate-400 uppercase italic tracking-widest">Encrypted Relay</div>
                                                                <div className="text-sm font-black italic text-slate-900">iamharishrohith@gmail.com</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* QR Code Card */}
                                                    <QRCodeCard
                                                        url={profileData.portfolio_url || "https://harishrohith.vercel.app"}
                                                        name={profileData.full_name}
                                                        title={profileData.job_title || "System Architect"}
                                                    />
                                                </div>
                                            </SystemWindow>
                                            <SystemWindow title="ENCRYPTED TRANSMISSION" className="lg:col-span-3 shadow-premium" idLabel="SYS_ID: TRANSMIT">
                                                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 italic tracking-widest">Entity Signature</label>
                                                            <input type="text" placeholder="NAME / ORGANIZATION" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold italic shadow-inner" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 italic tracking-widest">Return Link</label>
                                                            <input type="email" placeholder="EMAIL ADDRESS" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold italic shadow-inner" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 italic tracking-widest">Raid Mission Data</label>
                                                        <textarea rows={6} placeholder="DESCRIBE YOUR OBJECTIVES IN THE SYSTEM..." className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold italic shadow-inner resize-none" />
                                                    </div>
                                                    <button className="btn-primary-system w-full py-5 !text-sm flex items-center justify-center gap-3">
                                                        <span>TRANSMIT ENCRYPTED DATA</span>
                                                        <Command size={18} />
                                                    </button>
                                                </form>
                                            </SystemWindow>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Footer System Status Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-8 py-3 z-[100] flex justify-between items-center shadow-2xl">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 text-[10px] font-black italic uppercase tracking-[0.2em] text-system-purple">
                        <div className="w-2.5 h-2.5 rounded-full bg-system-purple animate-pulse shadow-[0_0_10px_rgba(124,58,237,0.5)]" />
                        System Core: Fully Operational
                    </div>
                </div>
                <div className="flex items-center gap-6 text-[10px] font-black italic uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-2"><div className="w-1 h-1 bg-green-500 rounded-full" /> Latency: 12ms</span>
                    <span className="text-system-purple/60 opacity-50">Build: Final_Release</span>
                </div>
            </div>
        </main>
    )
}
