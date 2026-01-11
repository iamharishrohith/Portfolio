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
    Music,
    Headphones
} from "lucide-react"
import { SystemWindow, StatBar, SystemNotification } from "./system-ui"
import { cn } from "@/lib/utils"
import { useGameState } from "../hooks/use-game-state"
import { useSoundFx } from "../hooks/use-sound-fx"

// Fallback data if props fail (should match structure of props)
const defaultProfile = {
    full_name: "Harish Rohith",
    level: 1,
    xp: 0,
    job_title: "System Architect",
    bio: "System initialization sequence complete.",
}

export default function PortfolioClient({
    initialProfile,
    projects = [],
    experiences = [],
    skills = [],
    education = [],
    certifications = [],
    achievements = [],
    roles: dbRoles = []
}) {
    // Use props or fallback
    const profileData = initialProfile || defaultProfile

    // Hooks
    const { level, xp, awakened, setAwakened, addXp } = useGameState(profileData)
    const {
        playHover,
        playClick,
        playLevelUp,
        playBoot,
        stopBoot,
        playBgm,
        stopBgm,
        isMuted,
        isMusicMuted,
        toggleMute,
        toggleMusic
    } = useSoundFx()

    const [showNotification, setShowNotification] = useState(false)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const [roleIndex, setRoleIndex] = useState(0)
    const [displayText, setDisplayText] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)
    const [likeCount, setLikeCount] = useState(profileData.likes || 0)
    const [darkMode, setDarkMode] = useState(true)

    const getDevicon = (name = "") => {
        const lower = name.toLowerCase()
        if (lower.includes('next')) return 'devicon-nextjs-plain'
        if (lower.includes('react')) return 'devicon-react-original colored'
        if (lower.includes('node')) return 'devicon-nodejs-plain colored'
        if (lower.includes('tailwind')) return 'devicon-tailwindcss-plain colored'
        if (lower.includes('sql') || lower.includes('db') || lower.includes('postgres') || lower.includes('supabase')) return 'devicon-postgresql-plain colored'
        if (lower.includes('graph')) return 'devicon-graphql-plain colored'
        if (lower.includes('fire')) return 'devicon-firebase-plain colored'
        if (lower.includes('dock')) return 'devicon-docker-plain colored'
        if (lower.includes('git')) return 'devicon-github-original colored'
        if (lower.includes('js') || lower.includes('javascript')) return 'devicon-javascript-plain colored'
        if (lower.includes('ts') || lower.includes('typescript')) return 'devicon-typescript-plain colored'
        if (lower.includes('nativ')) return 'devicon-react-original colored'
        if (lower.includes('html')) return 'devicon-html5-plain colored'
        if (lower.includes('css')) return 'devicon-css3-plain colored'
        if (lower.includes('python')) return 'devicon-python-plain colored'
        if (lower.includes('java') && !lower.includes('script')) return 'devicon-java-plain colored'
        if (lower.includes('c++') || lower.includes('cpp')) return 'devicon-cplusplus-plain colored'
        if (lower.includes('aws') || lower.includes('amazon')) return 'devicon-amazonwebservices-plain-wordmark colored'
        if (lower.includes('google') || lower.includes('gcp')) return 'devicon-googlecloud-plain colored'
        if (lower.includes('figma')) return 'devicon-figma-plain colored'
        if (lower.includes('mui') || lower.includes('material')) return 'devicon-materialui-plain colored'
        if (lower.includes('boot')) return 'devicon-bootstrap-plain colored'
        if (lower.includes('mongo')) return 'devicon-mongodb-plain colored'
        if (lower.includes('redis')) return 'devicon-redis-plain colored'
        if (lower.includes('express')) return 'devicon-express-original'
        return null
    }

    const roles = dbRoles.length > 0
        ? dbRoles
        : initialProfile?.job_title
            ? [initialProfile.job_title, "Full Stack Developer", "Mobile Architect"]
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
            // Start boot loop immediately during loading
            // Note: If this fails due to autoplay, it will trigger on first interaction
            playBoot()

            const timer = setTimeout(() => {
                setAwakened(true)
                stopBoot() // Stop loop after loading
                setShowNotification(true)
                setTimeout(() => setShowNotification(false), 5000)
            }, 5000) // Extended to 5s for cinematic feel
            return () => {
                clearTimeout(timer)
                stopBoot()
            }
        }
    }, [awakened, playBoot, stopBoot])

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
                    <div className="relative w-full">
                        {/* Sticky Navigation */}
                        <div className="fixed top-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-100 dark:border-slate-800 rounded-full z-[150] shadow-2xl flex items-center gap-8 hidden md:flex">
                            {[
                                { id: 'home', label: 'Home' },
                                { id: 'status', label: 'Status' },
                                { id: 'shadows', label: 'Experience' },
                                { id: 'quests', label: 'Raids' },
                                { id: 'skills', label: 'Skills' },
                                { id: 'contact', label: 'Comms' }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => { document.getElementById(item.id).scrollIntoView({ behavior: 'smooth' }); playClick(); }}
                                    className="text-[9px] font-black uppercase tracking-widest italic text-slate-400 hover:text-system-purple transition-colors"
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* Main Content Sections */}
                        <div className="max-w-5xl mx-auto px-6 py-20 space-y-40">

                            {/* Hero / Home Section */}
                            <section id="home" className="pt-20 space-y-20">
                                {/* System Header Branding */}
                                <div className="relative z-10 w-full flex justify-center mb-6">
                                    <div className="text-base md:text-lg font-black tracking-[0.6em] text-system-purple uppercase border-b-2 border-system-purple/50 pb-4 px-12 drop-shadow-[0_0_10px_rgba(124,58,237,0.5)]">MONARCH SYSTEM</div>
                                </div>

                                <div className="flex flex-col items-center text-center space-y-12">
                                    {/* Avatar with Rank */}
                                    <div className="w-48 h-48 relative group">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-system-purple to-blue-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                        <div className="relative w-full h-full p-1 bg-white dark:bg-slate-950 rounded-[2.5rem] border-2 border-system-purple/30 overflow-hidden">
                                            <img
                                                src={profileData.avatar_url || "https://github.com/shadcn.png"}
                                                alt={profileData.full_name}
                                                className="w-full h-full object-cover rounded-[2.2rem] grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
                                            />
                                            <div className="absolute top-4 right-4 bg-system-purple text-white px-2 py-0.5 text-[9px] font-black italic rounded shadow-lg">RANK: S</div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h1 className="text-6xl md:text-9xl font-black tracking-tighter italic uppercase">
                                            {profileData.full_name?.split(' ')[0]} <span className="text-system-purple">{profileData.full_name?.split(' ')[1]}</span>
                                        </h1>
                                        <div className="flex items-center justify-center gap-4 text-[12px] md:text-[14px] font-black uppercase tracking-[0.5em] text-slate-400 italic">
                                            <Sparkles size={16} className="text-system-purple" />
                                            {displayText}
                                            <span className="animate-blink text-system-purple">|</span>
                                        </div>
                                    </div>

                                    <p className="max-w-2xl mx-auto text-sm md:text-base text-slate-500 font-medium italic leading-relaxed uppercase tracking-wider">
                                        "{profileData.bio || 'System initialization complete. Architect potential detected.'}"
                                    </p>

                                    <div className="flex flex-wrap items-center justify-center gap-8 pt-8">
                                        <button onClick={() => { document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }); playClick(); }} className="px-10 py-4 bg-system-purple text-white text-[11px] font-black uppercase italic tracking-widest rounded-2xl shadow-2xl shadow-system-purple/20 hover:scale-105 active:scale-95 transition-all">
                                            Initialize Comms
                                        </button>
                                        <button onClick={() => { playClick(); }} className="px-10 py-4 bg-slate-100 dark:bg-slate-900 text-[11px] font-black uppercase italic tracking-widest rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                                            Download Resume
                                        </button>
                                        <button
                                            onClick={async () => {
                                                setLikeCount(prev => prev + 1);
                                                playClick();
                                                try {
                                                    const { PortfolioData } = await import("../lib/data-access");
                                                    await PortfolioData.incrementLikes();
                                                } catch (err) { console.error(err); }
                                            }}
                                            className="flex items-center gap-4 px-8 py-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-red-500/50 transition-colors group"
                                        >
                                            <Heart size={20} className={cn("transition-colors", likeCount > 0 ? "fill-red-500 text-red-500" : "text-slate-300 group-hover:text-red-500")} />
                                            <span className="text-xs font-black italic">{likeCount}</span>
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* Status Section */}
                            <motion.section
                                id="status"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-12"
                            >
                                <SystemWindow title="Core Attributes" idLabel="SYS_ID: ATTR">
                                    <div className="space-y-6">
                                        <StatBar label="System Architecture" value={98} />
                                        <StatBar label="Backend Logic" value={94} />
                                        <StatBar label="AI Core" value={92} />
                                        <StatBar label="Cloud Integration" value={90} />
                                        <StatBar label="Frontend Mastery" value={96} />
                                    </div>
                                </SystemWindow>

                                <div className="space-y-12">
                                    <SystemWindow title="Progress Level">
                                        <div className="space-y-8">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[11px] font-black text-system-purple uppercase italic tracking-widest">Global Level</span>
                                                <span className="text-5xl font-black italic text-black dark:text-white">{level}</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden shadow-inner">
                                                <motion.div initial={{ width: 0 }} whileInView={{ width: `${xp}%` }} transition={{ duration: 1.5 }} className="h-full bg-system-purple shadow-[0_0_15px_rgba(124,58,237,0.5)]" />
                                            </div>
                                            <button onClick={handleAction} className="w-full py-5 text-[11px] font-black uppercase italic tracking-[0.4em] bg-system-purple/5 text-system-purple rounded-2xl hover:bg-system-purple hover:text-white transition-all shadow-sm">
                                                Initiate Training
                                            </button>
                                        </div>
                                    </SystemWindow>

                                    <SystemWindow title="Academic Log">
                                        <div className="space-y-6">
                                            {(education || []).map((edu, idx) => (
                                                <div key={idx} className="flex justify-between items-center group border-b border-slate-50 dark:border-slate-900 pb-4 last:border-0 last:pb-0">
                                                    <div className="space-y-1">
                                                        <div className="text-[11px] font-black italic text-slate-800 dark:text-white uppercase tracking-wider">{edu.degree}</div>
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{edu.institution}</div>
                                                    </div>
                                                    <div className="text-[10px] font-black text-system-purple bg-system-purple/5 px-3 py-1 rounded-lg capitalize">{edu.year}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </SystemWindow>
                                </div>
                            </motion.section>

                            {/* Experience Section */}
                            <motion.section
                                id="shadows"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="space-y-12"
                            >
                                <div className="text-center space-y-3">
                                    <h3 className="text-3xl font-black italic uppercase tracking-[0.3em] text-black dark:text-white">Experience Chronology</h3>
                                    <div className="w-24 h-1 bg-system-purple mx-auto rounded-full shadow-[0_0_10px_rgba(124,58,237,0.5)]" />
                                </div>
                                <div className="space-y-8">
                                    {(experiences || []).map((job, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ x: -20, opacity: 0 }}
                                            whileInView={{ x: 0, opacity: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                            viewport={{ once: true, margin: "-100px" }}
                                        >
                                            <SystemWindow title={job.title} idLabel={job.company}>
                                                <div className="flex flex-col md:flex-row justify-between gap-8 py-2">
                                                    <div className="flex-1 space-y-6">
                                                        <p className="text-sm text-slate-500 font-medium uppercase italic leading-loose tracking-wide">{job.description}</p>
                                                        <div className="flex flex-wrap gap-3">
                                                            {job.technologies?.map(tech => (
                                                                <span key={tech} className="px-4 py-1.5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 text-[10px] font-black italic text-system-purple uppercase rounded-xl shadow-sm hover:border-system-purple transition-colors">
                                                                    {tech}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="text-[11px] font-black text-slate-400 uppercase italic tracking-widest text-right whitespace-nowrap bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded-xl self-start">
                                                        {job.start_date} - {job.end_date || 'Present'}
                                                    </div>
                                                </div>
                                            </SystemWindow>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.section>

                            {/* Projects Section */}
                            <motion.section
                                id="quests"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="space-y-16"
                            >
                                <div className="text-center space-y-3">
                                    <h3 className="text-3xl font-black italic uppercase tracking-[0.3em] text-black dark:text-white">Raid Expeditions</h3>
                                    <div className="w-24 h-1 bg-system-purple mx-auto rounded-full shadow-[0_0_10px_rgba(124,58,237,0.5)]" />
                                </div>
                                <div className="grid grid-cols-1 gap-14">
                                    {(projects || []).map((quest, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ scale: 0.95, opacity: 0 }}
                                            whileInView={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.5 }}
                                            viewport={{ once: true }}
                                        >
                                            <SystemWindow title={`RAID #${quest.raid_id || i + 100}`}>
                                                <div className="flex flex-col lg:flex-row gap-12 items-start py-4">
                                                    <div className="w-full lg:w-[360px] shrink-0">
                                                        <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-900 shadow-2xl group cursor-pointer">
                                                            <img
                                                                src={`/api/og-project?title=${encodeURIComponent(quest.title)}&tags=${encodeURIComponent(quest.tags?.join(',') || '')}&rank=${quest.difficulty}`}
                                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                                alt={quest.title}
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                                            <div className="absolute bottom-6 left-6 px-4 py-1.5 bg-red-600 text-white text-[11px] font-black italic uppercase rounded-xl shadow-2xl shadow-red-600/40">RANK {quest.difficulty}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 space-y-8">
                                                        <div className="space-y-4">
                                                            <h4 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-black dark:text-white">{quest.title}</h4>
                                                            <p className="text-sm md:text-base text-slate-500 font-medium italic leading-relaxed uppercase tracking-tighter">{quest.description}</p>
                                                        </div>
                                                        <div className="flex flex-wrap gap-3">
                                                            {quest.tags?.map(tag => (
                                                                <span key={tag} className="px-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[10px] font-black italic uppercase text-system-purple rounded-xl shadow-sm">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <div className="flex flex-wrap justify-between items-center pt-8 border-t border-slate-100 dark:border-slate-800 gap-6">
                                                            <div className="text-[11px] font-black text-slate-400 uppercase italic tracking-widest">
                                                                Cleared Reward: <span className="text-yellow-600 drop-shadow-[0_0_8px_rgba(202,138,4,0.3)]">{quest.reward || "Architect XP"}</span>
                                                            </div>
                                                            <a href={quest.live_link} target="_blank" className="flex items-center gap-3 px-6 py-2.5 bg-system-purple text-white text-[11px] font-black italic uppercase tracking-widest rounded-xl hover:scale-105 transition-transform" rel="noreferrer">
                                                                Enter Gate <ExternalLink size={16} />
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </SystemWindow>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.section>

                            {/* Skills Section */}
                            <motion.section
                                id="skills"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="space-y-16"
                            >
                                <div className="text-center space-y-3">
                                    <h3 className="text-3xl font-black italic uppercase tracking-[0.3em] text-black dark:text-white">Arsenal & Abilities</h3>
                                    <div className="w-24 h-1 bg-system-purple mx-auto rounded-full shadow-[0_0_10px_rgba(124,58,237,0.5)]" />
                                </div>
                                <SystemWindow>
                                    <div className="space-y-24 py-8">
                                        {Object.entries(
                                            (skills || []).reduce((acc, skill) => {
                                                const cat = skill.category || "Tactical";
                                                if (!acc[cat]) acc[cat] = [];
                                                acc[cat].push(skill);
                                                return acc;
                                            }, {})
                                        ).map(([category, items]) => (
                                            <div key={category} className="space-y-12">
                                                <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.6em] italic text-center opacity-80">{category}</h4>
                                                <div className="flex flex-wrap justify-center gap-6">
                                                    {items.map((skill, i) => {
                                                        const devicon = getDevicon(skill?.name)
                                                        return (
                                                            <motion.div
                                                                key={i}
                                                                whileHover={{ scale: 1.05 }}
                                                                className="group relative flex items-center gap-4 px-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-system-purple transition-all duration-300 shadow-sm"
                                                            >
                                                                {devicon && <i className={cn(devicon, "text-2xl")} />}
                                                                <div className="flex flex-col">
                                                                    <span className="text-[11px] font-black italic uppercase tracking-wider">{skill.name}</span>
                                                                    <span className="text-[8px] font-bold text-system-purple uppercase tracking-widest">Lv.{skill.level || 99}</span>
                                                                </div>
                                                            </motion.div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </SystemWindow>
                            </motion.section>

                            {/* Certifications Section */}
                            <motion.section
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="space-y-12"
                            >
                                <div className="text-center space-y-3">
                                    <h3 className="text-2xl font-black italic uppercase tracking-[0.3em] text-black dark:text-white">Recognition & Trophies</h3>
                                    <div className="w-20 h-1 bg-system-purple mx-auto rounded-full" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {(certifications || []).map((cert, i) => {
                                        const Icon = { Network, Code2, Layout, Target, Database }[cert.icon_name] || Award
                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                viewport={{ once: true }}
                                                className="flex gap-5 p-8 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[2rem] hover:border-system-purple transition-all shadow-premium group"
                                            >
                                                <div className="p-4 bg-system-purple/5 rounded-2xl text-system-purple self-start shadow-inner"><Icon size={28} /></div>
                                                <div className="space-y-2">
                                                    <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest italic">{cert.issuer}</div>
                                                    <h4 className="text-base font-black italic text-slate-900 dark:text-white uppercase leading-tight">{cert.title}</h4>
                                                    <div className="text-[10px] font-black text-system-purple uppercase bg-system-purple/10 px-3 py-1.5 rounded-xl inline-block mt-3 tracking-widest shadow-sm">{cert.date}</div>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </motion.section>

                            {/* Contact Section */}
                            <motion.section
                                id="contact"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="space-y-16"
                            >
                                <div className="text-center space-y-3">
                                    <h3 className="text-3xl font-black italic uppercase tracking-[0.3em] text-black dark:text-white">Encrypted Comms</h3>
                                    <div className="w-24 h-1 bg-system-purple mx-auto rounded-full shadow-[0_0_10px_rgba(124,58,237,0.5)]" />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                                    <div className="lg:col-span-2 space-y-10">
                                        <SystemWindow title="Channel Info">
                                            <div className="space-y-10 py-4">
                                                <h5 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Global <br /><span className="text-system-purple">Uplink</span></h5>
                                                <div className="pt-10 border-t border-slate-100 dark:border-slate-900 space-y-8">
                                                    <a href="mailto:iamharishrohith@gmail.com" className="flex items-center gap-6 group cursor-pointer">
                                                        <div className="w-16 h-16 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 group-hover:bg-system-purple tooltip group-hover:text-white transition-all shadow-sm"><Mail size={26} /></div>
                                                        <div className="space-y-1">
                                                            <div className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest italic">Direct Line</div>
                                                            <div className="text-base font-black italic text-slate-900 dark:text-white group-hover:text-system-purple transition-colors">iamharishrohith@gmail.com</div>
                                                        </div>
                                                    </a>
                                                    <div className="flex gap-4">
                                                        <a href="https://github.com" className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:text-system-purple transition-all"><Github size={20} /></a>
                                                        <a href="https://linkedin.com" className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:text-system-purple transition-all"><Linkedin size={20} /></a>
                                                    </div>
                                                </div>
                                            </div>
                                        </SystemWindow>
                                    </div>
                                    <div className="lg:col-span-3">
                                        <SystemWindow title="New Transmission">
                                            <form className="space-y-8 py-4" onSubmit={(e) => e.preventDefault()}>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Identity</label>
                                                        <input type="text" placeholder="IDENTITY SIGNATURE" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl px-6 py-5 text-[11px] font-black italic uppercase shadow-inner focus:border-system-purple transition-colors" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Relay</label>
                                                        <input type="email" placeholder="RELAY LINK" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl px-6 py-5 text-[11px] font-black italic uppercase shadow-inner focus:border-system-purple transition-colors" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Objective</label>
                                                    <textarea rows={6} placeholder="MISSION OBJECTIVES..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl px-6 py-5 text-[11px] font-black italic uppercase shadow-inner resize-none focus:border-system-purple transition-colors" />
                                                </div>
                                                <button className="w-full py-6 bg-system-purple text-white text-[12px] font-black tracking-[0.4em] uppercase italic rounded-[1.8rem] shadow-2xl shadow-system-purple/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4">
                                                    Transmit Signal <Command size={22} />
                                                </button>
                                            </form>
                                        </SystemWindow>
                                    </div>
                                </div>
                            </motion.section>

                            {/* Footer Spacing */}
                            <div className="h-20" />
                        </div>

                        {/* Footer System Status Bar */}
                        <div className="fixed bottom-0 left-0 w-full bg-white/80 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-900 px-8 py-4 z-[100] flex justify-between items-center shadow-2xl">
                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-3 text-[11px] font-black italic uppercase tracking-[0.3em] text-system-purple">
                                    <div className="w-3 h-3 rounded-full bg-system-purple animate-pulse shadow-[0_0_15px_rgba(124,58,237,0.5)]" />
                                    System Core: Active
                                </div>
                                <div className="hidden sm:flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    <Sun size={12} className={cn("cursor-pointer hover:text-system-purple transition-colors", !darkMode && "text-system-purple")} onClick={() => setDarkMode(false)} />
                                    <div className="w-[1px] h-3 bg-slate-200 dark:bg-slate-800" />
                                    <Moon size={12} className={cn("cursor-pointer hover:text-system-purple transition-colors", darkMode && "text-system-purple")} onClick={() => setDarkMode(true)} />
                                </div>
                            </div>
                            <div className="flex items-center gap-8 text-[11px] font-black italic uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> 12ms</span>
                                <span className="hidden md:inline text-system-purple/60 opacity-50">Build: V4._FINAL</span>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    )
}
