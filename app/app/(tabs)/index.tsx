import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, RefreshControl, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import {
  Bell, Settings, Calendar, LayoutDashboard, CheckSquare,
  ChevronRight, Trophy, Zap, Clock, Users, Target,
  TrendingUp, StickyNote, GraduationCap, AlertTriangle,
  Link, Briefcase, BookOpen, FileText, CalendarDays,
  Mail, Globe, Edit3, BarChart2
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  FadeInDown,
  FadeInUp,
  Easing,
  withSpring
} from 'react-native-reanimated';
import { SystemBackground } from '../../components/SystemBackground';
import { useSystemSound } from '../../hooks/useSystemSound';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import * as Haptics from 'expo-haptics';

import { calculateTotalXp, getLevelFromXp, getRankFromLevel } from '@/lib/xpCalculator';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48 - 16) / 2;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// MAT Schedule for Today's Classes
// MAT Schedule for Today's Classes (Updated based on Timetable Image)
const MAT_SCHEDULE: any = {
  'Monday': [
    { period: 'I-II', time: '09:30 AM - 11:10 AM', name: 'Core - PHP & MySQL', staff: 'Ms. N. Sukanya' },
    { period: 'III-IV', time: '11:25 AM - 01:05 PM', name: 'Core Practical - PHP Lab', staff: 'Dr. P. Sukumar' },
    { period: 'VI-VII', time: '02:00 PM - 03:40 PM', name: 'E2 - Data Structures', staff: 'Ms. C.K. Sukanya' },
  ],
  'Tuesday': [
    { period: 'I-II', time: '09:30 AM - 11:10 AM', name: 'Core - PHP & MySQL', staff: 'Ms. N. Sukanya' },
    { period: 'III-IV', time: '11:25 AM - 01:05 PM', name: 'E2 - Data Structures', staff: 'Ms. C.K. Sukanya' },
    { period: 'VI-VII', time: '02:00 PM - 03:40 PM', name: 'Allied 4 - Statistics', staff: 'Dr. C. Vanitha' },
  ],
  'Wednesday': [
    { period: 'I-II', time: '09:30 AM - 11:10 AM', name: 'Allied 4 - Statistics', staff: 'Dr. C. Vanitha' },
    { period: 'III-IV', time: '11:25 AM - 01:05 PM', name: 'E2 - Data Structures', staff: 'Ms. C.K. Sukanya' },
    { period: 'VI-VII', time: '02:00 PM - 03:40 PM', name: 'Core - PHP & MySQL', staff: 'Ms. N. Sukanya' },
  ],
  'Thursday': [
    { period: 'I-II', time: '09:30 AM - 11:10 AM', name: 'Core - PHP & MySQL', staff: 'Ms. N. Sukanya' },
    { period: 'III-IV', time: '11:25 AM - 01:05 PM', name: 'Allied 4 - Statistics', staff: 'Dr. C. Vanitha' },
    { period: 'VI-VII', time: '02:00 PM - 03:40 PM', name: 'E2 - Data Structures', staff: 'Ms. C.K. Sukanya' },
  ],
  'Friday': [
    { period: 'I-II', time: '09:30 AM - 11:10 AM', name: 'E2 - Data Structures', staff: 'Ms. C.K. Sukanya' },
    { period: 'III-IV', time: '11:25 AM - 01:05 PM', name: 'Core - PHP & MySQL', staff: 'Ms. N. Sukanya' },
    { period: 'VI-VII', time: '02:00 PM - 03:40 PM', name: 'Core - PHP & MySQL', staff: 'Ms. N. Sukanya' },
  ],
  'Saturday': [],
  'Sunday': [],
};

