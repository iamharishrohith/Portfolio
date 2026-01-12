import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PortfolioService } from '@/services/portfolioService';
import { MessageSquare, Plus, X, Save, Trash2, CheckCircle, Star, Image as ImageIcon } from 'lucide-react-native';
import { Stack } from 'expo-router';

export default function TestimonialsManager() {
    const insets = useSafeAreaInsets();
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Form State
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [company, setCompany] = useState('');
    const [content, setContent] = useState('');
    const [rating, setRating] = useState(5);
    const [imageUrl, setImageUrl] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);
    const [isApproved, setIsApproved] = useState(false);

    useEffect(() => {
        fetchTestimonials();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            const data = await PortfolioService.getTestimonials();
            setTestimonials(data || []);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name || !content) {
            Alert.alert('Error', 'Name and Content are required');
            return;
        }

        const testimonialData = {
            name,
            role,
            company,
            content,
            rating: Number(rating),
            image_url: imageUrl || null,
            is_featured: isFeatured,
            is_approved: isApproved,
        };

        try {
            await PortfolioService.upsertTestimonial({
                ...testimonialData,
                id: editingItem?.id
            });

            setModalVisible(false);
            resetForm();
            fetchTestimonials();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleDelete = async (id) => {
        Alert.alert(
            'Delete Report',
            'Are you sure you want to delete this report?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await PortfolioService.softDelete('testimonials', id);
                            fetchTestimonials();
                        } catch (error) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setName(item.name);
            setRole(item.role || '');
            setCompany(item.company || '');
            setContent(item.content);
            setRating(item.rating || 5);
            setImageUrl(item.image_url || '');
            setIsFeatured(item.is_featured);
            setIsApproved(item.is_approved);
        } else {
            resetForm();
        }
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingItem(null);
        setName('');
        setRole('');
        setCompany('');
        setContent('');
        setRating(5);
        setImageUrl('');
        setIsFeatured(false);
        setIsApproved(false);
    };

    const renderStars = (count) => {
        return (
            <View className="flex-row gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={12}
                        fill={i < count ? "#eab308" : "transparent"}
                        color={i < count ? "#eab308" : "#475569"}
                    />
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-950">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="p-6 pt-2 pb-4 border-b border-slate-800 bg-slate-950">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">Feedback</Text>
                        <Text className="text-2xl font-black text-white italic">MISSION REPORTS</Text>
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
                    testimonials.map((item) => (
                        <View key={item.id} className="mb-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
                            <View className="flex-row justify-between items-start mb-2">
                                <View className="flex-1 pr-4">
                                    <View className="flex-row items-center gap-2 mb-1">
                                        {!item.is_approved ? (
                                            <View className="px-1.5 py-0.5 bg-yellow-900/40 rounded border border-yellow-500/40">
                                                <Text className="text-yellow-400 text-[9px] font-bold uppercase">Pending</Text>
                                            </View>
                                        ) : (
                                            <View className="px-1.5 py-0.5 bg-green-900/40 rounded border border-green-500/40">
                                                <Text className="text-green-400 text-[9px] font-bold uppercase">Approved</Text>
                                            </View>
                                        )}
                                        {renderStars(item.rating)}
                                    </View>
                                    <Text className="text-lg font-black text-white italic leading-tight">{item.name}</Text>
                                    {(item.role || item.company) && (
                                        <Text className="text-slate-400 text-xs font-bold mt-0.5">
                                            {item.role}{item.role && item.company && ' at '}{item.company}
                                        </Text>
                                    )}
                                </View>
                                <View className="flex-row gap-2">
                                    <TouchableOpacity
                                        onPress={() => openModal(item)}
                                        className="p-2 bg-slate-800 rounded-lg"
                                    >
                                        <MessageSquare size={16} color="#94a3b8" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDelete(item.id)}
                                        className="p-2 bg-red-900/20 rounded-lg"
                                    >
                                        <Trash2 size={16} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text className="text-slate-500 text-xs mb-3 font-medium leading-5 italic">
                                "&quot;{item.content}&quot;"
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
                                    {editingItem ? 'EDIT REPORT' : 'NEW REPORT'}
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
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Author Name</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold text-lg h-16"
                                            value={name}
                                            onChangeText={setName}
                                            placeholder="John Doe"
                                            placeholderTextColor="#475569"
                                        />
                                    </View>

                                    <View className="flex-row gap-4 mb-5">
                                        <View className="flex-1">
                                            <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Role</Text>
                                            <TextInput
                                                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-base h-14"
                                                value={role}
                                                onChangeText={setRole}
                                                placeholder="Senior Dev"
                                                placeholderTextColor="#475569"
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Company</Text>
                                            <TextInput
                                                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-base h-14"
                                                value={company}
                                                onChangeText={setCompany}
                                                placeholder="Tech Corp"
                                                placeholderTextColor="#475569"
                                            />
                                        </View>
                                    </View>

                                    <View>
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Content</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-medium text-base h-36"
                                            value={content}
                                            onChangeText={setContent}
                                            placeholder="What did they say?"
                                            placeholderTextColor="#475569"
                                            multiline
                                            textAlignVertical="top"
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Rating (1-5)</Text>
                                        <View className="flex-row gap-2">
                                            {[1, 2, 3, 4, 5].map(r => (
                                                <TouchableOpacity
                                                    key={r}
                                                    onPress={() => setRating(r)}
                                                    className={`w-12 h-12 rounded-xl items-center justify-center border ${rating === r ? 'bg-yellow-500 border-yellow-500' : 'bg-slate-950 border-slate-800'}`}
                                                >
                                                    <Text className={`font-bold text-lg ${rating === r ? 'text-slate-900' : 'text-slate-500'}`}>{r}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    <View>
                                        <Text className="text-slate-400 font-bold text-sm uppercase mb-3">Avatar URL</Text>
                                        <View className="relative">
                                            <View className="absolute left-5 top-5 z-10">
                                                <ImageIcon size={18} color="#64748b" />
                                            </View>
                                            <TextInput
                                                className="bg-slate-950 border border-slate-800 rounded-2xl pl-14 p-4 text-white text-base h-16"
                                                value={imageUrl}
                                                onChangeText={setImageUrl}
                                                placeholder="https://..."
                                                placeholderTextColor="#475569"
                                                autoCapitalize="none"
                                            />
                                        </View>
                                    </View>

                                    <View className="flex-row gap-4 pt-2">
                                        <TouchableOpacity
                                            onPress={() => setIsApproved(!isApproved)}
                                            className={`flex-1 flex-row items-center p-5 rounded-2xl border ${isApproved ? 'bg-green-900/20 border-green-500' : 'bg-slate-950 border-slate-800'}`}
                                        >
                                            <View className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${isApproved ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}>
                                                {isApproved && <CheckCircle size={14} color="white" />}
                                            </View>
                                            <Text className={`font-bold text-base ${isApproved ? 'text-green-400' : 'text-slate-400'}`}>Approved</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => setIsFeatured(!isFeatured)}
                                            className={`flex-1 flex-row items-center p-5 rounded-2xl border ${isFeatured ? 'bg-purple-900/20 border-purple-500' : 'bg-slate-950 border-slate-800'}`}
                                        >
                                            <View className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${isFeatured ? 'bg-purple-500 border-purple-500' : 'border-slate-600'}`}>
                                                {isFeatured && <CheckCircle size={14} color="white" />}
                                            </View>
                                            <Text className={`font-bold text-base ${isFeatured ? 'text-purple-400' : 'text-slate-400'}`}>Featured</Text>
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
                                        <Text className="text-white font-black text-lg ml-3 italic">SAVE REPORT</Text>
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
