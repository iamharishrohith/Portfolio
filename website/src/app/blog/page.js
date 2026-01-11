import { createClient } from '@supabase/supabase-js'
import BlogClient from '@/components/BlogClient'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export const metadata = {
    title: 'Blog',
    description: 'Tech articles, tutorials, and insights from a System Architect',
}

async function getArticles() {
    const { data, error } = await supabase
        .from('articles')
        .select('id, title, slug, excerpt, cover_image, tags, reading_time, published_at, views')
        .eq('is_published', true)
        .is('archived_at', null)
        .order('published_at', { ascending: false })

    if (error) {
        console.error('Error fetching articles:', error)
        return []
    }

    return data || []
}

export default async function BlogPage() {
    const articles = await getArticles()

    return <BlogClient articles={articles} />
}
