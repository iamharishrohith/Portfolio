import { supabase } from '../lib/supabase';
import {
    SkillSchema, ProjectSchema, CertificationSchema, ExperienceSchema,
    CourseSchema, EducationSchema, EventSchema, HabitSchema, QuickLinkSchema, HackathonSchema,
    ArticleSchema, TestimonialSchema
} from '../lib/schemas';
import type {
    Skill, Project, Certification, Experience,
    Course, Education, Event, Habit, QuickLink, Hackathon,
    Article, Testimonial
} from '../lib/schemas';
import { syncProfileXp } from '../lib/xpCalculator';

export const PortfolioService = {
    // Generic helper for fetching data
    async fetchData<T>(table: string, orderColumn: string = 'order_index', ascending: boolean = true) {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .is('archived_at', null)
            .order(orderColumn, { ascending });
        if (error) throw error;
        return data as T[];
    },

    // Generic helper for upserting data with validation
    async upsertData<T>(table: string, schema: any, payload: any) {
        const validated = schema.parse(payload);
        // Note: Profiles access usually requires id matching auth.uid()
        // We assume the user_id column enforcement on other tables.

        const { data, error } = await supabase
            .from(table)
            .upsert({ ...validated, id: payload.id })
            .select()
            .single();

        if (error) throw error;

        // Automation: Sync XP after changes
        syncProfileXp().catch(e => console.log('XP Sync Error:', e));

        return data as T;
    },

    // Skills
    async getSkills() { return this.fetchData<Skill>('skills'); },
    async upsertSkill(skill: Partial<Skill> & { id?: string }) {
        return this.upsertData<Skill>('skills', SkillSchema, skill);
    },

    // Projects
    async getProjects() { return this.fetchData<Project>('projects'); },
    async upsertProject(project: Partial<Project> & { id?: string }) {
        return this.upsertData<Project>('projects', ProjectSchema, project);
    },

    // Articles (NEW)
    async getArticles() { return this.fetchData<Article>('articles', 'published_at', false); },
    async getArticle(slug: string) {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('slug', slug)
            .single();
        if (error) throw error;
        return data as Article;
    },
    async upsertArticle(article: Partial<Article> & { id?: string }) {
        return this.upsertData<Article>('articles', ArticleSchema, article);
    },

    // Testimonials (NEW)
    async getTestimonials() { return this.fetchData<Testimonial>('testimonials', 'created_at', false); },
    async upsertTestimonial(t: Partial<Testimonial> & { id?: string }) {
        return this.upsertData<Testimonial>('testimonials', TestimonialSchema, t);
    },

    // Certifications
    async getCertifications() { return this.fetchData<Certification>('certifications'); },
    async upsertCertification(cert: Partial<Certification> & { id?: string }) {
        return this.upsertData<Certification>('certifications', CertificationSchema, cert);
    },

    // Education
    async getEducation() { return this.fetchData<Education>('education'); },
    async upsertEducation(edu: Partial<Education> & { id?: string }) {
        return this.upsertData<Education>('education', EducationSchema, edu);
    },

    // Experiences
    async getExperiences() { return this.fetchData<Experience>('experiences'); },
    async upsertExperience(exp: Partial<Experience> & { id?: string }) {
        return this.upsertData<Experience>('experiences', ExperienceSchema, exp);
    },

    // Courses
    async getCourses() { return this.fetchData<Course>('courses'); },
    async upsertCourse(course: Partial<Course> & { id?: string }) {
        return this.upsertData<Course>('courses', CourseSchema, course);
    },
    async updateCourseStatus(id: string, is_completed: boolean) {
        const { error } = await supabase
            .from('courses')
            .update({ is_completed })
            .eq('id', id);
        if (error) throw error;
    },

    // Events
    async getEvents() { return this.fetchData<Event>('events', 'event_date'); },
    async upsertEvent(event: Partial<Event> & { id?: string }) {
        return this.upsertData<Event>('events', EventSchema, event);
    },

    // Habits
    async getHabits() { return this.fetchData<Habit>('habits'); },
    async upsertHabit(habit: Partial<Habit> & { id?: string }) {
        return this.upsertData<Habit>('habits', HabitSchema, habit);
    },

    // Hackathons
    async getHackathons() { return this.fetchData<Hackathon>('hackathons'); },
    async upsertHackathon(hackathon: Partial<Hackathon> & { id?: string }) {
        return this.upsertData<Hackathon>('hackathons', HackathonSchema, hackathon);
    },

    // Quick Links
    async getQuickLinks() { return this.fetchData<QuickLink>('quick_links'); },
    async upsertQuickLink(link: Partial<QuickLink> & { id?: string }) {
        return this.upsertData<QuickLink>('quick_links', QuickLinkSchema, link);
    },

    // Notes
    async getNotes() { return this.fetchData<Note>('notes', 'created_at', false); },
    async upsertNote(note: Partial<Note> & { id?: string }) {
        return this.upsertData<Note>('notes', NoteSchema, note);
    },

    // Achievements
    async getAchievements() {
        const { data, error } = await supabase
            .from('achievements')
            .select('*')
            .is('archived_at', null)
            .order('order_index', { ascending: true });
        if (error) throw error;
        return data;
    },
    async upsertAchievement(achievement: any) {
        const { data, error } = await supabase
            .from('achievements')
            .upsert({ ...achievement })
            .select()
            .single();
        if (error) throw error;

        // Sync XP
        syncProfileXp().catch(e => console.log('XP Sync Error:', e));

        return data;
    },

    // Roles
    async getRoles() {
        const { data, error } = await supabase
            .from('roles')
            .select('*')
            .is('archived_at', null)
            .order('order_index', { ascending: true });
        if (error) throw error;
        return data;
    },
    async upsertRole(role: any) {
        const { data, error } = await supabase
            .from('roles')
            .upsert({ ...role })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Soft Delete
    async softDelete(table: string, id: string) {
        const { error } = await supabase
            .from(table)
            .update({ archived_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;

        // Automation: Sync XP after changes
        syncProfileXp().catch(e => console.log('XP Sync Error:', e));
    },

    // Bulk operations
    async bulkUpdateCategory(table: string, ids: string[], category: string) {
        const { error } = await supabase
            .from(table)
            .update({ category })
            .in('id', ids);
        if (error) throw error;
    }
};
