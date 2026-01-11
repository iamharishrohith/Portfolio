import { z } from 'zod';

export const SkillSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    category: z.string().min(2, 'Category is required'),
    level: z.number().min(0).max(100),
    description: z.string().optional(),
    icon_name: z.string().default('Code2'),
    is_published: z.boolean().default(true),
    order_index: z.number().default(0),
});

export const ProjectSchema = z.object({
    title: z.string().min(2, 'Title is required'),
    description: z.string().min(10, 'Description should be more detailed'),
    tech_stack: z.array(z.string()).default([]),
    github_url: z.string().url().optional().or(z.literal('')),
    demo_url: z.string().url().optional().or(z.literal('')),
    deadline: z.string().optional(),
    case_study_content: z.string().optional(),
    metrics: z.record(z.string()).optional(),
    is_featured: z.boolean().default(false),
    is_published: z.boolean().default(true),
    order_index: z.number().default(0),
});

export const CertificationSchema = z.object({
    title: z.string().min(2, 'Title is required'),
    issuer: z.string().min(2, 'Issuer is required'),
    date: z.string().optional(),
    is_published: z.boolean().default(true),
    order_index: z.number().default(0),
});

export const ExperienceSchema = z.object({
    title: z.string().min(2, 'Title is required'),
    company: z.string().min(2, 'Company is required'),
    type: z.enum(['work', 'volunteer', 'internship']).default('work'),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    is_current: z.boolean().default(false),
    description: z.string().optional(),
    technologies: z.array(z.string()).default([]),
    is_published: z.boolean().default(true),
    order_index: z.number().default(0),
});

export const CourseSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(2, "Title is required"),
    platform: z.string().optional(),
    progress: z.number().min(0).max(100).default(0),
    is_completed: z.boolean().default(false),
    is_published: z.boolean().default(true),
    order_index: z.number().int().default(0),
});

export const EducationSchema = z.object({
    id: z.string().uuid().optional(),
    degree: z.string().min(2, "Degree is required"),
    institution: z.string().min(2, "Institution is required"),
    year: z.string().optional(),
    status: z.string().optional(),
    specialization: z.string().optional(),
    is_published: z.boolean().default(true),
    order_index: z.number().int().default(0),
});

export const HackathonSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(2, "Title is required"),
    description: z.string().optional(),
    date: z.string().optional(),
    status: z.enum(['upcoming', 'ongoing', 'completed']).default('upcoming'),
    is_published: z.boolean().default(true),
});

export const EventSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(2, "Title is required"),
    description: z.string().optional(),
    event_date: z.string(),
    event_time: z.string().optional(),
    category: z.string().default('personal'),
    color: z.string().optional(),
    is_deadline: z.boolean().default(false),
    is_published: z.boolean().default(true),
});

export const HabitSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(2, "Title is required"),
    category: z.string().default('personal'),
    last_completed_at: z.string().optional(),
    is_published: z.boolean().default(true),
});

export const NoteSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(1, "Title is required").default("Untitled Note"),
    content: z.string().default(""),
    is_pinned: z.boolean().default(false),
    is_published: z.boolean().default(true),
});

export const QuickLinkSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(2, "Title is required"),
    url: z.string().url("Invalid URL"),
    category: z.string().default('general'),
    is_pinned: z.boolean().default(false),
    is_published: z.boolean().default(true),
});

// Phase 2 Schemas
export const ArticleSchema = z.object({
    id: z.string().uuid().optional(),
    slug: z.string().min(3, "Slug is required"),
    title: z.string().min(5, "Title must be at least 5 characters"),
    excerpt: z.string().optional(),
    content: z.string().optional(),
    cover_image: z.string().url().optional().or(z.literal('')),
    published_at: z.string().optional(),
    is_published: z.boolean().default(false),
    is_featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    views: z.number().default(0),
    reading_time: z.number().default(0),
});

export const TestimonialSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(2, "Name is required"),
    role: z.string().optional(),
    company: z.string().optional(),
    content: z.string().min(10, "Content must be at least 10 characters"),
    rating: z.number().min(1).max(5).default(5),
    image_url: z.string().url().optional().or(z.literal('')),
    is_featured: z.boolean().default(false),
    is_approved: z.boolean().default(false),
    created_at: z.string().optional(),
});

export type Education = z.infer<typeof EducationSchema>;
export type Course = z.infer<typeof CourseSchema>;
export type Event = z.infer<typeof EventSchema>;
export type Habit = z.infer<typeof HabitSchema>;
export type QuickLink = z.infer<typeof QuickLinkSchema>;
export type Hackathon = z.infer<typeof HackathonSchema>;
export type Note = z.infer<typeof NoteSchema>;
export type Article = z.infer<typeof ArticleSchema>;
export type Testimonial = z.infer<typeof TestimonialSchema>;
