import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="conteo"
        options={{
          title: 'Conteo',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="minijuego"
        options={{
          title: 'Apuestas',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="dice.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tabla"
        options={{
          title: 'Tabla',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="banco"
        options={{
          title: 'Banco',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="dollarsign.circle.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
