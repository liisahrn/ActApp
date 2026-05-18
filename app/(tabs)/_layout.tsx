import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Fonts } from '@/constants/theme'

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]} numberOfLines={1}>{label}</Text>
    </View>
  )
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarBackground: () => (
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(13,32,24,0.97)']}
            style={StyleSheet.absoluteFill}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🌱" label="Today" focused={focused} /> }}
      />
      <Tabs.Screen
        name="impact-bank"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏦" label="Impact" focused={focused} /> }}
      />
      <Tabs.Screen
        name="friends"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👥" label="Friends" focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏆" label="Profile" focused={focused} /> }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: 82,
    paddingBottom: 14,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  tabItem: { alignItems: 'center', gap: 3, width: 72 },
  tabEmoji: { fontSize: 24, opacity: 0.38 },
  tabEmojiFocused: { opacity: 1 },
  tabLabel: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  tabLabelFocused: {
    color: Colors.primary,
    fontFamily: Fonts.heading,
    fontSize: 10,
  },
})
