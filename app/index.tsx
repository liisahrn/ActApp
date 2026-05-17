import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Redirect } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import { Colors } from '@/constants/theme'

export default function Index() {
  const { session, profile, loading } = useAuthStore()

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  if (!session) return <Redirect href="/(auth)/phone" />
  if (session && !profile?.username) return <Redirect href="/onboarding" />
  return <Redirect href="/(tabs)" />
}
