import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PortfolioService } from '@/services/portfolioService';
import { Trophy, Plus, X, Save, Trash2, Calendar } from 'lucide-react-native';
import { Stack } from 'expo-router';

export default function AchievementManager() {
    const [achievements, setAchievements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [orderIndex, setOrderIndex] = useState('0');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await PortfolioService.getAchievements();
            setAchievements(data || []);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await PortfolioService.upsertAchievement({
                id: editingItem?.id,
                title,
                description,
                order_index: parseInt(orderIndex) || 0,
                is_published: true
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
            'Delete Achievement',
            'Are you sure you want to delete this achievement?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Using generic softDelete if available, or we might need a specific one
                            // For achievements, let's check if softDelete works
                            await PortfolioService.softDelete('achievements', id);
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
            setDescription(item.description || '');
            setOrderIndex(String(item.order_index || 0));
        } else {
            resetForm();
        }
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingItem(null);
        setTitle('');
        setDescription('');
        setOrderIndex('0');
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-950">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="p-6 pt-2 pb-4 border-b border-slate-800 bg-slate-950">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">Archive</Text>
                        <Text className="text-2xl font-black text-white italic">ACHIEVEMENTS</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => openModal()}
                        className="bg-yellow-600 px-4 py-2 rounded-lg flex-row items-center"
                    >
                        <Plus size={16} color="white" />
                        <Text className="text-white font-bold ml-2">ADD</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-4 py-4">
                {loading ? (
                    <ActivityIndicator color="#EAB308" className="mt-10" />
                ) : (
                    achievements.map((item) => (
                        <View key={item.id} className="mb-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
                            <View className="flex-row justify-between items-start mb-1">
                                <View className="flex-1">
                                    <Text className="text-lg font-black text-white italic">{item.title}</Text>
                                    <Text className="text-yellow-500 font-bold text-[10px] uppercase tracking-widest mt-1">
                                        RANK: {item.order_index === 1 ? 'S' : item.order_index <= 2 ? 'A' : 'B'}
                                    </Text>
                                </View>
                                <View className="flex-row gap-2">
                                    <TouchableOpacity
                                        onPress={() => openModal(item)}
                                        className="p-2 bg-slate-800 rounded-lg"
                                    >
                                        <Trophy size={16} color="#94a3b8" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDelete(item.id)}
                                        className="p-2 bg-red-900/20 rounded-lg"
                                    >
                                        <Trash2 size={16} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text className="text-slate-400 text-xs font-medium leading-5 mt-2">
                                {item.description}
                            </Text>
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
                                    {editingItem ? 'EDIT ACHIEVEMENT' : 'NEW ACHIEVEMENT'}
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
                                <View className="space-y-4">
                                    <View>
                                        <Text className="text-slate-400 font-bold text-xs uppercase mb-2">Achievement Title</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold h-14"
                                            value={title}
                                            onChangeText={setTitle}
                                            placeholder="e.g. Hackathon Finalist"
                                            placeholderTextColor="#475569"
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-slate-400 font-bold text-xs uppercase mb-2">Description</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-medium h-32"
                                            value={description}
                                            onChangeText={setDescription}
                                            placeholder="Briefly describe the feat..."
                                            placeholderTextColor="#475569"
                                            multiline
                                            textAlignVertical="top"
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-slate-400 font-bold text-xs uppercase mb-2">Display Order</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold h-14"
                                            value={orderIndex}
                                            onChangeText={setOrderIndex}
                                            placeholder="0"
                                            placeholderTextColor="#475569"
                                            keyboardType="numeric"
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
                                        className="bg-yellow-600 w-full p-4 rounded-xl items-center flex-row justify-center shadow-lg shadow-yellow-900/20"
                                    >
                                        <Save size={20} color="white" />
                                        <Text className="text-white font-black text-lg ml-2 italic">SAVE RECORD</Text>
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
