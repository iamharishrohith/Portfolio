import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { PortfolioService } from '@/services/portfolioService';
import { Check, RefreshCw, Plus, PieChart, Code, Briefcase, Trash2 } from 'lucide-react-native';
import { FloatingHome } from '@/components/FloatingHome';
import * as Haptics from 'expo-haptics';

type Segment = 'schedule' | 'goals' | 'hackathons' | 'projects';

// Skeleton Loader Component
const SkeletonItem = () => (
    <View className="bg-slate-900 rounded-xl p-4 mb-3 animate-pulse">
        <View className="flex-row items-center">
            <View className="w-6 h-6 rounded bg-slate-800 mr-4" />
            <View className="flex-1">
                <View className="h-4 bg-slate-800 rounded w-3/4 mb-2" />
                <View className="h-3 bg-slate-800 rounded w-1/2" />
            </View>
        </View>
    </View>
);

export default function TrackerScreen() {
    const [activeSegment, setActiveSegment] = useState<Segment>('schedule');
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [newItemText, setNewItemText] = useState('');
    const [newItemExtra, setNewItemExtra] = useState('');
    const [newItemDate, setNewItemDate] = useState('');
    const [newItemStatus, setNewItemStatus] = useState<'upcoming' | 'ongoing' | 'completed'>('upcoming');

    useEffect(() => {
        fetchData();
    }, [activeSegment]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let data: any[] = [];
            if (activeSegment === 'schedule' || activeSegment === 'goals') {
                const habits = await PortfolioService.getHabits();
                if (activeSegment === 'schedule') {
                    data = habits.filter(h => h.category === 'schedule');
                } else {
                    data = habits.filter(h => h.category !== 'schedule');
                }
                const today = new Date().toDateString();
                data = data.map((h: any) => ({
                    ...h,
                    is_completed: h.last_completed_at ? new Date(h.last_completed_at).toDateString() === today : false
                }));
            } else if (activeSegment === 'hackathons') {
                data = await PortfolioService.getHackathons();
            } else if (activeSegment === 'projects') {
                data = await PortfolioService.getProjects();
            }
            setItems(data || []);
        } catch (e: any) {
            console.log("Error fetching tracker data:", e.message);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await fetchData();
        setRefreshing(false);
    };

    const handleSegmentPress = (segment: Segment) => {
        Haptics.selectionAsync();
        setActiveSegment(segment);
    };

    const addItem = async () => {
        if (!newItemText) return;
        try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (activeSegment === 'hackathons') {
                await PortfolioService.upsertHackathon({
                    title: newItemText,
                    description: newItemExtra,
                    status: newItemStatus,
                    date: newItemDate
                });
            } else if (activeSegment === 'projects') {
                await PortfolioService.upsertProject({
                    title: newItemText,
                    description: newItemExtra
                });
            } else {
                // Habits
                await PortfolioService.upsertHabit({
                    title: newItemText,
                    category: activeSegment === 'schedule' ? 'schedule' : 'personal'
                });
            }
            setNewItemText('');
            setNewItemExtra('');
            setNewItemDate('');
            setModalVisible(false);
            fetchData();
        } catch (e: any) {
            Alert.alert("Error", e.message);
        }
    };

    const toggleHabit = async (item: any) => {
        if (activeSegment === 'hackathons' || activeSegment === 'projects') return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const newStatus = !item.is_completed;
        const now = new Date().toISOString();

        // Optimistic UI
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_completed: newStatus } : i));

        try {
            await PortfolioService.upsertHabit({
                ...item,
                last_completed_at: newStatus ? now : null
            });
        } catch (e: any) {
            // Revert on error
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_completed: !newStatus } : i));
            Alert.alert("Error", e.message);
        }
    };

    const handleDelete = async (item: any) => {
        Alert.alert('Delete Entry', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    try {
                        let table = 'habits';
                        if (activeSegment === 'hackathons') table = 'hackathons';
                        if (activeSegment === 'projects') table = 'projects';

                        await PortfolioService.softDelete(table, item.id);
                        fetchData();
                    } catch (e: any) {
                        Alert.alert("Error", e.message);
                    }
                }
            }
        ]);
    };

    // Analysis Stats
    const completedCount = items.filter(i => i.is_completed).length;
    const totalCount = items.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <SafeAreaView className="flex-1 bg-slate-950" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />
            <FloatingHome />

            <View className="px-6 pt-4 pb-2">
                <Text className="text-3xl font-black text-white italic">TRACKER <Text className="text-purple-500">PLUS</Text></Text>
            </View>

            {/* Segments */}
            <View className="flex-row px-4 pb-4">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {[
                        { id: 'schedule', label: 'Schedule' },
                        { id: 'goals', label: 'Goals' },
                        { id: 'hackathons', label: 'Hackathons' },
                        { id: 'projects', label: 'Projects' }
                    ].map((seg: any) => (
                        <TouchableOpacity
                            key={seg.id}
                            onPress={() => handleSegmentPress(seg.id as Segment)}
                            className={`mr-3 px-4 py-2 rounded-full border ${activeSegment === seg.id ? 'bg-purple-600 border-purple-600' : 'bg-transparent border-slate-700'}`}
                        >
                            <Text className={`font-bold text-xs ${activeSegment === seg.id ? 'text-white' : 'text-slate-400'}`}>{seg.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Analytics Card (Only for habits) */}
            {(activeSegment === 'schedule' || activeSegment === 'goals') && (
                <View className="mx-6 mb-6 p-4 bg-slate-900 rounded-xl border border-slate-800 flex-row items-center justify-between">
                    <View>
                        <Text className="text-slate-400 text-xs font-bold uppercase">Daily Completion</Text>
                        <Text className="text-white text-2xl font-black">{percentage}% <Text className="text-sm font-normal text-slate-500">done</Text></Text>
                    </View>
                    <View className="h-12 w-12 rounded-full border-4 border-slate-800 justify-center items-center">
                        <View className="h-full w-full rounded-full border-4 border-purple-500 absolute" style={{ opacity: percentage / 100 }} />
                        <Text className="text-[10px] text-white font-bold">{completedCount}/{totalCount}</Text>
                    </View>
                </View>
            )}

            {/* List */}
            <ScrollView
                className="flex-1 px-6"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#A855F7"
                        colors={['#A855F7']}
                    />
                }
            >
                {loading ? (
                    <>
                        <SkeletonItem />
                        <SkeletonItem />
                        <SkeletonItem />
                    </>
                ) : (
                    items.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => toggleHabit(item)}
                            onLongPress={() => handleDelete(item)}
                            activeOpacity={activeSegment === 'hackathons' ? 1 : 0.7}
                            className="flex-row items-center mb-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800/50"
                        >
                            {(activeSegment === 'schedule' || activeSegment === 'goals') && (
                                <View className={`w-5 h-5 border rounded mr-3 justify-center items-center ${item.is_completed ? 'bg-purple-500 border-purple-500' : 'bg-transparent border-slate-600'}`}>
                                    {item.is_completed && <Check size={12} color="white" />}
                                </View>
                            )}

                            {activeSegment === 'hackathons' && <Code size={20} color="#F59E0B" className="mr-3" />}
                            {activeSegment === 'projects' && <Briefcase size={20} color="#3B82F6" className="mr-3" />}

                            <View className="flex-1">
                                <Text className={`text-sm font-bold ${item.is_completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                    {item.title}
                                </Text>
                                {item.description && <Text className="text-slate-500 text-xs">{item.description}</Text>}
                                {item.status && <Text className="text-amber-500 text-[10px] uppercase font-bold mt-1">{item.status}</Text>}
                                {item.date && <Text className="text-slate-500 text-[10px] mt-1">{item.date}</Text>}
                            </View>
                        </TouchableOpacity>
                    ))
                )}
                <View className="h-24" />
            </ScrollView>

            {/* Add Button */}
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="absolute bottom-6 left-6 h-12 w-12 bg-slate-800 rounded-full justify-center items-center shadow-lg border border-slate-700"
            >
                <Plus color="white" />
            </TouchableOpacity>

            {/* Add Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View className="flex-1 bg-black/80 justify-end">
                    <View className="bg-slate-900 rounded-t-3xl p-6 border-t border-slate-800">
                        <Text className="text-white font-bold text-lg mb-4">
                            {activeSegment === 'hackathons' ? 'New Hackathon' :
                                activeSegment === 'projects' ? 'New Project' :
                                    `Add to ${activeSegment}`}
                        </Text>

                        <TextInput
                            value={newItemText}
                            onChangeText={setNewItemText}
                            placeholder={activeSegment === 'hackathons' ? 'Hackathon Name' :
                                activeSegment === 'projects' ? 'Project Title' : 'Title / Goal Name'}
                            placeholderTextColor="#64748b"
                            className="bg-slate-950 text-white p-4 rounded-xl border border-slate-800 mb-4"
                        />

                        {activeSegment === 'hackathons' && (
                            <>
                                <TextInput
                                    value={newItemExtra}
                                    onChangeText={setNewItemExtra}
                                    placeholder="Description / Theme"
                                    placeholderTextColor="#64748b"
                                    className="bg-slate-950 text-white p-4 rounded-xl border border-slate-800 mb-4"
                                />
                                <TextInput
                                    value={newItemDate}
                                    onChangeText={setNewItemDate}
                                    placeholder="Date (e.g. Jan 2026)"
                                    placeholderTextColor="#64748b"
                                    className="bg-slate-950 text-white p-4 rounded-xl border border-slate-800 mb-4"
                                />
                                <View className="flex-row gap-3 mb-4">
                                    {['upcoming', 'ongoing', 'completed'].map(status => (
                                        <TouchableOpacity
                                            key={status}
                                            onPress={() => setNewItemStatus(status as any)}
                                            className={`flex-1 p-3 rounded-xl border items-center ${newItemStatus === status ? 'bg-purple-600 border-purple-500' : 'bg-slate-950 border-slate-700'}`}
                                        >
                                            <Text className={`text-xs uppercase font-bold ${newItemStatus === status ? 'text-white' : 'text-slate-400'}`}>{status}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )}

                        {activeSegment === 'projects' && (
                            <>
                                <TextInput
                                    value={newItemExtra}
                                    onChangeText={setNewItemExtra}
                                    placeholder="Description"
                                    placeholderTextColor="#64748b"
                                    multiline
                                    className="bg-slate-950 text-white p-4 rounded-xl border border-slate-800 mb-4 h-24"
                                    textAlignVertical="top"
                                />
                            </>
                        )}

                        <TouchableOpacity onPress={addItem} className="bg-purple-600 p-4 rounded-xl items-center mb-3">
                            <Text className="text-white font-bold">Create Entry</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-slate-800 p-4 rounded-xl items-center">
                            <Text className="text-white font-bold">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
