import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Save, User, FileText, Link as LinkIcon, X, Mail, Phone, Globe, Image as ImageIcon } from 'lucide-react-native';
import { useAuth } from '@/context/auth';
import { useToast } from '@/context/ToastContext';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileEditScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [profileId, setProfileId] = useState<string | null>(null);

    // Profile Fields
    const [fullName, setFullName] = useState('');
    const [headline, setHeadline] = useState('');
    const [bio, setBio] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');

    // Contact & Digital Card Fields
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [portfolioUrl, setPortfolioUrl] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .limit(1)
                .single();

            if (data) {
                setProfileId(data.id);
                setFullName(data.full_name || '');
                setHeadline(data.job_title || data.headline || ''); // synced with job_title
                setBio(data.bio || '');
                setResumeUrl(data.resume_url || '');
                setGithubUrl(data.github_url || '');
                setLinkedinUrl(data.linkedin_url || '');
                setEmail(data.email || '');
                setPhone(data.phone || '');
                setPortfolioUrl(data.portfolio_url || '');
                setAvatarUrl(data.avatar_url || '');
            } else if (error) {
                console.log('Error fetching profile data:', error.message);
            }
        } catch (e: any) {
            console.log('Error fetching profile context:', e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            if (!profileId) {
                Alert.alert("Error", "No profile loaded to update.");
                return;
            }

            const updates = {
                id: profileId,
                full_name: fullName,
                job_title: headline, // Sync headline to job_title
                bio,
                resume_url: resumeUrl,
                github_url: githubUrl,
                linkedin_url: linkedinUrl,
                email,
                phone,
                portfolio_url: portfolioUrl,
                avatar_url: avatarUrl,
                updated_at: new Date(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) throw error;
            Alert.alert("Success", "Profile updated successfully!");
            router.back();
        } catch (e: any) {
            Alert.alert("Error", e.message);
        } finally {
            setSaving(false);
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const uri = result.assets[0].uri;
                await uploadAvatar(uri);
            }
        } catch (error) {
            showToast("Error picking image", 'error');
        }
    };

    const uploadAvatar = async (uri: string) => {
        try {
            setUploading(true);
            const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const formData = new FormData();
            formData.append('file', {
                uri,
                name: fileName,
                type: `image/${fileExt}`,
            } as any);

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, formData);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            if (data) {
                setAvatarUrl(data.publicUrl);
                showToast("Avatar uploaded successfully!", 'success');
            }
        } catch (error: any) {
            showToast("Upload failed: " + error.message, 'error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-950" edges={['top']}>
            <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />

            {/* Header */}
            <View className="px-6 pt-6 pb-4 flex-row justify-between items-center border-b border-slate-900">
                <Text className="text-xl font-black text-white italic">EDIT <Text className="text-purple-500">PROFILE</Text></Text>
                <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-900 rounded-full">
                    <X size={20} color="#94a3b8" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator color="#A855F7" />
                </View>
            ) : (
                <ScrollView className="flex-1 px-6 pt-6">

                    {/* Basic Info */}
                    <View className="mb-6 space-y-4">
                        <View className="flex-row items-center space-x-2 mb-2">
                            <User size={16} color="#A855F7" />
                            <Text className="text-purple-400 font-bold uppercase text-xs tracking-widest">Identity</Text>
                        </View>

                        <View>
                            <Text className="text-slate-500 text-xs mb-1 font-bold">FULL NAME</Text>
                            <TextInput
                                value={fullName}
                                onChangeText={setFullName}
                                className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800"
                                placeholder="Harish Rohith"
                                placeholderTextColor="#475569"
                            />
                        </View>

                        <View>
                            <Text className="text-slate-500 text-xs mb-1 font-bold">JOB TITLE / ROLE</Text>
                            <TextInput
                                value={headline}
                                onChangeText={setHeadline}
                                className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800"
                                placeholder="System Architect"
                                placeholderTextColor="#475569"
                            />
                        </View>

                        <View>
                            <Text className="text-slate-500 text-xs mb-1 font-bold">BIO</Text>
                            <TextInput
                                value={bio}
                                onChangeText={setBio}
                                multiline
                                numberOfLines={4}
                                className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 h-24"
                                placeholder="Short description..."
                                placeholderTextColor="#475569"
                                textAlignVertical="top"
                            />
                        </View>

                        <View>
                            <Text className="text-slate-500 text-xs mb-3 font-bold">AVATAR</Text>
                            <View className="flex-row items-center space-x-4">
                                <TouchableOpacity onPress={pickImage} className="relative">
                                    <View className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden items-center justify-center">
                                        {avatarUrl ? (
                                            <Image source={{ uri: avatarUrl }} className="w-full h-full" />
                                        ) : (
                                            <User size={32} color="#475569" />
                                        )}
                                        {uploading && (
                                            <View className="absolute inset-0 bg-black/50 justify-center items-center">
                                                <ActivityIndicator color="#A855F7" size="small" />
                                            </View>
                                        )}
                                    </View>
                                    <View className="absolute bottom-0 right-0 bg-purple-600 p-1.5 rounded-full border border-slate-900">
                                        <ImageIcon size={12} color="white" />
                                    </View>
                                </TouchableOpacity>

                                <View className="flex-1">
                                    <TouchableOpacity
                                        onPress={pickImage}
                                        className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 self-start"
                                    >
                                        <Text className="text-slate-300 font-bold text-xs">Change Photo</Text>
                                    </TouchableOpacity>
                                    <Text className="text-slate-600 text-[10px] mt-2">
                                        Upload a square image. Max 2MB.
                                    </Text>
                                </View>
                            </View>
                            {/* Hidden Input for manual URL override if needed, or just remove */}
                        </View>
                    </View>

                    {/* Contact Info (New) */}
                    <View className="mb-6 space-y-4">
                        <View className="flex-row items-center space-x-2 mb-2">
                            <Mail size={16} color="#F59E0B" />
                            <Text className="text-amber-400 font-bold uppercase text-xs tracking-widest">Contact Details</Text>
                        </View>

                        <View>
                            <Text className="text-slate-500 text-xs mb-1 font-bold">EMAIL</Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800"
                                placeholder="contact@example.com"
                                placeholderTextColor="#475569"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View>
                            <Text className="text-slate-500 text-xs mb-1 font-bold">PHONE</Text>
                            <TextInput
                                value={phone}
                                onChangeText={setPhone}
                                className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800"
                                placeholder="+91 98765 43210"
                                placeholderTextColor="#475569"
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View>
                            <Text className="text-slate-500 text-xs mb-1 font-bold">PORTFOLIO URL (For QR)</Text>
                            <TextInput
                                value={portfolioUrl}
                                onChangeText={setPortfolioUrl}
                                className="bg-slate-900 text-blue-400 p-4 rounded-xl border border-slate-800"
                                placeholder="https://harishrohith.vercel.app"
                                placeholderTextColor="#475569"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Links */}
                    <View className="mb-24 space-y-4">
                        <View className="flex-row items-center space-x-2 mb-2">
                            <LinkIcon size={16} color="#3B82F6" />
                            <Text className="text-blue-400 font-bold uppercase text-xs tracking-widest">Social Links</Text>
                        </View>

                        <View>
                            <Text className="text-slate-500 text-xs mb-1 font-bold">RESUME URL</Text>
                            <TextInput
                                value={resumeUrl}
                                onChangeText={setResumeUrl}
                                className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800"
                                placeholder="https://..."
                                placeholderTextColor="#475569"
                            />
                        </View>

                        <View>
                            <Text className="text-slate-500 text-xs mb-1 font-bold">GITHUB URL</Text>
                            <TextInput
                                value={githubUrl}
                                onChangeText={setGithubUrl}
                                className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800"
                                placeholder="https://github.com/..."
                                placeholderTextColor="#475569"
                            />
                        </View>

                        <View>
                            <Text className="text-slate-500 text-xs mb-1 font-bold">LINKEDIN URL</Text>
                            <TextInput
                                value={linkedinUrl}
                                onChangeText={setLinkedinUrl}
                                className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800"
                                placeholder="https://linkedin.com/in/..."
                                placeholderTextColor="#475569"
                            />
                        </View>
                    </View>

                </ScrollView>
            )}

            {/* Save Button */}
            <View className="absolute left-6 right-6" style={{ bottom: Math.max(insets.bottom, 16) + 8 }}>
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    className="bg-purple-600 p-4 rounded-xl flex-row justify-center items-center shadow-lg shadow-purple-600/20"
                >
                    {saving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Save size={20} color="white" className="mr-2" />
                            <Text className="text-white font-bold text-lg">Save Profile</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}
