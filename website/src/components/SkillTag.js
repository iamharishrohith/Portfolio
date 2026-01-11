import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { PortfolioData } from '@/lib/data-access';
import { cn } from '@/lib/utils'; // Assuming cn exists, usually does in shadcn/projects

export default function SkillTag({ skill, iconClass, playHover, playClick }) {
    const [count, setCount] = useState(skill.endorsement_count || 0);
    const [endorsed, setEndorsed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleEndorse = async (e) => {
        e.stopPropagation();
        if (endorsed) return;

        setEndorsed(true);
        setCount(c => c + 1);
        if (playClick) playClick(); // Trigger sound

        try {
            await PortfolioData.endorseSkill(skill.id);
        } catch (err) {
            console.error("Endorsement failed", err);
            setCount(c => c - 1); // Revert
            setEndorsed(false);
        }
    };

    return (
        <div
            className="group inline-flex items-center bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden transition-all hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 mr-2 mb-2"
            onMouseEnter={() => {
                setIsHovered(true);
                if (playHover) playHover();
            }}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span className="px-3 py-1.5 text-xs font-black italic text-slate-700 dark:text-slate-300 uppercase tracking-wider group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center gap-2">
                {iconClass && <i className={`${iconClass} text-sm`} />}
                {skill.name}
            </span>
            <button
                onClick={handleEndorse}
                className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 border-l border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all active:scale-95",
                    endorsed ? "text-red-500" : "text-slate-400 hover:text-red-500"
                )}
                title="Endorse this skill"
            >
                <Heart
                    size={10}
                    className={cn(
                        "transition-transform duration-300",
                        endorsed ? "fill-current scale-110" : "group-hover:scale-110",
                        isHovered && !endorsed && "animate-pulse"
                    )}
                />
                <span className="text-[9px] font-black tabular-nums leading-none">{count}</span>
            </button>
        </div>
    );
}
