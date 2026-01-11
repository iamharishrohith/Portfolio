import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, RefreshControl, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PortfolioService } from '@/services/portfolioService';
import { Stack } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faCode, faDatabase, faServer, faCloud, faMobile, faRobot, faBrain,
    faFire, faBolt, faWind, faLeaf, faGear, faPlus, faXmark, faSave,
    faTrash, faRefresh, faTrophy, faLayerGroup
} from '@fortawesome/free-solid-svg-icons';
import {
    faReact, faJs, faPython, faNodeJs, faHtml5, faCss3Alt, faGithub,
    faDocker, faAws, faGitAlt, faAndroid, faApple, faPhp, faJava,
    faVuejs, faAngular, faBootstrap, faLinux, faNpm, faFigma, faSass,
    faLaravel, faSwift, faMicrosoft
} from '@fortawesome/free-brands-svg-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2 - 8;

// Skill icon mapping
const getSkillIcon = (skillName: string) => {
    const name = skillName.toLowerCase().trim();
    const iconMap: { [key: string]: any } = {
        // Languages
        'javascript': faJs,
        'typescript': faJs,
        'python': faPython,
        'java': faJava,
        'php': faPhp,
        'swift': faSwift,
        'c++': faCode,
        'c#': faMicrosoft,
        // Frontend
        'react': faReact,
        'react native': faReact,
        'vue': faVuejs,
        'angular': faAngular,
        'html': faHtml5,
        'css': faCss3Alt,
        'sass': faSass,
        'tailwind': faWind,
        'bootstrap': faBootstrap,
        'next.js': faReact,
        'nextjs': faReact,
        // Backend
        'node': faNodeJs,
        'nodejs': faNodeJs,
        'node.js': faNodeJs,
        'express': faNodeJs,
        'laravel': faLaravel,
        // Databases  
        'mongodb': faLeaf,
        'mysql': faDatabase,
        'postgresql': faDatabase,
        'firebase': faFire,
        'supabase': faBolt,
        'sql': faDatabase,
        // Cloud & Tools
        'aws': faAws,
        'docker': faDocker,
        'git': faGitAlt,
        'github': faGithub,
        'linux': faLinux,
        'npm': faNpm,
        'figma': faFigma,
        // Mobile
        'android': faAndroid,
        'ios': faApple,
        'flutter': faMobile,
        // AI
        'ai': faBrain,
        'ml': faRobot,
        'machine learning': faRobot,
    };
    return iconMap[name] || faCode;
};

// Get color based on category
const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
        'languages': '#3B82F6',
        'frameworks': '#8B5CF6',
        'tools': '#F59E0B',
        'databases': '#10B981',
        'devops': '#EC4899',
        'design': '#EF4444',
        'mobile': '#06B6D4',
        'vibe coding': '#14B8A6',
    };
    return colors[category.toLowerCase()] || '#A855F7';
};

// Skeleton loader
const SkeletonCard = () => (
    <View className="bg-slate-900 rounded-2xl p-4 mb-4 animate-pulse" style={{ width: CARD_WIDTH }}>
        <View className="w-12 h-12 rounded-xl bg-slate-800 mb-3" />
        <View className="h-4 bg-slate-800 rounded w-3/4 mb-2" />
        <View className="h-3 bg-slate-800 rounded w-1/2 mb-3" />
        <View className="h-2 bg-slate-800 rounded-full w-full" />
    </View>
);

