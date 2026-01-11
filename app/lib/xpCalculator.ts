import { supabase } from './supabase';

// XP Calculation System for 100 Levels
// Tiers: 1-10 (100xp), 11-20 (200xp)... 91-100 (1000xp)
// Total XP to Max: 55,000

export const MAX_LEVEL = 100;

export const XP_PER_SKILL_PERCENT = 5;        // skill.level × 5 (80% skill = 400 XP)
export const XP_PER_PROJECT = 50;              // Each project
export const XP_PER_FEATURED_PROJECT = 75;     // Featured project bonus
export const XP_PER_CERTIFICATION = 100;       // Each cert
export const XP_PER_EXPERIENCE = 75;           // Each experience
export const XP_PER_ACHIEVEMENT = 100;          // Each achievement
export const XP_PER_COURSE_PROGRESS = 0.5;     // course.progress × 0.5
export const XP_PER_HABIT_STREAK = 2;          // Each streak day

// Calculate XP needed for a specific level (XP required to complete that level)
export function getXpForLevel(level: number): number {
    if (level < 1) return 100;
    if (level > MAX_LEVEL) return 0; // Max level reached

    // Tiered progression: 
    // Levels 1-10: 100
    // Levels 11-20: 200
    // ...
    // Levels 91-100: 1000
    const tier = Math.floor((level - 1) / 10) + 1;
    return tier * 100;
}

// Calculate level from total XP
export function getLevelFromXp(totalXp: number): { level: number; currentXp: number; nextLevelXp: number } {
    let level = 1;
    let xpUsed = 0;

    while (level < MAX_LEVEL) {
        const xpNeeded = getXpForLevel(level);

        if (xpUsed + xpNeeded > totalXp) {
            break;
        }

        xpUsed += xpNeeded;
        level++;
    }

    const nextLevelXp = getXpForLevel(level);
    const currentXp = Math.floor(totalXp - xpUsed);

    return {
        level,
        currentXp: Math.max(0, currentXp),
        nextLevelXp
    };
}

// Generate the full XP Table (User Requested)
export function generateXpTable(): { level: number; xpPerLevel: number; totalXpRequired: number }[] {
    const table = [];
    let runningTotal = 0;

    for (let i = 1; i <= MAX_LEVEL; i++) {
        const xp = getXpForLevel(i);
        table.push({
            level: i,
            xpPerLevel: xp,
            totalXpRequired: runningTotal // XP needed to REACH this level start (for accumulated view)
        });
        runningTotal += xp;
    }
    return table;
}

// Calculate Rank based on level (S-Rank System)
export function getRankFromLevel(level: number): string {
    if (level < 10) return 'E';
    if (level < 25) return 'D';
    if (level < 45) return 'C';
    if (level < 65) return 'B';
    if (level < 85) return 'A';
    return 'S';
}

// Calculate total XP from all data sources
export async function calculateTotalXp(): Promise<{
    totalXp: number;
    breakdown: {
        skills: number;
        projects: number;
        certifications: number;
        experiences: number;
        achievements: number;
        courses: number;
        habits: number;
    };
}> {
    const defaultBreakdown = { skills: 0, projects: 0, certifications: 0, experiences: 0, achievements: 0, courses: 0, habits: 0 };

    try {
        // Fetch all data with individual try-catches to handle missing tables
        let skillsData: any[] = [];
        let projectsData: any[] = [];
        let certsData: any[] = [];
        let expData: any[] = [];
        let achievementsData: any[] = [];
        let coursesData: any[] = [];
        let habitsData: any[] = [];

        // Skills
        try {
            const { data } = await supabase.from('skills').select('level');
            skillsData = data || [];
        } catch (e) { console.log('Skills table error'); }

        // Projects
        try {
            const { data } = await supabase.from('projects').select('is_featured');
            projectsData = data || [];
        } catch (e) { console.log('Projects table error'); }

        // Certifications
        try {
            const { data } = await supabase.from('certifications').select('id');
            certsData = data || [];
        } catch (e) { console.log('Certifications table error'); }

        // Experiences (may not exist)
        try {
            const { data, error } = await supabase.from('experiences').select('id');
            if (!error) expData = data || [];
        } catch (e) { console.log('Experiences table not found - skipping'); }

        // Achievements
        try {
            const { data, error } = await supabase.from('achievements').select('id').is('archived_at', null).eq('is_published', true);
            if (!error) achievementsData = data || [];
        } catch (e) { console.log('Achievements table error'); }

        // Courses
        try {
            const { data } = await supabase.from('courses').select('progress');
            coursesData = data || [];
        } catch (e) { console.log('Courses table error'); }

        // Habits
        try {
            const { data } = await supabase.from('habits').select('streak');
            habitsData = data || [];
        } catch (e) { console.log('Habits table error'); }

        // Calculate XP from each source with safe defaults
        const skillsXp = skillsData.reduce((acc, s) => {
            const level = Number(s?.level) || 0;
            return acc + (level * XP_PER_SKILL_PERCENT);
        }, 0);

        const projectsXp = projectsData.reduce((acc, p) => {
            return acc + (p?.is_featured ? XP_PER_FEATURED_PROJECT : XP_PER_PROJECT);
        }, 0);

        const certsXp = (certsData.length || 0) * XP_PER_CERTIFICATION;

        const expXp = (expData.length || 0) * XP_PER_EXPERIENCE;

        const achievementsXp = (achievementsData.length || 0) * XP_PER_ACHIEVEMENT;

        const coursesXp = coursesData.reduce((acc, c) => {
            const progress = Number(c?.progress) || 0;
            return acc + Math.floor(progress * XP_PER_COURSE_PROGRESS);
        }, 0);

        const habitsXp = habitsData.reduce((acc, h) => {
            const streak = Number(h?.streak) || 0;
            return acc + (streak * XP_PER_HABIT_STREAK);
        }, 0);

        // Ensure all values are valid numbers
        const totalXp = Math.max(0,
            (isNaN(skillsXp) ? 0 : skillsXp) +
            (isNaN(projectsXp) ? 0 : projectsXp) +
            (isNaN(certsXp) ? 0 : certsXp) +
            (isNaN(expXp) ? 0 : expXp) +
            (isNaN(achievementsXp) ? 0 : achievementsXp) +
            (isNaN(coursesXp) ? 0 : coursesXp) +
            (isNaN(habitsXp) ? 0 : habitsXp)
        );

        return {
            totalXp,
            breakdown: {
                skills: isNaN(skillsXp) ? 0 : skillsXp,
                projects: isNaN(projectsXp) ? 0 : projectsXp,
                certifications: isNaN(certsXp) ? 0 : certsXp,
                experiences: isNaN(expXp) ? 0 : expXp,
                achievements: isNaN(achievementsXp) ? 0 : achievementsXp,
                courses: isNaN(coursesXp) ? 0 : coursesXp,
                habits: isNaN(habitsXp) ? 0 : habitsXp,
            }
        };
    } catch (error) {
        console.log('XP Calculation error:', error);
        return { totalXp: 0, breakdown: defaultBreakdown };
    }
}

