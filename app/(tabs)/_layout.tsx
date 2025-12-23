import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { SmashColors } from '@/constants/theme';

// Iconos personalizados para el tab bar
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: { [key: string]: string } = {
    home: '🏠',
    conteo: '📝',
    minijuego: '🎰',
    tabla: '📊',
    banco: '💰',
  };

  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>
        {icons[name] || '❓'}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: SmashColors.gold,
        tabBarInactiveTintColor: SmashColors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerStyle: styles.header,
        headerTintColor: SmashColors.textWhite,
        headerTitleStyle: styles.headerTitle,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          headerTitle: 'DOJO SMASH 2025',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="conteo"
        options={{
          title: 'Conteo',
          headerTitle: 'CONTEO SEMANAL',
          headerStyle: { ...styles.header, backgroundColor: '#e52521' },
          tabBarIcon: ({ focused }) => <TabIcon name="conteo" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="minijuego"
        options={{
          title: 'Apuestas',
          headerTitle: 'ROBO DE PUNTOS',
          headerStyle: { ...styles.header, backgroundColor: '#0a0a1a' },
          tabBarIcon: ({ focused }) => <TabIcon name="minijuego" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tabla"
        options={{
          title: 'Tabla',
          headerTitle: 'TABLA GLOBAL',
          headerStyle: { ...styles.header, backgroundColor: '#1a1a1a' },
          tabBarIcon: ({ focused }) => <TabIcon name="tabla" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="banco"
        options={{
          title: 'Banco',
          headerTitle: 'BANCO SMASH',
          headerStyle: { ...styles.header, backgroundColor: '#7cb342' },
          tabBarIcon: ({ focused }) => <TabIcon name="banco" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: SmashColors.backgroundPrimary,
    borderTopWidth: 3,
    borderTopColor: SmashColors.accentPrimary,
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  header: {
    backgroundColor: SmashColors.backgroundPrimary,
    borderBottomWidth: 3,
    borderBottomColor: SmashColors.accentPrimary,
  },
  headerTitle: {
    color: SmashColors.gold,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  iconContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  iconContainerFocused: {
    backgroundColor: 'rgba(233, 69, 96, 0.2)',
  },
  icon: {
    fontSize: 20,
  },
  iconFocused: {
    fontSize: 24,
  },
});
