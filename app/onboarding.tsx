import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Colors, Fonts, Radius, Shadow } from '@/constants/theme'

const AVATARS = ['🌱', '🌿', '🌲', '🌍', '⚡', '🚲', '🐝', '🦋', '🌊', '☀️', '🍃', '♻️']

export default function OnboardingScreen() {
  const { fetchProfile } = useAuthStore()
  const [username, setUsername] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0])
  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    const trimmed = username.trim()
    if (trimmed.length < 2) {
      Alert.alert('Pick a username', 'Must be at least 2 characters.')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      Alert.alert('Invalid username', 'Only letters, numbers, and underscores.')
      return
    }

    setLoading(true)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        Alert.alert('Session expired', 'Please sign in again.')
        router.replace('/(auth)/phone')
        return
      }

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', trimmed)
        .neq('id', user.id)
        .maybeSingle()

      if (existing) {
        Alert.alert('Taken!', 'That username is already in use. Try another.')
        return
      }

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        username: trimmed,
        avatar_url: selectedAvatar,
        avatar_emoji: selectedAvatar,
        xp: 0,
        level: 1,
        timezone,
      })

      if (error) {
        Alert.alert('Error', error.message)
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.selected}>{selectedAvatar}</Text>
          <Text style={styles.title}>Set up your profile</Text>
          <Text style={styles.subtitle}>Choose your avatar and pick a username</Text>
        </View>

        <View style={styles.avatarGrid}>
          {AVATARS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={[styles.avatarCell, selectedAvatar === emoji && styles.avatarCellSelected]}
              onPress={() => setSelectedAvatar(emoji)}
              activeOpacity={0.75}
            >
              <Text style={styles.avatarEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <View style={styles.inputRow}>
            <Text style={styles.at}>@</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="your_username"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, (loading || username.trim().length < 2) && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={loading || username.trim().length < 2}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Setting up…' : "Let's go 🌍"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { padding: 28, gap: 24, paddingTop: 80, paddingBottom: 40 },
  header: { alignItems: 'center', gap: 8 },
  selected: { fontSize: 72, marginBottom: 4 },
  title: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: Fonts.sizes.md, color: Colors.textSecondary },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  avatarCell: {
    width: 56, height: 56, borderRadius: Radius.md,
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarCellSelected: { borderColor: Colors.primary, borderWidth: 2.5, backgroundColor: Colors.surfaceAlt },
  avatarEmoji: { fontSize: 28 },
  inputGroup: { gap: 6 },
  label: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.textSecondary },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    paddingHorizontal: 14, ...Shadow.sm,
  },
  at: { fontSize: Fonts.sizes.lg, color: Colors.textSecondary, marginRight: 4 },
  input: { flex: 1, paddingVertical: 14, fontSize: Fonts.sizes.lg, color: Colors.text },
  button: { backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingVertical: 16, alignItems: 'center', ...Shadow.lg },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: '#fff', fontSize: Fonts.sizes.lg, fontWeight: '700' },
})