export default function SkillsManager() {
    const insets = useSafeAreaInsets();
    const [skills, setSkills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Filter & Bulk Edit State
    const [selectedFilter, setSelectedFilter] = useState<string>('All');
    const [bulkMode, setBulkMode] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [bulkModalVisible, setBulkModalVisible] = useState(false);
    const [bulkCategory, setBulkCategory] = useState('Languages');

    // Form State
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Languages');
    const [level, setLevel] = useState('50');
    const [description, setDescription] = useState('');

    // Expanded categories list
    const CATEGORIES = [
        'Languages', 'Frameworks', 'Tools', 'Databases', 'DevOps', 'Design', 'Mobile',
        'Vibe Coding', 'AI Agents', 'Blockchain', 'Comp Sci', 'Frontend', 'Backend',
        'Infrastructure', 'Intelligence', 'Realtime', 'Cloud', 'Security'
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await PortfolioService.getSkills();
            setSkills(data || []);
        } catch (error: any) {
            console.log('Skills fetch error:', error.message);
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

    const handleSave = async () => {
        if (!name || !category) {
            Alert.alert('Error', 'Name and Category are required');
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const payload = {
            name,
            category,
            level: parseInt(level) || 50,
            description,
        };

        try {
            await PortfolioService.upsertSkill({
                ...payload,
                id: editingItem?.id
            });

            setModalVisible(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert('Delete Skill', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    try {
                        await PortfolioService.softDelete('skills', id);
                        fetchData();
                    } catch (error: any) {
                        Alert.alert('Error', error.message);
                    }
                }
            }
        ]);
    };

    const openModal = (item: any = null) => {
        Haptics.selectionAsync();
        if (item) {
            setEditingItem(item);
            setName(item.name);
            setCategory(item.category);
            setLevel(String(item.level));
            setDescription(item.description || '');
        } else {
            resetForm();
        }
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingItem(null);
        setName('');
        setCategory('Frontend');
        setLevel('50');
        setDescription('');
    };

    // Filter skills based on selected filter
    const filteredSkills = selectedFilter === 'All'
        ? skills
        : skills.filter(s => s.category === selectedFilter);

    // Group skills by category
    const groupedSkills = filteredSkills.reduce((acc: any, skill) => {
        const cat = skill.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(skill);
        return acc;
    }, {});

    // Calculate total XP from skills
    const totalSkillXp = skills.reduce((acc, s) => acc + (s.level || 0) * 5, 0);

    // Toggle skill selection for bulk edit
    const toggleSkillSelection = (id: string) => {
        setSelectedSkills(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // Bulk update category
    const handleBulkCategoryUpdate = async () => {
        if (selectedSkills.length === 0) {
            Alert.alert('Error', 'No skills selected');
            return;
        }
        try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            // Note: Bulk update not yet in PortfolioService, using direct for now or adding it
            const { error } = await PortfolioService.bulkUpdateCategory('skills', selectedSkills, bulkCategory);
            if (error) throw error;
            setBulkModalVisible(false);
            setSelectedSkills([]);
            setBulkMode(false);
            fetchData();
            Alert.alert('Success', `${selectedSkills.length} skills updated`);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    // Get unique categories from current skills
    const existingCategories = [...new Set(skills.map(s => s.category))].filter(Boolean);

    return (
        <SafeAreaView className="flex-1 bg-slate-950" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-6 pt-4 pb-2 border-b border-slate-800">
                <View className="flex-row justify-between items-center mb-2">
                    <View>
                        <Text className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">Ability Tree</Text>
                        <Text className="text-2xl font-black text-white italic">SKILLS</Text>
                    </View>
                    <View className="flex-row gap-2">
                        {/* Bulk Mode Toggle */}
                        <TouchableOpacity
                            onPress={() => {
                                setBulkMode(!bulkMode);
                                setSelectedSkills([]);
                            }}
                            className={`px-3 py-3 rounded-xl flex-row items-center ${bulkMode ? 'bg-amber-600' : 'bg-slate-800'}`}
                        >
                            <FontAwesomeIcon icon={faLayerGroup as any} size={14} color="white" />
                        </TouchableOpacity>
                        {/* Add Button */}
                        <TouchableOpacity
                            onPress={() => openModal()}
                            className="bg-purple-600 px-4 py-3 rounded-xl flex-row items-center"
                        >
                            <FontAwesomeIcon icon={faPlus as any} size={14} color="white" />
                            <Text className="text-white font-bold ml-2">ADD</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Stats Bar */}
                <View className="flex-row items-center mt-2 bg-slate-900/50 rounded-xl p-3 border border-slate-800">
                    <FontAwesomeIcon icon={faTrophy as any} size={16} color="#F59E0B" />
                    <Text className="text-slate-400 text-xs font-bold ml-2">{skills.length} Skills</Text>
                    <View className="w-[1px] h-4 bg-slate-800 mx-3" />
                    <FontAwesomeIcon icon={faBolt as any} size={16} color="#A855F7" />
                    <Text className="text-purple-400 text-xs font-bold ml-2">+{totalSkillXp} XP</Text>
                    {bulkMode && selectedSkills.length > 0 && (
                        <>
                            <View className="w-[1px] h-4 bg-slate-800 mx-3" />
                            <Text className="text-amber-400 text-xs font-bold">{selectedSkills.length} selected</Text>
                        </>
                    )}
                </View>

                {/* Category Filter Tabs */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mt-3 -mx-2"
                    contentContainerStyle={{ paddingHorizontal: 8 }}
                >
                    <TouchableOpacity
                        onPress={() => setSelectedFilter('All')}
                        className={`px-4 py-2 rounded-lg mr-2 ${selectedFilter === 'All' ? 'bg-purple-600' : 'bg-slate-800'}`}
                    >
                        <Text className={`font-bold text-xs ${selectedFilter === 'All' ? 'text-white' : 'text-slate-400'}`}>
                            All ({skills.length})
                        </Text>
                    </TouchableOpacity>
                    {existingCategories.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setSelectedFilter(cat)}
                            className={`px-4 py-2 rounded-lg mr-2 ${selectedFilter === cat ? 'bg-purple-600' : 'bg-slate-800'}`}
                        >
                            <Text className={`font-bold text-xs ${selectedFilter === cat ? 'text-white' : 'text-slate-400'}`}>
                                {cat} ({skills.filter(s => s.category === cat).length})
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Bulk Action Button */}
                {bulkMode && selectedSkills.length > 0 && (
                    <TouchableOpacity
                        onPress={() => setBulkModalVisible(true)}
                        className="bg-amber-600 mt-3 p-3 rounded-xl flex-row items-center justify-center"
                    >
                        <FontAwesomeIcon icon={faGear as any} size={16} color="white" />
                        <Text className="text-white font-bold ml-2">Change Category for {selectedSkills.length} Skills</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                className="flex-1 px-4 pt-4"
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
                {loading ? (
                    <View className="flex-row flex-wrap justify-between">
                        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                    </View>
                ) : (
                    Object.entries(groupedSkills).map(([category, categorySkills]: [string, any], catIdx) => (
                        <Animated.View
                            key={category}
                            entering={FadeInDown.delay(catIdx * 100).duration(400)}
                            className="mb-6"
                        >
                            {/* Category Header */}
                            <View className="flex-row items-center mb-3">
                                <View
                                    className="w-2 h-6 rounded-full mr-3"
                                    style={{ backgroundColor: getCategoryColor(category) }}
                                />
                                <Text className="text-white font-bold text-sm uppercase tracking-widest">{category}</Text>
                                <View className="flex-1 h-[1px] bg-slate-800 ml-3" />
                            </View>

                            {/* Skills Grid */}
                            <View className="flex-row flex-wrap justify-between">
                                {categorySkills.map((skill: any, idx: number) => (
                                    <Animated.View
                                        key={skill.id}
                                        entering={FadeInUp.delay(idx * 50).springify()}
                                        style={{ width: CARD_WIDTH }}
                                    >
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (bulkMode) {
                                                    toggleSkillSelection(skill.id);
                                                } else {
                                                    openModal(skill);
                                                }
                                            }}
                                            onLongPress={() => handleDelete(skill.id)}
                                            className={`bg-slate-900 rounded-2xl p-4 mb-4 border active:scale-95 ${selectedSkills.includes(skill.id)
                                                ? 'border-amber-500 bg-amber-500/10'
                                                : 'border-slate-800'
                                                }`}
                                        >
                                            {/* Selection Checkbox */}
                                            {bulkMode && (
                                                <View className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 items-center justify-center ${selectedSkills.includes(skill.id)
                                                    ? 'bg-amber-500 border-amber-500'
                                                    : 'border-slate-600'
                                                    }`}>
                                                    {selectedSkills.includes(skill.id) && (
                                                        <Text className="text-white text-xs font-black">✓</Text>
                                                    )}
                                                </View>
                                            )}

                                            {/* Icon */}
                                            <View
                                                className="w-12 h-12 rounded-xl items-center justify-center mb-3"
                                                style={{ backgroundColor: getCategoryColor(category) + '20' }}
                                            >
                                                <FontAwesomeIcon
                                                    icon={getSkillIcon(skill.name) as any}
                                                    size={22}
                                                    color={getCategoryColor(category)}
                                                />
                                            </View>

                                            {/* Name */}
                                            <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>
                                                {skill.name}
                                            </Text>

                                            {/* Level Badge */}
                                            <View className="flex-row items-center mb-3">
                                                <Text className="text-slate-500 text-xs font-medium">Level</Text>
                                                <Text className="text-purple-400 text-xs font-black ml-1">{skill.level}%</Text>
                                            </View>

                                            {/* Progress Bar */}
                                            <View className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <View
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${skill.level}%`,
                                                        backgroundColor: getCategoryColor(category)
                                                    }}
                                                />
                                            </View>

                                            {/* Delete Button (visible when not in bulk mode) */}
                                            {!bulkMode && (
                                                <TouchableOpacity
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(skill.id);
                                                    }}
                                                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/20 items-center justify-center border border-red-500/30"
                                                >
                                                    <FontAwesomeIcon icon={faTrash as any} size={12} color="#EF4444" />
                                                </TouchableOpacity>
                                            )}
                                        </TouchableOpacity>
                                    </Animated.View>
                                ))}
                            </View>
                        </Animated.View>
                    ))
                )}

                {!loading && skills.length === 0 && (
                    <View className="items-center py-16 opacity-50">
                        <FontAwesomeIcon icon={faCode as any} size={48} color="#64748b" />
                        <Text className="text-slate-500 font-bold mt-4">No skills added yet</Text>
                        <Text className="text-slate-600 text-sm">Tap + to add your first skill</Text>
                    </View>
                )}

                <View className="h-24" />
            </ScrollView>

            {/* Bulk Edit Category Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={bulkModalVisible}
                onRequestClose={() => setBulkModalVisible(false)}
            >
                <View className="flex-1 bg-slate-950/90 justify-center px-6">
                    <View className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                        <Text className="text-xl font-black text-white italic mb-4">CHANGE CATEGORY</Text>
                        <Text className="text-slate-400 text-sm mb-4">
                            Select new category for {selectedSkills.length} selected skills:
                        </Text>
                        <ScrollView className="max-h-64">
                            <View className="flex-row flex-wrap gap-2">
                                {CATEGORIES.map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        onPress={() => setBulkCategory(cat)}
                                        className={`px-4 py-2 rounded-lg border ${bulkCategory === cat
                                            ? 'bg-purple-600 border-purple-600'
                                            : 'bg-slate-950 border-slate-800'
                                            }`}
                                    >
                                        <Text className={`font-bold text-sm ${bulkCategory === cat ? 'text-white' : 'text-slate-500'}`}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                        <View className="flex-row gap-3 mt-6">
                            <TouchableOpacity
                                onPress={() => setBulkModalVisible(false)}
                                className="flex-1 bg-slate-800 p-4 rounded-xl items-center"
                            >
                                <Text className="text-white font-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleBulkCategoryUpdate}
                                className="flex-1 bg-amber-600 p-4 rounded-xl items-center"
                            >
                                <Text className="text-white font-bold">Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Add/Edit Modal */}
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
                            {/* Modal Header */}
                            <View className="p-6 border-b border-slate-800 flex-row justify-between items-center bg-slate-900 z-10">
                                <Text className="text-xl font-black text-white italic">
                                    {editingItem ? 'EDIT SKILL' : 'NEW SKILL'}
                                </Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 -mr-2">
                                    <FontAwesomeIcon icon={faXmark as any} size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                className="flex-1 px-6"
                                contentContainerStyle={{ paddingBottom: 100, paddingTop: 24 }}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >
                                <View className="space-y-6">
                                    {/* Name */}
                                    <View>
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Skill Name</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold text-lg h-16"
                                            value={name}
                                            onChangeText={setName}
                                            placeholder="e.g. React, Python, AWS"
                                            placeholderTextColor="#475569"
                                            autoFocus={true}
                                        />
                                    </View>

                                    {/* Category Selector */}
                                    <View>
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Category</Text>
                                        <View className="flex-row flex-wrap gap-2">
                                            {CATEGORIES.map(cat => (
                                                <TouchableOpacity
                                                    key={cat}
                                                    onPress={() => setCategory(cat)}
                                                    className={`px-4 py-2 rounded-xl border ${category === cat
                                                        ? 'bg-purple-600 border-purple-600'
                                                        : 'bg-slate-950 border-slate-800'
                                                        }`}
                                                >
                                                    <Text className={`font-bold text-sm ${category === cat ? 'text-white' : 'text-slate-500'
                                                        }`}>
                                                        {cat}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Level Slider */}
                                    <View>
                                        <View className="flex-row justify-between items-center mb-2">
                                            <Text className="text-slate-400 font-bold text-xs uppercase">Proficiency Level</Text>
                                            <Text className="text-purple-400 font-black text-lg">{level}%</Text>
                                        </View>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold text-center text-2xl h-16"
                                            value={level}
                                            onChangeText={(t) => {
                                                const num = parseInt(t) || 0;
                                                setLevel(String(Math.min(100, Math.max(0, num))));
                                            }}
                                            keyboardType="numeric"
                                            maxLength={3}
                                        />
                                        <View className="flex-row justify-between mt-3">
                                            {[25, 50, 75, 100].map(val => (
                                                <TouchableOpacity
                                                    key={val}
                                                    onPress={() => setLevel(String(val))}
                                                    className="bg-slate-800 px-5 py-3 rounded-xl"
                                                >
                                                    <Text className="text-slate-400 font-bold text-sm">{val}%</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Description */}
                                    <View>
                                        <Text className="text-slate-400 font-bold text-xs uppercase mb-2">Description (Optional)</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white h-32 text-base"
                                            value={description}
                                            onChangeText={setDescription}
                                            placeholder="Brief description of your experience..."
                                            placeholderTextColor="#475569"
                                            multiline
                                            textAlignVertical="top"
                                        />
                                    </View>
                                </View>
                            </ScrollView>

                            {/* Save Button */}
                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
                            >
                                <View className="p-6 border-t border-slate-800 bg-slate-900 pb-8">
                                    <TouchableOpacity
                                        onPress={handleSave}
                                        className="bg-purple-600 w-full p-4 rounded-2xl items-center flex-row justify-center shadow-lg shadow-purple-900/30 active:scale-95 transition-transform"
                                    >
                                        <FontAwesomeIcon icon={faSave} size={20} color="white" />
                                        <Text className="text-white font-black text-lg ml-3 italic">SAVE SKILL</Text>
                                    </TouchableOpacity>
                                </View>
                            </KeyboardAvoidingView>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal >
        </SafeAreaView >
    );
}
