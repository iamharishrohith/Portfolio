import { PortfolioData } from '../lib/data-access'
import { validateEnv } from '../lib/env-check'
import PortfolioClient from '../components/PortfolioClient'

export const dynamic = 'force-dynamic'

async function getData() {
    try {
        const [
            profile,
            projects,
            experiences,
            skills,
            certifications,
            education,
            achievements,
            roles,
            testimonials
        ] = await Promise.all([
            PortfolioData.getProfile(),
            PortfolioData.getProjects(),
            PortfolioData.getExperiences(),
            PortfolioData.getSkills(),
            PortfolioData.getCertifications(),
            PortfolioData.getEducation(),
            PortfolioData.getAchievements(),
            PortfolioData.getRoles(),
            PortfolioData.getTestimonials()
        ])

        return {
            profile: profile || null,
            projects: projects?.map((p, i) => ({
                id: p.id,
                raid_id: `SUPA-${100 + i}`,
                title: p.title,
                description: p.description,
                difficulty: p.is_featured ? "S" : "A",
                tags: p.tech_stack || ["React", "Supabase"],
                reward: "Deployed",
                github_link: p.github_url || "#",
                live_link: p.demo_url || "#"
            })) || [],
            experiences: experiences || [],
            skills: skills || [],
            certifications: certifications || [],
            education: education || [],
            achievements: achievements || [],
            roles: roles?.length > 0 ? roles.map(r => r.role_name) : [],
            testimonials: testimonials || []
        }
    } catch (error) {
        console.error("Supabase SSR Fetch Error:", error)
        return {
            education: [],
            certifications: [],
            achievements: [],
            roles: [],
            testimonials: []
        }
    }
}

export default async function Page() {
    validateEnv()
    const data = await getData()

    return (
        <PortfolioClient
            initialProfile={data.profile}
            projects={data.projects}
            experiences={data.experiences}
            skills={data.skills}
            education={data.education}
            certifications={data.certifications}
            achievements={data.achievements}
            roles={data.roles}
            testimonials={data.testimonials}
        />
    )
}
