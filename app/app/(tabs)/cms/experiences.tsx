import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PortfolioService } from '@/services/portfolioService';
import { Briefcase, Plus, X, Save, Trash2, Calendar } from 'lucide-react-native';
import { Stack } from 'expo-router';

export default function ExperienceManager() {
    const insets = useSafeAreaInsets();
    const [experiences, setExperiences] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [description, setDescription] = useState('');
    const [techInput, setTechInput] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await PortfolioService.getExperiences();
            setExperiences(data || []);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await PortfolioService.upsertExperience({
                id: editingItem?.id,
                title,
                company,
                start_date: startDate,
                end_date: endDate,
                description,
                technologies: techInput.split(',').map(s => s.trim()).filter(s => s.length > 0)
            });

            setModalVisible(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            'Delete Entry',
            'Are you sure you want to delete this experience?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await PortfolioService.softDelete('experiences', id);
                            fetchData();
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    const openModal = (item: any = null) => {
        if (item) {
            setEditingItem(item);
            setTitle(item.title);
            setCompany(item.company);
            setStartDate(item.start_date || '');
            setEndDate(item.end_date || '');
            setDescription(item.description || '');
            setTechInput(item.technologies ? item.technologies.join(', ') : '');
        } else {
            resetForm();
        }
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingItem(null);
        setTitle('');
        setCompany('');
        setStartDate('');
        setEndDate('');
        setDescription('');
        setTechInput('');
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-950">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="p-6 pt-2 pb-4 border-b border-slate-800 bg-slate-950">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">Database</Text>
                        <Text className="text-2xl font-black text-white italic">EXPERIENCE</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => openModal()}
                        className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
                    >
                        <Plus size={16} color="white" />
                        <Text className="text-white font-bold ml-2">ADD</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-4 py-4">
                {loading ? (
                    <ActivityIndicator color="#3B82F6" className="mt-10" />
                ) : (
                    experiences.map((item) => (
                        <View key={item.id} className="mb-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
                            <View className="flex-row justify-between items-start mb-1">
                                <View className="flex-1">
                                    <Text className="text-lg font-black text-white italic">{item.title}</Text>
                                    <Text className="text-blue-400 font-bold text-xs uppercase">{item.company}</Text>
                                </View>
                                <View className="flex-row gap-2">
                                    <TouchableOpacity
                                        onPress={() => openModal(item)}
                                        className="p-2 bg-slate-800 rounded-lg"
                                    >
                                        <Briefcase size={16} color="#94a3b8" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDelete(item.id)}
                                        className="p-2 bg-red-900/20 rounded-lg"
                                    >
                                        <Trash2 size={16} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View className="flex-row items-center mt-2 mb-3">
                                <Calendar size={12} color="#64748b" />
                                <Text className="text-slate-500 text-[10px] font-bold ml-2 uppercase tracking-wider">
                                    {item.start_date} {item.end_date ? `- ${item.end_date}` : ''}
                                </Text>
                            </View>

                            <Text className="text-slate-400 text-xs font-medium leading-5 mb-2">
                                {item.description}
                            </Text>

                            {item.technologies && item.technologies.length > 0 && (
                                <View className="flex-row flex-wrap gap-2">
                                    {item.technologies.map((tech: string, i: number) => (
                                        <View key={i} className="bg-blue-900/20 px-2 py-1 rounded-md border border-blue-900/30">
                                            <Text className="text-blue-400 text-[8px] font-black uppercase tracking-tighter">{tech}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
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
                                    {editingItem ? 'EDIT ROLE' : 'NEW ROLE'}
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
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Job Role</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold text-lg h-16"
                                            value={title}
                                            onChangeText={setTitle}
                                            placeholder="e.g. Senior Developer"
                                            placeholderTextColor="#475569"
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Company Name</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-lg h-16"
                                            value={company}
                                            onChangeText={setCompany}
                                            placeholder="e.g. Acme Corp"
                                            placeholderTextColor="#475569"
                                        />
                                    </View>

                                    <View className="flex-row gap-4 mb-5">
                                        <View className="flex-1">
                                            <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Start Date</Text>
                                            <TextInput
                                                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-base h-14"
                                                value={startDate}
                                                onChangeText={setStartDate}
                                                placeholder="e.g. Jan 2024"
                                                placeholderTextColor="#475569"
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-slate-400 font-bold text-sm uppercase mb-3">End Date</Text>
                                            <TextInput
                                                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-base h-14"
                                                value={endDate}
                                                onChangeText={setEndDate}
                                                placeholder="e.g. Present"
                                                placeholderTextColor="#475569"
                                            />
                                        </View>
                                    </View>

                                    <View>
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Description</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-medium text-base h-36"
                                            value={description}
                                            onChangeText={setDescription}
                                            placeholder="Describe your responsibilities..."
                                            placeholderTextColor="#475569"
                                            multiline
                                            textAlignVertical="top"
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Technologies (Comma Separated)</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-base h-20"
                                            value={techInput}
                                            onChangeText={setTechInput}
                                            placeholder="e.g. React, Node.js, Supabase"
                                            placeholderTextColor="#475569"
                                            multiline
                                            textAlignVertical="top"
                                        />
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
                                        className="bg-blue-600 w-full p-4 rounded-2xl items-center flex-row justify-center shadow-lg shadow-blue-900/20"
                                    >
                                        <Save size={20} color="white" />
                                        <Text className="text-white font-black text-lg ml-3 italic">SAVE ENTRY</Text>
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
