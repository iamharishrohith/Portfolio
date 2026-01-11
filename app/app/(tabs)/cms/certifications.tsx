import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PortfolioService } from '@/services/portfolioService';
import { Award, Plus, X, Save, Trash2 } from 'lucide-react-native';
import { Stack } from 'expo-router';

export default function CertificationsManager() {
    const insets = useSafeAreaInsets();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [issuer, setIssuer] = useState('');
    const [date, setDate] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await PortfolioService.getCertifications();
            setItems(data || []);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await PortfolioService.upsertCertification({
                id: editingItem?.id,
                title,
                issuer,
                date
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
            'Are you sure you want to delete this certification?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await PortfolioService.softDelete('certifications', id);
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
            setIssuer(item.issuer);
            setDate(item.date);
        } else {
            resetForm();
        }
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingItem(null);
        setTitle('');
        setIssuer('');
        setDate('');
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-950">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="p-6 pt-2 pb-4 border-b border-slate-800 bg-slate-950">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">Database</Text>
                        <Text className="text-2xl font-black text-white italic">CERTIFICATIONS</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => openModal()}
                        className="bg-green-600 px-4 py-2 rounded-lg flex-row items-center"
                    >
                        <Plus size={16} color="white" />
                        <Text className="text-white font-bold ml-2">ADD</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-4 py-4">
                {loading ? (
                    <ActivityIndicator color="#10B981" className="mt-10" />
                ) : (
                    items.map((item) => (
                        <View key={item.id} className="mb-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
                            <View className="flex-row justify-between items-start mb-2">
                                <View className="flex-1">
                                    <Text className="text-lg font-black text-white italic">{item.title}</Text>
                                    <Text className="text-green-400 font-bold text-xs uppercase">{item.issuer}</Text>
                                </View>
                                <View className="flex-row gap-2">
                                    <TouchableOpacity
                                        onPress={() => openModal(item)}
                                        className="p-2 bg-slate-800 rounded-lg"
                                    >
                                        <Award size={16} color="#94a3b8" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDelete(item.id)}
                                        className="p-2 bg-red-900/20 rounded-lg"
                                    >
                                        <Trash2 size={16} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Issued: {item.date}</Text>
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
                                    {editingItem ? 'EDIT CERT' : 'NEW CERT'}
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
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Certification Name</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold text-lg h-16"
                                            value={title}
                                            onChangeText={setTitle}
                                            placeholder="e.g. AWS Solutions Architect"
                                            placeholderTextColor="#475569"
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Issuing Organization</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-lg h-16"
                                            value={issuer}
                                            onChangeText={setIssuer}
                                            placeholder="e.g. Amazon Web Services"
                                            placeholderTextColor="#475569"
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Year Issued</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-base h-16"
                                            value={date}
                                            onChangeText={setDate}
                                            placeholder="e.g. 2025"
                                            placeholderTextColor="#475569"
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
                                        className="bg-green-600 w-full p-4 rounded-2xl items-center flex-row justify-center shadow-lg shadow-green-900/20"
                                    >
                                        <Save size={20} color="white" />
                                        <Text className="text-white font-black text-lg ml-3 italic">SAVE CERT</Text>
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
