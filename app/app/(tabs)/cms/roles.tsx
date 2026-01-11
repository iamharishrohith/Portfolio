import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PortfolioService } from '@/services/portfolioService';
import { Cpu, Plus, X, Save, Trash2, Command } from 'lucide-react-native';
import { Stack } from 'expo-router';

export default function RoleManager() {
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Form State
    const [roleName, setRoleName] = useState('');
    const [orderIndex, setOrderIndex] = useState('0');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await PortfolioService.getRoles();
            setRoles(data || []);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (!roleName.trim()) {
                Alert.alert('Error', 'Role name is required');
                return;
            }

            await PortfolioService.upsertRole({
                id: editingItem?.id,
                role_name: roleName,
                order_index: parseInt(orderIndex) || 0
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
            'Delete Role',
            'Are you sure you want to delete this role?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await PortfolioService.softDelete('roles', id);
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
            setRoleName(item.role_name);
            setOrderIndex(String(item.order_index || 0));
        } else {
            resetForm();
        }
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingItem(null);
        setRoleName('');
        setOrderIndex('0');
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-950">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="p-6 pt-2 pb-4 border-b border-slate-800 bg-slate-950">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">System Config</Text>
                        <Text className="text-2xl font-black text-white italic">TYP_ROLES</Text>
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

            <View className="px-6 py-4 bg-purple-900/10 border-b border-purple-900/20">
                <Text className="text-purple-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                    These titles cycle through the typing effect on your website header.
                </Text>
            </View>

            <ScrollView className="flex-1 px-4 py-4">
                {loading ? (
                    <ActivityIndicator color="#8B5CF6" className="mt-10" />
                ) : (
                    roles.map((item) => (
                        <View key={item.id} className="mb-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
                            <View className="flex-row justify-between items-center">
                                <View className="flex-row items-center flex-1">
                                    <View className="w-8 h-8 rounded-full bg-purple-900/30 items-center justify-center mr-3 border border-purple-900/40">
                                        <Text className="text-purple-400 font-black text-xs">{item.order_index}</Text>
                                    </View>
                                    <Text className="text-lg font-black text-white italic">{item.role_name}</Text>
                                </View>
                                <View className="flex-row gap-2">
                                    <TouchableOpacity
                                        onPress={() => openModal(item)}
                                        className="p-2 bg-slate-800 rounded-lg"
                                    >
                                        <Cpu size={16} color="#94a3b8" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDelete(item.id)}
                                        className="p-2 bg-red-900/20 rounded-lg"
                                    >
                                        <Trash2 size={16} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
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
                <View className="flex-1 bg-slate-950/90 justify-end">
                    <View className="bg-slate-900 rounded-t-3xl border-t border-slate-800 h-[50%]">
                        <View className="p-6 border-b border-slate-800 flex-row justify-between items-center bg-slate-900 rounded-t-3xl">
                            <Text className="text-xl font-black text-white italic">
                                {editingItem ? 'EDIT ROLE' : 'NEW ROLE'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1 p-6">
                            <View className="space-y-4 pb-12">
                                <View>
                                    <Text className="text-slate-400 font-bold text-xs uppercase mb-2">Role Name</Text>
                                    <TextInput
                                        className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold"
                                        value={roleName}
                                        onChangeText={setRoleName}
                                        placeholder="e.g. System Architect"
                                        placeholderTextColor="#475569"
                                    />
                                </View>

                                <View>
                                    <Text className="text-slate-400 font-bold text-xs uppercase mb-2">Display Order</Text>
                                    <TextInput
                                        className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold"
                                        value={orderIndex}
                                        onChangeText={setOrderIndex}
                                        placeholder="0"
                                        placeholderTextColor="#475569"
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        </ScrollView>

                        <View className="p-6 border-t border-slate-800 bg-slate-900 pb-10">
                            <TouchableOpacity
                                onPress={handleSave}
                                className="bg-purple-600 w-full p-4 rounded-xl items-center flex-row justify-center shadow-lg shadow-purple-900/20"
                            >
                                <Save size={20} color="white" />
                                <Text className="text-white font-black text-lg ml-2 italic">SAVE SEQUENCE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
