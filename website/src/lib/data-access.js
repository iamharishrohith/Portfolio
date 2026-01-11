import { supabase } from './supabase';

export const PortfolioData = {
    async getProfile() {
        const { data, error } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, level, xp, job_title, rank, title, email, phone, bio, portfolio_url, likes, total_views, coding_stats')
            .single();
        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
        return data;
    },

    async incrementLikes() {
        const { error } = await supabase.rpc('increment_likes');
        if (error) {
            console.error('Error incrementing likes:', error);
            throw error;
        }
    },

    async incrementViews() {
        const { error } = await supabase.rpc('increment_profile_views');
        if (error) {
            console.error('Error incrementing views:', error);
        }
    },

    async getProjects() {
        const { data, error } = await supabase
            .from('projects')
            .select('id, title, description, tech_stack, github_url, demo_url, is_featured, case_study_content, metrics')
            .eq('is_published', true)
            .is('archived_at', null)
            .order('order_index', { ascending: true });
        if (error) {
            console.error('Error fetching projects:', error);
            return [];
        }
        return data;
    },

    async getExperiences() {
        const { data, error } = await supabase
            .from('experiences')
            .select('id, title, company, type, start_date, end_date, is_current, description, technologies')
            .eq('is_published', true)
            .is('archived_at', null)
            .order('order_index', { ascending: true });
        if (error) {
            console.error('Error fetching experiences:', error);
            return [];
        }
        return data;
    },

    async getSkills() {
        const { data, error } = await supabase
            .from('skills')
            .select('id, name, level, category, description, icon_name, endorsement_count')
            .eq('is_published', true)
            .is('archived_at', null)
            .order('order_index', { ascending: true });
        if (error) {
            console.error('Error fetching skills:', error);
            return [];
        }
        return data;
    },

    async getCertifications() {
        const { data, error } = await supabase
            .from('certifications')
            .select('id, title, issuer, date')
            .eq('is_published', true)
            .is('archived_at', null)
            .order('order_index', { ascending: true });
        if (error) {
            console.error('Error fetching certifications:', error);
            return [];
        }
        return data;
    },

    async getEducation() {
        const { data, error } = await supabase
            .from('education')
            .select('id, degree, institution, year, status, specialization')
            .eq('is_published', true)
            .is('archived_at', null)
            .order('order_index', { ascending: true });
        if (error) {
            console.error('Error fetching education:', error);
            return [];
        }
        return data;
    },

    async getAchievements() {
        const { data, error } = await supabase
            .from('achievements')
            .select('id, title, description')
            .eq('is_published', true)
            .order('order_index', { ascending: true });
        if (error) {
            console.error('Error fetching achievements:', error);
            return [];
        }
        return data;
    },

    async getRoles() {
        const { data, error } = await supabase
            .from('roles')
            .select('role_name')
            .order('order_index', { ascending: true });
        if (error) {
            console.error('Error fetching roles:', error);
            return [];
        }
        return data;
    },

    async getTestimonials() {
        const { data, error } = await supabase
            .from('testimonials')
            .select('id, author_name, author_title, author_company, author_avatar, author_linkedin, content, rating, project_name, is_featured')
            .eq('is_published', true)
            .is('archived_at', null)
            .order('order_index', { ascending: true });
        if (error) {
            console.error('Error fetching testimonials:', error);
            return [];
        }
        return data;
    },

    async endorseSkill(skillId) {
        // Insert public endorsement with anonymous name by default
        const { error } = await supabase
            .from('skill_endorsements')
            .insert({
                skill_id: skillId,
                endorser_name: 'Anonymous Hunter',
                is_verified: false
            });

        if (error) {
            console.error('Error endorsing skill:', error);
            throw error;
        }
    },

    async trackEvent(eventType, eventData = {}) {
        try {
            const { error } = await supabase
                .from('analytics_events')
                .insert({
                    event_type: eventType,
                    event_data: eventData,
                    page_path: typeof window !== 'undefined' ? window.location.pathname : null,
                    referrer: typeof document !== 'undefined' ? document.referrer : null,
                    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                });
            if (error) console.error('Analytics error:', error);
        } catch (e) {
            // Silently fail - analytics shouldn't break the app
        }
    }
};
