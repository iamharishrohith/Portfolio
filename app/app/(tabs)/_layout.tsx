import { Tabs, Redirect } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Home, CheckSquare } from 'lucide-react-native';
import { useAuth } from '@/context/auth';

export default function TabLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/pin" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#64748b',
        headerShown: false,
        tabBarStyle: {
          display: 'none', // Hidden - using floating button instead
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Command',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cms"
        options={{
          title: 'CMS',
          tabBarIcon: ({ color }) => <CheckSquare size={24} color={color} />, // Using CheckSquare or finding a better icon like Database/Edit
        }}
      />
      <Tabs.Screen
        name="protocol"
        options={{
          title: 'Protocol',
          tabBarIcon: ({ color }) => <CheckSquare size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
