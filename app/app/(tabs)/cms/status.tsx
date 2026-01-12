import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Stack } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faUser, faSave, faCrown, faShieldHalved, faCircleInfo, faRefresh,
    faBolt, faTrophy, faRankingStar, faCalculator
} from '@fortawesome/free-solid-svg-icons';
import { calculateTotalXp, getLevelFromXp, getRankFromLevel } from '@/lib/xpCalculator';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, useSharedValue, withTiming, useAnimatedStyle, Easing } from 'react-native-reanimated';

export default function StatusManager() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Profile State
    const [fullName, setFullName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [level, setLevel] = useState(1);
    const [rank, setRank] = useState('E');
    const [title, setTitle] = useState('');
    const [totalXp, setTotalXp] = useState(0);
    const [currentXp, setCurrentXp] = useState(0);
    const [nextLevelXp, setNextLevelXp] = useState(100);
    const [xpBreakdown, setXpBreakdown] = useState<any>(null);
    const [codingStats, setCodingStats] = useState<any>({});

    // XP Animation
    const xpWidth = useSharedValue(0);
    const xpAnimatedStyle = useAnimatedStyle(() => ({
        width: `${xpWidth.value}%`,
    }));

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .single();

            if (data) {
                setFullName(data.full_name || '');
                setJobTitle(data.job_title || 'Hunter');
                setLevel(data.level || 1);
                setRank(data.rank || 'E');
                setTitle(data.title || 'None');
                setTotalXp(data.total_xp || 0);
                setCodingStats(data.coding_stats || {});
            }

            // Calculate current XP breakdown
            const { totalXp: calcXp, breakdown } = await calculateTotalXp();
            const levelInfo = getLevelFromXp(calcXp || 0);

            setTotalXp(calcXp || 0);
            setCurrentXp(levelInfo.currentXp || 0);
            setNextLevelXp(levelInfo.nextLevelXp || 100);
            setLevel(levelInfo.level || 1);
            setRank(getRankFromLevel(levelInfo.level || 1));
            setXpBreakdown(breakdown);

            // Animate XP bar with NaN protection
            const safeCurrentXp = levelInfo.currentXp || 0;
            const safeNextLevelXp = levelInfo.nextLevelXp || 100;
            const percent = safeNextLevelXp > 0 ? (safeCurrentXp / safeNextLevelXp) * 100 : 0;
            xpWidth.value = withTiming(isNaN(percent) ? 0 : percent, { duration: 1000, easing: Easing.out(Easing.cubic) });

        } catch (error: any) {
            console.log('Profile error:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await fetchProfile();
        setRefreshing(false);
    };

    const handleRecalculate = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSaving(true);

        try {
            const { totalXp: calcXp, breakdown } = await calculateTotalXp();
            const levelInfo = getLevelFromXp(calcXp);
            const calculatedRank = getRankFromLevel(levelInfo.level);

            // Update profile
            const { data: profile } = await supabase.from('profiles').select('id').single();
            if (profile) {
                await supabase.from('profiles').update({
                    level: levelInfo.level,
                    xp: levelInfo.currentXp,
                    rank: calculatedRank,
                    total_xp: calcXp
                }).eq('id', profile.id);
            }

            setTotalXp(calcXp);
            setCurrentXp(levelInfo.currentXp);
            setNextLevelXp(levelInfo.nextLevelXp);
            setLevel(levelInfo.level);
            setRank(calculatedRank);
            setXpBreakdown(breakdown);

            const percent = (levelInfo.currentXp / levelInfo.nextLevelXp) * 100;
            xpWidth.value = withTiming(percent, { duration: 800 });

            Alert.alert('✨ XP Synced!', `Level ${levelInfo.level} (${calculatedRank}-Rank)\nTotal XP: ${calcXp}`);

        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        try {
            const updates = {
                full_name: fullName,
                job_title: jobTitle,
                title: title,
                coding_stats: codingStats,
                updated_at: new Date(),
            };

            const { data: current } = await supabase.from('profiles').select('id').single();

            if (current) {
                const { error } = await supabase
                    .from('profiles')
                    .update(updates)
                    .eq('id', current.id);

                if (error) throw error;
                Alert.alert('✓ Saved', 'Hunter Status Updated');
            }

        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setSaving(false);
        }
    };

    const getRankColor = (r: string) => {
        const colors: { [key: string]: string } = {
            'E': '#64748B',
            'D': '#22C55E',
            'C': '#3B82F6',
            'B': '#8B5CF6',
            'A': '#F59E0B',
            'S': '#EF4444',
        };
        return colors[r] || '#64748B';
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-950" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="p-6 pt-2 pb-4 border-b border-slate-800">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">System</Text>
                        <Text className="text-2xl font-black text-white italic">STATUS</Text>
                    </View>
                    <View className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 items-center justify-center">
                        <FontAwesomeIcon icon={faUser} size={20} color="#94a3b8" />
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 py-6"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#A855F7"
                        colors={['#A855F7']}
                    />
                }
            >
                {/* Level & XP Display */}
                <Animated.View
                    entering={FadeInDown.duration(600)}
                    className="bg-gradient-to-br from-purple-900/30 to-slate-900 rounded-2xl p-6 border border-purple-500/20 mb-6"
                >
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <View
                                className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
                                style={{ backgroundColor: getRankColor(rank) + '30' }}
                            >
                                <Text
                                    className="text-3xl font-black"
                                    style={{ color: getRankColor(rank) }}
                                >
                                    {rank}
                                </Text>
                            </View>
                            <View>
                                <Text className="text-white font-black text-2xl">Level {level}</Text>
                                <Text className="text-slate-400 text-xs font-medium">{rank}-Rank Hunter</Text>
                            </View>
                        </View>
                        <FontAwesomeIcon icon={faTrophy} size={24} color={getRankColor(rank)} />
                    </View>

                    {/* XP Progress */}
                    <View className="mb-2">
                        <View className="flex-row justify-between mb-1">
                            <Text className="text-slate-500 text-xs font-bold">XP to Next Level</Text>
                            <Text className="text-purple-400 text-xs font-bold">{currentXp} / {nextLevelXp}</Text>
                        </View>
                        <View className="h-3 bg-slate-800 rounded-full overflow-hidden">
                            <Animated.View
                                className="h-full bg-purple-600 rounded-full"
                                style={xpAnimatedStyle}
                            />
                        </View>
                    </View>

                    <Text className="text-slate-500 text-xs text-center">Total XP: {totalXp}</Text>
                </Animated.View>

                {/* XP Breakdown */}
                {xpBreakdown && (
                    <Animated.View
                        entering={FadeInDown.delay(100).duration(600)}
                        className="bg-slate-900 rounded-2xl p-4 border border-slate-800 mb-6"
                    >
                        <View className="flex-row items-center mb-3">
                            <FontAwesomeIcon icon={faRankingStar} size={14} color="#F59E0B" />
                            <Text className="text-slate-300 font-bold text-xs uppercase tracking-widest ml-2">XP Sources</Text>
                        </View>
                        <View className="space-y-2">
                            {[
                                { label: 'Skills', value: xpBreakdown.skills, icon: faBolt },
                                { label: 'Projects', value: xpBreakdown.projects, icon: faShieldHalved },
                                { label: 'Certifications', value: xpBreakdown.certifications, icon: faTrophy },
                                { label: 'Experiences', value: xpBreakdown.experiences, icon: faUser },
                                { label: 'Achievements', value: xpBreakdown.achievements, icon: faCrown },
                                { label: 'Courses', value: xpBreakdown.courses, icon: faCircleInfo },
                            ].map((item, idx) => (
                                <View key={idx} className="flex-row items-center justify-between py-2 border-b border-slate-800/50 mb-1">
                                    <View className="flex-row items-center">
                                        <FontAwesomeIcon icon={item.icon} size={12} color="#64748b" />
                                        <Text className="text-slate-400 text-sm ml-2">{item.label}</Text>
                                    </View>
                                    <Text className="text-purple-400 font-bold text-sm">+{item.value} XP</Text>
                                </View>
                            ))}
                        </View>
                    </Animated.View>
                )}

                {/* Recalculate Button */}
                <TouchableOpacity
                    onPress={handleRecalculate}
                    disabled={saving}
                    className="bg-emerald-600 w-full p-4 rounded-xl items-center flex-row justify-center mb-6"
                >
                    <FontAwesomeIcon icon={faCalculator} size={18} color="white" />
                    <Text className="text-white font-black text-base ml-2">
                        {saving ? 'SYNCING...' : 'RECALCULATE XP'}
                    </Text>
                </TouchableOpacity>

                {/* Identity Section */}
                <Animated.View
                    entering={FadeInDown.delay(200).duration(600)}
                    className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 mb-6"
                >
                    <View className="flex-row items-center gap-3 mb-4">
                        <FontAwesomeIcon icon={faCircleInfo} size={16} color="#60A5FA" />
                        <Text className="text-slate-300 font-bold uppercase text-xs tracking-widest">Identity</Text>
                    </View>

                    <View className="space-y-4">
                        <View className="mb-4">
                            <Text className="text-slate-500 text-[10px] font-bold uppercase mb-2">Full Name</Text>
                            <TextInput
                                className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold text-lg"
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Hunter Name"
                                placeholderTextColor="#475569"
                            />
                        </View>
                        <View className="mb-4">
                            <Text className="text-slate-500 text-[10px] font-bold uppercase mb-2">Job Class</Text>
                            <TextInput
                                className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold"
                                value={jobTitle}
                                onChangeText={setJobTitle}
                                placeholder="e.g. Shadow Monarch"
                                placeholderTextColor="#475569"
                            />
                        </View>
                        <View className="mb-4">
                            <Text className="text-slate-500 text-[10px] font-bold uppercase mb-2">Title</Text>
                            <TextInput
                                className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-purple-400 font-bold tracking-widest text-center uppercase"
                                value={title}
                                onChangeText={setTitle}
                                placeholder="THE PLAYER"
                                placeholderTextColor="#475569"
                            />
                        </View>

                        {/* Integrations Section */}
                        <View className="pt-4 border-t border-slate-800 mt-2">
                            <View className="flex-row items-center gap-2 mb-4">
                                <FontAwesomeIcon icon={faCircleInfo} size={14} color="#FBBF24" />
                                <Text className="text-slate-300 font-bold uppercase text-xs tracking-widest">System Uplinks</Text>
                            </View>

                            <View className="mb-4">
                                <Text className="text-slate-500 text-[10px] font-bold uppercase mb-2">GitHub Username</Text>
                                <TextInput
                                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-medium"
                                    value={codingStats?.github_username || ''}
                                    onChangeText={(text) => setCodingStats(prev => ({ ...prev, github_username: text }))}
                                    placeholder="GitHub User"
                                    placeholderTextColor="#475569"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-slate-500 text-[10px] font-bold uppercase mb-2">LeetCode Username</Text>
                                <TextInput
                                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-medium"
                                    value={codingStats?.leetcode_username || ''}
                                    onChangeText={(text) => setCodingStats(prev => ({ ...prev, leetcode_username: text }))}
                                    placeholder="LeetCode User"
                                    placeholderTextColor="#475569"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>
                    </View>
                </Animated.View>

                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    className="bg-blue-600 w-full p-5 rounded-xl items-center flex-row justify-center shadow-lg shadow-blue-900/20 active:bg-blue-700"
                >
                    <FontAwesomeIcon icon={faSave} size={20} color="white" />
                    <Text className="text-white font-black text-lg ml-2 italic">UPDATE IDENTITY</Text>
                </TouchableOpacity>

                <View className="h-24" />
            </ScrollView>
        </SafeAreaView>
    );
}
