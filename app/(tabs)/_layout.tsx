import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SmashColors } from '@/constants/smashTheme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: SmashColors.accent,
        tabBarInactiveTintColor: SmashColors.textDark,
        tabBarStyle: {
          backgroundColor: SmashColors.secondary,
          borderTopWidth: 3,
          borderTopColor: SmashColors.border,
        },
        headerStyle: {
          backgroundColor: SmashColors.secondary,
          borderBottomWidth: 3,
          borderBottomColor: SmashColors.border,
        },
        headerTintColor: SmashColors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 16,
        },
        headerShown: true,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'INICIO',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="conteo"
        options={{
          title: 'CONTEO',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="minijuego"
        options={{
          title: 'APUESTAS',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="dice.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tabla"
        options={{
          title: 'TABLA',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="banco"
        options={{
          title: 'BANCO',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="dollarsign.circle.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
