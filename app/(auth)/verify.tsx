import { useState, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { Colors, Fonts, Radius, Shadow } from '@/constants/theme'

export default function VerifyScreen() {
  const { email } = useLocalSearchParams<{ email: string }>()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<TextInput>(null)

  const handleVerify = async () => {
    if (code.length !== 6) {
      Alert.alert('Invalid code', 'Please enter the 6-digit code.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })
    setLoading(false)
    if (error) {
      Alert.alert('Wrong code', "That code didn't work. Try again.")
      setCode('')
    }
    // Navigation handled by auth state listener in _layout.tsx
  }

  const handleResend = async () => {
    await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
    Alert.alert('Code resent!', `We sent a new code to ${email}`)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.emoji}>📧</Text>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.highlight}>{email}</Text>
          </Text>
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={() => inputRef.current?.focus()}>
          <View style={styles.codeBox}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <View
                key={i}
                style={[styles.codeCell, code.length === i && styles.codeCellActive]}
              >
                <Text style={styles.codeDigit}>{code[i] ?? ''}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          style={styles.hiddenInput}
          autoFocus
        />

        <TouchableOpacity
          style={[styles.button, (loading || code.length !== 6) && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading || code.length !== 6}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verifying…' : 'Verify →'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend} style={styles.resend}>
          <Text style={styles.resendText}>Didn't get it? Resend code</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, paddingHorizontal: 28, justifyContent: 'center', gap: 24 },
  back: { position: 'absolute', top: 60, left: 28 },
  backText: { color: Colors.primary, fontSize: Fonts.sizes.md, fontWeight: '600' },
  header: { alignItems: 'center', gap: 10 },
  emoji: { fontSize: 56, marginBottom: 4 },
  title: { fontSize: Fonts.sizes.xxxl, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  subtitle: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  highlight: { fontWeight: '700', color: Colors.text },
  codeBox: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  codeCell: {
    width: 48,
    height: 58,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  codeCellActive: { borderColor: Colors.primary, borderWidth: 2 },
  codeDigit: { fontSize: Fonts.sizes.xxl, fontWeight: '700', color: Colors.text },
  hiddenInput: { position: 'absolute', opacity: 0, height: 0, width: 0 },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    ...Shadow.lg,
  },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: '#fff', fontSize: Fonts.sizes.lg, fontWeight: '700' },
  resend: { alignItems: 'center' },
  resendText: { color: Colors.primary, fontSize: Fonts.sizes.sm, fontWeight: '600' },
})
