import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import ArticleClient from '@/components/ArticleClient'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function generateMetadata({ params }) {
    const { data: article } = await supabase
        .from('articles')
        .select('title, excerpt, cover_image')
        .eq('slug', params.slug)
        .single()

    if (!article) {
        return { title: 'Article Not Found' }
    }

    return {
        title: article.title,
        description: article.excerpt,
        openGraph: {
            title: article.title,
            description: article.excerpt,
            images: article.cover_image ? [article.cover_image] : [],
        },
    }
}

async function getArticle(slug) {
    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

    if (error || !data) {
        return null
    }

    // Increment view count (fire and forget)
    supabase.rpc('increment_article_views', { article_id: data.id }).catch(() => { })

    return data
}

async function getRelatedArticles(currentId, tags) {
    const { data } = await supabase
        .from('articles')
        .select('id, title, slug, excerpt, cover_image, reading_time')
        .eq('is_published', true)
        .neq('id', currentId)
        .overlaps('tags', tags || [])
        .limit(3)

    return data || []
}

export default async function ArticlePage({ params }) {
    const article = await getArticle(params.slug)

    if (!article) {
        notFound()
    }

    const relatedArticles = await getRelatedArticles(article.id, article.tags)

    return <ArticleClient article={article} relatedArticles={relatedArticles} />
}
