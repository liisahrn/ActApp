import { useState } from 'react'
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, Alert,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Colors, Fonts, Radius } from '@/constants/theme'
import { S } from '@/constants/styles'
import Background from '@/components/Background'

const AVATARS = ['🌱', '🌿', '🌲', '🌍', '⚡', '🚲', '🐝', '🦋', '🌊', '☀️', '🍃', '♻️', '🦊', '🐺', '🦅', '🐬', '🌵', '🏔️', '🌋', '❄️']

export default function OnboardingScreen() {
  const { fetchProfile } = useAuthStore()
  const [selected, setSelected] = useState(AVATARS[0])
  const [loading, setLoading]   = useState(false)

  const handleContinue = async () => {
    setLoading(true)
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        Alert.alert('Session expired', 'Please sign in again.')
        router.replace('/(auth)/phone')
        return
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: selected })
        .eq('id', user.id)

      if (updateError) {
        Alert.alert('Error', updateError.message)
        return
      }

      await fetchProfile(user.id)
      router.replace('/(tabs)')
    } catch (e: any) {
      Alert.alert('Something went wrong', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={S.fill}>
      <Background />
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <Text style={styles.bigEmoji}>{selected}</Text>
          <View style={[S.missionBadge, { alignSelf: 'center' }]}>
            <Text style={S.missionBadgeText}>AGENT IDENTITY</Text>
          </View>
          <Text style={styles.title}>Choose your avatar</Text>
          <Text style={[S.muted, { textAlign: 'center', fontSize: Fonts.sizes.sm }]}>
            This is how other agents will see you.
          </Text>
        </View>

        <View style={styles.grid}>
          {AVATARS.map(emoji => (
            <TouchableOpacity
              key={emoji}
              style={[styles.cell, selected === emoji && styles.cellSelected]}
              onPress={() => setSelected(emoji)}
              activeOpacity={0.75}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[S.primaryBtn, loading && { opacity: 0.6 }]}
          onPress={handleContinue}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={S.primaryBtnText}>
            {loading ? 'Deploying…' : 'Begin mission 🌍'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  inner:       { padding: 28, gap: 28, paddingTop: 80, paddingBottom: 40 },
  header:      { alignItems: 'center', gap: 10 },
  bigEmoji:    { fontSize: 80 },
  title:       { fontSize: Fonts.sizes.xxl, fontFamily: Fonts.heading, color: Colors.text, textAlign: 'center' },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  cell:        { width: 60, height: 60, borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  cellSelected:{ borderColor: Colors.primary, borderWidth: 2.5, backgroundColor: Colors.primaryLight },
  emoji:       { fontSize: 30 },
})