// Sync profile with calculated XP
export async function syncProfileXp(): Promise<{ level: number; xp: number; rank: string } | null> {
    try {
        const { totalXp } = await calculateTotalXp();
        const { level, currentXp, nextLevelXp } = getLevelFromXp(totalXp);
        const rank = getRankFromLevel(level);

        // Update profile
        const { data: profile } = await supabase.from('profiles').select('id').single();
        if (profile) {
            await supabase.from('profiles').update({
                level,
                xp: currentXp,
                rank,
                total_xp: totalXp
            }).eq('id', profile.id);
        }

        return { level, xp: currentXp, rank };
    } catch (error) {
        console.log('Sync profile XP error:', error);
        return null;
    }
}

// Skill icon mapping for FontAwesome (EXPANDED)
export const SKILL_ICONS: { [key: string]: string } = {
    // Languages
    'javascript': 'fa-brands fa-js',
    'typescript': 'fa-brands fa-js',
    'python': 'fa-brands fa-python',
    'java': 'fa-brands fa-java',
    'php': 'fa-brands fa-php',
    'c': 'fa-solid fa-c',
    'c++': 'fa-solid fa-code',
    'c#': 'fa-brands fa-microsoft',
    'swift': 'fa-brands fa-swift',
    'kotlin': 'fa-brands fa-android',
    'go': 'fa-brands fa-golang',
    'rust': 'fa-solid fa-gear',
    'dart': 'fa-solid fa-bullseye',
    'ruby': 'fa-solid fa-gem',
    'scala': 'fa-solid fa-s',
    'r': 'fa-solid fa-r',
    'sql': 'fa-solid fa-database',

    // Frontend Frameworks
    'react': 'fa-brands fa-react',
    'vue': 'fa-brands fa-vuejs',
    'angular': 'fa-brands fa-angular',
    'svelte': 'fa-solid fa-fire',
    'next.js': 'fa-solid fa-n',
    'nextjs': 'fa-solid fa-n',
    'nuxt': 'fa-brands fa-vuejs',
    'gatsby': 'fa-solid fa-g',

    // Web Technologies
    'html': 'fa-brands fa-html5',
    'css': 'fa-brands fa-css3-alt',
    'sass': 'fa-brands fa-sass',
    'tailwind': 'fa-solid fa-wind',
    'bootstrap': 'fa-brands fa-bootstrap',

    // Backend Frameworks
    'node': 'fa-brands fa-node-js',
    'nodejs': 'fa-brands fa-node-js',
    'node.js': 'fa-brands fa-node-js',
    'express': 'fa-brands fa-node-js',
    'django': 'fa-brands fa-python',
    'flask': 'fa-brands fa-python',
    'fastapi': 'fa-brands fa-python',
    'laravel': 'fa-brands fa-laravel',
    'spring': 'fa-solid fa-leaf',
    'rails': 'fa-solid fa-gem',

    // Databases
    'mongodb': 'fa-solid fa-leaf',
    'mysql': 'fa-solid fa-database',
    'postgresql': 'fa-solid fa-database',
    'firebase': 'fa-solid fa-fire',
    'supabase': 'fa-solid fa-bolt',
    'redis': 'fa-solid fa-layer-group',
    'graphql': 'fa-solid fa-diagram-project',

    // Cloud & DevOps
    'aws': 'fa-brands fa-aws',
    'azure': 'fa-brands fa-microsoft',
    'gcp': 'fa-brands fa-google',
    'docker': 'fa-brands fa-docker',
    'kubernetes': 'fa-solid fa-dharmachakra',
    'jenkins': 'fa-brands fa-jenkins',
    'terraform': 'fa-solid fa-cubes',

    // Version Control
    'git': 'fa-brands fa-git-alt',
    'github': 'fa-brands fa-github',
    'gitlab': 'fa-brands fa-gitlab',
    'bitbucket': 'fa-brands fa-bitbucket',

    // Design Tools
    'figma': 'fa-brands fa-figma',
    'sketch': 'fa-brands fa-sketch',
    'adobe xd': 'fa-solid fa-pen-nib',
    'photoshop': 'fa-solid fa-image',
    'adobe photoshop': 'fa-solid fa-image',
    'illustrator': 'fa-solid fa-pen-ruler',
    'adobe illustrator': 'fa-solid fa-pen-ruler',
    'after effects': 'fa-solid fa-film',
    'adobe after effects': 'fa-solid fa-film',
    'ae': 'fa-solid fa-film',
    'premiere pro': 'fa-solid fa-video',
    'adobe premiere pro': 'fa-solid fa-video',
    'premiere': 'fa-solid fa-video',
    'affinity designer': 'fa-solid fa-bezier-curve',
    'affinity photo': 'fa-solid fa-camera',
    'affinity': 'fa-solid fa-bezier-curve',
    'canva': 'fa-solid fa-palette',
    'blender': 'fa-solid fa-cube',

    // Office & Productivity
    'ms office': 'fa-brands fa-microsoft',
    'microsoft office': 'fa-brands fa-microsoft',
    'word': 'fa-solid fa-file-word',
    'excel': 'fa-solid fa-file-excel',
    'powerpoint': 'fa-solid fa-file-powerpoint',
    'outlook': 'fa-solid fa-envelope',
    'notion': 'fa-solid fa-note-sticky',
    'trello': 'fa-brands fa-trello',
    'slack': 'fa-brands fa-slack',
    'jira': 'fa-brands fa-jira',

    // AI/ML
    'tensorflow': 'fa-solid fa-brain',
    'pytorch': 'fa-solid fa-fire-flame-curved',
    'machine learning': 'fa-solid fa-robot',
    'ml': 'fa-solid fa-robot',
    'ai': 'fa-solid fa-brain',
    'openai': 'fa-solid fa-robot',
    'chatgpt': 'fa-solid fa-message',

    // Blockchain & Web3
    'blockchain': 'fa-solid fa-link',
    'ethereum': 'fa-brands fa-ethereum',
    'solidity': 'fa-brands fa-ethereum',
    'web3': 'fa-solid fa-globe',
    'bitcoin': 'fa-brands fa-bitcoin',
    'crypto': 'fa-solid fa-coins',

    // Mobile
    'react native': 'fa-brands fa-react',
    'flutter': 'fa-solid fa-mobile-screen',
    'android': 'fa-brands fa-android',
    'ios': 'fa-brands fa-apple',
    'expo': 'fa-solid fa-e',

    // Other Tools
    'linux': 'fa-brands fa-linux',
    'npm': 'fa-brands fa-npm',
    'yarn': 'fa-brands fa-yarn',
    'webpack': 'fa-solid fa-box',
    'vite': 'fa-solid fa-bolt',
    'postman': 'fa-solid fa-paper-plane',
    'vs code': 'fa-solid fa-code',
    'vscode': 'fa-solid fa-code',
    'vim': 'fa-solid fa-terminal',

    // Vibe Coding Tools
    'antigravity': 'fa-solid fa-rocket',
    'v0': 'fa-solid fa-wand-magic-sparkles',
    'orchids': 'fa-solid fa-seedling',
    'mgx': 'fa-solid fa-microchip',
    'cursor': 'fa-solid fa-i-cursor',
    'copilot': 'fa-solid fa-robot',

    // Default
    'default': 'fa-solid fa-code',
};

// Get icon for a skill name
export function getSkillIcon(skillName: string): string {
    const normalized = skillName.toLowerCase().trim();
    return SKILL_ICONS[normalized] || SKILL_ICONS['default'];
}

// Skill categories for organization
export const SKILL_CATEGORIES = [
    'Languages',      // JavaScript, Python, C, etc.
    'Frameworks',     // React, Next.js, etc.
    'Tools',          // Figma, VS Code, MS Office, etc.
    'Databases',      // MongoDB, MySQL, Firebase, etc.
    'DevOps',         // Docker, AWS, Git, etc.
    'Design',         // Photoshop, Illustrator, Affinity, etc.
    'Mobile',         // React Native, Android, iOS
    'Vibe Coding',    // Antigravity, V0, Orchids, MGX
];

