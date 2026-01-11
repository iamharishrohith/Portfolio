import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { FloatingHome } from '@/components/FloatingHome';
import { Clock, MapPin, User, BookOpen, Calendar, GraduationCap, CheckCircle, Circle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// MAT Timetable - II B.Sc CT, Computer Science (Weekly Class Schedule)
const MAT_TIMETABLE: any = {
    'Monday': [
        { period: 'I', time: '9:30 AM', name: 'Core - PHP & MySQL', room: 'B212', staff: 'Ms. N. Sukanya' },
        { period: 'II', time: '10:20 AM', name: 'Core - PHP & MySQL', room: 'B212', staff: 'Ms. N. Sukanya' },
        { period: 'BREAK', time: '11:10 AM - 11:25 AM', name: 'MORNING BREAK', type: 'break' },
        { period: 'III', time: '11:25 AM', name: 'Core Lab - PHP & MySQL', room: 'Lab', staff: 'Dr. P. Sukumar' },
        { period: 'IV', time: '12:15 PM', name: 'Core Lab - PHP & MySQL', room: 'Lab', staff: 'Dr. P. Sukumar' },
        { period: 'LUNCH', time: '1:05 PM - 2:00 PM', name: 'LUNCH BREAK', type: 'break' },
        { period: 'VI', time: '2:00 PM', name: 'E2 - Data Structures', room: 'B212', staff: 'Ms. C.K. Sukanya' },
        { period: 'VII', time: '2:50 PM', name: 'E2 - Data Structures', room: 'B212', staff: 'Ms. C.K. Sukanya' },
    ],
    'Tuesday': [
        { period: 'I', time: '9:30 AM', name: 'Core - PHP & MySQL', room: 'B212', staff: 'Ms. N. Sukanya' },
        { period: 'II', time: '10:20 AM', name: 'Core - PHP & MySQL', room: 'B212', staff: 'Ms. N. Sukanya' },
        { period: 'BREAK', time: '11:10 AM - 11:25 AM', name: 'MORNING BREAK', type: 'break' },
        { period: 'III', time: '11:25 AM', name: 'E2 - Data Structures', room: 'B212', staff: 'Ms. C.K. Sukanya' },
        { period: 'IV', time: '12:15 PM', name: 'E2 - Data Structures', room: 'B212', staff: 'Ms. C.K. Sukanya' },
        { period: 'LUNCH', time: '1:05 PM - 2:00 PM', name: 'LUNCH BREAK', type: 'break' },
        { period: 'VI', time: '2:00 PM', name: 'Allied 4 - Statistics', room: 'B212', staff: 'Dr. C. Vanitha' },
        { period: 'VII', time: '2:50 PM', name: 'Allied 4 - Statistics', room: 'B212', staff: 'Dr. C. Vanitha' },
    ],
    'Wednesday': [
        { period: 'I', time: '9:30 AM', name: 'Allied 4 - Statistics', room: 'B212', staff: 'Dr. C. Vanitha' },
        { period: 'II', time: '10:20 AM', name: 'Allied 4 - Statistics', room: 'B212', staff: 'Dr. C. Vanitha' },
        { period: 'BREAK', time: '11:10 AM - 11:25 AM', name: 'MORNING BREAK', type: 'break' },
        { period: 'III', time: '11:25 AM', name: 'E2 - Data Structures', room: 'B212', staff: 'Ms. C.K. Sukanya' },
        { period: 'IV', time: '12:15 PM', name: 'E2 - Data Structures', room: 'B212', staff: 'Ms. C.K. Sukanya' },
        { period: 'LUNCH', time: '1:05 PM - 2:00 PM', name: 'LUNCH BREAK', type: 'break' },
        { period: 'VI', time: '2:00 PM', name: 'Core - PHP & MySQL', room: 'B212', staff: 'Ms. N. Sukanya' },
        { period: 'VII', time: '2:50 PM', name: 'Core - PHP & MySQL', room: 'B212', staff: 'Ms. N. Sukanya' },
    ],
    'Thursday': [
        { period: 'I', time: '9:30 AM', name: 'Core - PHP & MySQL', room: 'B212', staff: 'Ms. N. Sukanya' },
        { period: 'II', time: '10:20 AM', name: 'Core - PHP & MySQL', room: 'B212', staff: 'Ms. N. Sukanya' },
        { period: 'BREAK', time: '11:10 AM - 11:25 AM', name: 'MORNING BREAK', type: 'break' },
        { period: 'III', time: '11:25 AM', name: 'Allied 4 - Statistics', room: 'B212', staff: 'Dr. C. Vanitha' },
        { period: 'IV', time: '12:15 PM', name: 'Allied 4 - Statistics', room: 'B212', staff: 'Dr. C. Vanitha' },
        { period: 'LUNCH', time: '1:05 PM - 2:00 PM', name: 'LUNCH BREAK', type: 'break' },
        { period: 'VI', time: '2:00 PM', name: 'E2 - Data Structures', room: 'B212', staff: 'Ms. C.K. Sukanya' },
        { period: 'VII', time: '2:50 PM', name: 'E2 - Data Structures', room: 'B212', staff: 'Ms. C.K. Sukanya' },
    ],
    'Friday': [
        { period: 'I', time: '9:30 AM', name: 'E2 - Data Structures', room: 'B212', staff: 'Ms. C.K. Sukanya' },
        { period: 'II', time: '10:20 AM', name: 'E2 - Data Structures', room: 'B212', staff: 'Ms. C.K. Sukanya' },
        { period: 'BREAK', time: '11:10 AM - 11:25 AM', name: 'MORNING BREAK', type: 'break' },
        { period: 'III', time: '11:25 AM', name: 'Core - PHP & MySQL', room: 'B212', staff: 'Ms. N. Sukanya' },
        { period: 'IV', time: '12:15 PM', name: 'Core - PHP & MySQL', room: 'B212', staff: 'Ms. N. Sukanya' },
        { period: 'LUNCH', time: '1:05 PM - 2:00 PM', name: 'LUNCH BREAK', type: 'break' },
        { period: 'VI', time: '2:00 PM', name: 'Core - PHP & MySQL', room: 'B212', staff: 'Ms. N. Sukanya' },
        { period: 'VII', time: '2:50 PM', name: 'Core - PHP & MySQL', room: 'B212', staff: 'Ms. N. Sukanya' },
    ],
};

// CAT Training Class Timetable - Phase 1
const CAT_TIMETABLE = [
    { date: '29-12-2025', fn: 'G7-B1 - Staff 6- Soft Skill', an: 'AI' },
    { date: '30-12-2025', fn: 'G7-B1 - Staff 6- Aptitude', an: 'AI' },
    { date: '31-12-2025', fn: 'CORE - RSmartCS1-IICT-G7-B1-Staff', an: 'AI' },
    { date: '05-01-2026', fn: 'G7-B1 - Staff 6- Soft Skill', an: 'AI' },
    { date: '06-01-2026', fn: 'G7-B1 - Staff 6- Aptitude', an: 'AI' },
    { date: '07-01-2026', fn: 'CORE - RSmartCS1-IICT-G7-B1-Staff', an: 'AI' },
    { date: '08-01-2026', fn: 'G7-B1 - Staff 6- Soft Skill', an: 'AI' },
    { date: '09-01-2026', fn: 'G7-B1 - Staff 6- Aptitude', an: 'AI' },
    { date: '19-01-2026', fn: 'CORE - RSmartCS1-IICT-G7-B1-Staff', an: 'AI' },
    { date: '20-01-2026', fn: 'G7-B1 - Staff 6- Soft Skill', an: 'AI' },
    { date: '21-01-2026', fn: 'G7-B1 - Staff 6- Aptitude', an: 'AI' },
    { date: '22-01-2026', fn: 'CORE - RSmartCS1-IICT-G7-B1-Staff', an: 'AI' },
    { date: '23-01-2026', fn: 'G7-B1 - Staff 6- Soft Skill', an: 'AI' },
    { date: '24-01-2026', fn: 'G7-B1 - Staff 6- Aptitude', an: 'AI' },
    { date: '27-01-2026', fn: 'CORE - RSmartCS1-IICT-G7-B1-Staff', an: 'AI' },
    { date: '28-01-2026', fn: 'G7-B1 - Staff 6- Soft Skill', an: 'AI' },
    { date: '29-01-2026', fn: 'G7-B1 - Staff 6- Aptitude', an: 'AI' },
    { date: '30-01-2026', fn: 'CORE - RSmartCS1-IICT-G7-B1-Staff', an: 'AI' },
];


export default function TimetableScreen() {
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [activeTab, setActiveTab] = useState<'mat' | 'cat'>('mat');
    const [refreshing, setRefreshing] = useState(false);
    const [completedSlots, setCompletedSlots] = useState<string[]>([]);

    React.useEffect(() => {
        // Set initial selected day to today
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[new Date().getDay()];
        if (DAYS.includes(today)) {
            setSelectedDay(today);
        }
        fetchCompletions();
    }, []);

    const fetchCompletions = async () => {
        const today = new Date().toISOString().split('T')[0];
        try {
            const { data } = await supabase
                .from('schedule_completions')
                .select('period_key')
                .eq('date', today);

            if (data) {
                setCompletedSlots(data.map(d => d.period_key));
            }
        } catch (e) {
            console.log('Error fetching schedule completions:', e);
        }
    };

    const toggleSlot = async (period: string) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDayName = days[new Date().getDay()];

        // Allow CAT items anytime, but MAT items only today
        if (!period.startsWith('CAT-')) {
            if (selectedDay !== currentDayName && activeTab !== 'cat') {
                // Check if it's meant to be restricted. User complained "not updating", so maybe remove restriction or just warn?
                // Let's remove restriction for now to allow freely marking schedule
            }
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const today = new Date().toISOString().split('T')[0];
        const key = `${selectedDay}-${period}`; // Unique key per day/period

        const isCompleted = completedSlots.includes(key);

        // Optimistic update
        setCompletedSlots(prev =>
            isCompleted ? prev.filter(k => k !== key) : [...prev, key]
        );

        try {
            if (isCompleted) {
                await supabase.from('schedule_completions').delete().match({ date: today, period_key: key });
            } else {
                await supabase.from('schedule_completions').insert({ date: today, period_key: key, is_completed: true });
            }
        } catch (e) {
            console.log('Error toggling slot:', e);
            // Revert on error
            fetchCompletions();
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTimeout(() => setRefreshing(false), 500);
    };

    const handleTabSwitch = (tab: 'mat' | 'cat') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setActiveTab(tab);
    };

    const handleDayPress = (day: string) => {
        Haptics.selectionAsync();
        setSelectedDay(day);
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-950" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />
            <FloatingHome />

            {/* Header */}
            <View className="px-6 pt-4 pb-2">
                <Text className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-1">Academic Schedule</Text>
                <Text className="text-2xl font-black text-white italic">
                    II B.Sc <Text className="text-purple-500">CT</Text>
                </Text>
                <Text className="text-slate-500 text-xs mt-1">Computer Science Department</Text>
            </View>

            {/* MAT / CAT Toggle */}
            <View className="flex-row mx-6 mb-4 bg-slate-900 rounded-xl p-1 border border-slate-800">
                <TouchableOpacity
                    onPress={() => handleTabSwitch('mat')}
                    className={`flex-1 py-3 rounded-lg flex-row items-center justify-center gap-2 ${activeTab === 'mat' ? 'bg-purple-600' : 'bg-transparent'}`}
                >
                    <GraduationCap size={16} color={activeTab === 'mat' ? 'white' : '#64748b'} />
                    <Text className={`font-bold ${activeTab === 'mat' ? 'text-white' : 'text-slate-500'}`}>MAT</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleTabSwitch('cat')}
                    className={`flex-1 py-3 rounded-lg flex-row items-center justify-center gap-2 ${activeTab === 'cat' ? 'bg-emerald-600' : 'bg-transparent'}`}
                >
                    <Calendar size={16} color={activeTab === 'cat' ? 'white' : '#64748b'} />
                    <Text className={`font-bold ${activeTab === 'cat' ? 'text-white' : 'text-slate-500'}`}>CAT</Text>
                </TouchableOpacity>
            </View>

            {/* MAT: Day Selector */}
            {activeTab === 'mat' && (
                <View className="flex-row px-4 pb-4 overflow-hidden">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {DAYS.map(day => (
                            <TouchableOpacity
                                key={day}
                                onPress={() => handleDayPress(day)}
                                className={`mr-3 px-6 py-2 rounded-full border ${selectedDay === day
                                    ? 'bg-purple-600 border-purple-600'
                                    : 'bg-transparent border-slate-700'
                                    }`}
                            >
                                <Text className={`font-bold ${selectedDay === day ? 'text-white' : 'text-slate-400'}`}>
                                    {day}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Content */}
            <ScrollView
                className="flex-1 px-4"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#A855F7"
                        colors={['#A855F7']}
                    />
                }
            >
                {/* MAT Schedule */}
                {activeTab === 'mat' && MAT_TIMETABLE[selectedDay].map((slot: any, index: number) => (
                    <View key={index} className="mb-3">
                        {slot.type === 'break' ? (
                            <View className="w-full bg-slate-900/50 p-2 rounded items-center border border-dashed border-slate-800">
                                <Text className="text-slate-500 font-bold text-xs tracking-widest uppercase">{slot.name}</Text>
                                <Text className="text-slate-600 text-[10px]">{slot.time}</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={() => toggleSlot(slot.period)}
                                className={`border rounded-xl p-4 flex-row justify-between items-center shadow-sm ${completedSlots.includes(`${selectedDay}-${slot.period}`)
                                    ? 'bg-purple-900/20 border-purple-500/50'
                                    : 'bg-slate-900 border-slate-800'
                                    }`}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="w-16 border-r border-slate-800 pr-4">
                                        <Text className="text-purple-400 font-black text-xl italic">{slot.period}</Text>
                                        <Text className="text-slate-500 text-[10px]">{slot.time}</Text>
                                    </View>
                                    <View className="flex-1 pl-4">
                                        <Text className="text-white font-bold text-base leading-tight">{slot.name}</Text>
                                        <View className="flex-row mt-2 items-center space-x-4">
                                            <View className="flex-row items-center">
                                                <User size={12} color="#94a3b8" />
                                                <Text className="text-slate-400 text-xs ml-1">{slot.staff}</Text>
                                            </View>
                                            <View className="flex-row items-center ml-2 space-x-1">
                                                <MapPin size={12} color="#94a3b8" />
                                                <Text className="text-slate-400 text-xs ml-1">{slot.room}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                <View className="ml-2">
                                    {completedSlots.includes(`${selectedDay}-${slot.period}`) ? (
                                        <CheckCircle size={24} color="#A855F7" />
                                    ) : (
                                        <Circle size={24} color="#334155" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}

                {/* CAT Schedule */}
                {activeTab === 'cat' && (
                    <View className="mb-4">
                        <Text className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-3 px-2">Phase 1 Training</Text>
                        {CAT_TIMETABLE.map((item, index) => {
                            const isCompleted = completedSlots.includes(`CAT-${item.date}`);
                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => toggleSlot(`CAT-${item.date}`)}
                                    className={`border rounded-xl p-4 mb-3 flex-row items-center justify-between ${isCompleted ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-slate-900 border-slate-800'
                                        }`}
                                >
                                    <View className="flex-row items-center flex-1">
                                        <View className="w-20 border-r border-slate-800 pr-3">
                                            <Text className="text-emerald-400 font-black text-sm">{item.date}</Text>
                                        </View>
                                        <View className="flex-1 pl-4">
                                            <View className="flex-row items-center gap-2 mb-1">
                                                <View className="bg-blue-500/20 px-2 py-0.5 rounded">
                                                    <Text className="text-blue-400 font-bold text-[10px]">FN</Text>
                                                </View>
                                                <Text className="text-white text-sm font-medium flex-1" numberOfLines={1}>{item.fn}</Text>
                                            </View>
                                            <View className="flex-row items-center gap-2">
                                                <View className="bg-amber-500/20 px-2 py-0.5 rounded">
                                                    <Text className="text-amber-400 font-bold text-[10px]">AN</Text>
                                                </View>
                                                <Text className="text-slate-400 text-sm">{item.an}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View className="ml-2">
                                        {isCompleted ? (
                                            <CheckCircle size={24} color="#10B981" />
                                        ) : (
                                            <Circle size={24} color="#334155" />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                <View className="h-24" />
            </ScrollView>
        </SafeAreaView >
    );
}
