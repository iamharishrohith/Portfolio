import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '@/lib/supabase';
import { Lock, Plus, X, Save, Trash2, Copy, Eye, EyeOff, Search, User, Users, Delete, ShieldCheck } from 'lucide-react-native';
import { Stack } from 'expo-router';

export default function PasswordsManager() {
    // PIN Lock State
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [enteredPin, setEnteredPin] = useState('');
    const [masterPin, setMasterPin] = useState<string | null>(null);
    const [pinLoading, setPinLoading] = useState(true);

    // Data State
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [platform, setPlatform] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [visibility, setVisibility] = useState<'me' | 'others'>('me');
    const [sharedWithName, setSharedWithName] = useState('');

    // Fetch master PIN from server on mount
    useEffect(() => {
        fetchMasterPin();
    }, []);

    const fetchMasterPin = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('pin')
                .single();

            if (data?.pin) {
                setMasterPin(data.pin);
            } else {
                // Fallback PIN if not set in DB
                setMasterPin('270504');
            }
        } catch (e) {
            console.log('PIN fetch error:', e);
            setMasterPin('270504'); // Fallback
        } finally {
            setPinLoading(false);
        }
    };

    const handlePinPress = (num: string) => {
        if (enteredPin.length < 6) {
            const newPin = enteredPin + num;
            setEnteredPin(newPin);

            if (newPin.length === 6) {
                setTimeout(() => {
                    if (newPin === masterPin) {
                        setIsUnlocked(true);
                        fetchData();
                    } else {
                        Alert.alert('ACCESS DENIED', 'Invalid PIN');
                        setEnteredPin('');
                    }
                }, 100);
            }
        }
    };

    const handlePinDelete = () => {
        setEnteredPin(prev => prev.slice(0, -1));
    };

    useEffect(() => {
        if (isUnlocked) {
            fetchData();
        }
    }, [isUnlocked]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('passwords')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setItems(data || []);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!platform || !password) {
            Alert.alert('Error', 'Platform and Password are required');
            return;
        }

        if (visibility === 'others' && !sharedWithName) {
            Alert.alert('Error', 'Person name is required for shared passwords');
            return;
        }

        const payload = {
            platform,
            email,
            username,
            password,
            visibility,
            shared_with_name: visibility === 'others' ? sharedWithName : null
        };

        try {
            const { data: profile } = await supabase.from('profiles').select('id').single();
            const userId = profile?.id || null;

            if (editingItem) {
                const { error } = await supabase
                    .from('passwords')
                    .update(payload)
                    .eq('id', editingItem.id);
                if (error) throw error;
            } else {
                const insertPayload = userId ? { ...payload, user_id: userId } : payload;
                const { error } = await supabase
                    .from('passwords')
                    .insert([insertPayload]);
                if (error) throw error;
            }

            setModalVisible(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            Alert.alert('Error', error.message || "An unknown error occurred");
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            'Delete Password',
            'Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase.from('passwords').delete().eq('id', id);
                            if (error) throw error;
                            fetchData();
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    const copyToClipboard = async (text: string) => {
        await Clipboard.setStringAsync(text);
        Alert.alert("Copied", "Password copied to clipboard");
    };

    const openModal = (item: any = null) => {
        if (item) {
            setEditingItem(item);
            setPlatform(item.platform);
            setEmail(item.email || '');
            setUsername(item.username || '');
            setPassword(item.password);
            setVisibility(item.visibility || 'me');
            setSharedWithName(item.shared_with_name || '');
        } else {
            resetForm();
        }
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingItem(null);
        setPlatform('');
        setEmail('');
        setUsername('');
        setPassword('');
        setVisibility('me');
        setSharedWithName('');
        setShowPassword(false);
    };

    const filteredItems = items.filter(item =>
        item.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Separate items by visibility
    const myItems = filteredItems.filter(i => i.visibility !== 'others');
    const othersItems = filteredItems.filter(i => i.visibility === 'others');

    // PIN Lock Screen
    if (pinLoading) {
        return (
            <SafeAreaView className="flex-1 bg-slate-950 justify-center items-center">
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color="#10B981" />
            </SafeAreaView>
        );
    }

    if (!isUnlocked) {
        return (
            <SafeAreaView className="flex-1 bg-slate-950">
                <Stack.Screen options={{ headerShown: false }} />

                <View className="flex-1 justify-center items-center px-8">
                    <View className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 items-center justify-center mb-6">
                        <ShieldCheck size={32} color="#10B981" />
                    </View>
                    <Text className="text-white font-black text-2xl italic mb-2">VAULT ACCESS</Text>
                    <Text className="text-slate-400 text-xs uppercase tracking-widest mb-8">Enter 6-digit PIN</Text>

                    {/* PIN Indicators */}
                    <View className="flex-row gap-3 mb-10">
                        {[...Array(6)].map((_, i) => (
                            <View
                                key={i}
                                className={`w-4 h-4 rounded-full border-2 ${i < enteredPin.length ? 'bg-emerald-500 border-emerald-500' : 'bg-transparent border-slate-700'}`}
                            />
                        ))}
                    </View>

                    {/* Keypad */}
                    <View className="flex-row flex-wrap justify-center w-64">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'].map((num, idx) => (
                            <TouchableOpacity
                                key={idx}
                                onPress={() => {
                                    if (num === 'del') handlePinDelete();
                                    else if (num !== '') handlePinPress(num.toString());
                                }}
                                disabled={num === ''}
                                className="w-16 h-16 m-2 items-center justify-center"
                            >
                                {num === 'del' ? (
                                    <Delete size={24} color="#ef4444" />
                                ) : num !== '' ? (
                                    <View className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 items-center justify-center">
                                        <Text className="text-white text-2xl font-bold">{num}</Text>
                                    </View>
                                ) : null}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    // Main Password Manager UI (after unlock)
    return (
        <SafeAreaView className="flex-1 bg-slate-950">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="p-6 pt-2 pb-4 border-b border-slate-800 bg-slate-950">
                <View className="flex-row justify-between items-center mb-4">
                    <View>
                        <Text className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">Secure Storage</Text>
                        <Text className="text-2xl font-black text-white italic">PASSWORDS</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => openModal()}
                        className="bg-emerald-600 px-4 py-2 rounded-lg flex-row items-center"
                    >
                        <Plus size={16} color="white" />
                        <Text className="text-white font-bold ml-2">ADD</Text>
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="bg-slate-900 rounded-xl flex-row items-center px-4 border border-slate-800">
                    <Search size={20} color="#64748b" />
                    <TextInput
                        className="flex-1 p-4 text-white font-bold"
                        placeholder="Search platforms..."
                        placeholderTextColor="#64748b"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <ScrollView className="flex-1 px-4 py-4">
                {loading ? (
                    <ActivityIndicator color="#10B981" className="mt-10" />
                ) : (
                    <>
                        {/* My Passwords Section */}
                        {myItems.length > 0 && (
                            <View className="mb-6">
                                <View className="flex-row items-center gap-2 mb-3">
                                    <User size={14} color="#10B981" />
                                    <Text className="text-emerald-400 text-xs font-bold uppercase tracking-widest">My Credentials</Text>
                                </View>
                                {myItems.map((item) => (
                                    <PasswordCard key={item.id} item={item} onCopy={copyToClipboard} onEdit={openModal} onDelete={handleDelete} />
                                ))}
                            </View>
                        )}

                        {/* Others' Passwords Section */}
                        {othersItems.length > 0 && (
                            <View className="mb-6">
                                <View className="flex-row items-center gap-2 mb-3">
                                    <Users size={14} color="#F59E0B" />
                                    <Text className="text-amber-400 text-xs font-bold uppercase tracking-widest">Shared Credentials</Text>
                                </View>
                                {othersItems.map((item) => (
                                    <PasswordCard key={item.id} item={item} onCopy={copyToClipboard} onEdit={openModal} onDelete={handleDelete} isShared />
                                ))}
                            </View>
                        )}

                        {filteredItems.length === 0 && (
                            <View className="items-center py-10 opacity-50">
                                <Text className="text-slate-500 font-bold">No passwords stored yet.</Text>
                            </View>
                        )}
                    </>
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
                                    {editingItem ? 'EDIT CREDENTIAL' : 'NEW CREDENTIAL'}
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
                                <View className="space-y-4 pb-6">
                                    {/* Visibility Toggle */}
                                    <View>
                                        <Text className="text-slate-400 font-bold text-xs uppercase mb-3">Visibility</Text>
                                        <View className="flex-row gap-3">
                                            <TouchableOpacity
                                                onPress={() => setVisibility('me')}
                                                className={`flex-1 p-4 rounded-xl border flex-row items-center justify-center gap-2 ${visibility === 'me' ? 'bg-emerald-600/20 border-emerald-500' : 'bg-slate-950 border-slate-800'}`}
                                            >
                                                <User size={18} color={visibility === 'me' ? '#10B981' : '#64748b'} />
                                                <Text className={`font-bold ${visibility === 'me' ? 'text-emerald-400' : 'text-slate-500'}`}>Me</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => setVisibility('others')}
                                                className={`flex-1 p-4 rounded-xl border flex-row items-center justify-center gap-2 ${visibility === 'others' ? 'bg-amber-600/20 border-amber-500' : 'bg-slate-950 border-slate-800'}`}
                                            >
                                                <Users size={18} color={visibility === 'others' ? '#F59E0B' : '#64748b'} />
                                                <Text className={`font-bold ${visibility === 'others' ? 'text-amber-400' : 'text-slate-500'}`}>Others</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Person Name (only for Others) */}
                                    {visibility === 'others' && (
                                        <View>
                                            <Text className="text-slate-400 font-bold text-xs uppercase mb-2">Person Name</Text>
                                            <TextInput
                                                className="bg-slate-950 border border-amber-500/30 rounded-xl p-4 text-white font-bold h-14"
                                                value={sharedWithName}
                                                onChangeText={setSharedWithName}
                                                placeholder="Who does this belong to?"
                                                placeholderTextColor="#475569"
                                            />
                                        </View>
                                    )}

                                    <View>
                                        <Text className="text-slate-400 font-bold text-xs uppercase mb-2">Platform / Website</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold h-14"
                                            value={platform}
                                            onChangeText={setPlatform}
                                            placeholder="e.g. Gmail, Netflix, AWS"
                                            placeholderTextColor="#475569"
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-slate-400 font-bold text-xs uppercase mb-2">Email (Optional)</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white h-14"
                                            value={email}
                                            onChangeText={setEmail}
                                            placeholder="user@example.com"
                                            placeholderTextColor="#475569"
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-slate-400 font-bold text-xs uppercase mb-2">Username (Optional)</Text>
                                        <TextInput
                                            className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white h-14"
                                            value={username}
                                            onChangeText={setUsername}
                                            placeholder="username123"
                                            placeholderTextColor="#475569"
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-slate-400 font-bold text-xs uppercase mb-2">Password</Text>
                                        <View className="relative">
                                            <TextInput
                                                className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white pr-12 font-bold h-14"
                                                value={password}
                                                onChangeText={setPassword}
                                                placeholder="••••••••"
                                                placeholderTextColor="#475569"
                                                secureTextEntry={!showPassword}
                                                autoCapitalize="none"
                                            />
                                            <TouchableOpacity
                                                onPress={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-4"
                                            >
                                                {showPassword ? (
                                                    <EyeOff size={20} color="#64748b" />
                                                ) : (
                                                    <Eye size={20} color="#64748b" />
                                                )}
                                            </TouchableOpacity>
                                        </View>
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
                                        className="bg-emerald-600 w-full p-4 rounded-xl items-center flex-row justify-center shadow-lg shadow-emerald-900/20"
                                    >
                                        <Save size={20} color="white" />
                                        <Text className="text-white font-black text-lg ml-2 italic">SAVE SECURELY</Text>
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

// Password Card Component
function PasswordCard({ item, onCopy, onEdit, onDelete, isShared = false }: any) {
    return (
        <View className={`mb-4 bg-slate-900 border rounded-xl p-4 ${isShared ? 'border-amber-500/30' : 'border-slate-800'}`}>
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                    <Text className="text-lg font-black text-white italic mb-1">{item.platform}</Text>
                    {isShared && item.shared_with_name && (
                        <View className="flex-row items-center gap-1 mb-1">
                            <Users size={12} color="#F59E0B" />
                            <Text className="text-amber-400 text-xs font-bold">{item.shared_with_name}</Text>
                        </View>
                    )}
                    {item.email ? <Text className="text-slate-400 text-xs font-bold">{item.email}</Text> : null}
                    {item.username ? <Text className="text-slate-500 text-xs">{item.username}</Text> : null}
                </View>
                <View className="flex-row gap-2">
                    <TouchableOpacity
                        onPress={() => onCopy(item.password)}
                        className="p-2 bg-emerald-900/20 rounded-lg border border-emerald-900/50"
                    >
                        <Copy size={16} color="#34d399" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onEdit(item)}
                        className="p-2 bg-slate-800 rounded-lg"
                    >
                        <Lock size={16} color="#94a3b8" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onDelete(item.id)}
                        className="p-2 bg-red-900/20 rounded-lg"
                    >
                        <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
