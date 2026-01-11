import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PortfolioService } from '@/services/portfolioService';
import { Boxes, Plus, X, Save, Trash2, Github, ExternalLink, Image as ImageIcon, FileText, BarChart3 } from 'lucide-react-native';
import { Stack } from 'expo-router';

export default function ProjectsManager() {
    const insets = useSafeAreaInsets();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProject, setEditingProject] = useState<any>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [techStack, setTechStack] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [demoUrl, setDemoUrl] = useState('');
    const [deadline, setDeadline] = useState('');
    const [caseStudyContent, setCaseStudyContent] = useState('');
    const [metricsJson, setMetricsJson] = useState('{}');
    const [isFeatured, setIsFeatured] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await PortfolioService.getProjects();
            setProjects(data || []);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!title || !description) {
            Alert.alert('Error', 'Title and Description are required');
            return;
        }

        let parsedMetrics = {};
        try {
            parsedMetrics = JSON.parse(metricsJson);
        } catch (e) {
            Alert.alert('Error', 'Invalid Metrics JSON format');
            return;
        }

        const projectData = {
            title,
            description,
            tech_stack: techStack.split(',').map(t => t.trim()).filter(Boolean),
            github_url: githubUrl,
            demo_url: demoUrl,
            deadline: deadline || null,
            case_study_content: caseStudyContent || null,
            metrics: parsedMetrics,
            is_featured: isFeatured,
        };

        try {
            await PortfolioService.upsertProject({
                ...projectData,
                id: editingProject?.id
            });

            setModalVisible(false);
            resetForm();
            fetchProjects();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleDelete = async (id) => {
        Alert.alert(
            'Delete Project',
            'Are you sure you want to delete this project?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await PortfolioService.softDelete('projects', id);
                            fetchProjects();
                        } catch (error) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    const openModal = (project = null) => {
        if (project) {
            setEditingProject(project);
            setTitle(project.title);
            setDescription(project.description);
            setTechStack(project.tech_stack?.join(', ') || '');
            setGithubUrl(project.github_url || '');
            setDemoUrl(project.demo_url || '');
            setDeadline(project.deadline || '');
            setCaseStudyContent(project.case_study_content || '');
            setMetricsJson(JSON.stringify(project.metrics || {}, null, 2));
            setIsFeatured(project.is_featured);
        } else {
            resetForm();
        }
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingProject(null);
        setTitle('');
        setDescription('');
        setTechStack('');
        setGithubUrl('');
        setDemoUrl('');
        setDeadline('');
        setCaseStudyContent('');
        setMetricsJson('{}');
        setIsFeatured(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-950">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="p-6 pt-2 pb-4 border-b border-slate-800 bg-slate-950">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">Database</Text>
                        <Text className="text-2xl font-black text-white italic">PROJECTS</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => openModal()}
                        className="bg-purple-600 px-4 py-2 rounded-lg flex-row items-center"
                    >
                        <Plus size={16} color="white" />
                        <Text className="text-white font-bold ml-2">ADD</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-4 py-4">
                {loading ? (
                    <ActivityIndicator color="#A855F7" className="mt-10" />
                ) : (
                    projects.map((item) => (
                        <View key={item.id} className="mb-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
                            <View className="flex-row justify-between items-start mb-2">
                                <Text className="text-lg font-black text-white italic flex-1">{item.title}</Text>
                                <View className="flex-row gap-2">
                                    <TouchableOpacity
                                        onPress={() => openModal(item)}
                                        className="p-2 bg-slate-800 rounded-lg"
                                    >
                                        <Boxes size={16} color="#94a3b8" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDelete(item.id)}
                                        className="p-2 bg-red-900/20 rounded-lg"
                                    >
                                        <Trash2 size={16} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text className="text-slate-400 text-xs mb-3 font-medium leading-5" numberOfLines={2}>
                                {item.description}
                            </Text>

                            <View className="flex-row flex-wrap gap-2 mb-3">
                                {item.tech_stack?.slice(0, 3).map((tech, i) => (
                                    <View key={i} className="px-2 py-1 bg-slate-800 rounded">
                                        <Text className="text-slate-300 text-[10px] font-bold">{tech}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))
                )}
                <View className="h-24" />
            </ScrollView>

            {/* Edit/Add Modal */}
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
                            <View className="p-6 border-b border-slate-800 flex-row justify-between items-center bg-slate-900 z-10">
                                <Text className="text-xl font-black text-white italic">
                                    {editingProject ? 'EDIT PROJECT' : 'NEW PROJECT'}
                                </Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 -mr-2">
                                    <X size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                className="flex-1 px-6"
                                contentContainerStyle={{ paddingBottom: 100, paddingTop: 24 }}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >
                                <View className="space-y-6">
                                    <View>
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Project Title</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold text-lg h-16"
                                            value={title}
                                            onChangeText={setTitle}
                                            placeholder="e.g. AI Content Generator"
                                            placeholderTextColor="#475569"
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Description</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-medium text-base h-36"
                                            value={description}
                                            onChangeText={setDescription}
                                            placeholder="Describe the project..."
                                            placeholderTextColor="#475569"
                                            multiline
                                            textAlignVertical="top"
                                        />
                                    </View>

                                    {/* NEW: Case Study */}
                                    <View>
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">
                                            <FileText size={12} color="#94a3b8" /> Mission Analysis (Case Study)
                                        </Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-medium text-base h-48"
                                            value={caseStudyContent}
                                            onChangeText={setCaseStudyContent}
                                            placeholder="Detailed breakdown of the project (Markdown supported)..."
                                            placeholderTextColor="#475569"
                                            multiline
                                            textAlignVertical="top"
                                        />
                                    </View>

                                    {/* NEW: Metrics */}
                                    <View>
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">
                                            <BarChart3 size={12} color="#94a3b8" /> Result Metrics (JSON)
                                        </Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-purple-300 font-mono text-xs h-32"
                                            value={metricsJson}
                                            onChangeText={setMetricsJson}
                                            placeholder='{"users": "100+", "uptime": "99.9%"}'
                                            placeholderTextColor="#475569"
                                            multiline
                                            textAlignVertical="top"
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Tech Stack (comma separated)</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-base h-16"
                                            value={techStack}
                                            onChangeText={setTechStack}
                                            placeholder="React, Node.js, Supabase..."
                                            placeholderTextColor="#475569"
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Github URL</Text>
                                        <View className="relative">
                                            <View className="absolute left-5 top-5 z-10">
                                                <Github size={18} color="#64748b" />
                                            </View>
                                            <TextInput
                                                className="bg-slate-950 border border-slate-800 rounded-2xl pl-14 p-4 text-white text-base h-16"
                                                value={githubUrl}
                                                onChangeText={setGithubUrl}
                                                placeholder="https://github.com/..."
                                                placeholderTextColor="#475569"
                                                autoCapitalize="none"
                                            />
                                        </View>
                                    </View>

                                    <View>
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Demo URL</Text>
                                        <View className="relative">
                                            <View className="absolute left-5 top-5 z-10">
                                                <ExternalLink size={18} color="#64748b" />
                                            </View>
                                            <TextInput
                                                className="bg-slate-950 border border-slate-800 rounded-2xl pl-14 p-4 text-white text-base h-16"
                                                value={demoUrl}
                                                onChangeText={setDemoUrl}
                                                placeholder="https://..."
                                                placeholderTextColor="#475569"
                                                autoCapitalize="none"
                                            />
                                        </View>
                                    </View>

                                    {/* Input: Deadline */}
                                    <View>
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Deadline (Optional)</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold text-base h-16"
                                            value={deadline}
                                            onChangeText={setDeadline}
                                            placeholder="YYYY-MM-DD"
                                            placeholderTextColor="#475569"
                                        />
                                    </View>

                                    <View className="pt-2">
                                        <TouchableOpacity
                                            onPress={() => setIsFeatured(!isFeatured)}
                                            className={`flex-row items-center p-5 rounded-2xl border ${isFeatured ? 'bg-purple-900/20 border-purple-500' : 'bg-slate-950 border-slate-800'}`}
                                        >
                                            <View className={`w-6 h-6 rounded border-2 items-center justify-center mr-4 ${isFeatured ? 'bg-purple-500 border-purple-500' : 'border-slate-600'}`}>
                                                {isFeatured && <Boxes size={14} color="white" />}
                                            </View>
                                            <Text className={`font-bold text-base ${isFeatured ? 'text-purple-400' : 'text-slate-400'}`}>Featured Project</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </ScrollView>

                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
                            >
                                <View className="p-6 border-t border-slate-800 bg-slate-900 pb-8">
                                    <TouchableOpacity
                                        onPress={handleSave}
                                        className="bg-purple-600 w-full p-4 rounded-2xl items-center flex-row justify-center shadow-lg shadow-purple-900/20"
                                    >
                                        <Save size={20} color="white" />
                                        <Text className="text-white font-black text-lg ml-3 italic">SAVE PROJECT</Text>
                                    </TouchableOpacity>
                                </View>
                            </KeyboardAvoidingView>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}
