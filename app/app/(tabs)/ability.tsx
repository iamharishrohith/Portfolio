import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Stack, useRouter } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faCode, faDatabase, faServer, faCloud, faMobile, faBrain,
    faFire, faBolt, faWind, faLeaf, faGear, faXmark, faTrophy,
    faImage, faVideo, faPenRuler, faFilm, faCube, faTerminal
} from '@fortawesome/free-solid-svg-icons';
import {
    faReact, faJs, faPython, faNodeJs, faHtml5, faCss3Alt, faGithub,
    faDocker, faAws, faGitAlt, faAndroid, faApple, faJava, faPhp,
    faVuejs, faAngular, faFigma
} from '@fortawesome/free-brands-svg-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { FloatingHome } from '@/components/FloatingHome';

const { width } = Dimensions.get('window');
const SKILL_SIZE = (width - 80) / 4;

// Icon mapping
const getSkillIcon = (name: string) => {
    const iconMap: { [key: string]: any } = {
        'javascript': faJs, 'typescript': faJs, 'python': faPython, 'java': faJava,
        'react': faReact, 'react native': faReact, 'vue': faVuejs, 'angular': faAngular,
        'node': faNodeJs, 'nodejs': faNodeJs, 'html': faHtml5, 'css': faCss3Alt,
        'git': faGitAlt, 'github': faGithub, 'docker': faDocker, 'aws': faAws,
        'android': faAndroid, 'ios': faApple, 'figma': faFigma, 'php': faPhp,
        'mongodb': faLeaf, 'firebase': faFire, 'supabase': faBolt,
        'photoshop': faImage, 'illustrator': faPenRuler, 'after effects': faFilm,
        'premiere': faVideo, 'blender': faCube, 'tailwind': faWind,
    };
    return iconMap[name.toLowerCase()] || faCode;
};

// Category colors and icons
const CATEGORY_CONFIG: { [key: string]: { color: string; gradient: string; icon: any } } = {
    'Languages': { color: '#3B82F6', gradient: '#1D4ED8', icon: faCode },
    'Frameworks': { color: '#8B5CF6', gradient: '#6D28D9', icon: faReact },
    'Tools': { color: '#F59E0B', gradient: '#D97706', icon: faGear },
    'Databases': { color: '#10B981', gradient: '#059669', icon: faDatabase },
    'DevOps': { color: '#EC4899', gradient: '#DB2777', icon: faCloud },
    'Design': { color: '#EF4444', gradient: '#DC2626', icon: faPenRuler },
    'Mobile': { color: '#06B6D4', gradient: '#0891B2', icon: faMobile },
    'Vibe Coding': { color: '#14B8A6', gradient: '#0D9488', icon: faBrain },
    'AI Agents': { color: '#F97316', gradient: '#EA580C', icon: faBrain },
    'App': { color: '#84CC16', gradient: '#65A30D', icon: faMobile },
    'Blockchain': { color: '#A855F7', gradient: '#9333EA', icon: faDatabase },
    'Comp Sci': { color: '#0EA5E9', gradient: '#0284C7', icon: faCode },
    'Frontend': { color: '#3B82F6', gradient: '#1D4ED8', icon: faReact },
    'Infrastructure': { color: '#64748B', gradient: '#475569', icon: faCloud },
    'Intelligence': { color: '#EC4899', gradient: '#DB2777', icon: faBrain },
    'Next.js': { color: '#000000', gradient: '#171717', icon: faCode },
    'Realtime': { color: '#22C55E', gradient: '#16A34A', icon: faBolt },
    'Solidity': { color: '#6366F1', gradient: '#4F46E5', icon: faDatabase },
};

