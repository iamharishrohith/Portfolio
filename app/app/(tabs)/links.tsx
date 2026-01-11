import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, RefreshControl, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PortfolioService } from '@/services/portfolioService';
import { Stack } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faLink, faPlus, faXmark, faSave, faTrash, faGlobe, faBook,
    faBriefcase, faGraduationCap, faTools, faThumbtack, faExternalLink,
    faSearch, faCopy
} from '@fortawesome/free-solid-svg-icons';
import { faGithub, faYoutube, faLinkedin, faStackOverflow } from '@fortawesome/free-brands-svg-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const CATEGORIES = [
    { id: 'all', label: 'All', icon: faGlobe },
    { id: 'work', label: 'Work', icon: faBriefcase },
    { id: 'learning', label: 'Learning', icon: faBook },
    { id: 'tools', label: 'Tools', icon: faTools },
    { id: 'general', label: 'General', icon: faLink },
];

const getLinkIcon = (url: string) => {
    const lower = url.toLowerCase();
    if (lower.includes('github')) return faGithub;
    if (lower.includes('youtube')) return faYoutube;
    if (lower.includes('linkedin')) return faLinkedin;
    if (lower.includes('stackoverflow')) return faStackOverflow;
    return faGlobe;
};

export default function QuickLinksScreen() {
    const [links, setLinks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [category, setCategory] = useState('general');
    const [isPinned, setIsPinned] = useState(false);

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = async () => {
        try {
            setLoading(true);
            const data = await PortfolioService.getQuickLinks();
            setLinks(data || []);
        } catch (error: any) {
            console.log('Links fetch error:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await fetchLinks();
        setRefreshing(false);
    };

    const handleSave = async () => {
        // Add https if missing
        let finalUrl = url;
        if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
            finalUrl = 'https://' + url;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
            await PortfolioService.upsertQuickLink({
                id: editingItem?.id,
                title,
                url: finalUrl,
                category,
                is_pinned: isPinned
            });

            setModalVisible(false);
            resetForm();
            fetchLinks();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert('Delete Link', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    try {
                        await PortfolioService.softDelete('quick_links', id);
                        fetchLinks();
                    } catch (e: any) {
                        Alert.alert("Error", e.message);
                    }
                }
            }
        ]);
    };

    const handleOpenLink = (link: any) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Linking.openURL(link.url);
    };

    const handleCopyLink = async (url: string) => {
        await Clipboard.setStringAsync(url);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('✓ Copied', 'Link copied to clipboard');
    };

    const togglePin = async (link: any) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        try {
            await PortfolioService.upsertQuickLink({
                ...link,
                is_pinned: !link.is_pinned
            });
            fetchLinks();
        } catch (e: any) {
            console.log(e);
        }
    };

    const openModal = (item: any = null) => {
        Haptics.selectionAsync();
        if (item) {
            setEditingItem(item);
            setTitle(item.title);
            setUrl(item.url);
            setCategory(item.category);
            setIsPinned(item.is_pinned);
        } else {
            resetForm();
        }
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingItem(null);
        setTitle('');
        setUrl('');
        setCategory('general');
        setIsPinned(false);
    };

    // Filter and search
    const filteredLinks = links.filter(link => {
        const matchesFilter = activeFilter === 'all' || link.category === activeFilter;
        const matchesSearch = link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            link.url.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const pinnedLinks = filteredLinks.filter(l => l.is_pinned);
    const regularLinks = filteredLinks.filter(l => !l.is_pinned);

    return (
        <SafeAreaView className="flex-1 bg-slate-950" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-6 pt-4 pb-4 border-b border-slate-800">
                <View className="flex-row justify-between items-center mb-4">
                    <View>
                        <Text className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">Quick Access</Text>
                        <Text className="text-2xl font-black text-white italic">LINKS</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => openModal()}
                        className="bg-blue-600 px-4 py-3 rounded-xl flex-row items-center"
                    >
                        <FontAwesomeIcon icon={faPlus} size={14} color="white" />
                        <Text className="text-white font-bold ml-2">ADD</Text>
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View className="flex-row items-center bg-slate-900 rounded-xl px-4 py-3 mb-4 border border-slate-800">
                    <FontAwesomeIcon icon={faSearch} size={14} color="#64748b" />
                    <TextInput
                        className="flex-1 text-white ml-3"
                        placeholder="Search links..."
                        placeholderTextColor="#64748b"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Category Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            onPress={() => {
                                Haptics.selectionAsync();
                                setActiveFilter(cat.id);
                            }}
                            className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${activeFilter === cat.id ? 'bg-blue-600' : 'bg-slate-900 border border-slate-800'
                                }`}
                        >
                            <FontAwesomeIcon
                                icon={cat.icon}
                                size={12}
                                color={activeFilter === cat.id ? 'white' : '#64748b'}
                            />
                            <Text className={`font-bold text-xs ml-2 ${activeFilter === cat.id ? 'text-white' : 'text-slate-500'
                                }`}>
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                className="flex-1 px-4 pt-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" colors={['#3B82F6']} />
                }
            >
                {/* Pinned Links */}
                {pinnedLinks.length > 0 && (
                    <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                            <FontAwesomeIcon icon={faThumbtack} size={12} color="#F59E0B" />
                            <Text className="text-amber-400 font-bold text-xs uppercase tracking-widest ml-2">Pinned</Text>
                        </View>
                        {pinnedLinks.map((link, idx) => (
                            <LinkCard
                                key={link.id}
                                link={link}
                                idx={idx}
                                onOpen={handleOpenLink}
                                onCopy={handleCopyLink}
                                onEdit={openModal}
                                onDelete={handleDelete}
                                onTogglePin={togglePin}
                            />
                        ))}
                    </View>
                )}

                {/* Regular Links */}
                {regularLinks.map((link, idx) => (
                    <LinkCard
                        key={link.id}
                        link={link}
                        idx={idx}
                        onOpen={handleOpenLink}
                        onCopy={handleCopyLink}
                        onEdit={openModal}
                        onDelete={handleDelete}
                        onTogglePin={togglePin}
                    />
                ))}

                {filteredLinks.length === 0 && !loading && (
                    <View className="items-center py-16 opacity-50">
                        <FontAwesomeIcon icon={faLink} size={48} color="#64748b" />
                        <Text className="text-slate-500 font-bold mt-4">No links found</Text>
                    </View>
                )}

                <View className="h-24" />
            </ScrollView>

            {/* Add/Edit Modal */}
            <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View className="flex-1 bg-slate-950/90 justify-end">
                    <View className="bg-slate-900 rounded-t-3xl border-t border-slate-800 max-h-[80%]">
                        <View className="p-6 border-b border-slate-800 flex-row justify-between items-center">
                            <Text className="text-xl font-black text-white italic">
                                {editingItem ? 'EDIT LINK' : 'NEW LINK'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <FontAwesomeIcon icon={faXmark} size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="p-6">
                            <View className="mb-4">
                                <Text className="text-slate-400 font-bold text-xs uppercase mb-2">Title</Text>
                                <TextInput
                                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold"
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholder="e.g. React Documentation"
                                    placeholderTextColor="#475569"
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-slate-400 font-bold text-xs uppercase mb-2">URL</Text>
                                <TextInput
                                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-blue-400"
                                    value={url}
                                    onChangeText={setUrl}
                                    placeholder="https://example.com"
                                    placeholderTextColor="#475569"
                                    autoCapitalize="none"
                                    keyboardType="url"
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-slate-400 font-bold text-xs uppercase mb-2">Category</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                                        <TouchableOpacity
                                            key={cat.id}
                                            onPress={() => setCategory(cat.id)}
                                            className={`px-4 py-2 rounded-lg border ${category === cat.id ? 'bg-blue-600 border-blue-600' : 'bg-slate-950 border-slate-800'
                                                }`}
                                        >
                                            <Text className={`font-bold text-sm ${category === cat.id ? 'text-white' : 'text-slate-500'}`}>
                                                {cat.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => setIsPinned(!isPinned)}
                                className={`flex-row items-center justify-between p-4 rounded-xl border mb-4 ${isPinned ? 'bg-amber-500/20 border-amber-500/50' : 'bg-slate-950 border-slate-800'
                                    }`}
                            >
                                <View className="flex-row items-center">
                                    <FontAwesomeIcon icon={faThumbtack} size={16} color={isPinned ? '#F59E0B' : '#64748b'} />
                                    <Text className={`font-bold ml-3 ${isPinned ? 'text-amber-400' : 'text-slate-500'}`}>
                                        Pin to Top
                                    </Text>
                                </View>
                                <View className={`w-6 h-6 rounded-full ${isPinned ? 'bg-amber-500' : 'bg-slate-800'}`} />
                            </TouchableOpacity>
                        </ScrollView>

                        <View className="p-6 border-t border-slate-800 pb-10">
                            <TouchableOpacity
                                onPress={handleSave}
                                className="bg-blue-600 w-full p-4 rounded-xl items-center flex-row justify-center"
                            >
                                <FontAwesomeIcon icon={faSave} size={20} color="white" />
                                <Text className="text-white font-black text-lg ml-2 italic">SAVE LINK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// Link Card Component
function LinkCard({ link, idx, onOpen, onCopy, onEdit, onDelete, onTogglePin }: any) {
    return (
        <Animated.View entering={FadeInUp.delay(idx * 30).springify()}>
            <TouchableOpacity
                onPress={() => onOpen(link)}
                onLongPress={() => onEdit(link)}
                className={`bg-slate-900 rounded-xl p-4 mb-3 border ${link.is_pinned ? 'border-amber-500/30' : 'border-slate-800'}`}
            >
                <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-xl bg-slate-800 items-center justify-center mr-3">
                        <FontAwesomeIcon icon={getLinkIcon(link.url)} size={18} color="#3B82F6" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white font-bold text-base" numberOfLines={1}>{link.title}</Text>
                        <Text className="text-slate-500 text-xs" numberOfLines={1}>{link.url}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                        <TouchableOpacity onPress={() => onCopy(link.url)} className="p-2">
                            <FontAwesomeIcon icon={faCopy} size={14} color="#64748b" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onTogglePin(link)} className="p-2">
                            <FontAwesomeIcon icon={faThumbtack} size={14} color={link.is_pinned ? '#F59E0B' : '#64748b'} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onDelete(link.id)} className="p-2">
                            <FontAwesomeIcon icon={faTrash} size={14} color="#EF4444" />
                        </TouchableOpacity>
                        <FontAwesomeIcon icon={faExternalLink} size={12} color="#64748b" />
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}
