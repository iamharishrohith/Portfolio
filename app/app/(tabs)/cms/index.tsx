import React from 'react';
import { TouchableOpacity, Linking, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Database, FolderGit2, BookOpen, Award, Key, ChevronRight, Briefcase, User, ExternalLink, Trophy, Command, MessageSquare, FileText } from 'lucide-react-native';
import { Layout, Text, List, ListItem, Divider, Card, Button, Icon } from '@ui-kitten/components';
import { useSystemSound } from '../../../hooks/useSystemSound';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function CMSScreen() {
    const router = useRouter();
    const { playSound } = useSystemSound();

    const cmsItems = [
        { title: 'Projects', route: '/(tabs)/cms/projects', icon: FolderGit2, color: '#F472B6', rank: 'S', description: 'Manage Active Raids' },
        { title: 'System Logs', route: '/(tabs)/cms/articles', icon: FileText, color: '#22d3ee', rank: 'A', description: 'Knowledge Base' },
        { title: 'Mission Reports', route: '/(tabs)/cms/testimonials', icon: MessageSquare, color: '#fbbf24', rank: 'B', description: 'Client Feedback' },
        { title: 'Hunter Status', route: '/(tabs)/cms/status', icon: User, color: '#FFFFFF', rank: '?', description: 'Edit Profile & Job' },
        { title: 'Experiences', route: '/(tabs)/cms/experiences', icon: Briefcase, color: '#60A5FA', rank: 'A', description: 'Career History' },
        { title: 'Achievements', route: '/(tabs)/cms/achievements', icon: Trophy, color: '#FBBF24', rank: 'S', description: 'Legendary Records' },
        { title: 'Typing Roles', route: '/(tabs)/cms/roles', icon: Command, iconName: 'Command', color: '#8B5CF6', rank: 'A', description: 'Header Status Cycling' },
        { title: 'Skills', route: '/(tabs)/cms/skills', icon: Database, color: '#34D399', rank: 'B', description: 'Ability Tree' },
        { title: 'Education', route: '/(tabs)/cms/education', icon: BookOpen, color: '#FBBF24', rank: 'C', description: 'Academic Records' },
        { title: 'Certifications', route: '/(tabs)/cms/certifications', icon: Award, color: '#A78BFA', rank: 'B', description: 'Licenses & Awards' },
        { title: 'Passwords', route: '/(tabs)/cms/passwords', icon: Key, color: '#E879F9', rank: 'S', description: 'Secure Vault' },
    ];

    const renderItemIcon = (item: any) => (props: any) => (
        <View style={[styles.iconContainer, { borderColor: item.color + '40', backgroundColor: item.color + '10' }]}>
            <item.icon size={24} color={item.color} />
        </View>
    );

    const renderItemAccessory = (props: any) => (
        <ChevronRight size={20} color="#475569" />
    );

    const renderItem = ({ item, index }: { item: any, index: number }) => (
        <ListItem
            title={(evaProps: any) => <Text {...evaProps} category='h6' style={{ color: 'white', fontWeight: 'bold', fontStyle: 'italic' }}>{item.title}</Text>}
            description={(evaProps: any) => <Text {...evaProps} category='c1' style={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>{item.description}</Text>}
            accessoryLeft={renderItemIcon(item)}
            accessoryRight={renderItemAccessory}
            onPress={() => {
                playSound('click');
                router.push(item.route as any);
            }}
            style={styles.listItem}
        />
    );

    const Header = () => (
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.header}>
            <Text category='c2' status='primary' style={styles.subHeader}>ADMINISTRATOR ACCESS</Text>
            <Text category='h1' style={styles.title}>DATA EDITOR</Text>

            <Card
                style={styles.systemCard}
                status='primary'
                onPress={() => {
                    playSound('dungeon_entry');
                    Linking.openURL('http://localhost:3000');
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                        <View style={{ padding: 8, backgroundColor: 'rgba(59, 130, 246, 0.15)', borderRadius: 8 }}>
                            <ExternalLink size={24} color="#3b82f6" />
                        </View>
                        <View>
                            <Text category='h6' style={{ fontWeight: '900', fontStyle: 'italic' }}>OPEN SYSTEM</Text>
                            <Text category='c1' appearance='hint'>ACCESS PUBLIC INTERFACE</Text>
                        </View>
                    </View>
                    <ChevronRight size={20} color="#475569" />
                </View>
            </Card>
        </Animated.View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#1e1e2e' }} edges={['top']}>
            <Layout style={styles.container}>
                <List
                    style={styles.list}
                    contentContainerStyle={styles.contentContainer}
                    data={cmsItems}
                    renderItem={renderItem}
                    ListHeaderComponent={Header}
                    ItemSeparatorComponent={Divider}
                />
            </Layout>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    contentContainer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 60,
    },
    header: {
        marginBottom: 30,
    },
    subHeader: {
        letterSpacing: 4,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#A78BFA'
    },
    title: {
        fontStyle: 'italic',
        fontWeight: '900',
        marginBottom: 20,
    },
    systemCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        marginBottom: 10,
    },
    listItem: {
        backgroundColor: 'transparent',
        paddingVertical: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        marginRight: 16
    }
});