export default function AbilityTreeScreen() {
    const router = useRouter();
    const [skills, setSkills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('skills')
            .select('*')
            .order('level', { ascending: false });
        setSkills(data || []);
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await fetchSkills();
        setRefreshing(false);
    };

    const openSkillDetail = (skill: any) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelectedSkill(skill);
        setModalVisible(true);
    };

    // Group by category
    const groupedSkills = skills.reduce((acc: any, skill) => {
        const cat = skill.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(skill);
        return acc;
    }, {});

    // Calculate total power
    const totalPower = skills.reduce((acc, s) => acc + (parseInt(s.level) || 0), 0);
    const avgPower = skills.length > 0 ? Math.round(totalPower / skills.length) : 0;

    // Get rarity based on level
    const getRarity = (level: number) => {
        if (level >= 90) return { name: 'LEGENDARY', color: '#F59E0B', bg: 'bg-amber-500/20' };
        if (level >= 75) return { name: 'EPIC', color: '#8B5CF6', bg: 'bg-purple-500/20' };
        if (level >= 50) return { name: 'RARE', color: '#3B82F6', bg: 'bg-blue-500/20' };
        if (level >= 25) return { name: 'UNCOMMON', color: '#10B981', bg: 'bg-green-500/20' };
        return { name: 'COMMON', color: '#64748B', bg: 'bg-slate-500/20' };
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-950" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />
            <FloatingHome />

            <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A855F7" />}
            >
                {/* Header */}
                <View className="px-6 pt-4 pb-2">
                    <Text className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">Hunter System</Text>
                    <Text className="text-3xl font-black text-white italic">
                        ABILITY <Text className="text-purple-500">TREE</Text>
                    </Text>
                </View>

                {/* Power Stats */}
                <Animated.View entering={FadeInDown.duration(600)} className="mx-6 mb-6 bg-gradient-to-r from-purple-900/30 to-slate-900 rounded-2xl p-5 border border-purple-500/20">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-slate-400 text-xs font-bold uppercase">Total Power</Text>
                            <Text className="text-4xl font-black text-white">{totalPower}<Text className="text-lg text-slate-500"> pts</Text></Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-slate-400 text-xs font-bold uppercase">Avg Level</Text>
                            <View className="flex-row items-center">
                                <Text className="text-2xl font-black text-purple-400">{avgPower}%</Text>
                            </View>
                        </View>
                        <View className="w-20 h-20 rounded-full border-4 border-purple-500 items-center justify-center bg-purple-500/20">
                            <FontAwesomeIcon icon={faTrophy} size={28} color="#A855F7" />
                        </View>
                    </View>

                    {/* Category Distribution */}
                    <View className="flex-row mt-4 h-2 rounded-full overflow-hidden bg-slate-800">
                        {Object.entries(groupedSkills).map(([cat, catSkills]: [string, any], idx) => {
                            const pct = (catSkills.length / skills.length) * 100;
                            return (
                                <View
                                    key={cat}
                                    style={{ width: `${pct}%`, backgroundColor: CATEGORY_CONFIG[cat]?.color || '#64748b' }}
                                    className="h-full"
                                />
                            );
                        })}
                    </View>
                    <View className="flex-row flex-wrap mt-2 gap-2">
                        {Object.entries(groupedSkills).map(([cat, catSkills]: [string, any]) => (
                            <View key={cat} className="flex-row items-center">
                                <View className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: CATEGORY_CONFIG[cat]?.color || '#64748b' }} />
                                <Text className="text-slate-500 text-[10px]">{cat}: {catSkills.length}</Text>
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* Ability Tree by Category */}
                {Object.entries(groupedSkills).map(([category, categorySkills]: [string, any], catIdx) => {
                    const config = CATEGORY_CONFIG[category] || { color: '#64748B', gradient: '#475569', icon: faCode };

                    return (
                        <Animated.View
                            key={category}
                            entering={FadeInUp.delay(catIdx * 100).duration(500)}
                            className="mb-6 mx-4"
                        >
                            {/* Category Header */}
                            <View className="flex-row items-center mb-4 px-2">
                                <View
                                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                                    style={{ backgroundColor: config.color + '30' }}
                                >
                                    <FontAwesomeIcon icon={config.icon} size={18} color={config.color} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-black text-lg uppercase tracking-wider">{category}</Text>
                                    <Text className="text-slate-500 text-xs">{categorySkills.length} abilities</Text>
                                </View>
                            </View>

                            {/* Skills Grid - Tree Style */}
                            <View className="flex-row flex-wrap justify-center">
                                {categorySkills.map((skill: any, idx: number) => {
                                    const rarity = getRarity(skill.level);
                                    return (
                                        <TouchableOpacity
                                            key={skill.id}
                                            onPress={() => openSkillDetail(skill)}
                                            className="items-center mb-4"
                                            style={{ width: SKILL_SIZE + 16 }}
                                        >
                                            {/* Skill Node */}
                                            <View
                                                className="rounded-2xl items-center justify-center border-2 mb-2"
                                                style={{
                                                    width: SKILL_SIZE,
                                                    height: SKILL_SIZE,
                                                    backgroundColor: config.color + '15',
                                                    borderColor: skill.level >= 75 ? config.color : config.color + '50'
                                                }}
                                            >
                                                {/* Glow effect for high level */}
                                                {skill.level >= 75 && (
                                                    <View
                                                        className="absolute inset-0 rounded-2xl"
                                                        style={{
                                                            shadowColor: config.color,
                                                            shadowOffset: { width: 0, height: 0 },
                                                            shadowOpacity: 0.5,
                                                            shadowRadius: 10,
                                                        }}
                                                    />
                                                )}

                                                <FontAwesomeIcon
                                                    icon={getSkillIcon(skill.name)}
                                                    size={SKILL_SIZE * 0.35}
                                                    color={config.color}
                                                />

                                                {/* Level Badge */}
                                                <View
                                                    className="absolute -bottom-1 px-2 py-0.5 rounded-full"
                                                    style={{ backgroundColor: config.color }}
                                                >
                                                    <Text className="text-white text-[9px] font-black">{skill.level}%</Text>
                                                </View>
                                            </View>

                                            {/* Skill Name */}
                                            <Text className="text-white text-[10px] font-bold text-center" numberOfLines={1}>
                                                {skill.name}
                                            </Text>

                                            {/* Rarity Tag */}
                                            {skill.level >= 75 && (
                                                <Text className="text-[8px] font-bold mt-0.5" style={{ color: rarity.color }}>
                                                    {rarity.name}
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </Animated.View>
                    );
                })}

                {skills.length === 0 && !loading && (
                    <View className="items-center py-20 opacity-50">
                        <FontAwesomeIcon icon={faCode} size={64} color="#64748b" />
                        <Text className="text-slate-500 font-bold mt-4 text-lg">No abilities unlocked</Text>
                        <Text className="text-slate-600 text-sm mt-1">Add skills in the CMS</Text>
                    </View>
                )}

                {/* CMS Link */}
                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push('/(tabs)/cms/skills');
                    }}
                    className="mx-6 mb-8 flex-row items-center justify-center p-4 bg-slate-900 border border-purple-500/30 rounded-xl"
                >
                    <FontAwesomeIcon icon={faGear} size={16} color="#A855F7" />
                    <Text className="text-purple-400 font-bold ml-2 uppercase tracking-wider text-xs">Manage Abilities</Text>
                </TouchableOpacity>

                <View className="h-20" />
            </ScrollView>

            {/* Skill Detail Modal */}
            <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View className="flex-1 bg-slate-950/95 justify-center items-center px-8">
                    {selectedSkill && (
                        <Animated.View
                            entering={FadeIn.duration(300)}
                            className="bg-slate-900 rounded-3xl border border-slate-800 w-full max-w-sm overflow-hidden"
                        >
                            {/* Header */}
                            <View
                                className="p-6 items-center"
                                style={{ backgroundColor: (CATEGORY_CONFIG[selectedSkill.category]?.color || '#64748b') + '20' }}
                            >
                                <TouchableOpacity
                                    onPress={() => setModalVisible(false)}
                                    className="absolute top-4 right-4"
                                >
                                    <FontAwesomeIcon icon={faXmark} size={24} color="#64748b" />
                                </TouchableOpacity>

                                <View
                                    className="w-24 h-24 rounded-2xl items-center justify-center border-2 mb-4"
                                    style={{
                                        backgroundColor: (CATEGORY_CONFIG[selectedSkill.category]?.color || '#64748b') + '30',
                                        borderColor: CATEGORY_CONFIG[selectedSkill.category]?.color || '#64748b'
                                    }}
                                >
                                    <FontAwesomeIcon
                                        icon={getSkillIcon(selectedSkill.name)}
                                        size={40}
                                        color={CATEGORY_CONFIG[selectedSkill.category]?.color || '#64748b'}
                                    />
                                </View>

                                <Text className="text-white font-black text-2xl italic text-center">{selectedSkill.name}</Text>
                                <View className={`mt-2 px-3 py-1 rounded-full ${getRarity(selectedSkill.level).bg}`}>
                                    <Text className="text-xs font-bold" style={{ color: getRarity(selectedSkill.level).color }}>
                                        {getRarity(selectedSkill.level).name}
                                    </Text>
                                </View>
                            </View>

                            {/* Stats */}
                            <View className="p-6">
                                <View className="flex-row justify-between items-center mb-4">
                                    <Text className="text-slate-400 font-bold uppercase text-xs">Proficiency Level</Text>
                                    <Text className="text-white font-black text-2xl">{selectedSkill.level}%</Text>
                                </View>

                                {/* Progress Bar */}
                                <View className="h-3 bg-slate-800 rounded-full overflow-hidden mb-4">
                                    <View
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${selectedSkill.level}%`,
                                            backgroundColor: CATEGORY_CONFIG[selectedSkill.category]?.color || '#64748b'
                                        }}
                                    />
                                </View>

                                {/* Category & XP */}
                                <View className="flex-row gap-3">
                                    <View className="flex-1 bg-slate-800 rounded-xl p-3">
                                        <Text className="text-slate-500 text-[10px] font-bold uppercase">Category</Text>
                                        <Text className="text-white font-bold text-sm">{selectedSkill.category}</Text>
                                    </View>
                                    <View className="flex-1 bg-slate-800 rounded-xl p-3">
                                        <Text className="text-slate-500 text-[10px] font-bold uppercase">XP Value</Text>
                                        <Text className="text-purple-400 font-bold text-sm">+{selectedSkill.level * 5} XP</Text>
                                    </View>
                                </View>

                                {selectedSkill.description && (
                                    <View className="mt-4 bg-slate-800/50 rounded-xl p-3">
                                        <Text className="text-slate-400 text-sm leading-5">{selectedSkill.description}</Text>
                                    </View>
                                )}
                            </View>
                        </Animated.View>
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
}
