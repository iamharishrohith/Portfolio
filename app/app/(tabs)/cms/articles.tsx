import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PortfolioService } from '@/services/portfolioService';
import { FileText, Plus, X, Save, Trash2, Eye, Clock, Image as ImageIcon, CheckCircle } from 'lucide-react-native';
import { Stack } from 'expo-router';

export default function ArticlesManager() {
    const insets = useSafeAreaInsets();
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingArticle, setEditingArticle] = useState<any>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [tags, setTags] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [isFeatured, setIsFeatured] = useState(false);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const data = await PortfolioService.getArticles();
            setArticles(data || []);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!title || !slug) {
            Alert.alert('Error', 'Title and Slug are required');
            return;
        }

        const articleData = {
            title,
            slug,
            excerpt,
            content,
            cover_image: coverImage || null,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            is_published: isPublished,
            is_featured: isFeatured,
        };

        try {
            await PortfolioService.upsertArticle({
                ...articleData,
                id: editingArticle?.id
            });

            setModalVisible(false);
            resetForm();
            fetchArticles();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleDelete = async (id) => {
        Alert.alert(
            'Delete Article',
            'Are you sure you want to delete this article? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await PortfolioService.softDelete('articles', id);
                            fetchArticles();
                        } catch (error) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    const openModal = (article = null) => {
        if (article) {
            setEditingArticle(article);
            setTitle(article.title);
            setSlug(article.slug);
            setExcerpt(article.excerpt || '');
            setContent(article.content || '');
            setCoverImage(article.cover_image || '');
            setTags(article.tags?.join(', ') || '');
            setIsPublished(article.is_published);
            setIsFeatured(article.is_featured);
        } else {
            resetForm();
        }
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingArticle(null);
        setTitle('');
        setSlug('');
        setExcerpt('');
        setContent('');
        setCoverImage('');
        setTags('');
        setIsPublished(false);
        setIsFeatured(false);
    };

    // Auto-generate slug from title if slug is empty
    const handleTitleChange = (text) => {
        setTitle(text);
        if (!editingArticle && !slug) {
            setSlug(text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-950">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="p-6 pt-2 pb-4 border-b border-slate-800 bg-slate-950">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">System Logs</Text>
                        <Text className="text-2xl font-black text-white italic">ARTICLES</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => openModal()}
                        className="bg-purple-600 px-4 py-2 rounded-lg flex-row items-center"
                    >
                        <Plus size={16} color="white" />
                        <Text className="text-white font-bold ml-2">WRITE</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-4 py-4">
                {loading ? (
                    <ActivityIndicator color="#A855F7" className="mt-10" />
                ) : (
                    articles.map((item) => (
                        <View key={item.id} className="mb-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
                            <View className="flex-row justify-between items-start mb-2">
                                <View className="flex-1 pr-4">
                                    <View className="flex-row items-center gap-2 mb-1">
                                        {item.is_featured && (
                                            <View className="px-1.5 py-0.5 bg-purple-900/40 rounded border border-purple-500/40">
                                                <Text className="text-purple-400 text-[9px] font-bold uppercase">Featured</Text>
                                            </View>
                                        )}
                                        {!item.is_published && (
                                            <View className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">
                                                <Text className="text-slate-400 text-[9px] font-bold uppercase">Draft</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text className="text-lg font-black text-white italic leading-tight">{item.title}</Text>
                                </View>
                                <View className="flex-row gap-2">
                                    <TouchableOpacity
                                        onPress={() => openModal(item)}
                                        className="p-2 bg-slate-800 rounded-lg"
                                    >
                                        <FileText size={16} color="#94a3b8" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDelete(item.id)}
                                        className="p-2 bg-red-900/20 rounded-lg"
                                    >
                                        <Trash2 size={16} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text className="text-slate-500 text-xs mb-3 font-medium leading-5" numberOfLines={2}>
                                {item.excerpt || 'No excerpt'}
                            </Text>

                            <View className="flex-row items-center gap-4 border-t border-slate-800 pt-3 mt-1">
                                <View className="flex-row items-center gap-1.5">
                                    <Eye size={12} color="#64748b" />
                                    <Text className="text-slate-500 text-[10px] font-bold">{item.views || 0} Views</Text>
                                </View>
                                <View className="flex-row items-center gap-1.5">
                                    <Clock size={12} color="#64748b" />
                                    <Text className="text-slate-500 text-[10px] font-bold">{item.reading_time || 0} min</Text>
                                </View>
                            </View>
                        </View>
                    ))
                )}
                <View className="h-24" />
            </ScrollView>

            {/* Edit/Add Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    className="flex-1"
                >
                    <View className="flex-1 bg-slate-950/90 justify-end">
                        <View className="bg-slate-900 rounded-t-3xl border-t border-slate-800 h-[85%] w-full overflow-hidden">
                            <View className="p-6 border-b border-slate-800 flex-row justify-between items-center bg-slate-900 z-10">
                                <Text className="text-xl font-black text-white italic">
                                    {editingArticle ? 'EDIT LOG' : 'NEW LOG'}
                                </Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 -mr-2">
                                    <X size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                className="flex-1 px-6"
                                contentContainerStyle={{ paddingBottom: 100, paddingTop: 24 }}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >
                                <View className="space-y-6">
                                    <View>
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Title</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold text-lg h-16"
                                            value={title}
                                            onChangeText={handleTitleChange}
                                            placeholder="Article Title..."
                                            placeholderTextColor="#475569"
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Slug (URL)</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-400 font-mono text-sm h-14"
                                            value={slug}
                                            onChangeText={setSlug}
                                            placeholder="article-slug-url"
                                            placeholderTextColor="#475569"
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Excerpt</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-medium text-base h-24"
                                            value={excerpt}
                                            onChangeText={setExcerpt}
                                            placeholder="Brief summary..."
                                            placeholderTextColor="#475569"
                                            multiline
                                            textAlignVertical="top"
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Content (Markdown)</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-medium text-base h-72"
                                            value={content}
                                            onChangeText={setContent}
                                            placeholder="# Heading\n\nWrite your article content here..."
                                            placeholderTextColor="#475569"
                                            multiline
                                            textAlignVertical="top"
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Cover Image URL</Text>
                                        <View className="relative">
                                            <View className="absolute left-5 top-5 z-10">
                                                <ImageIcon size={18} color="#64748b" />
                                            </View>
                                            <TextInput
                                                className="bg-slate-950 border border-slate-800 rounded-2xl pl-14 p-4 text-white text-base h-16"
                                                value={coverImage}
                                                onChangeText={setCoverImage}
                                                placeholder="https://..."
                                                placeholderTextColor="#475569"
                                                autoCapitalize="none"
                                            />
                                        </View>
                                    </View>

                                    <View>
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Tags (comma separated)</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-base h-16"
                                            value={tags}
                                            onChangeText={setTags}
                                            placeholder="React, Architecture, System Design..."
                                            placeholderTextColor="#475569"
                                        />
                                    </View>

                                    <View className="flex-row gap-4 pt-2">
                                        <TouchableOpacity
                                            onPress={() => setIsPublished(!isPublished)}
                                            className={`flex-1 flex-row items-center p-5 rounded-2xl border ${isPublished ? 'bg-green-900/20 border-green-500' : 'bg-slate-950 border-slate-800'}`}
                                        >
                                            <View className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${isPublished ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}>
                                                {isPublished && <CheckCircle size={14} color="white" />}
                                            </View>
                                            <Text className={`font-bold text-base ${isPublished ? 'text-green-400' : 'text-slate-400'}`}>Published</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => setIsFeatured(!isFeatured)}
                                            className={`flex-1 flex-row items-center p-5 rounded-2xl border ${isFeatured ? 'bg-purple-900/20 border-purple-500' : 'bg-slate-950 border-slate-800'}`}
                                        >
                                            <View className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${isFeatured ? 'bg-purple-500 border-purple-500' : 'border-slate-600'}`}>
                                                {isFeatured && <CheckCircle size={14} color="white" />}
                                            </View>
                                            <Text className={`font-bold text-base ${isFeatured ? 'text-purple-400' : 'text-slate-400'}`}>Featured</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </ScrollView>

                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
                            >
                                <View className="p-6 border-t border-slate-800 bg-slate-900 pb-8">
                                    <TouchableOpacity
                                        onPress={handleSave}
                                        className="bg-purple-600 w-full p-4 rounded-2xl items-center flex-row justify-center shadow-lg shadow-purple-900/20"
                                    >
                                        <Save size={20} color="white" />
                                        <Text className="text-white font-black text-lg ml-3 italic">SAVE LOG</Text>
                                    </TouchableOpacity>
                                </View>
                            </KeyboardAvoidingView>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}
