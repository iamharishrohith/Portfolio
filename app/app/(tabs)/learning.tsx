import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { FloatingHome } from '@/components/FloatingHome';
import { CheckCircle, Circle, PlayCircle, Plus, X } from 'lucide-react-native';
import { PortfolioService } from '@/services/portfolioService';

export default function LearningScreen() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [showOngoingOnly, setShowOngoingOnly] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [platform, setPlatform] = useState('');


    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const data = await PortfolioService.getCourses();
            setCourses(data || []);
        } catch (e: any) {
            console.log('Error fetching courses:', e.message);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCourse = async () => {
        try {
            await PortfolioService.upsertCourse({
                title,
                platform,
                progress: 0,
                is_completed: false
            });
            setModalVisible(false);
            setTitle('');
            setPlatform('');
            fetchCourses();
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    const toggleCompletion = async (course: any) => {
        const newStatus = !course.is_completed;
        // Optimistic update
        setCourses(prev => prev.map(c => c.id === course.id ? { ...c, is_completed: newStatus } : c));

        try {
            await PortfolioService.updateCourseStatus(course.id, newStatus);
        } catch (e: any) {
            console.log('Toggle error:', e);
            // Revert on error
            fetchCourses();
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-950" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />
            <FloatingHome />

            <View className="px-6 pt-4 pb-4 flex-row justify-between items-end">
                <View>
                    <Text className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-1">Knowledge Base</Text>
                    <Text className="text-3xl font-black text-white italic">
                        LEARNING <Text className="text-amber-500">PATH</Text>
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => setShowOngoingOnly(!showOngoingOnly)}
                    className={`px-3 py-1.5 rounded-full border ${showOngoingOnly ? 'bg-amber-500 border-amber-500' : 'bg-transparent border-slate-700'}`}
                >
                    <Text className={`text-xs font-bold ${showOngoingOnly ? 'text-white' : 'text-slate-400'}`}>
                        {showOngoingOnly ? 'ONGOING' : 'ALL'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6">
                {loading ? (
                    <ActivityIndicator color="#F59E0B" size="large" className="mt-10" />
                ) : courses.length === 0 ? (
                    <View className="items-center py-10 opacity-50">
                        <Text className="text-slate-500 font-bold">No courses added yet.</Text>
                    </View>
                ) : (
                    courses
                        .filter(c => !showOngoingOnly || !c.is_completed)
                        .map(course => (
                            <View key={course.id} className={`bg-slate-900 rounded-xl p-5 mb-4 border ${course.is_completed ? 'border-emerald-500/30 bg-emerald-900/10' : 'border-slate-800'}`}>
                                <View className="flex-row justify-between items-start mb-2">
                                    <View className="flex-1 mr-4">
                                        <Text className="text-white font-bold text-lg leading-tight">{course.title}</Text>
                                        <Text className="text-slate-500 text-xs uppercase font-bold mt-1">{course.platform}</Text>
                                    </View>
                                    {course.is_completed ? (
                                        <CheckCircle size={24} color="#10B981" />
                                    ) : (
                                        <PlayCircle size={24} color="#F59E0B" />
                                    )}
                                </View>

                                {/* Actions / Status */}
                                <View className="mt-4 pt-4 border-t border-slate-800/50 flex-row justify-between items-center">
                                    <View className="flex-row items-center">
                                        <Text className={`text-xs font-bold ${course.is_completed ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {course.is_completed ? 'COMPLETED' : 'IN PROGRESS'}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => {
                                                Alert.alert("Delete", "Delete this course?", [
                                                    { text: "Cancel", style: "cancel" },
                                                    {
                                                        text: "Delete", style: "destructive", onPress: () => {
                                                            PortfolioService.softDelete('courses', course.id).then(() => fetchCourses());
                                                        }
                                                    }
                                                ]);
                                            }}
                                            className="ml-3"
                                        >
                                            <Text className="text-red-900 text-[10px] font-bold">DELETE</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => toggleCompletion(course)}
                                        className="flex-row items-center gap-2"
                                    >
                                        <View className={`w-5 h-5 rounded-full border items-center justify-center ${course.is_completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                                            {course.is_completed && <CheckCircle size={12} color="white" />}
                                        </View>
                                        <Text className="text-slate-400 text-xs text-right">Mark Done</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                )}

                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className="mt-4 p-4 border border-dashed border-slate-700 rounded-xl items-center flex-row justify-center gap-2 active:bg-slate-900"
                >
                    <Plus size={18} color="#64748b" />
                    <Text className="text-slate-500 font-bold text-sm">Add New Course</Text>
                </TouchableOpacity>

                <View className="h-24" />
            </ScrollView>

            {/* Add Course Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View className="flex-1 bg-black/80 justify-end">
                    <View className="bg-slate-900 rounded-t-3xl p-6 border-t border-slate-800">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-white font-black text-xl italic">NEW COURSE</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Course Title"
                            placeholderTextColor="#64748b"
                            className="bg-slate-950 text-white p-4 rounded-xl border border-slate-800 mb-4 font-bold"
                        />
                        <TextInput
                            value={platform}
                            onChangeText={setPlatform}
                            placeholder="Platform (e.g. Udemy, Coursera)"
                            placeholderTextColor="#64748b"
                            className="bg-slate-950 text-white p-4 rounded-xl border border-slate-800 mb-4"
                        />

                        <TouchableOpacity onPress={handleAddCourse} className="bg-amber-500 p-4 rounded-xl items-center">
                            <Text className="text-white font-black text-base">ADD COURSE</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
