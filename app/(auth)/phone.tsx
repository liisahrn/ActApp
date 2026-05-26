import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { Colors, Fonts, Radius, Shadow } from '@/constants/theme'
import { S } from '@/constants/styles'
import Background from '@/components/Background'
import AppLogo from '@/components/AppLogo'

// Supabase requires an email — we construct a synthetic one the user never sees.
const toEmail = (username: string) => `${username.toLowerCase()}@actapp.local`

export default function AuthScreen() {
  const [mode, setMode]         = useState<'signup' | 'login'>('signup')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  const trimmed = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')

  const validate = () => {
    if (trimmed.length < 3) {
      Alert.alert('Too short', 'Agent name must be at least 3 characters.')
      return false
    }
    if (!/^[a-z0-9_]+$/.test(trimmed)) {
      Alert.alert('Invalid name', 'Only letters, numbers, and underscores.')
      return false
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.')
      return false
    }
    return true
  }

  const handleSignUp = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      // Check username is available
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', trimmed)
        .maybeSingle()

      if (existing) {
        Alert.alert('Name taken', 'That agent name is already in use. Choose another.')
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email: toEmail(trimmed),
        password,
      })

      if (error) {
        // Username already registered = account exists
        if (error.message.toLowerCase().includes('already registered')) {
          Alert.alert('Already registered', 'An agent with that name already exists. Try signing in.')
          setMode('login')
        } else {
          Alert.alert('Sign up failed', error.message)
        }
        return
      }

      if (!data.session) {
        // Email confirmation is on — tell them to disable it
        Alert.alert(
          'One more step',
          'Disable "Enable email confirmations" in Supabase → Auth → Settings, then try again.'
        )
        return
      }

      // Create initial profile with username
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      await supabase.from('profiles').upsert({
        id: data.user!.id,
        username: trimmed,
        xp: 0,
        level: 1,
        kind_gems: 0,
        timezone,
      })

      router.replace('/onboarding')
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: toEmail(trimmed),
        password,
      })

      if (error) {
        if (error.message.toLowerCase().includes('invalid login')) {
          Alert.alert('Wrong details', 'Agent name or password is incorrect.')
        } else {
          Alert.alert('Sign in failed', error.message)
        }
        return
      }

      router.replace('/')
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={S.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Background />
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">

        <View style={styles.logoArea}>
          <AppLogo size="lg" showTagline />
        </View>

        <View style={styles.card}>
          <View style={[S.missionBadge, { alignSelf: 'center' }]}>
            <Text style={S.missionBadgeText}>
              {mode === 'signup' ? 'ENLIST AS AN AGENT' : 'AGENT LOGIN'}
            </Text>
          </View>

          <Text style={styles.cardTitle}>
            {mode === 'signup' ? 'Create your identity' : 'Welcome back, Agent'}
          </Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Agent Name</Text>
              <View style={styles.inputRow}>
                <Text style={styles.at}>@</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={t => setUsername(t.replace(/[^a-zA-Z0-9_]/g, ''))}
                  placeholder="your_agent_name"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                  maxLength={20}
                />
              </View>
              <Text style={styles.hint}>Letters, numbers, underscores only</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.inputStandalone]}
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 6 characters"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity
            style={[S.primaryBtn, loading && { opacity: 0.6 }]}
            onPress={mode === 'signup' ? handleSignUp : handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={S.primaryBtnText}>
              {loading ? 'Loading…' : mode === 'signup' ? 'Deploy as Agent →' : 'Sign in →'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMode(mode === 'signup' ? 'login' : 'signup')} style={styles.toggle}>
            <Text style={styles.toggleText}>
              {mode === 'signup' ? 'Already an agent? ' : 'New recruit? '}
              <Text style={styles.toggleLink}>{mode === 'signup' ? 'Sign in' : 'Sign up'}</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  inner:     { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center', gap: 32, paddingVertical: 60 },
  logoArea:  { alignItems: 'center' },
  card:      { backgroundColor: Colors.surfaceDark, borderRadius: 28, padding: 24, gap: 20, borderWidth: 1, borderColor: Colors.border, ...Shadow.md },
  cardTitle: { fontFamily: Fonts.heading, fontSize: Fonts.sizes.xxl, color: Colors.text, letterSpacing: 1, textAlign: 'center' },
  form:      { gap: 14 },
  inputGroup:{ gap: 6 },
  label:     { fontFamily: Fonts.body, fontSize: Fonts.sizes.sm, color: Colors.textSecondary, letterSpacing: 0.5 },
  hint:      { fontFamily: Fonts.body, fontSize: Fonts.sizes.xs, color: Colors.textMuted },
  inputRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: 14 },
  at:        { fontSize: Fonts.sizes.lg, color: Colors.textMuted, marginRight: 4 },
  input:     { flex: 1, paddingVertical: 13, fontSize: Fonts.sizes.md, color: Colors.text, fontFamily: Fonts.body },
  inputStandalone: { backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: 16, paddingVertical: 13, fontSize: Fonts.sizes.md, color: Colors.text, fontFamily: Fonts.body },
  toggle:    { alignItems: 'center' },
  toggleText:{ fontFamily: Fonts.body, fontSize: Fonts.sizes.sm, color: Colors.textMuted },
  toggleLink:{ color: Colors.primary, fontFamily: Fonts.heading },
})
