import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PortfolioService } from '@/services/portfolioService';
import { BookOpen, Plus, X, Save, Trash2, GraduationCap } from 'lucide-react-native';
import { Stack } from 'expo-router';

export default function EducationManager() {
    const insets = useSafeAreaInsets();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Form State
    const [degree, setDegree] = useState('');
    const [institution, setInstitution] = useState('');
    const [year, setYear] = useState('');
    const [status, setStatus] = useState('');
    const [specialization, setSpecialization] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await PortfolioService.getEducation();
            setItems(data || []);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await PortfolioService.upsertEducation({
                id: editingItem?.id,
                degree,
                institution,
                year,
                status,
                specialization
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
            'Are you sure you want to delete this?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await PortfolioService.softDelete('education', id);
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
            setDegree(item.degree);
            setInstitution(item.institution);
            setYear(item.year || '');
            setStatus(item.status || '');
            setSpecialization(item.specialization || '');
        } else {
            resetForm();
        }
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingItem(null);
        setDegree('');
        setInstitution('');
        setYear('');
        setStatus('');
        setSpecialization('');
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-950">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="p-6 pt-2 pb-4 border-b border-slate-800 bg-slate-950">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">Database</Text>
                        <Text className="text-2xl font-black text-white italic">EDUCATION</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => openModal()}
                        className="bg-red-600 px-4 py-2 rounded-lg flex-row items-center"
                    >
                        <Plus size={16} color="white" />
                        <Text className="text-white font-bold ml-2">ADD</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-4 py-4">
                {loading ? (
                    <ActivityIndicator color="#EF4444" className="mt-10" />
                ) : (
                    items.map((item) => (
                        <View key={item.id} className="mb-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
                            <View className="flex-row justify-between items-start mb-2">
                                <View className="flex-1">
                                    <Text className="text-lg font-black text-white italic">{item.degree}</Text>
                                    <Text className="text-red-400 font-bold text-xs uppercase">{item.institution}</Text>
                                </View>
                                <View className="flex-row gap-2">
                                    <TouchableOpacity
                                        onPress={() => openModal(item)}
                                        className="p-2 bg-slate-800 rounded-lg"
                                    >
                                        <BookOpen size={16} color="#94a3b8" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDelete(item.id)}
                                        className="p-2 bg-red-900/20 rounded-lg"
                                    >
                                        <Trash2 size={16} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View className="flex-row items-center mt-1 mb-2">
                                <GraduationCap size={12} color="#64748b" />
                                <Text className="text-slate-500 text-[10px] font-bold ml-2 uppercase tracking-wider">{item.year} • {item.status}</Text>
                            </View>

                            {item.specialization && (
                                <Text className="text-slate-400 text-xs font-medium bg-slate-800/50 p-2 rounded-lg mt-2">
                                    Specialization: {item.specialization}
                                </Text>
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
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <View className="flex-1 bg-slate-950/90 justify-end">
                        <View className="bg-slate-900 rounded-t-3xl border-t border-slate-800 max-h-[92%]">
                            <View className="p-6 border-b border-slate-800 flex-row justify-between items-center bg-slate-900 rounded-t-3xl">
                                <Text className="text-xl font-black text-white italic">
                                    {editingItem ? 'EDIT ENTRY' : 'NEW ENTRY'}
                                </Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <X size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                                <View className="space-y-5 pb-12">
                                    <View className="mb-5">
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Degree / Course</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-bold text-base"
                                            value={degree}
                                            onChangeText={setDegree}
                                            placeholder="e.g. B.Tech Computer Science"
                                            placeholderTextColor="#475569"
                                        />
                                    </View>

                                    <View className="mb-5">
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Institution</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white text-base"
                                            value={institution}
                                            onChangeText={setInstitution}
                                            placeholder="e.g. MIT"
                                            placeholderTextColor="#475569"
                                        />
                                    </View>

                                    <View className="flex-row gap-4 mb-5">
                                        <View className="flex-1">
                                            <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Year / Batch</Text>
                                            <TextInput
                                                className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white text-base"
                                                value={year}
                                                onChangeText={setYear}
                                                placeholder="e.g. 2024 - 2028"
                                                placeholderTextColor="#475569"
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Status / Grade</Text>
                                            <TextInput
                                                className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white text-base"
                                                value={status}
                                                onChangeText={setStatus}
                                                placeholder="e.g. 8.5 CGPA"
                                                placeholderTextColor="#475569"
                                            />
                                        </View>
                                    </View>

                                    <View className="mb-5">
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Specialization</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-medium text-base"
                                            value={specialization}
                                            onChangeText={setSpecialization}
                                            placeholder="e.g. AI & Data Science"
                                            placeholderTextColor="#475569"
                                        />
                                    </View>
                                </View>
                            </ScrollView>

                            <View className="p-6 border-t border-slate-800 bg-slate-900" style={{ paddingBottom: Math.max(insets.bottom, 16) + 16 }}>
                                <TouchableOpacity
                                    onPress={handleSave}
                                    className="bg-red-600 w-full p-5 rounded-2xl items-center flex-row justify-center shadow-lg shadow-red-900/20"
                                >
                                    <Save size={22} color="white" />
                                    <Text className="text-white font-black text-lg ml-3 italic">SAVE ENTRY</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}
