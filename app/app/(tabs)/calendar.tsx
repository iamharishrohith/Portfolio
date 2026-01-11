import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Switch, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { PortfolioService } from '@/services/portfolioService';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, X, Bell, Target, Play, Pause, RotateCcw, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

type Event = {
    id: string;
    title: string;
    description?: string;
    event_date: string;
    event_time?: string;
    reminder_enabled: boolean;
    reminder_minutes: number;
    is_deadline: boolean;
    category: string;
    color: string;
};

const CATEGORIES = [
    { id: 'exam', label: 'Exam', color: '#EF4444' },
    { id: 'assignment', label: 'Assignment', color: '#F59E0B' },
    { id: 'meeting', label: 'Meeting', color: '#3B82F6' },
    { id: 'personal', label: 'Personal', color: '#8B5CF6' },
    { id: 'deadline', label: 'Deadline', color: '#EC4899' },
];

const REMINDER_OPTIONS = [
    { value: 15, label: '15 min' },
    { value: 30, label: '30 min' },
    { value: 60, label: '1 hour' },
    { value: 1440, label: '1 day' },
];

export default function CalendarScreen() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [category, setCategory] = useState('personal');
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderMinutes, setReminderMinutes] = useState(30);
    const [isDeadline, setIsDeadline] = useState(false);

    // Stopwatch State
    const [stopwatchTime, setStopwatchTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchEvents();
    }, [currentDate]);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setStopwatchTime(prev => prev + 1);
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const data = await PortfolioService.getEvents();
            setEvents(data || []);
        } catch (e: any) {
            console.log("Error fetching events:", e.message);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await fetchEvents();
        setRefreshing(false);
    };

    const handleSaveEvent = async () => {
        if (!title || !selectedDate) {
            Alert.alert('Error', 'Title and date are required');
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const catColor = CATEGORIES.find(c => c.id === category)?.color || '#A855F7';

        try {
            await PortfolioService.upsertEvent({
                title,
                description,
                event_date: selectedDate,
                event_time: eventTime || null,
                reminder_enabled: reminderEnabled,
                reminder_minutes: reminderMinutes,
                is_deadline: isDeadline,
                category,
                color: catColor,
            });

            setModalVisible(false);
            resetForm();
            fetchEvents();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleDeleteEvent = async (id: string) => {
        Alert.alert('Delete Event', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    try {
                        await PortfolioService.softDelete('events', id);
                        fetchEvents();
                    } catch (e: any) {
                        Alert.alert("Error", e.message);
                    }
                }
            }
        ]);
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setEventTime('');
        setCategory('personal');
        setReminderEnabled(false);
        setReminderMinutes(30);
        setIsDeadline(false);
        setSelectedDate(null);
    };

    const openAddModal = (dateStr?: string) => {
        Haptics.selectionAsync();
        resetForm();
        if (dateStr) setSelectedDate(dateStr);
        setModalVisible(true);
    };

    const changeMonth = (delta: number) => {
        Haptics.selectionAsync();
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1);
        setCurrentDate(newDate);
    };

    // Stopwatch functions
    const toggleStopwatch = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsRunning(!isRunning);
    };

    const resetStopwatch = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsRunning(false);
        setStopwatchTime(0);
    };

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Get countdown for deadlines
    const getCountdown = (date: string, time?: string) => {
        const eventDate = new Date(date + (time ? 'T' + time : 'T23:59:59'));
        const now = new Date();
        const diff = eventDate.getTime() - now.getTime();
        if (diff <= 0) return 'Passed';
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (days > 0) return `${days}d ${hours}h left`;
        return `${hours}h left`;
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const today = new Date().toISOString().split('T')[0];

    const renderCalendarGrid = () => {
        const totalSlots = Math.ceil((daysInMonth + firstDay) / 7) * 7;
        const days = [];

        for (let i = 0; i < totalSlots; i++) {
            const dayNum = i - firstDay + 1;
            const isValidDay = dayNum > 0 && dayNum <= daysInMonth;
            const dateString = isValidDay
                ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
                : '';
            const dayEvents = events.filter(e => e.event_date === dateString);
            const isToday = dateString === today;

            days.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => isValidDay && openAddModal(dateString)}
                    className={`w-[14.28%] h-14 justify-start items-center border border-slate-900 pt-1 
                        ${isValidDay ? 'bg-slate-900/50' : 'bg-transparent'}
                        ${isToday ? 'border-2 border-blue-500' : ''}`}
                >
                    {isValidDay && (
                        <>
                            <Text className={`text-xs font-bold ${isToday ? 'text-blue-400' : dayEvents.length > 0 ? 'text-purple-400' : 'text-slate-400'}`}>
                                {dayNum}
                            </Text>
                            {dayEvents.length > 0 && (
                                <View className="flex-row mt-1 gap-0.5">
                                    {dayEvents.slice(0, 3).map((e, idx) => (
                                        <View key={idx} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: e.color }} />
                                    ))}
                                </View>
                            )}
                        </>
                    )}
                </TouchableOpacity>
            );
        }
        return days;
    };

    // Filter deadlines for countdown display
    const upcomingDeadlines = events.filter(e => e.is_deadline).slice(0, 3);

    return (
        <SafeAreaView className="flex-1 bg-slate-950" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />}
            >
                {/* Header */}
                <View className="p-6 pb-2 flex-row justify-between items-center">
                    <View>
                        <Text className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-1">Schedule Manager</Text>
                        <Text className="text-3xl font-black text-white italic">
                            CALENDAR <Text className="text-blue-500">VIEW</Text>
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => openAddModal(today)} className="bg-blue-600 p-3 rounded-xl">
                        <Plus size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Stopwatch */}
                <Animated.View entering={FadeInDown.duration(400)} className="mx-6 mb-4 bg-slate-900 rounded-2xl p-4 border border-slate-800">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Clock size={16} color="#3B82F6" />
                            <Text className="text-slate-400 font-bold text-xs uppercase ml-2">Stopwatch</Text>
                        </View>
                        <Text className="text-white font-mono text-2xl font-bold">{formatTime(stopwatchTime)}</Text>
                    </View>
                    <View className="flex-row justify-end mt-3 gap-2">
                        <TouchableOpacity onPress={resetStopwatch} className="bg-slate-800 p-2 rounded-lg">
                            <RotateCcw size={18} color="#94a3b8" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={toggleStopwatch}
                            className={`p-2 rounded-lg ${isRunning ? 'bg-red-600' : 'bg-green-600'}`}
                        >
                            {isRunning ? <Pause size={18} color="white" /> : <Play size={18} color="white" />}
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Deadline Countdowns */}
                {upcomingDeadlines.length > 0 && (
                    <View className="mx-6 mb-4">
                        <Text className="text-slate-400 font-bold text-xs uppercase mb-2">⏰ Deadline Countdown</Text>
                        {upcomingDeadlines.map((deadline, idx) => (
                            <View key={idx} className="bg-red-900/20 rounded-xl p-3 mb-2 flex-row items-center justify-between border border-red-500/30">
                                <View className="flex-row items-center flex-1">
                                    <Target size={16} color="#EF4444" />
                                    <Text className="text-white font-bold ml-2" numberOfLines={1}>{deadline.title}</Text>
                                </View>
                                <Text className="text-red-400 font-bold text-sm">{getCountdown(deadline.event_date, deadline.event_time)}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Calendar Controls */}
                <View className="flex-row justify-between items-center px-6 py-4 bg-slate-900 border-y border-slate-800">
                    <TouchableOpacity onPress={() => changeMonth(-1)}>
                        <ChevronLeft color="white" />
                    </TouchableOpacity>
                    <Text className="text-white font-bold text-lg">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </Text>
                    <TouchableOpacity onPress={() => changeMonth(1)}>
                        <ChevronRight color="white" />
                    </TouchableOpacity>
                </View>

                {/* Days Header */}
                <View className="flex-row px-4 pt-4 pb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <Text key={i} className="flex-1 text-center text-slate-500 font-bold text-xs">{d}</Text>
                    ))}
                </View>

                {/* Grid */}
                <View className="flex-row flex-wrap px-4 mb-6">
                    {renderCalendarGrid()}
                </View>

                {/* Upcoming Events */}
                <View className="px-6 pb-20">
                    <Text className="text-white font-bold text-lg mb-4 border-l-4 border-blue-500 pl-3">
                        Events This Month
                    </Text>

                    {events.length === 0 && !loading && (
                        <Text className="text-slate-500 italic">Tap a date to add an event</Text>
                    )}

                    {events.map((event, idx) => (
                        <Animated.View key={event.id} entering={FadeInUp.delay(idx * 50)}>
                            <TouchableOpacity
                                onLongPress={() => handleDeleteEvent(event.id)}
                                className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-3 flex-row items-center"
                            >
                                <View
                                    className="w-10 h-10 rounded-full justify-center items-center mr-4"
                                    style={{ backgroundColor: event.color + '30' }}
                                >
                                    {event.is_deadline ? (
                                        <Target size={18} color={event.color} />
                                    ) : (
                                        <CalendarIcon size={18} color={event.color} />
                                    )}
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-bold text-base">{event.title}</Text>
                                    <View className="flex-row items-center mt-1">
                                        <Text className="text-slate-400 text-xs">{event.event_date}</Text>
                                        {event.event_time && (
                                            <Text className="text-slate-500 text-xs ml-2">• {event.event_time}</Text>
                                        )}
                                        {event.reminder_enabled && (
                                            <Bell size={10} color="#F59E0B" style={{ marginLeft: 8 }} />
                                        )}
                                    </View>
                                </View>
                                {event.is_deadline && (
                                    <Text className="text-red-400 text-xs font-bold">{getCountdown(event.event_date, event.event_time)}</Text>
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>
            </ScrollView>

            {/* Add Event Modal */}
            <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View className="flex-1 bg-slate-950/90 justify-end">
                    <View className="bg-slate-900 rounded-t-3xl border-t border-slate-800 max-h-[85%]">
                        <View className="p-6 border-b border-slate-800 flex-row justify-between items-center">
                            <Text className="text-xl font-black text-white italic">NEW EVENT</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="p-6">
                            {/* Title */}
                            <View className="mb-4">
                                <Text className="text-slate-400 font-bold text-xs uppercase mb-2">Event Title</Text>
                                <TextInput
                                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold"
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholder="e.g. Final Exam"
                                    placeholderTextColor="#475569"
                                />
                            </View>

                            {/* Date & Time */}
                            <View className="flex-row gap-3 mb-4">
                                <View className="flex-1">
                                    <Text className="text-slate-400 font-bold text-xs uppercase mb-2">Date</Text>
                                    <View className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                                        <Text className="text-white font-bold">{selectedDate || 'Select from calendar'}</Text>
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-slate-400 font-bold text-xs uppercase mb-2">Time (HH:MM)</Text>
                                    <TextInput
                                        className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold"
                                        value={eventTime}
                                        onChangeText={setEventTime}
                                        placeholder="09:00"
                                        placeholderTextColor="#475569"
                                    />
                                </View>
                            </View>

                            {/* Category */}
                            <View className="mb-4">
                                <Text className="text-slate-400 font-bold text-xs uppercase mb-2">Category</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {CATEGORIES.map(cat => (
                                        <TouchableOpacity
                                            key={cat.id}
                                            onPress={() => setCategory(cat.id)}
                                            className={`px-4 py-2 rounded-lg border ${category === cat.id ? 'border-2' : 'border-slate-800'}`}
                                            style={{ borderColor: category === cat.id ? cat.color : '#1e293b' }}
                                        >
                                            <Text style={{ color: category === cat.id ? cat.color : '#64748b' }} className="font-bold text-sm">
                                                {cat.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Deadline Toggle */}
                            <TouchableOpacity
                                onPress={() => setIsDeadline(!isDeadline)}
                                className={`flex-row items-center justify-between p-4 rounded-xl border mb-4 ${isDeadline ? 'bg-red-500/20 border-red-500/50' : 'bg-slate-950 border-slate-800'}`}
                            >
                                <View className="flex-row items-center">
                                    <Target size={16} color={isDeadline ? '#EF4444' : '#64748b'} />
                                    <Text className={`font-bold ml-3 ${isDeadline ? 'text-red-400' : 'text-slate-500'}`}>Mark as Deadline</Text>
                                </View>
                                <Switch value={isDeadline} onValueChange={setIsDeadline} trackColor={{ true: '#EF4444' }} />
                            </TouchableOpacity>

                            {/* Reminder Toggle */}
                            <TouchableOpacity
                                onPress={() => setReminderEnabled(!reminderEnabled)}
                                className={`flex-row items-center justify-between p-4 rounded-xl border mb-4 ${reminderEnabled ? 'bg-amber-500/20 border-amber-500/50' : 'bg-slate-950 border-slate-800'}`}
                            >
                                <View className="flex-row items-center">
                                    <Bell size={16} color={reminderEnabled ? '#F59E0B' : '#64748b'} />
                                    <Text className={`font-bold ml-3 ${reminderEnabled ? 'text-amber-400' : 'text-slate-500'}`}>Enable Reminder</Text>
                                </View>
                                <Switch value={reminderEnabled} onValueChange={setReminderEnabled} trackColor={{ true: '#F59E0B' }} />
                            </TouchableOpacity>

                            {/* Reminder Time Options */}
                            {reminderEnabled && (
                                <View className="flex-row gap-2 mb-4">
                                    {REMINDER_OPTIONS.map(opt => (
                                        <TouchableOpacity
                                            key={opt.value}
                                            onPress={() => setReminderMinutes(opt.value)}
                                            className={`flex-1 py-2 rounded-lg ${reminderMinutes === opt.value ? 'bg-amber-600' : 'bg-slate-800'}`}
                                        >
                                            <Text className={`text-center font-bold text-xs ${reminderMinutes === opt.value ? 'text-white' : 'text-slate-500'}`}>
                                                {opt.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {/* Description */}
                            <View className="mb-4">
                                <Text className="text-slate-400 font-bold text-xs uppercase mb-2">Notes (Optional)</Text>
                                <TextInput
                                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white h-20"
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Additional details..."
                                    placeholderTextColor="#475569"
                                    multiline
                                    textAlignVertical="top"
                                />
                            </View>
                        </ScrollView>

                        <View className="p-6 border-t border-slate-800 pb-10">
                            <TouchableOpacity onPress={handleSaveEvent} className="bg-blue-600 w-full p-4 rounded-xl items-center flex-row justify-center">
                                <CalendarIcon size={20} color="white" />
                                <Text className="text-white font-black text-lg ml-2 italic">SAVE EVENT</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
