import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { Colors, Fonts, Radius, Shadow } from '@/constants/theme'
import Background from '@/components/Background'
import AppLogo from '@/components/AppLogo'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address.')
      return
    }
    if (password.length < 6) {
      Alert.alert('Password too short', 'Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email: trimmedEmail, password })
      if (error) {
        if (error.message.includes('already registered')) {
          Alert.alert('Already registered', 'You already have an account. Try signing in instead.')
          setIsSignUp(false)
        } else {
          Alert.alert('Sign up failed', error.message)
        }
      } else if (data.session === null) {
        Alert.alert('Check your email', 'Confirm your email then sign in.\n\nTip: disable "Enable email confirmations" in Supabase → Auth → Settings for dev.')
      } else {
        router.replace('/')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password })
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          Alert.alert('Email not confirmed', 'Disable "Enable email confirmations" in Supabase → Auth → Settings.')
        } else {
          Alert.alert('Sign in failed', error.message)
        }
      } else {
        router.replace('/')
      }
    }
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Background />
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.logoArea}>
          <AppLogo size="lg" showTagline />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isSignUp ? 'Create account' : 'Welcome back'}
          </Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="At least 6 characters"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Loading…' : isSignUp ? 'Create account →' : 'Sign in →'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.toggle}>
            <Text style={styles.toggleText}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <Text style={styles.toggleLink}>{isSignUp ? 'Sign in' : 'Sign up'}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center', gap: 32, paddingVertical: 60 },
  logoArea: { alignItems: 'center' },
  card: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 28,
    padding: 24,
    gap: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.md,
  },
  cardTitle: {
    fontFamily: Fonts.heading,
    fontSize: Fonts.sizes.xxl,
    color: Colors.text,
    letterSpacing: 1,
  },
  form: { gap: 14 },
  inputGroup: { gap: 6 },
  label: { fontFamily: Fonts.body, fontSize: Fonts.sizes.sm, color: Colors.textSecondary, letterSpacing: 0.5 },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    fontFamily: Fonts.body,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 15,
    alignItems: 'center',
    ...Shadow.lg,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontFamily: Fonts.heading, color: '#fff', fontSize: Fonts.sizes.lg, letterSpacing: 1 },
  toggle: { alignItems: 'center' },
  toggleText: { fontFamily: Fonts.body, fontSize: Fonts.sizes.sm, color: Colors.textMuted },
  toggleLink: { color: Colors.primary, fontFamily: Fonts.heading },
})
