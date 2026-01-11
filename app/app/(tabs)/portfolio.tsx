import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { FloatingHome } from '@/components/FloatingHome';
import { Briefcase, ExternalLink, Github, Plus, Star, Code, Layers } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Skeleton Component
const SkeletonCard = () => (
    <View className="mb-6 bg-slate-900 rounded-2xl p-5 border border-slate-800 animate-pulse">
        <View className="h-6 bg-slate-800 rounded w-3/4 mb-3" />
        <View className="h-4 bg-slate-800 rounded w-full mb-2" />
        <View className="h-4 bg-slate-800 rounded w-2/3 mb-4" />
        <View className="flex-row gap-2">
            <View className="h-6 bg-slate-800 rounded w-16" />
            <View className="h-6 bg-slate-800 rounded w-16" />
        </View>
    </View>
);

export default function PortfolioScreen() {
    const router = useRouter();
    const [projects, setProjects] = useState<any[]>([]);
    const [skills, setSkills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'projects' | 'skills'>('projects');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [projectsRes, skillsRes] = await Promise.all([
            supabase.from('projects').select('*').order('is_featured', { ascending: false }),
            supabase.from('skills').select('*').order('level', { ascending: false }).limit(12),
        ]);
        setProjects(projectsRes.data || []);
        setSkills(skillsRes.data || []);
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await fetchData();
        setRefreshing(false);
    };

    const handleTabChange = (tab: 'projects' | 'skills') => {
        Haptics.selectionAsync();
        setActiveTab(tab);
    };

    // Group skills by category
    const groupedSkills = skills.reduce((acc: any, skill) => {
        const cat = skill.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(skill);
        return acc;
    }, {});

    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            'Languages': '#3B82F6',
            'Frameworks': '#8B5CF6',
            'Tools': '#F59E0B',
            'Databases': '#10B981',
            'DevOps': '#EC4899',
            'Design': '#EF4444',
            'Mobile': '#06B6D4',
        };
        return colors[category] || '#A855F7';
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-950" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />
            <FloatingHome />

            {/* Header */}
            <View className="px-6 pt-4 pb-2">
                <Text className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-1">Live Portfolio</Text>
                <Text className="text-3xl font-black text-white italic">
                    PROJECT <Text className="text-purple-500">LAB</Text>
                </Text>
            </View>

            {/* Stats Bar */}
            <View className="flex-row mx-6 mb-4 bg-slate-900/50 rounded-xl p-3 border border-slate-800">
                <View className="flex-row items-center flex-1">
                    <Briefcase size={14} color="#A855F7" />
                    <Text className="text-slate-400 text-xs font-bold ml-2">{projects.length} Projects</Text>
                </View>
                <View className="w-[1px] h-4 bg-slate-800" />
                <View className="flex-row items-center flex-1 justify-center">
                    <Layers size={14} color="#3B82F6" />
                    <Text className="text-slate-400 text-xs font-bold ml-2">{skills.length} Skills</Text>
                </View>
                <View className="w-[1px] h-4 bg-slate-800" />
                <View className="flex-row items-center flex-1 justify-end">
                    <Star size={14} color="#F59E0B" />
                    <Text className="text-slate-400 text-xs font-bold ml-2">{projects.filter(p => p.is_featured).length} Featured</Text>
                </View>
            </View>

            {/* Tab Switcher */}
            <View className="flex-row mx-6 mb-4 bg-slate-900 rounded-xl p-1 border border-slate-800">
                <TouchableOpacity
                    onPress={() => handleTabChange('projects')}
                    className={`flex-1 py-3 rounded-lg ${activeTab === 'projects' ? 'bg-purple-600' : ''}`}
                >
                    <Text className={`text-center font-bold ${activeTab === 'projects' ? 'text-white' : 'text-slate-500'}`}>
                        Projects
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleTabChange('skills')}
                    className={`flex-1 py-3 rounded-lg ${activeTab === 'skills' ? 'bg-blue-600' : ''}`}
                >
                    <Text className={`text-center font-bold ${activeTab === 'skills' ? 'text-white' : 'text-slate-500'}`}>
                        Skills
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 px-6"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A855F7" />}
            >
                {activeTab === 'projects' ? (
                    <>
                        {loading ? (
                            <>
                                <SkeletonCard />
                                <SkeletonCard />
                            </>
                        ) : (
                            projects.map((project, index) => (
                                <Animated.View
                                    key={project.id}
                                    entering={FadeInUp.delay(index * 100).springify()}
                                    className="mb-5"
                                >
                                    <View className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg shadow-purple-900/10">
                                        {/* Featured Badge */}
                                        {project.is_featured && (
                                            <View className="absolute top-3 right-3 bg-amber-500 px-2 py-1 rounded-full z-10 flex-row items-center">
                                                <Star size={10} color="white" />
                                                <Text className="text-white text-[10px] font-bold ml-1">FEATURED</Text>
                                            </View>
                                        )}

                                        {/* Project Header */}
                                        <View className="p-5 border-b border-slate-800">
                                            <Text className="text-white font-black text-xl italic pr-20">{project.title}</Text>
                                            <View className="flex-row flex-wrap mt-3 gap-2">
                                                {project.tech_stack?.slice(0, 5).map((tech: string, i: number) => (
                                                    <View key={i} className="px-2 py-1 bg-purple-500/10 rounded border border-purple-500/20">
                                                        <Text className="text-purple-300 text-[10px] font-bold uppercase">{tech}</Text>
                                                    </View>
                                                ))}
                                                {project.tech_stack?.length > 5 && (
                                                    <View className="px-2 py-1 bg-slate-800 rounded">
                                                        <Text className="text-slate-400 text-[10px] font-bold">+{project.tech_stack.length - 5}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>

                                        {/* Description */}
                                        <View className="p-5">
                                            <Text className="text-slate-400 text-sm leading-6" numberOfLines={3}>
                                                {project.description}
                                            </Text>

                                            {/* Links */}
                                            <View className="flex-row gap-3 mt-4">
                                                {project.github_url && (
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                            Linking.openURL(project.github_url);
                                                        }}
                                                        className="flex-1 flex-row items-center justify-center p-3 bg-slate-950 rounded-xl border border-slate-800"
                                                    >
                                                        <Github size={16} color="white" />
                                                        <Text className="text-white font-bold text-xs ml-2">Code</Text>
                                                    </TouchableOpacity>
                                                )}
                                                {project.demo_url && (
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                            Linking.openURL(project.demo_url);
                                                        }}
                                                        className="flex-1 flex-row items-center justify-center p-3 bg-purple-600 rounded-xl"
                                                    >
                                                        <ExternalLink size={16} color="white" />
                                                        <Text className="text-white font-bold text-xs ml-2">Live Demo</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                </Animated.View>
                            ))
                        )}

                        {projects.length === 0 && !loading && (
                            <View className="items-center py-16 opacity-50">
                                <Briefcase size={48} color="#64748b" />
                                <Text className="text-slate-500 font-bold mt-4">No projects yet</Text>
                            </View>
                        )}
                    </>
                ) : (
                    /* Skills Tab */
                    <>
                        {Object.entries(groupedSkills).map(([category, categorySkills]: [string, any], catIdx) => (
                            <Animated.View
                                key={category}
                                entering={FadeInDown.delay(catIdx * 100)}
                                className="mb-6"
                            >
                                <View className="flex-row items-center mb-3">
                                    <View
                                        className="w-2 h-6 rounded-full mr-3"
                                        style={{ backgroundColor: getCategoryColor(category) }}
                                    />
                                    <Text className="text-white font-bold text-sm uppercase tracking-widest">{category}</Text>
                                </View>

                                <View className="flex-row flex-wrap gap-2">
                                    {categorySkills.map((skill: any, idx: number) => (
                                        <View
                                            key={skill.id}
                                            className="bg-slate-900 rounded-xl px-4 py-3 border border-slate-800"
                                        >
                                            <View className="flex-row items-center">
                                                <Code size={12} color={getCategoryColor(category)} />
                                                <Text className="text-white font-bold text-sm ml-2">{skill.name}</Text>
                                            </View>
                                            <View className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden w-24">
                                                <View
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${skill.level}%`,
                                                        backgroundColor: getCategoryColor(category)
                                                    }}
                                                />
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </Animated.View>
                        ))}

                        {skills.length === 0 && !loading && (
                            <View className="items-center py-16 opacity-50">
                                <Layers size={48} color="#64748b" />
                                <Text className="text-slate-500 font-bold mt-4">No skills added</Text>
                            </View>
                        )}
                    </>
                )}

                {/* CMS Button */}
                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push(activeTab === 'projects' ? '/(tabs)/cms/projects' : '/(tabs)/cms/skills');
                    }}
                    className="flex-row items-center justify-center p-4 bg-slate-900 border border-purple-500/30 rounded-xl mb-6"
                >
                    <Plus size={20} color="#A855F7" />
                    <Text className="text-purple-400 font-bold ml-2 uppercase tracking-wider text-xs">
                        Manage {activeTab === 'projects' ? 'Projects' : 'Skills'} in CMS
                    </Text>
                </TouchableOpacity>

                <View className="h-24" />
            </ScrollView>
        </SafeAreaView>
    );
}
