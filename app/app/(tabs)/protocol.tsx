import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckSquare, Activity, Calendar, Clock, Plus, RefreshCw } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth';

type Task = {
    id: string;
    title: string;
    xp_reward: number;
    category: string;
    is_completed: boolean;
};

export default function ProtocolScreen() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setTasks(data || []);
        } catch (error: any) {
            console.log('Fetch error:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleTask = async (task: Task) => {
        try {
            const newStatus = !task.is_completed;

            setTasks(prev => prev.map(t =>
                t.id === task.id ? { ...t, is_completed: newStatus } : t
            ));

            const { error: taskError } = await supabase
                .from('tasks')
                .update({ is_completed: newStatus, completed_at: newStatus ? new Date() : null })
                .eq('id', task.id);

            if (taskError) throw taskError;

            const { data: profile } = await supabase
                .from('profiles')
                .select('id, xp, level')
                .limit(1)
                .single();

            if (profile) {
                let newXp = (profile.xp || 0) + (newStatus ? task.xp_reward : -task.xp_reward);
                let newLevel = profile.level;

                if (newXp >= 100) {
                    newXp -= 100;
                    newLevel += 1;
                    Alert.alert("LEVEL UP", `System successfully upgraded to Level ${newLevel}`);
                } else if (newXp < 0) {
                    newXp = 0;
                }

                await supabase
                    .from('profiles')
                    .update({ xp: newXp, level: newLevel })
                    .eq('id', profile.id);
            }

        } catch (error: any) {
            Alert.alert('Sync Error', error.message);
            fetchTasks();
        }
    };

    const dailyXp = tasks.filter(t => t.is_completed).reduce((acc, t) => acc + t.xp_reward, 0);

    if (loading && tasks.length === 0) {
        return (
            <View className="flex-1 justify-center items-center bg-slate-50">
                <ActivityIndicator color="#7C3AED" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView className="px-6 py-6" contentContainerStyle={{ paddingBottom: 100 }}>

                <View className="mb-8 flex-row justify-between items-center">
                    <View>
                        <Text className="text-3xl font-extrabold italic text-slate-900">
                            SYSTEM <Text className="text-purple-600">PROTOCOL</Text>
                        </Text>
                        <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest italic mt-1">
                            Daily Productivity Upload
                        </Text>
                    </View>
                    <TouchableOpacity onPress={fetchTasks} className="p-2 bg-slate-100 rounded-full">
                        <RefreshCw size={20} color="#64748b" />
                    </TouchableOpacity>
                </View>

                <View className="flex-row justify-between mb-8">
                    <View className="bg-white p-4 rounded-xl border border-slate-100 items-center flex-1 mr-2 shadow-sm">
                        <Activity size={20} color="#7C3AED" />
                        <Text className="text-[10px] font-black text-slate-400 uppercase mt-2">Daily XP</Text>
                        <Text className="text-xl font-black text-slate-900 italic">{dailyXp}</Text>
                    </View>
                    <View className="bg-white p-4 rounded-xl border border-slate-100 items-center flex-1 mx-2 shadow-sm">
                        <Calendar size={20} color="#3B82F6" />
                        <Text className="text-[10px] font-black text-slate-400 uppercase mt-2">Streak</Text>
                        <Text className="text-xl font-black text-slate-900 italic">--</Text>
                    </View>
                    <View className="bg-white p-4 rounded-xl border border-slate-100 items-center flex-1 ml-2 shadow-sm">
                        <Clock size={20} color="#10B981" />
                        <Text className="text-[10px] font-black text-slate-400 uppercase mt-2">Efficiency</Text>
                        <Text className="text-xl font-black text-slate-900 italic">--%</Text>
                    </View>
                </View>

                <View className="mb-4 flex-row justify-between items-end">
                    <Text className="text-xs font-black text-slate-400 uppercase tracking-widest italic">
                        Active Protocols
                    </Text>
                    <TouchableOpacity className="flex-row items-center">
                        <Plus size={14} color="#7C3AED" />
                        <Text className="text-[10px] font-bold text-purple-600 uppercase ml-1">Add New</Text>
                    </TouchableOpacity>
                </View>

                <View className="space-y-3">
                    {tasks.length === 0 ? (
                        <Text className="text-slate-400 italic text-center mt-10">No active protocols found. Add one in DB.</Text>
                    ) : (
                        tasks.map((task) => (
                            <TouchableOpacity
                                key={task.id}
                                className={`p-4 rounded-xl border flex-row items-center mb-3 ${task.is_completed ? 'bg-purple-50 border-purple-100' : 'bg-white border-slate-100'}`}
                                onPress={() => toggleTask(task)}
                            >
                                <View className={`w-6 h-6 rounded border-2 mr-3 justify-center items-center ${task.is_completed ? 'bg-purple-600 border-purple-600' : 'border-slate-300'}`}>
                                    {task.is_completed && <CheckSquare size={14} color="white" />}
                                </View>

                                <View className="flex-1">
                                    <Text className={`text-sm font-bold italic uppercase ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                        {task.title}
                                    </Text>
                                    <Text className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                                        {task.category}
                                    </Text>
                                </View>

                                <View className={`px-2 py-1 rounded-lg ${task.is_completed ? 'bg-purple-100' : 'bg-slate-100'}`}>
                                    <Text className={`text-[10px] font-black italic ${task.is_completed ? 'text-purple-600' : 'text-slate-500'}`}>
                                        +{task.xp_reward} XP
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