export default function HomeScreen() {
  const router = useRouter();
  const { playSound } = useSystemSound();
  const [refreshing, setRefreshing] = useState(false);
  const [activeView, setActiveView] = useState<'today' | 'dashboard'>('today');

  // Profile state synced from DB with contact details
  const [profile, setProfile] = useState({
    full_name: 'Loading...',
    job_title: 'Hunter',
    level: 1,
    xp: 0,
    totalXp: 0,
    nextLevelXp: 100,
    streak: 0,
    rank: 'E',
    avatar_url: null,
    email: '',
    phone: '',
    portfolio_url: '',
    monthly_xp: 0,
    yearly_xp: 0
  });

  // Today's data
  const [notes, setNotes] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [learningPaths, setLearningPaths] = useState<any[]>([]);

  // XP Animation
  const xpWidth = useSharedValue(0);
  const xpAnimatedStyle = useAnimatedStyle(() => ({
    width: `${xpWidth.value}%`,
  }));

  // Toggle animation
  const togglePosition = useSharedValue(0);
  const toggleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(togglePosition.value) }]
  }));

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchProfile(),
      fetchNotes(),
      fetchHabits(),
      fetchDeadlines(),
      fetchLearningPaths()
    ]);
  };

  const fetchProfile = async () => {
    try {
      const { data } = await supabase.from('profiles').select('*').single();

      // Calculate real XP from all sources
      const { totalXp: calculatedXp } = await calculateTotalXp();
      const levelInfo = getLevelFromXp(calculatedXp);
      const calculatedRank = getRankFromLevel(levelInfo.level);

      if (data) {
        setProfile({
          full_name: data.full_name || 'Unknown Hunter',
          job_title: data.job_title || data.title || 'Shadow Monarch',
          level: levelInfo.level,
          xp: levelInfo.currentXp,
          totalXp: calculatedXp,
          nextLevelXp: levelInfo.nextLevelXp,
          streak: data.streak || 0,
          rank: calculatedRank,
          avatar_url: data.avatar_url || null,
          email: data.email || '',
          phone: data.phone || '',
          portfolio_url: data.portfolio_url || 'https://harishrohith.vercel.app',
          monthly_xp: data.monthly_xp || 0,
          yearly_xp: data.yearly_xp || 0
        });

        // Animate XP bar based on progress to next level
        const xpProgress = levelInfo.nextLevelXp > 0
          ? (levelInfo.currentXp / levelInfo.nextLevelXp) * 100
          : 0;
        xpWidth.value = withDelay(500, withTiming(xpProgress, { duration: 1000, easing: Easing.out(Easing.cubic) }));
      }
    } catch (e) {
      console.log('Profile fetch error:', e);
    }
  };

  const fetchLearningPaths = async () => {
    try {
      const { data } = await supabase.from('courses').select('*').limit(3);
      if (data) setLearningPaths(data);
    } catch (e) { console.log('Learning fetch error', e); }
  };

  useEffect(() => {
    fetchProfile();
    fetchLearningPaths();
    // ... other fetches if needed
  }, []);

  const fetchNotes = async () => {
    try {
      const { data } = await supabase.from('notes').select('*').order('created_at', { ascending: false }).limit(3);
      setNotes(data || []);
    } catch (e) { console.log('Notes fetch error:', e); }
  };

  const fetchHabits = async () => {
    try {
      const { data } = await supabase.from('habits').select('*').order('created_at', { ascending: false });
      setHabits(data || []);
    } catch (e) { console.log('Habits fetch error:', e); }
  };

  const fetchDeadlines = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(5);
      setDeadlines(data || []);
    } catch (e) { console.log('Deadlines fetch error:', e); }
  };



  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchAllData();
    setRefreshing(false);
  };

  const getDayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const todaySchedule = MAT_SCHEDULE[getDayName()] || [];

  const handleViewToggle = (view: 'today' | 'dashboard') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveView(view);
    togglePosition.value = view === 'today' ? 0 : (width - 48) / 2;
  };

  const handlePress = (route: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playSound('click');
    router.push(route);
  };

  const menuItems = [
    { title: 'Habit Tracker', icon: CheckSquare, route: '/(tabs)/tracker', color: '#10B981', desc: 'Daily Protocols' },
    { title: 'Ability Tree', icon: Zap, route: '/(tabs)/ability', color: '#A855F7', desc: 'Skill Matrix' },
    { title: 'Calendar', icon: Calendar, route: '/(tabs)/calendar', color: '#3B82F6', desc: 'Mission Schedule' },
    { title: 'Quick Links', icon: Link, route: '/(tabs)/links', color: '#EC4899', desc: 'Saved URLs' },
    { title: 'Portfolio', icon: Briefcase, route: '/(tabs)/portfolio', color: '#8B5CF6', desc: 'Job Class Data' },
    { title: 'Learning', icon: BookOpen, route: '/(tabs)/learning', color: '#F59E0B', desc: 'Int. Gathering' },
    { title: 'Timetable', icon: Clock, route: '/(tabs)/timetable', color: '#06B6D4', desc: 'Time Dilation' },
    { title: 'Notepad', icon: FileText, route: '/notepad', color: '#64748B', desc: 'System Logs' },
    { title: 'Admin CMS', icon: Settings, route: '/(tabs)/cms', color: '#EF4444', desc: 'Data Editor' },
  ];

  const getDateString = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <SystemBackground>
      <SafeAreaView className="flex-1" edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#A855F7"
              colors={['#A855F7']}
            />
          }
        >
          {/* PROFILE CARD MINI LANDSCAPE */}
          <Animated.View
            entering={FadeInDown.duration(600)}
            className="px-6 pt-6"
          >
            <LinearGradient
              colors={['#4c1d95', '#2e1065', '#1e1b4b', '#0f172a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-3xl p-5 shadow-lg shadow-purple-500/50"
            >
              <View className="flex-row items-center gap-4">
                {/* Left: Avatar */}
                <View className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-purple-500/50 items-center justify-center overflow-hidden shadow-md shadow-black/50">
                  {profile.avatar_url ? (
                    <Image source={{ uri: profile.avatar_url }} className="w-full h-full" />
                  ) : (
                    <Text className="text-3xl">👨‍💻</Text>
                  )}
                </View>

                {/* Right: Info */}
                <View className="flex-1">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-4">
                      <Text
                        className="text-white text-xl font-black italic tracking-tight mb-1"
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {profile.full_name ? profile.full_name.toUpperCase() : 'HUNTER'}
                      </Text>
                      <Text className="text-purple-400 font-bold text-[10px] uppercase tracking-[0.15em] mb-2">
                        {profile.job_title}
                      </Text>
                    </View>
                    {/* Rank Badge */}
                    <View className="bg-amber-500/20 px-2 py-1 rounded-lg border border-amber-500/40 transform rotate-3">
                      <Text className="text-amber-400 font-black text-xs">S-RANK</Text>
                    </View>
                  </View>

                  {/* Compact Stats Grid */}
                  <View className="flex-row gap-2">
                    <View className="bg-slate-900/50 px-3 py-1.5 rounded-lg border border-purple-500/20">
                      <Text className="text-purple-400 font-bold text-xs">LV. {profile.level}</Text>
                    </View>
                    <View className="bg-slate-900/50 px-3 py-1.5 rounded-lg border border-emerald-500/20 flex-row items-center gap-1">
                      <Zap size={10} color="#10B981" />
                      <Text className="text-emerald-400 font-bold text-xs">{profile.totalXp}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handlePress('/profile-edit')} className="ml-auto bg-slate-800 p-1.5 rounded-lg">
                      <Edit3 size={12} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* XP Progress Bar (Mini) */}
              <View className="mt-4">
                <View className="flex-row justify-between mb-1.5">
                  <Text className="text-slate-500 text-[9px] font-medium uppercase">Next Level Progress</Text>
                  <Text className="text-purple-400 text-[9px] font-bold">{profile.xp} / {profile.nextLevelXp} XP</Text>
                </View>
                <View className="w-full h-1.5 bg-slate-900/80 rounded-full overflow-hidden border border-white/5">
                  <Animated.View
                    className="h-full rounded-full"
                    style={[{ backgroundColor: '#A855F7' }, xpAnimatedStyle]}
                  />
                </View>
              </View>

              {/* Collapsed/Mini Digital Card Trigger (or just show icons) */}
              <View className="mt-4 pt-3 border-t border-white/10 flex-row justify-between items-center">
                <View className="flex-row gap-4">
                  {profile.email ? (
                    <View className="flex-row items-center gap-1.5 opacity-80">
                      <Mail size={10} color="#94a3b8" />
                      <Text className="text-slate-400 text-[10px]">Email</Text>
                    </View>
                  ) : null}
                  {profile.portfolio_url ? (
                    <View className="flex-row items-center gap-1.5 opacity-80">
                      <Globe size={10} color="#94a3b8" />
                      <Text className="text-slate-400 text-[10px]">Portfolio</Text>
                    </View>
                  ) : null}
                </View>
                {/* Mini QR Icon */}
                <TouchableOpacity
                  onPress={() => Alert.alert('Digital Card', 'QR Code would expand here')}
                  className="bg-white p-1 rounded-md"
                >
                  <Image
                    source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(profile.portfolio_url || 'none')}` }}
                    className="w-6 h-6"
                  />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* TODAY / DASHBOARD TOGGLE */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(500)}
            className="mx-6 mt-4"
          >
            <View className="flex-row bg-slate-900 rounded-xl p-1 relative">
              {/* Animated indicator */}
              <Animated.View
                style={[toggleStyle]}
                className="absolute top-1 left-1 w-1/2 h-[calc(100%-8px)] bg-purple-600 rounded-lg"
              />
              <TouchableOpacity
                onPress={() => handleViewToggle('today')}
                className="flex-1 py-3 items-center z-10"
              >
                <View className="flex-row items-center gap-2">
                  <CalendarDays size={16} color={activeView === 'today' ? '#fff' : '#64748b'} />
                  <Text className={`font-bold text-sm ${activeView === 'today' ? 'text-white' : 'text-slate-500'}`}>
                    Today
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleViewToggle('dashboard')}
                className="flex-1 py-3 items-center z-10"
              >
                <View className="flex-row items-center gap-2">
                  <LayoutDashboard size={16} color={activeView === 'dashboard' ? '#fff' : '#64748b'} />
                  <Text className={`font-bold text-sm ${activeView === 'dashboard' ? 'text-white' : 'text-slate-500'}`}>
                    Dashboard
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* DATE HEADER */}
          {activeView === 'today' && (
            <Animated.View
              entering={FadeInDown.delay(150).duration(400)}
              className="px-6 mt-4"
            >
              <Text className="text-purple-400 font-bold text-xs uppercase tracking-widest">{getDateString()}</Text>
            </Animated.View>
          )}

          {/* ===== TODAY VIEW ===== */}
          {activeView === 'today' && (
            <View className="px-6 pb-24">
              {/* Today's Schedule */}
              <Animated.View
                entering={FadeInDown.delay(200).duration(500)}
                className="bg-slate-900/80 rounded-2xl p-4 mt-4 border border-slate-800"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                    <Clock size={14} color="#EC4899" />
                    <Text className="text-pink-400 font-bold text-xs uppercase tracking-widest">Today's Classes</Text>
                  </View>
                  <TouchableOpacity onPress={() => handlePress('/(tabs)/timetable')}>
                    <ChevronRight size={16} color="#64748b" />
                  </TouchableOpacity>
                </View>

                {todaySchedule.length > 0 ? (
                  todaySchedule.slice(0, 3).map((cls: any, idx: number) => (
                    <View key={idx} className="flex-row items-center py-2 border-b border-slate-800/50 last:border-b-0">
                      <View className="w-10">
                        <Text className="text-purple-400 font-black text-sm italic">{cls.period}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-white font-medium text-sm" numberOfLines={1}>{cls.name}</Text>
                        <Text className="text-slate-500 text-[10px]">{cls.time}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View className="items-center py-4">
                    <Text className="text-2xl mb-2">🎉</Text>
                    <Text className="text-slate-400 text-sm">No classes today!</Text>
                  </View>
                )}
              </Animated.View>

              {/* Recent Notes */}
              <Animated.View
                entering={FadeInDown.delay(250).duration(500)}
                className="bg-slate-900/80 rounded-2xl p-4 mt-4 border border-slate-800"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                    <StickyNote size={14} color="#F59E0B" />
                    <Text className="text-amber-400 font-bold text-xs uppercase tracking-widest">Recent Notes</Text>
                  </View>
                  <TouchableOpacity onPress={() => handlePress('/notepad')}>
                    <ChevronRight size={16} color="#64748b" />
                  </TouchableOpacity>
                </View>

                {notes.length > 0 ? (
                  notes.map((note, idx) => (
                    <View key={idx} className="py-2 border-b border-slate-800/50 last:border-b-0">
                      <Text className="text-white font-medium text-sm" numberOfLines={1}>{note.title || 'Untitled'}</Text>
                      <Text className="text-slate-500 text-xs" numberOfLines={1}>{note.content || ''}</Text>
                    </View>
                  ))
                ) : (
                  <Text className="text-slate-500 text-sm text-center py-2">No notes yet</Text>
                )}
              </Animated.View>

              {/* Learning Progress */}
              <Animated.View
                entering={FadeInDown.delay(300).duration(500)}
                className="bg-slate-900/80 rounded-2xl p-4 mt-4 border border-slate-800"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                    <GraduationCap size={14} color="#10B981" />
                    <Text className="text-emerald-400 font-bold text-xs uppercase tracking-widest">Learning Paths</Text>
                  </View>
                  <TouchableOpacity onPress={() => handlePress('/(tabs)/learning')}>
                    <ChevronRight size={16} color="#64748b" />
                  </TouchableOpacity>
                </View>

                {learningPaths.length > 0 ? (
                  learningPaths.map((path, idx) => (
                    <View key={idx} className="py-2 border-b border-slate-800/50 last:border-b-0">
                      <Text className="text-white font-medium text-sm">{path.title}</Text>
                      <View className="flex-row items-center mt-1">
                        <View className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden mr-2">
                          <View
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${path.progress || 0}%` }}
                          />
                        </View>
                        <Text className="text-slate-500 text-[10px]">{path.progress || 0}%</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text className="text-slate-500 text-sm text-center py-2">No active learning paths</Text>
                )}
              </Animated.View>

              {/* Upcoming Deadlines */}
              <Animated.View
                entering={FadeInDown.delay(350).duration(500)}
                className="bg-slate-900/80 rounded-2xl p-4 mt-4 border border-slate-800"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                    <AlertTriangle size={14} color="#EF4444" />
                    <Text className="text-red-400 font-bold text-xs uppercase tracking-widest">Deadlines</Text>
                  </View>
                  <TouchableOpacity onPress={() => handlePress('/(tabs)/calendar')}>
                    <ChevronRight size={16} color="#64748b" />
                  </TouchableOpacity>
                </View>

                {deadlines.length > 0 ? (
                  deadlines.slice(0, 3).map((deadline, idx) => (
                    <View key={idx} className="flex-row items-center py-2 border-b border-slate-800/50 last:border-b-0">
                      <View className="w-12 h-12 rounded-xl bg-red-500/10 items-center justify-center mr-3">
                        <Text className="text-red-400 font-black text-sm">
                          {new Date(deadline.date).getDate()}
                        </Text>
                        <Text className="text-red-400 text-[8px] uppercase">
                          {new Date(deadline.date).toLocaleDateString('en', { month: 'short' })}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-white font-medium text-sm" numberOfLines={1}>{deadline.title}</Text>
                        <Text className="text-slate-500 text-[10px]">{deadline.description || 'No description'}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text className="text-slate-500 text-sm text-center py-2">No upcoming deadlines</Text>
                )}
              </Animated.View>

              {/* Habits Today */}
              <Animated.View
                entering={FadeInDown.delay(400).duration(500)}
                className="bg-slate-900/80 rounded-2xl p-4 mt-4 border border-slate-800"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                    <Target size={14} color="#8B5CF6" />
                    <Text className="text-purple-400 font-bold text-xs uppercase tracking-widest">Daily Habits</Text>
                  </View>
                  <TouchableOpacity onPress={() => handlePress('/(tabs)/tracker')}>
                    <ChevronRight size={16} color="#64748b" />
                  </TouchableOpacity>
                </View>

                {habits.length > 0 ? (
                  <View className="flex-row flex-wrap gap-2">
                    {habits.slice(0, 6).map((habit, idx) => (
                      <View key={idx} className="bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20">
                        <Text className="text-purple-300 text-xs font-medium">{habit.name}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="text-slate-500 text-sm text-center py-2">No habits configured</Text>
                )}
              </Animated.View>
            </View>
          )}

          {/* ===== DASHBOARD VIEW ===== */}
          {activeView === 'dashboard' && (
            <View className="px-6 pb-24">
              {/* Activity Report */}
              <Animated.View
                entering={FadeInDown.delay(150).duration(500)}
                className="bg-slate-900/80 rounded-2xl p-5 mt-4 border border-slate-800"
              >
                <View className="flex-row items-center gap-2 mb-4">
                  <BarChart2 size={16} color="#3B82F6" />
                  <Text className="text-blue-400 font-bold text-xs uppercase tracking-widest">Activity Report</Text>
                </View>

                <View className="flex-row gap-4">
                  <View className="flex-1 bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                    <Text className="text-slate-500 text-[10px] uppercase font-bold mb-1">Monthly XP</Text>
                    <Text className="text-white text-xl font-black italic">{profile.monthly_xp || 0}</Text>
                    <Text className="text-emerald-500 text-[10px] font-bold mt-1">+12% vs last</Text>
                  </View>
                  <View className="flex-1 bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                    <Text className="text-slate-500 text-[10px] uppercase font-bold mb-1">Yearly XP</Text>
                    <Text className="text-white text-xl font-black italic">{profile.yearly_xp || 0}</Text>
                    <Text className="text-blue-500 text-[10px] font-bold mt-1">On Track</Text>
                  </View>
                </View>
              </Animated.View>
              {/* Section Header */}
              <Animated.View
                entering={FadeInDown.delay(200).duration(500)}
                className="flex-row items-center mt-4 mb-4 space-x-4"
              >
                <View className="h-[1px] w-8 bg-purple-500/50" />
                <Text className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] italic">Command Grid</Text>
                <View className="h-[1px] flex-1 bg-slate-800" />
              </Animated.View>

              {/* Navigation Grid */}
              <View className="flex-row flex-wrap justify-between">
                {menuItems.map((item, index) => (
                  <AnimatedTouchable
                    key={index}
                    onPress={() => handlePress(item.route)}
                    entering={FadeInUp.delay(250 + index * 50).springify().damping(12)}
                    style={{ width: ITEM_WIDTH }}
                    className="bg-slate-900/60 rounded-2xl p-4 mb-4 border border-white/5 items-start justify-between h-32 active:scale-95 transition-all overflow-hidden relative"
                  >
                    <View className="absolute right-0 top-0 p-10 bg-purple-500/5 rounded-bl-[100px] -mr-4 -mt-4 opacity-50" />

                    <View className="p-2.5 rounded-xl bg-slate-950 border border-white/5 shadow-inner">
                      <item.icon size={22} color={item.color} />
                    </View>

                    <View>
                      <Text className="text-white font-bold text-sm tracking-wide">{item.title}</Text>
                      <Text className="text-slate-500 text-[10px] font-medium uppercase tracking-wider mt-1">{item.desc}</Text>
                    </View>
                  </AnimatedTouchable>
                ))}
              </View>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </SystemBackground>
  );
}
