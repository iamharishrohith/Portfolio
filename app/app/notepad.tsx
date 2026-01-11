import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Search, Plus, X, Save, Trash2, StickyNote, Pin, PinOff, ChevronRight } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';
import { PortfolioService } from '@/services/portfolioService';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function NotepadScreen() {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Data State
    const [notes, setNotes] = useState<any[]>([]);
    const [editingNote, setEditingNote] = useState<any>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isPinned, setIsPinned] = useState(false);

    const router = useRouter();

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const data = await PortfolioService.getNotes();
            setNotes(data || []);
        } catch (error: any) {
            console.log('Error fetching notes:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchNotes();
        setRefreshing(false);
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Note title is required');
            return;
        }

        setSaving(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
            const payload = {
                title,
                content,
                is_pinned: isPinned,
                id: editingNote?.id
            };

            await PortfolioService.upsertNote(payload);
            setModalVisible(false);
            resetForm();
            fetchNotes();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            'Delete Note',
            'This will archive the note. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await PortfolioService.softDelete('notes', id);
                            fetchNotes();
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    const handleTogglePin = async (note: any) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        try {
            await PortfolioService.upsertNote({
                ...note,
                is_pinned: !note.is_pinned
            });
            fetchNotes();
        } catch (error: any) {
            console.log('Pin toggle error', error);
        }
    };

    const openModal = (note: any = null) => {
        if (note) {
            setEditingNote(note);
            setTitle(note.title);
            setContent(note.content);
            setIsPinned(note.is_pinned);
        } else {
            resetForm();
        }
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingNote(null);
        setTitle('');
        setContent('');
        setIsPinned(false);
    };

    const filteredNotes = notes.filter(note =>
        note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pinnedNotes = filteredNotes.filter(n => n.is_pinned);
    const otherNotes = filteredNotes.filter(n => !n.is_pinned);

    return (
        <SafeAreaView className="flex-1 bg-slate-950" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="p-6 pt-2 pb-4 border-b border-slate-800 bg-slate-950">
                <View className="flex-row justify-between items-center mb-4">
                    <View>
                        <Text className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">System Logs</Text>
                        <Text className="text-2xl font-black text-white italic">NOTEPAD</Text>
                    </View>
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => openModal()}
                            className="bg-purple-600 px-4 py-2 rounded-lg flex-row items-center"
                        >
                            <Plus size={16} color="white" />
                            <Text className="text-white font-bold ml-2">NEW</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-800 rounded-lg">
                            <X size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Bar */}
                <View className="bg-slate-900 rounded-xl flex-row items-center px-4 border border-slate-800">
                    <Search size={20} color="#64748b" />
                    <TextInput
                        className="flex-1 p-4 text-white font-bold"
                        placeholder="Search logs..."
                        placeholderTextColor="#64748b"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <ScrollView
                className="flex-1 px-4 py-4"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A855F7" />}
            >
                {loading && !refreshing ? (
                    <ActivityIndicator color="#A855F7" className="mt-10" />
                ) : (
                    <>
                        {pinnedNotes.length > 0 && (
                            <View className="mb-6">
                                <View className="flex-row items-center gap-2 mb-3">
                                    <Pin size={12} color="#F59E0B" />
                                    <Text className="text-amber-400 text-xs font-bold uppercase tracking-widest">Pinned Logs</Text>
                                </View>
                                {pinnedNotes.map((note, i) => (
                                    <NoteCard key={note.id} note={note} onEdit={openModal} onDelete={handleDelete} onPin={handleTogglePin} index={i} />
                                ))}
                            </View>
                        )}

                        <View className="mb-6">
                            {pinnedNotes.length > 0 && (
                                <View className="flex-row items-center gap-2 mb-3">
                                    <StickyNote size={12} color="#94a3b8" />
                                    <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest">Recent Logs</Text>
                                </View>
                            )}
                            {otherNotes.map((note, i) => (
                                <NoteCard key={note.id} note={note} onEdit={openModal} onDelete={handleDelete} onPin={handleTogglePin} index={i} />
                            ))}
                        </View>

                        {filteredNotes.length === 0 && (
                            <View className="items-center py-10 opacity-50">
                                <Text className="text-slate-500 font-bold italic">Memory core empty. Start a new log.</Text>
                            </View>
                        )}
                    </>
                )}
                <View className="h-24" />
            </ScrollView>

            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <View className="flex-1 bg-slate-950/90 justify-end">
                        <View className="bg-slate-900 rounded-t-3xl border-t border-slate-800 max-h-[92%]">
                            <View className="p-6 border-b border-slate-800 flex-row justify-between items-center bg-slate-900 rounded-t-3xl">
                                <Text className="text-xl font-black text-white italic">{editingNote ? 'EDIT LOG' : 'NEW LOG'}</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}><X size={24} color="#64748b" /></TouchableOpacity>
                            </View>

                            <ScrollView className="flex-1 p-6">
                                <TextInput
                                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-black text-xl italic mb-4"
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholder="Log Title..."
                                    placeholderTextColor="#475569"
                                />
                                <TextInput
                                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 text-base leading-6 min-h-[300] text-start"
                                    multiline
                                    textAlignVertical="top"
                                    value={content}
                                    onChangeText={setContent}
                                    placeholder="Start documenting..."
                                    placeholderTextColor="#475569"
                                />

                                <TouchableOpacity
                                    onPress={() => setIsPinned(!isPinned)}
                                    className={`mt-4 p-4 rounded-xl border flex-row items-center justify-center gap-2 ${isPinned ? 'bg-amber-600/20 border-amber-500' : 'bg-slate-950 border-slate-800'}`}
                                >
                                    <Pin size={18} color={isPinned ? '#F59E0B' : '#64748b'} />
                                    <Text className={`font-bold ${isPinned ? 'text-amber-400' : 'text-slate-500'}`}>Pin to Top</Text>
                                </TouchableOpacity>
                            </ScrollView>

                            <View className="p-6 border-t border-slate-800 bg-slate-900" style={{ paddingBottom: Math.max(insets.bottom, 16) + 16 }}>
                                <TouchableOpacity onPress={handleSave} disabled={saving} className="bg-purple-600 w-full p-5 rounded-2xl items-center flex-row justify-center shadow-lg shadow-purple-900/20">
                                    <Save size={22} color="white" />
                                    <Text className="text-white font-black text-lg ml-3 italic">{saving ? 'UPLOADING...' : 'SAVE ENCRYPTED'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

function NoteCard({ note, onEdit, onDelete, onPin, index }: any) {
    return (
        <Animated.View entering={FadeInUp.delay(index * 50).duration(400)}>
            <TouchableOpacity
                onPress={() => onEdit(note)}
                className={`mb-4 bg-slate-900 border rounded-2xl p-4 ${note.is_pinned ? 'border-amber-500/30 shadow-lg shadow-amber-900/10' : 'border-slate-800'}`}
            >
                <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                        <Text className="text-lg font-black text-white italic mb-1 uppercase tracking-tighter" numberOfLines={1}>{note.title}</Text>
                        <Text className="text-slate-500 text-xs mb-3" numberOfLines={2}>{note.content || 'Empty log...'}</Text>
                        <Text className="text-slate-600 text-[9px] font-bold uppercase tracking-widest">
                            {new Date(note.created_at).toLocaleDateString()} • {note.content?.length || 0} characters
                        </Text>
                    </View>
                    <View className="flex-row gap-2 ml-4">
                        <TouchableOpacity onPress={() => onPin(note)} className={`p-2 rounded-lg ${note.is_pinned ? 'bg-amber-900/20' : 'bg-slate-800'}`}>
                            {note.is_pinned ? <PinOff size={16} color="#F59E0B" /> : <Pin size={16} color="#64748b" />}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onDelete(note.id)} className="p-2 bg-red-900/20 rounded-lg">
                            <Trash2 size={16} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}
