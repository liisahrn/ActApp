# NativeWind Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all `StyleSheet.create` usage with NativeWind (Tailwind CSS for React Native), extract repeated style patterns as UI primitive components, and delete `constants/styles.ts`.

**Architecture:** Install NativeWind v4, register brand tokens in `tailwind.config.js`, create 10 UI primitives in `components/ui/`, then rewrite each styled file to use `className` for static styles and keep `style={}` only for runtime-computed values. Shadows stay inline throughout (RN's multi-prop shadow model cannot map to a single Tailwind class).

**Tech Stack:** NativeWind v4, Tailwind CSS v3, Expo SDK 55, React Native 0.83

**Spec:** `docs/superpowers/specs/2026-05-19-nativewind-migration-design.md`

---

## File Map

**Created:**
- `metro.config.js` — NativeWind metro transformer
- `tailwind.config.js` — brand token registry
- `global.css` — Tailwind directives entry point
- `nativewind-env.d.ts` — TypeScript className support
- `components/ui/Card.tsx`
- `components/ui/PrimaryButton.tsx`
- `components/ui/PillBadge.tsx`
- `components/ui/PillButton.tsx`
- `components/ui/SectionTitle.tsx`
- `components/ui/Heading.tsx`
- `components/ui/BodyText.tsx`
- `components/ui/MutedText.tsx`
- `components/ui/AppTextInput.tsx`
- `components/ui/EmptyState.tsx`
- `components/ui/index.ts`

**Modified:**
- `babel.config.js` — add NativeWind plugin
- `app/_layout.tsx` — import global.css, fix GestureHandlerRootView
- `components/Background.tsx` — remove StyleSheet
- `components/AppLogo.tsx` — remove StyleSheet
- `components/SwipeToComplete.tsx` — remove StyleSheet
- `components/MissionsCard.tsx` — remove StyleSheet, use primitives
- `app/(tabs)/_layout.tsx` — remove StyleSheet
- `app/(auth)/phone.tsx` — remove StyleSheet, use primitives
- `app/(auth)/verify.tsx` — remove StyleSheet, use primitives
- `app/onboarding.tsx` — remove StyleSheet, use primitives
- `app/(tabs)/index.tsx` — remove StyleSheet, use primitives
- `app/(tabs)/impact-bank.tsx` — remove StyleSheet, use primitives
- `app/(tabs)/friends.tsx` — remove StyleSheet, use primitives
- `app/(tabs)/profile.tsx` — remove StyleSheet, use primitives
- `app/impact-report.tsx` — remove StyleSheet, use primitives

**Deleted:**
- `constants/styles.ts`

---

## Task 1: Install NativeWind and create metro config

**Files:**
- Create: `metro.config.js`
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install packages**

```bash
npm install nativewind@^4.0.0
npm install --save-dev tailwindcss@3.3.2
```

Expected: packages added to node_modules, no peer dep errors.

- [ ] **Step 2: Create `metro.config.js`**

```js
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const config = getDefaultConfig(__dirname)
module.exports = withNativeWind(config, { input: './global.css' })
```

- [ ] **Step 3: Commit**

```bash
git add metro.config.js package.json package-lock.json
git commit -m "chore: install nativewind and wire metro transformer"
```

---

## Task 2: Tailwind config, global CSS, and TypeScript types

**Files:**
- Create: `tailwind.config.js`
- Create: `global.css`
- Create: `nativewind-env.d.ts`

- [ ] **Step 1: Create `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#5ABF50',
        'primary-dark': '#3D9E34',
        'primary-light': 'rgba(90,191,80,0.18)',
        accent: '#D4553A',
        'accent-light': 'rgba(212,85,58,0.18)',
        background: '#0B1F0C',
        surface: 'rgba(255,255,255,0.07)',
        'surface-strong': 'rgba(255,255,255,0.13)',
        'surface-alt': 'rgba(255,255,255,0.04)',
        'surface-dark': 'rgba(0,0,0,0.45)',
        secondary: 'rgba(255,255,255,0.75)',
        muted: 'rgba(255,255,255,0.45)',
        border: 'rgba(255,255,255,0.13)',
        'border-light': 'rgba(255,255,255,0.07)',
        'xp-gold': '#FFD166',
        'streak-orange': '#FF8C42',
        'level-purple': '#C084FC',
        'kind-gem': '#60A5FA',
        'kind-gem-light': 'rgba(96,165,250,0.18)',
        error: '#FF6B6B',
      },
      fontFamily: {
        heading: ['ChakraPetch_700Bold'],
        body: ['Schoolbell_400Regular'],
      },
      fontSize: {
        xs: '11px',
        sm: '13px',
        md: '15px',
        lg: '17px',
        xl: '20px',
        '2xl': '26px',
        '3xl': '34px',
        hero: '52px',
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '20px',
        xl: '28px',
        full: '9999px',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: Create `global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 3: Create `nativewind-env.d.ts`** (enables `className` prop on RN components in TypeScript)

```ts
/// <reference types="nativewind/types" />
```

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.js global.css nativewind-env.d.ts
git commit -m "chore: add tailwind config with brand tokens and nativewind types"
```

---

## Task 3: Wire NativeWind into Babel and root layout

**Files:**
- Modify: `babel.config.js`
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Update `babel.config.js`**

```js
module.exports = (api) => {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin', 'nativewind/babel'],
  }
}
```

- [ ] **Step 2: Update `app/_layout.tsx`** (import global.css; fix flex-1 via className)

```tsx
import '../global.css'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export default function RootLayout() {
  const { setSession, fetchProfile } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) fetchProfile(session.user.id)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) fetchProfile(session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile, setSession])

  return (
    <GestureHandlerRootView className="flex-1">
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/phone" />
        <Stack.Screen name="(auth)/verify" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="impact-report"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack>
    </GestureHandlerRootView>
  )
}
```

- [ ] **Step 3: Start the dev server and verify it boots without errors**

```bash
npx expo start --clear
```

Expected: Metro bundler starts, no "cannot find module nativewind" errors.

- [ ] **Step 4: Commit**

```bash
git add babel.config.js app/_layout.tsx
git commit -m "chore: wire nativewind babel plugin and import global css"
```

---

## Task 4: Create UI primitives

**Files:**
- Create: `components/ui/Card.tsx`
- Create: `components/ui/PrimaryButton.tsx`
- Create: `components/ui/PillBadge.tsx`
- Create: `components/ui/PillButton.tsx`
- Create: `components/ui/SectionTitle.tsx`
- Create: `components/ui/Heading.tsx`
- Create: `components/ui/BodyText.tsx`
- Create: `components/ui/MutedText.tsx`
- Create: `components/ui/AppTextInput.tsx`
- Create: `components/ui/EmptyState.tsx`
- Create: `components/ui/index.ts`

- [ ] **Step 1: Create `components/ui/Card.tsx`**

```tsx
import { View, type ViewProps } from 'react-native'
import { Shadow } from '@/constants/theme'

type Props = ViewProps & {
  row?: boolean
  shadow?: 'sm' | 'md' | 'lg'
}

export function Card({ row, shadow, className = '', style, children, ...props }: Props) {
  return (
    <View
      className={`bg-surface-dark rounded-lg border border-border ${row ? 'flex-row items-center' : ''} ${className}`}
      style={[shadow ? Shadow[shadow] : undefined, style]}
      {...props}
    >
      {children}
    </View>
  )
}
```

- [ ] **Step 2: Create `components/ui/PrimaryButton.tsx`**

```tsx
import { Text, TouchableOpacity, type TouchableOpacityProps } from 'react-native'
import { Shadow } from '@/constants/theme'

type Props = TouchableOpacityProps & {
  label?: string
}

export function PrimaryButton({ label, disabled, className = '', style, children, ...props }: Props) {
  return (
    <TouchableOpacity
      className={`bg-primary rounded-lg py-4 items-center ${disabled ? 'opacity-50' : ''} ${className}`}
      style={[Shadow.lg, style]}
      disabled={disabled}
      activeOpacity={0.85}
      {...props}
    >
      {children ?? (
        <Text className="text-white font-heading text-lg">{label}</Text>
      )}
    </TouchableOpacity>
  )
}
```

- [ ] **Step 3: Create `components/ui/PillBadge.tsx`**

```tsx
import { Text, View, type ViewProps } from 'react-native'

type Props = ViewProps & {
  label: string
}

export function PillBadge({ label, className = '', style, ...props }: Props) {
  return (
    <View
      className={`bg-accent rounded-full px-[10px] py-1 self-start ${className}`}
      style={style}
      {...props}
    >
      <Text className="text-xs font-heading text-white tracking-[1.5px]">
        {label}
      </Text>
    </View>
  )
}
```

- [ ] **Step 4: Create `components/ui/PillButton.tsx`**

```tsx
import { Text, TouchableOpacity, type TouchableOpacityProps } from 'react-native'

type Props = TouchableOpacityProps & {
  label: string
  outlined?: boolean
}

export function PillButton({ label, outlined, className = '', style, ...props }: Props) {
  return (
    <TouchableOpacity
      className={`rounded-full px-[14px] py-[6px] ${outlined ? 'bg-surface border border-primary' : 'bg-primary'} ${className}`}
      style={style}
      activeOpacity={0.85}
      {...props}
    >
      <Text className="text-white text-xs font-heading">{label}</Text>
    </TouchableOpacity>
  )
}
```

- [ ] **Step 5: Create `components/ui/SectionTitle.tsx`**

```tsx
import { Text, type TextProps } from 'react-native'

export function SectionTitle({ children, className = '', style, ...props }: TextProps & { className?: string }) {
  return (
    <Text className={`text-lg font-heading text-white ${className}`} style={style} {...props}>
      {children}
    </Text>
  )
}
```

- [ ] **Step 6: Create `components/ui/Heading.tsx`**

```tsx
import { Text, type TextProps } from 'react-native'

export function Heading({ children, className = '', style, ...props }: TextProps & { className?: string }) {
  return (
    <Text className={`font-heading text-white ${className}`} style={style} {...props}>
      {children}
    </Text>
  )
}
```

- [ ] **Step 7: Create `components/ui/BodyText.tsx`**

```tsx
import { Text, type TextProps } from 'react-native'

export function BodyText({ children, className = '', style, ...props }: TextProps & { className?: string }) {
  return (
    <Text className={`font-body text-secondary ${className}`} style={style} {...props}>
      {children}
    </Text>
  )
}
```

- [ ] **Step 8: Create `components/ui/MutedText.tsx`**

```tsx
import { Text, type TextProps } from 'react-native'

export function MutedText({ children, className = '', style, ...props }: TextProps & { className?: string }) {
  return (
    <Text className={`font-body text-muted ${className}`} style={style} {...props}>
      {children}
    </Text>
  )
}
```

- [ ] **Step 9: Create `components/ui/AppTextInput.tsx`**

```tsx
import { TextInput, type TextInputProps } from 'react-native'

export function AppTextInput({ className = '', style, ...props }: TextInputProps & { className?: string }) {
  return (
    <TextInput
      className={`bg-surface border border-border rounded-md px-[14px] py-[10px] text-md font-body text-white ${className}`}
      style={style}
      {...props}
    />
  )
}
```

- [ ] **Step 10: Create `components/ui/EmptyState.tsx`**

```tsx
import { Text, View } from 'react-native'

type Props = {
  emoji: string
  title: string
  hint?: string
  className?: string
}

export function EmptyState({ emoji, title, hint, className = '' }: Props) {
  return (
    <View className={`items-center pt-[60px] gap-2 ${className}`}>
      <Text style={{ fontSize: 48 }}>{emoji}</Text>
      <Text className="text-lg font-heading text-white">{title}</Text>
      {hint && (
        <Text className="text-sm font-body text-muted text-center px-5">{hint}</Text>
      )}
    </View>
  )
}
```

- [ ] **Step 11: Create `components/ui/index.ts`**

```ts
export { Card } from './Card'
export { PrimaryButton } from './PrimaryButton'
export { PillBadge } from './PillBadge'
export { PillButton } from './PillButton'
export { SectionTitle } from './SectionTitle'
export { Heading } from './Heading'
export { BodyText } from './BodyText'
export { MutedText } from './MutedText'
export { AppTextInput } from './AppTextInput'
export { EmptyState } from './EmptyState'
```

- [ ] **Step 12: Commit**

```bash
git add components/ui/
git commit -m "feat: add UI primitive components for NativeWind migration"
```

---

## Task 5: Migrate Background.tsx and AppLogo.tsx

**Files:**
- Modify: `components/Background.tsx`
- Modify: `components/AppLogo.tsx`

- [ ] **Step 1: Rewrite `components/Background.tsx`**

`StyleSheet.absoluteFill` is replaced with a plain object — no StyleSheet import needed.

```tsx
import { LinearGradient } from 'expo-linear-gradient'
import { BG_GRADIENT, BG_GRADIENT_END, BG_GRADIENT_START } from '@/constants/theme'

export default function Background() {
  return (
    <LinearGradient
      colors={BG_GRADIENT}
      start={BG_GRADIENT_START}
      end={BG_GRADIENT_END}
      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
    />
  )
}
```

- [ ] **Step 2: Rewrite `components/AppLogo.tsx`**

Dynamic sizes (`globeSize`, `textSize`, `overlap`, `rowWidth`) stay inline since they're computed from props.

```tsx
import { Text, View } from 'react-native'
import { Colors, Fonts } from '@/constants/theme'

type Props = {
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
}

export default function AppLogo({ size = 'md', showTagline = false }: Props) {
  const globeSize = size === 'sm' ? 32 : size === 'md' ? 50 : 70
  const textSize = size === 'sm' ? 16 : size === 'md' ? 24 : 34
  const overlap = Math.round(globeSize * 0.32)
  const rowWidth = globeSize * 3 - overlap * 2

  return (
    <View className="items-center gap-[14px]">
      <View
        style={{ width: rowWidth, height: globeSize }}
        className="relative items-center justify-center"
      >
        <View className="flex-row items-center absolute">
          <Text style={{ fontSize: globeSize, lineHeight: globeSize }}>🌍</Text>
          <Text style={{ fontSize: globeSize, lineHeight: globeSize, marginLeft: -overlap }}>🌍</Text>
          <Text style={{ fontSize: globeSize, lineHeight: globeSize, marginLeft: -overlap }}>🌍</Text>
        </View>
        <View className="absolute items-center justify-center">
          <Text
            style={{
              fontFamily: Fonts.heading,
              fontSize: textSize,
              color: '#FFFFFF',
              letterSpacing: 2,
              textShadowColor: 'rgba(0,0,0,0.95)',
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 6,
            }}
          >
            ACTAPP
          </Text>
        </View>
      </View>

      {showTagline && (
        <View className="bg-accent rounded-full px-[18px] py-2">
          <Text className="font-body text-white text-xs tracking-[1.5px]">
            ONE MISSION. EVERYONE. EVERY DAY.
          </Text>
        </View>
      )}
    </View>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/Background.tsx components/AppLogo.tsx
git commit -m "refactor: migrate Background and AppLogo to NativeWind"
```

---

## Task 6: Migrate SwipeToComplete.tsx

**Files:**
- Modify: `components/SwipeToComplete.tsx`

All animation styles (`translateX`, `fillWidth`, `trackOpacity`) remain inline. Only the static track/thumb shapes move to className.

- [ ] **Step 1: Rewrite `components/SwipeToComplete.tsx`**

```tsx
import * as Haptics from 'expo-haptics'
import { useRef, useState } from 'react'
import { Animated, Dimensions, PanResponder, Text, View } from 'react-native'
import { Colors, Fonts, Radius } from '@/constants/theme'

const TRACK_WIDTH = Dimensions.get('window').width - 40 - 48
const THUMB_SIZE = 56
const MAX_SLIDE = TRACK_WIDTH - THUMB_SIZE - 4
const THRESHOLD = MAX_SLIDE * 0.8

type Props = {
  onComplete: () => void
  disabled?: boolean
  color?: 'green' | 'blue'
}

export default function SwipeToComplete({ onComplete, disabled, color = 'green' }: Props) {
  const thumbColor = color === 'blue' ? Colors.kindGem : Colors.primary
  const translateX = useRef(new Animated.Value(0)).current
  const [completed, setCompleted] = useState(false)
  const hasTriggered = useRef(false)

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled && !hasTriggered.current,
      onMoveShouldSetPanResponder: () => !disabled && !hasTriggered.current,
      onPanResponderMove: (_, { dx }) => {
        const clamped = Math.max(0, Math.min(dx, MAX_SLIDE))
        translateX.setValue(clamped)
      },
      onPanResponderRelease: (_, { dx }) => {
        if (dx >= THRESHOLD && !hasTriggered.current) {
          hasTriggered.current = true
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          Animated.spring(translateX, { toValue: MAX_SLIDE, useNativeDriver: true, tension: 80 }).start(() => {
            setCompleted(true)
            onComplete()
          })
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 100 }).start()
        }
      },
    }),
  ).current

  const trackOpacity = translateX.interpolate({ inputRange: [0, MAX_SLIDE], outputRange: [1, 0], extrapolate: 'clamp' })
  const fillWidth = translateX.interpolate({ inputRange: [0, MAX_SLIDE], outputRange: [THUMB_SIZE + 4, TRACK_WIDTH], extrapolate: 'clamp' })

  if (completed) {
    return (
      <View
        className="items-center justify-center border border-primary bg-primary-light"
        style={{ width: TRACK_WIDTH, height: THUMB_SIZE + 8, borderRadius: Radius.full }}
      >
        <Text style={{ fontSize: 15, fontFamily: Fonts.heading, color: Colors.primary }}>
          ✅ Mission complete!
        </Text>
      </View>
    )
  }

  return (
    <View
      className="justify-center overflow-hidden relative border border-border bg-surface-alt"
      style={{ width: TRACK_WIDTH, height: THUMB_SIZE + 8, borderWidth: 1.5, borderRadius: Radius.full }}
    >
      <Animated.View
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: fillWidth,
          backgroundColor: thumbColor,
          borderRadius: Radius.full,
          opacity: 0.2,
        }}
      />
      <Animated.Text
        style={{
          opacity: trackOpacity,
          textAlign: 'center',
          fontSize: 14,
          fontFamily: Fonts.body,
          color: Colors.textSecondary,
          paddingLeft: THUMB_SIZE + 8,
        }}
      >
        Swipe to complete mission →
      </Animated.Text>
      <Animated.View
        style={{
          position: 'absolute',
          left: 4,
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          borderRadius: THUMB_SIZE / 2,
          backgroundColor: thumbColor,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: thumbColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 6,
          transform: [{ translateX }],
        }}
        {...panResponder.panHandlers}
      >
        <Text style={{ fontSize: 22, color: '#fff', fontWeight: '700' }}>→</Text>
      </Animated.View>
    </View>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/SwipeToComplete.tsx
git commit -m "refactor: migrate SwipeToComplete to NativeWind"
```

---

## Task 7: Migrate MissionsCard.tsx

**Files:**
- Modify: `components/MissionsCard.tsx`

Dynamic styles (difficulty colors, progress opacity, `accentColor + "60"`) remain inline. The three `StyleSheet.create` blocks at the bottom are deleted.

- [ ] **Step 1: Rewrite `components/MissionsCard.tsx`**

```tsx
import * as Haptics from 'expo-haptics'
import { useState } from 'react'
import { Alert, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { PrimaryButton, SectionTitle } from '@/components/ui'
import { Colors, Fonts, Radius, Shadow } from '@/constants/theme'
import { type Mission, useActionStore } from '@/store/actionStore'
import { useAuthStore } from '@/store/authStore'

const DIFFICULTY_COLOR = {
  easy: Colors.primary,
  medium: Colors.xpGold,
  hard: Colors.streakOrange,
}
const CATEGORY_EMOJI: Record<string, string> = {
  transport: '🚲', food: '🥗', energy: '💡', water: '🚿',
  waste: '♻️', nature: '🌿', community: '🤝',
}

function ProgressDots({ count, goal, color }: { count: number; goal: number; color: string }) {
  return (
    <View className="flex-row items-center flex-wrap gap-1">
      {Array.from({ length: goal }).map((_, i) => (
        <View
          key={i}
          style={{
            width: 8, height: 8, borderRadius: 4, borderWidth: 1,
            backgroundColor: i < count ? color : Colors.surface,
            borderColor: i < count ? color : Colors.border,
          }}
        />
      ))}
    </View>
  )
}

function MissionModal({ mission, onClose, onPledge, onLog, onClaim }: {
  mission: Mission; onClose: () => void; onPledge: () => void; onLog: () => void; onClaim: () => void
}) {
  const t = new Date().toISOString().split('T')[0]
  const alreadyLoggedToday = mission.last_logged_date === t
  const diffColor = DIFFICULTY_COLOR[mission.difficulty]
  const accentColor = mission.gem_reward > 0 ? Colors.kindGem : Colors.primary
  const daysLeft = Math.max(0, Math.ceil((new Date(mission.end_date).getTime() - Date.now()) / 86400000))
  const rewardText = mission.xp_reward > 0 ? `⭐ ${mission.xp_reward} XP` : `💎 ${mission.gem_reward}`
  const pct = mission.pledged ? mission.count / mission.goal_count : 0

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
        <View
          className="border-t border-border"
          style={{
            backgroundColor: '#101E11',
            borderTopLeftRadius: 28, borderTopRightRadius: 28,
            padding: 24, paddingBottom: 36, maxHeight: '88%',
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 8 }}>
            <View className="flex-row items-start justify-between">
              <View className="flex-row gap-[10px] flex-1">
                <Text style={{ fontSize: 44, opacity: mission.pledged ? 0.4 + 0.6 * pct : 0.3 }}>
                  {mission.badge_emoji}
                </Text>
                <View style={{ gap: 5, flex: 1 }}>
                  <View className="flex-row gap-[6px] flex-wrap">
                    <View
                      className="rounded-full px-2 py-[3px] border"
                      style={{
                        backgroundColor: mission.mission_type === 'monthly' ? Colors.accent + '22' : Colors.primary + '22',
                        borderColor: mission.mission_type === 'monthly' ? Colors.accent : Colors.primary,
                      }}
                    >
                      <Text style={{
                        fontSize: 9, fontFamily: Fonts.heading, letterSpacing: 0.5,
                        color: mission.mission_type === 'monthly' ? Colors.accent : Colors.primary,
                      }}>
                        {mission.mission_type.toUpperCase()}
                      </Text>
                    </View>
                    <View className="rounded-full px-2 py-[3px] border" style={{ borderColor: diffColor }}>
                      <Text style={{ fontSize: 9, fontFamily: Fonts.heading, letterSpacing: 0.5, color: diffColor }}>
                        {mission.difficulty.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text className="font-body text-muted text-xs">{daysLeft} days left · {rewardText}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} className="w-8 h-8 items-center justify-center">
                <Text style={{ color: Colors.textMuted, fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text className="font-heading text-white text-2xl" style={{ lineHeight: 30 }}>{mission.title}</Text>

            <View
              className="rounded-lg p-4 border-l-[3px]"
              style={{
                backgroundColor: mission.completed ? Colors.primaryLight : Colors.surface,
                borderLeftColor: mission.completed ? Colors.primary : Colors.border,
              }}
            >
              <Text className="font-body text-muted text-xs mb-[6px]">
                {mission.completed ? 'COMPLETED ✅' : 'YOUR PLEDGE'}
              </Text>
              <Text className="font-body text-white text-md" style={{ lineHeight: 22 }}>
                "{mission.completed ? mission.pledge_text_past : mission.pledge_text}"
              </Text>
            </View>

            {mission.pledged && (
              <View style={{ gap: 8 }}>
                <View className="flex-row justify-between">
                  <Text className="font-body text-muted text-xs">
                    {mission.completed ? 'Done!' : `${mission.count} of ${mission.goal_count} check-ins`}
                  </Text>
                  <Text className="font-body text-muted text-xs">{Math.round(pct * 100)}%</Text>
                </View>
                <ProgressDots count={mission.count} goal={mission.goal_count} color={accentColor} />
              </View>
            )}

            <Text className="font-body text-secondary text-md" style={{ lineHeight: 23 }}>{mission.description}</Text>

            <View className="flex-row items-center gap-3 bg-surface rounded-md p-[14px]">
              <Text style={{ fontSize: 22 }}>{CATEGORY_EMOJI[mission.category] ?? '🌍'}</Text>
              <View className="flex-1">
                <Text className="font-body text-muted text-xs">ESTIMATED IMPACT</Text>
                <Text className="font-heading text-primary text-md">{mission.impact_summary}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={{ paddingTop: 16, gap: 10 }}>
            {!mission.pledged && (
              <PrimaryButton onPress={onPledge} label="Take the Pledge 🤝" />
            )}
            {mission.pledged && !mission.completed && (
              <PrimaryButton onPress={onLog} disabled={alreadyLoggedToday}
                label={alreadyLoggedToday ? '✅ Logged for today' : 'Did it today ✓'}
              />
            )}
            {mission.completed && !mission.claimed && (
              <TouchableOpacity
                className="rounded-lg py-4 items-center bg-xp-gold"
                style={Shadow.lg}
                onPress={onClaim}
                activeOpacity={0.85}
              >
                <Text className="text-black font-heading text-lg">Claim Reward {rewardText} 🎉</Text>
              </TouchableOpacity>
            )}
            {mission.claimed && (
              <View className="bg-primary-light rounded-md p-[14px] items-center border border-primary">
                <Text className="font-heading text-primary text-md">✅ Reward Claimed!</Text>
              </View>
            )}
            <TouchableOpacity onPress={onClose} className="py-2">
              <Text className="font-body text-muted text-center">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

function MissionTile({ mission, onPress }: { mission: Mission; onPress: () => void }) {
  const diffColor = DIFFICULTY_COLOR[mission.difficulty]
  const accentColor = mission.gem_reward > 0 ? Colors.kindGem : Colors.primary
  const pct = mission.pledged ? mission.count / mission.goal_count : 0
  const daysLeft = Math.max(0, Math.ceil((new Date(mission.end_date).getTime() - Date.now()) / 86400000))
  const t = new Date().toISOString().split('T')[0]
  const loggedToday = mission.last_logged_date === t
  const emojiOpacity = mission.completed ? 1 : mission.pledged ? 0.25 + 0.75 * pct : 0.25

  let statusEl = null
  if (mission.claimed) statusEl = <Text style={{ fontSize: 10, fontFamily: Fonts.body, color: Colors.textMuted }}>✅ done</Text>
  else if (mission.completed) statusEl = <Text style={{ fontSize: 10, fontFamily: Fonts.body, color: Colors.xpGold }}>🎁 claim!</Text>
  else if (loggedToday) statusEl = <Text style={{ fontSize: 10, fontFamily: Fonts.body, color: Colors.primary }}>✓ logged today</Text>
  else if (mission.pledged) statusEl = <Text style={{ fontSize: 10, fontFamily: Fonts.body, color: Colors.textMuted }}>in progress</Text>
  else statusEl = <Text style={{ fontSize: 10, fontFamily: Fonts.body, color: Colors.textMuted }}>tap to pledge</Text>

  return (
    <TouchableOpacity
      style={[
        {
          width: 148,
          backgroundColor: Colors.surfaceDark,
          borderRadius: Radius.xl,
          padding: 14,
          borderWidth: mission.pledged && !mission.completed ? 1.5 : mission.completed && !mission.claimed ? 1.5 : 1,
          borderColor: mission.pledged && !mission.completed
            ? accentColor + '60'
            : mission.completed && !mission.claimed
              ? Colors.xpGold
              : Colors.border,
          opacity: mission.claimed ? 0.6 : 1,
        },
        Shadow.sm,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={{ fontSize: 34, opacity: emojiOpacity, marginBottom: 6 }}>{mission.badge_emoji}</Text>
      <Text className="font-heading text-white text-sm" style={{ lineHeight: 17 }} numberOfLines={2}>{mission.title}</Text>
      <Text className="font-body text-muted text-xs" style={{ marginTop: 3 }}>{daysLeft}d left</Text>

      {mission.pledged && (
        <View style={{ marginTop: 8 }}>
          <ProgressDots count={mission.count} goal={mission.goal_count} color={accentColor} />
        </View>
      )}

      <View className="self-start rounded-full px-[7px] py-[2px] border" style={{ borderColor: diffColor, marginTop: 8 }}>
        <Text style={{ fontSize: 9, fontFamily: Fonts.heading, letterSpacing: 0.3, color: diffColor }}>
          {mission.difficulty}
        </Text>
      </View>

      <View style={{ marginTop: 6 }}>{statusEl}</View>
    </TouchableOpacity>
  )
}

export default function MissionsCard() {
  const { missions, pledgeMission, logMissionDay, claimMissionReward } = useActionStore()
  const { session } = useAuthStore()
  const [selected, setSelected] = useState<Mission | null>(null)

  if (!missions.length) return null
  const userId = session?.user?.id
  const syncSelected = (id: string) => setSelected(missions.find((m) => m.id === id) ?? null)

  const handlePledge = async () => {
    if (!userId || !selected) return
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    await pledgeMission(userId, selected.id)
    syncSelected(selected.id)
  }
  const handleLog = async () => {
    if (!userId || !selected) return
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    await logMissionDay(userId, selected.id)
    syncSelected(selected.id)
  }
  const handleClaim = async () => {
    if (!userId || !selected) return
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    const { xpEarned, gemsEarned } = await claimMissionReward(userId, selected.id)
    syncSelected(selected.id)
    const reward = xpEarned > 0 ? `+${xpEarned} XP ⭐` : `+${gemsEarned} 💎`
    Alert.alert('Reward Claimed! 🎉', `You earned ${reward} for completing this mission.`)
  }

  const weekly = missions.filter((m) => m.mission_type === 'weekly')
  const monthly = missions.filter((m) => m.mission_type === 'monthly')

  return (
    <View className="px-5 pt-5 gap-3">
      {weekly.length > 0 && (
        <>
          <View className="flex-row items-center justify-between">
            <SectionTitle>📅 Weekly Missions</SectionTitle>
            <Text className="font-body text-muted text-xs">Check in each day you do it</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
            {weekly.map((m) => <MissionTile key={m.id} mission={m} onPress={() => setSelected(m)} />)}
          </ScrollView>
        </>
      )}

      {monthly.length > 0 && (
        <>
          <View className="flex-row items-center justify-between" style={{ marginTop: weekly.length > 0 ? 8 : 0 }}>
            <SectionTitle>🏆 Monthly Missions</SectionTitle>
            <Text className="font-body text-muted text-xs">Log each time you do it</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
            {monthly.map((m) => <MissionTile key={m.id} mission={m} onPress={() => setSelected(m)} />)}
          </ScrollView>
        </>
      )}

      {selected && (
        <MissionModal
          mission={selected}
          onClose={() => setSelected(null)}
          onPledge={handlePledge}
          onLog={handleLog}
          onClaim={handleClaim}
        />
      )}
    </View>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/MissionsCard.tsx
git commit -m "refactor: migrate MissionsCard to NativeWind"
```

---

## Task 8: Migrate app/(tabs)/_layout.tsx

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

The `tabBarStyle` object is passed as a prop to `<Tabs>` — it must stay as a plain JS object (not className). `StyleSheet.absoluteFill` is replaced inline.

- [ ] **Step 1: Rewrite `app/(tabs)/_layout.tsx`**

```tsx
import { LinearGradient } from 'expo-linear-gradient'
import { Tabs } from 'expo-router'
import { Text, View } from 'react-native'
import { Colors, Fonts } from '@/constants/theme'

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View className="items-center gap-[3px] w-[72px]">
      <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.38 }}>{emoji}</Text>
      <Text
        style={{
          fontFamily: focused ? Fonts.heading : Fonts.body,
          fontSize: focused ? 10 : 11,
          color: focused ? Colors.primary : Colors.textMuted,
          textAlign: 'center',
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  )
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: 82,
          paddingBottom: 14,
          paddingTop: 8,
          backgroundColor: 'transparent',
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(13,32,24,0.97)']}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          />
        ),
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🌱" label="Today" focused={focused} /> }} />
      <Tabs.Screen name="impact-bank" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏦" label="Impact" focused={focused} /> }} />
      <Tabs.Screen name="friends" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👥" label="Friends" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏆" label="Profile" focused={focused} /> }} />
    </Tabs>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/_layout.tsx"
git commit -m "refactor: migrate tabs layout to NativeWind"
```

---

## Task 9: Migrate app/(auth)/phone.tsx

**Files:**
- Modify: `app/(auth)/phone.tsx`

- [ ] **Step 1: Rewrite `app/(auth)/phone.tsx`**

```tsx
import { router } from 'expo-router'
import { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import AppLogo from '@/components/AppLogo'
import Background from '@/components/Background'
import { AppTextInput, PrimaryButton } from '@/components/ui'
import { Colors, Shadow } from '@/constants/theme'
import { supabase } from '@/lib/supabase'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail.includes('@')) { Alert.alert('Invalid email', 'Please enter a valid email address.'); return }
    if (password.length < 6) { Alert.alert('Password too short', 'Password must be at least 6 characters.'); return }
    setLoading(true)
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email: trimmedEmail, password })
      if (error) {
        if (error.message.includes('already registered')) { Alert.alert('Already registered', 'You already have an account. Try signing in instead.'); setIsSignUp(false) }
        else Alert.alert('Sign up failed', error.message)
      } else if (data.session === null) {
        Alert.alert('Check your email', 'Confirm your email then sign in.\n\nTip: disable "Enable email confirmations" in Supabase → Auth → Settings for dev.')
      } else { router.replace('/') }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password })
      if (error) {
        if (error.message.includes('Email not confirmed')) Alert.alert('Email not confirmed', 'Disable "Enable email confirmations" in Supabase → Auth → Settings.')
        else Alert.alert('Sign in failed', error.message)
      } else { router.replace('/') }
    }
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Background />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center', gap: 32, paddingVertical: 60 }} keyboardShouldPersistTaps="handled">
        <View className="items-center">
          <AppLogo size="lg" showTagline />
        </View>

        <View
          className="rounded-[28px] border border-border gap-5 p-6"
          style={[{ backgroundColor: Colors.surfaceDark }, Shadow.md]}
        >
          <Text className="font-heading text-white text-2xl tracking-[1px]">
            {isSignUp ? 'Create account' : 'Welcome back'}
          </Text>

          <View style={{ gap: 14 }}>
            <View style={{ gap: 6 }}>
              <Text className="font-body text-secondary text-sm tracking-[0.5px]">Email</Text>
              <AppTextInput
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
            <View style={{ gap: 6 }}>
              <Text className="font-body text-secondary text-sm tracking-[0.5px]">Password</Text>
              <AppTextInput
                value={password}
                onChangeText={setPassword}
                placeholder="At least 6 characters"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
              />
            </View>
          </View>

          <PrimaryButton
            onPress={handleAuth}
            disabled={loading}
            label={loading ? 'Loading…' : isSignUp ? 'Create account →' : 'Sign in →'}
            className="tracking-[1px]"
          />

          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} className="items-center">
            <Text className="font-body text-muted text-sm">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <Text className="text-primary font-heading">
                {isSignUp ? 'Sign in' : 'Sign up'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(auth)/phone.tsx"
git commit -m "refactor: migrate phone auth screen to NativeWind"
```

---

## Task 10: Migrate app/(auth)/verify.tsx

**Files:**
- Modify: `app/(auth)/verify.tsx`

- [ ] **Step 1: Rewrite `app/(auth)/verify.tsx`**

```tsx
import { router, useLocalSearchParams } from 'expo-router'
import { useRef, useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { PrimaryButton } from '@/components/ui'
import { Colors, Fonts, Radius, Shadow } from '@/constants/theme'
import { supabase } from '@/lib/supabase'

export default function VerifyScreen() {
  const { email } = useLocalSearchParams<{ email: string }>()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<TextInput>(null)

  const handleVerify = async () => {
    if (code.length !== 6) { Alert.alert('Invalid code', 'Please enter the 6-digit code.'); return }
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' })
    setLoading(false)
    if (error) { Alert.alert('Wrong code', "That code didn't work. Try again."); setCode('') }
  }

  const handleResend = async () => {
    await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
    Alert.alert('Code resent!', `We sent a new code to ${email}`)
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-1 justify-center gap-6 px-7">
        <TouchableOpacity className="absolute top-[60px] left-7" onPress={() => router.back()}>
          <Text className="text-primary text-md" style={{ fontWeight: '600' }}>← Back</Text>
        </TouchableOpacity>

        <View className="items-center gap-[10px]">
          <Text style={{ fontSize: 56, marginBottom: 4 }}>📧</Text>
          <Text className="text-white text-3xl text-center" style={{ fontWeight: '800' }}>Check your email</Text>
          <Text className="text-secondary text-md text-center" style={{ lineHeight: 22 }}>
            We sent a 6-digit code to{'\n'}
            <Text style={{ fontWeight: '700', color: Colors.text }}>{email}</Text>
          </Text>
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={() => inputRef.current?.focus()}>
          <View className="flex-row justify-center gap-[10px]">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <View
                key={i}
                className="items-center justify-center"
                style={[
                  {
                    width: 48, height: 58,
                    borderRadius: Radius.md,
                    backgroundColor: Colors.surface,
                    borderWidth: code.length === i ? 2 : 1.5,
                    borderColor: code.length === i ? Colors.primary : Colors.border,
                  },
                  Shadow.sm,
                ]}
              >
                <Text style={{ fontSize: 26, fontWeight: '700', color: Colors.text }}>{code[i] ?? ''}</Text>
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
          style={{ position: 'absolute', opacity: 0, height: 0, width: 0 }}
          autoFocus
        />

        <PrimaryButton
          onPress={handleVerify}
          disabled={loading || code.length !== 6}
          label={loading ? 'Verifying…' : 'Verify →'}
        />

        <TouchableOpacity onPress={handleResend} className="items-center">
          <Text className="text-primary text-sm" style={{ fontWeight: '600' }}>Didn't get it? Resend code</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(auth)/verify.tsx"
git commit -m "refactor: migrate verify screen to NativeWind"
```

---

## Task 11: Migrate app/onboarding.tsx

**Files:**
- Modify: `app/onboarding.tsx`

- [ ] **Step 1: Rewrite `app/onboarding.tsx`**

```tsx
import { router } from 'expo-router'
import { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { AppTextInput, PrimaryButton } from '@/components/ui'
import { Colors, Shadow } from '@/constants/theme'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

const AVATARS = ['🌱','🌿','🌲','🌍','⚡','🚲','🐝','🦋','🌊','☀️','🍃','♻️']

export default function OnboardingScreen() {
  const { fetchProfile } = useAuthStore()
  const [username, setUsername] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0])
  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    const trimmed = username.trim()
    if (trimmed.length < 2) { Alert.alert('Pick a username', 'Must be at least 2 characters.'); return }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) { Alert.alert('Invalid username', 'Only letters, numbers, and underscores.'); return }
    setLoading(true)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) { Alert.alert('Session expired', 'Please sign in again.'); router.replace('/(auth)/phone'); return }
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const { data: existing } = await supabase.from('profiles').select('id').eq('username', trimmed).neq('id', user.id).maybeSingle()
      if (existing) { Alert.alert('Taken!', 'That username is already in use. Try another.'); return }
      const { error } = await supabase.from('profiles').upsert({ id: user.id, username: trimmed, avatar_url: selectedAvatar, avatar_emoji: selectedAvatar, xp: 0, level: 1, timezone })
      if (error) { Alert.alert('Error', error.message); return }
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
      className="flex-1"
      style={{ backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 28, gap: 24, paddingTop: 80, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View className="items-center gap-2">
          <Text style={{ fontSize: 72, marginBottom: 4 }}>{selectedAvatar}</Text>
          <Text className="text-white text-2xl" style={{ fontWeight: '800' }}>Set up your profile</Text>
          <Text className="text-secondary text-md">Choose your avatar and pick a username</Text>
        </View>

        <View className="flex-row flex-wrap gap-[10px] justify-center">
          {AVATARS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              className="w-14 h-14 items-center justify-center rounded-md border"
              style={{
                backgroundColor: selectedAvatar === emoji ? Colors.surfaceAlt : Colors.surface,
                borderWidth: selectedAvatar === emoji ? 2.5 : 1.5,
                borderColor: selectedAvatar === emoji ? Colors.primary : Colors.border,
              }}
              onPress={() => setSelectedAvatar(emoji)}
              activeOpacity={0.75}
            >
              <Text style={{ fontSize: 28 }}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ gap: 6 }}>
          <Text className="text-secondary text-sm" style={{ fontWeight: '600' }}>Username</Text>
          <View
            className="flex-row items-center rounded-md border"
            style={[{ backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 14 }, Shadow.sm]}
          >
            <Text className="text-secondary text-lg" style={{ marginRight: 4 }}>@</Text>
            <AppTextInput
              className="flex-1 py-[14px] bg-transparent border-0"
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

        <PrimaryButton
          onPress={handleContinue}
          disabled={loading || username.trim().length < 2}
          label={loading ? 'Setting up…' : "Let's go 🌍"}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/onboarding.tsx
git commit -m "refactor: migrate onboarding screen to NativeWind"
```

---

## Task 12: Migrate app/(tabs)/index.tsx

**Files:**
- Modify: `app/(tabs)/index.tsx`

Dynamic styles (animation values `xpOpacity`, `xpY`, `gemOpacity`, `gemY`, color strings with hex suffixes) remain inline.

- [ ] **Step 1: Rewrite `app/(tabs)/index.tsx`**

```tsx
import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Animated, ScrollView, Text, View } from 'react-native'
import AppLogo from '@/components/AppLogo'
import Background from '@/components/Background'
import SwipeToComplete from '@/components/SwipeToComplete'
import { BodyText, EmptyState, Heading, MutedText, PillBadge, SectionTitle } from '@/components/ui'
import { Colors, Fonts, LEVEL_NAMES, Radius, Shadow } from '@/constants/theme'
import { useActionStore } from '@/store/actionStore'
import { useAuthStore } from '@/store/authStore'

const CATEGORY_EMOJI: Record<string, string> = {
  energy: '⚡', transport: '🚲', food: '🥗', social: '💚',
  waste: '♻️', water: '💧', nature: '🌿', community: '🤝',
}

export default function TodayScreen() {
  const { session, profile } = useAuthStore()
  const { todaysAction, todaysCommunityAction, streak, hasCompletedToday, hasCompletedCommunityToday, loading, fetchTodaysAction, fetchStreak, completeAction, completeCommunityAction } = useActionStore()
  const [completing, setCompleting] = useState(false)
  const [completingComm, setCompletingComm] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)
  const [justCompletedComm, setJustCompletedComm] = useState(false)
  const xpOpacity = useRef(new Animated.Value(0)).current
  const xpY = useRef(new Animated.Value(0)).current
  const gemOpacity = useRef(new Animated.Value(0)).current
  const gemY = useRef(new Animated.Value(0)).current

  useEffect(() => {
    fetchTodaysAction()
    if (session?.user?.id) fetchStreak(session.user.id)
  }, [session])

  const popAnimation = (opacity: Animated.Value, y: Animated.Value) => {
    opacity.setValue(0); y.setValue(0)
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(y, { toValue: -40, duration: 800, useNativeDriver: true }),
    ]).start(() => Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }).start())
  }

  const handleComplete = async () => {
    if (!session?.user?.id || !todaysAction || hasCompletedToday || completing) return
    setCompleting(true)
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    await completeAction(session.user.id, todaysAction.id)
    setJustCompleted(true)
    popAnimation(xpOpacity, xpY)
    setCompleting(false)
    setTimeout(() => router.push('/impact-report'), 1500)
  }

  const handleCompleteComm = async () => {
    if (!session?.user?.id || !todaysCommunityAction || hasCompletedCommunityToday || completingComm) return
    setCompletingComm(true)
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    await completeCommunityAction(session.user.id, todaysCommunityAction.id)
    setJustCompletedComm(true)
    popAnimation(gemOpacity, gemY)
    setCompletingComm(false)
  }

  const levelName = LEVEL_NAMES[Math.min((profile?.level ?? 1) - 1, LEVEL_NAMES.length - 1)]
  const isCarbon = hasCompletedToday || justCompleted
  const isCommunity = hasCompletedCommunityToday || justCompletedComm

  return (
    <View className="flex-1">
      <Background />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24, gap: 14 }}>
          <View className="flex-row items-center justify-between">
            <AppLogo size="sm" />
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <View
                className="rounded-full px-3 py-[5px] border"
                style={{ backgroundColor: Colors.xpGold + '20', borderColor: Colors.xpGold + '40' }}
              >
                <Text style={{ fontSize: 13, fontFamily: Fonts.heading, color: Colors.xpGold }}>
                  ⭐ {profile?.xp ?? 0} XP
                </Text>
              </View>
              <View
                className="rounded-full px-3 py-[5px] border"
                style={{ backgroundColor: Colors.kindGemLight, borderColor: Colors.kindGem + '40' }}
              >
                <Text style={{ fontSize: 13, fontFamily: Fonts.heading, color: Colors.kindGem }}>
                  💎 {profile?.kind_gems ?? 0}
                </Text>
              </View>
            </View>
          </View>

          <PillBadge label="MISSION: ACT" />
          <Heading className="text-lg">Agent {profile?.avatar_url} {profile?.username ?? ''}</Heading>
          <MutedText className="text-xs">Rank: {levelName} · Lv.{profile?.level}</MutedText>

          <View className="flex-row items-center gap-3">
            <View
              className="flex-row items-center gap-[6px] rounded-full px-[14px] py-2"
              style={{ backgroundColor: Colors.streakOrange + '28' }}
            >
              <Text style={{ fontSize: 18 }}>🔥</Text>
              <Text style={{ fontSize: 20, fontFamily: Fonts.heading, color: Colors.streakOrange }}>
                {streak?.current_streak ?? 0}
              </Text>
              <BodyText className="text-sm" style={{ color: Colors.streakOrange }}>day streak</BodyText>
            </View>
            <MutedText className="text-sm">Best: {streak?.longest_streak ?? 0}</MutedText>
          </View>
        </View>

        {/* Daily Mission */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 12 }}>
          <SectionTitle>🌍 Daily Mission</SectionTitle>
          {loading ? (
            <View className="rounded-xl bg-surface" style={{ height: 260, borderRadius: Radius.xl }} />
          ) : todaysAction ? (
            <View
              style={[
                { backgroundColor: Colors.surfaceDark, borderRadius: Radius.xl, padding: 22, gap: 12, borderWidth: isCarbon ? 1.5 : 1, borderColor: isCarbon ? Colors.primary : Colors.border },
                Shadow.md,
              ]}
            >
              <View className="flex-row items-center justify-between">
                <Text style={{ fontSize: 40 }}>{CATEGORY_EMOJI[todaysAction.category] ?? '🌍'}</Text>
                <View className="rounded-full px-3 py-1" style={{ backgroundColor: Colors.primaryLight }}>
                  <Text style={{ fontSize: 11, fontFamily: Fonts.heading, color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {todaysAction.category}
                  </Text>
                </View>
              </View>
              <Heading className="text-2xl" style={{ lineHeight: 30 }}>{todaysAction.title}</Heading>
              <BodyText className="text-md" style={{ lineHeight: 22 }}>{todaysAction.description}</BodyText>
              <View className="flex-row justify-between bg-surface rounded-md p-3">
                <MutedText className="text-sm">Impact per person</MutedText>
                <Heading className="text-sm text-primary">
                  {todaysAction.co2_equivalent > 0 ? `~${todaysAction.co2_equivalent}kg CO₂` : todaysAction.impact_unit}
                </Heading>
              </View>
              <View className="items-center" style={{ marginTop: 4 }}>
                <SwipeToComplete onComplete={handleComplete} disabled={isCarbon || completing} />
                {xpOpacity && (
                  <Animated.Text
                    style={{
                      position: 'absolute', fontSize: 20, fontFamily: Fonts.heading,
                      opacity: xpOpacity, transform: [{ translateY: xpY }], color: Colors.xpGold,
                    }}
                  >
                    +XP ⭐
                  </Animated.Text>
                )}
              </View>
            </View>
          ) : (
            <EmptyState emoji="☀️" title="" hint="No mission briefing yet — check back soon, Agent." />
          )}
        </View>

        {/* Community Op */}
        {(todaysCommunityAction || loading) && (
          <View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 12 }}>
            <SectionTitle>💎 Community Op</SectionTitle>
            {loading ? (
              <View className="rounded-xl bg-surface" style={{ height: 180, borderRadius: Radius.xl }} />
            ) : (
              <View
                style={[
                  { backgroundColor: 'rgba(30,50,80,0.7)', borderRadius: Radius.xl, padding: 22, gap: 12, borderWidth: isCommunity ? 1.5 : 1, borderColor: isCommunity ? Colors.kindGem : Colors.kindGem + '40' },
                  Shadow.md,
                ]}
              >
                <View className="flex-row items-center justify-between">
                  <Text style={{ fontSize: 40 }}>🤝</Text>
                  <View className="rounded-full px-3 py-1 border" style={{ backgroundColor: Colors.kindGemLight, borderColor: Colors.kindGem + '50' }}>
                    <Text style={{ fontSize: 13, fontFamily: Fonts.heading, color: Colors.kindGem }}>
                      +{todaysCommunityAction!.gem_reward} 💎
                    </Text>
                  </View>
                </View>
                <Heading className="text-xl" style={{ lineHeight: 26 }}>{todaysCommunityAction!.title}</Heading>
                <BodyText className="text-md" style={{ lineHeight: 22 }}>{todaysCommunityAction!.description}</BodyText>
                <View className="items-center" style={{ marginTop: 4 }}>
                  <SwipeToComplete onComplete={handleCompleteComm} disabled={isCommunity || completingComm} color="blue" />
                  {gemOpacity && (
                    <Animated.Text
                      style={{
                        position: 'absolute', fontSize: 20, fontFamily: Fonts.heading,
                        opacity: gemOpacity, transform: [{ translateY: gemY }], color: Colors.kindGem,
                      }}
                    >
                      +{todaysCommunityAction!.gem_reward} 💎
                    </Animated.Text>
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Tip */}
        <View
          className="flex-row gap-3 items-start rounded-lg p-4 border m-5 mt-3"
          style={{ backgroundColor: Colors.accentLight, borderColor: Colors.accent + '30' }}
        >
          <Text style={{ fontSize: 22, marginTop: 1 }}>💡</Text>
          <BodyText className="flex-1 text-sm" style={{ lineHeight: 20 }}>
            Every mission you complete is multiplied by every agent doing the same. You're never operating alone.
          </BodyText>
        </View>
      </ScrollView>
    </View>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/index.tsx"
git commit -m "refactor: migrate today screen to NativeWind"
```

---

## Task 13: Migrate app/(tabs)/impact-bank.tsx

**Files:**
- Modify: `app/(tabs)/impact-bank.tsx`

Dynamic bar heights (`height: \`${...}%\``) remain inline.

- [ ] **Step 1: Rewrite `app/(tabs)/impact-bank.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import Background from '@/components/Background'
import MissionsCard from '@/components/MissionsCard'
import { EmptyState, Heading, MutedText, PillBadge, SectionTitle } from '@/components/ui'
import { Colors, Fonts, Radius, Shadow } from '@/constants/theme'
import { supabase } from '@/lib/supabase'
import { useActionStore } from '@/store/actionStore'
import { useAuthStore } from '@/store/authStore'

type WeekRow = { week: string; co2: number; count: number }
type CategoryRow = { category: string; count: number; co2: number }

const CATEGORY_EMOJI: Record<string, string> = {
  energy: '⚡', transport: '🚲', food: '🥗', social: '💚',
  waste: '♻️', water: '💧', nature: '🌿', community: '🤝',
}

const CO2_EQUIV = (kg: number) => [
  { emoji: '🌳', value: Math.max(0, +(kg / 21).toFixed(1)), label: 'trees\nabsorbing CO₂' },
  { emoji: '🚗', value: Math.max(0, Math.round(kg / 0.12)), label: 'km not\ndriven by car' },
  { emoji: '🏠', value: Math.max(0, +(kg / 8.5).toFixed(1)), label: 'homes\npowered a day' },
  { emoji: '📱', value: Math.max(0, Math.round(kg * 200)), label: 'phones\nfully charged' },
]

export default function ImpactBankScreen() {
  const { session } = useAuthStore()
  const { missions, fetchMissions } = useActionStore()
  const [totalCO2, setTotalCO2] = useState(0)
  const [totalActions, setTotalActions] = useState(0)
  const [weeks, setWeeks] = useState<WeekRow[]>([])
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) return
    fetchMissions(session.user.id)
    fetchImpact(session.user.id)
  }, [session])

  const fetchImpact = async (userId: string) => {
    setLoading(true)
    const { data: completionRows } = await supabase.from('completions').select('action_id, created_at').eq('user_id', userId).order('created_at', { ascending: false })
    if (!completionRows?.length) { setLoading(false); return }
    const actionIds = [...new Set(completionRows.map((c) => c.action_id))]
    const { data: actionRows } = await supabase.from('actions').select('id, co2_equivalent, category, action_type').in('id', actionIds)
    const actionMap: Record<string, { co2_equivalent: number; category: string; action_type: string }> = {}
    actionRows?.forEach((a) => { actionMap[a.id] = a })
    const completions = completionRows.map((c) => ({ ...c, action: actionMap[c.action_id] ?? null }))
    setTotalActions(completions.length)
    const carbon = completions.filter((c) => c.action?.action_type === 'carbon')
    const co2 = carbon.reduce((sum, c) => sum + (c.action?.co2_equivalent ?? 0), 0)
    setTotalCO2(Math.round(co2 * 10) / 10)
    const weekMap: Record<string, WeekRow> = {}
    carbon.forEach((c) => {
      const d = new Date(c.created_at); const mon = new Date(d); mon.setDate(d.getDate() - ((d.getDay() + 6) % 7))
      const key = mon.toISOString().split('T')[0]; const label = `${mon.getDate()}/${mon.getMonth() + 1}`
      if (!weekMap[key]) weekMap[key] = { week: label, co2: 0, count: 0 }
      weekMap[key].co2 += c.action?.co2_equivalent ?? 0; weekMap[key].count += 1
    })
    setWeeks(Object.entries(weekMap).sort((a, b) => a[0].localeCompare(b[0])).slice(-8).map(([, v]) => ({ ...v, co2: Math.round(v.co2 * 10) / 10 })))
    const catMap: Record<string, CategoryRow> = {}
    completions.forEach((c) => {
      const cat = c.action?.category ?? 'other'
      if (!catMap[cat]) catMap[cat] = { category: cat, count: 0, co2: 0 }
      catMap[cat].count += 1; catMap[cat].co2 += c.action?.co2_equivalent ?? 0
    })
    setCategories(Object.values(catMap).sort((a, b) => b.count - a.count))
    setLoading(false)
  }

  const equivalents = CO2_EQUIV(totalCO2)
  const maxWeekCO2 = Math.max(...weeks.map((w) => w.co2), 0.1)
  const maxCatCount = Math.max(...categories.map((c) => c.count), 1)

  return (
    <View className="flex-1">
      <Background />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, gap: 8 }}>
          <PillBadge label="IMPACT BANK" />
          <Heading className="text-3xl">Field Record</Heading>
          <MutedText className="text-sm">Your mission history. Every deployment counted.</MutedText>
        </View>

        <View
          className="mx-5 items-center gap-[6px] border rounded-xl p-7"
          style={[{ backgroundColor: Colors.surfaceDark, borderColor: Colors.primary + '40' }, Shadow.md]}
        >
          <MutedText className="text-sm">TOTAL CO₂ SAVED</MutedText>
          <Text style={{ fontSize: 64, fontFamily: Fonts.heading, color: Colors.primary, letterSpacing: -2 }}>
            {loading ? '…' : `${totalCO2}kg`}
          </Text>
          <MutedText className="text-sm">{totalActions} missions completed</MutedText>
        </View>

        {totalCO2 > 0 && (
          <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 12 }}>
            <SectionTitle>That's the same as…</SectionTitle>
            <View className="flex-row flex-wrap gap-2">
              {equivalents.map((eq, i) => (
                <View key={i} className="border border-border rounded-lg p-[14px] items-center gap-1" style={{ width: '47.5%', backgroundColor: Colors.surfaceDark }}>
                  <Text style={{ fontSize: 26 }}>{eq.emoji}</Text>
                  <Text style={{ fontSize: 20, fontFamily: Fonts.heading, color: Colors.text }}>{eq.value.toLocaleString()}</Text>
                  <Text style={{ fontSize: 10, fontFamily: Fonts.body, color: Colors.textMuted, textAlign: 'center', lineHeight: 14 }}>{eq.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {weeks.length > 0 && (
          <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 12 }}>
            <SectionTitle>Week by week</SectionTitle>
            <View className="flex-row items-end gap-[6px]" style={{ height: 120 }}>
              {weeks.map((w, i) => (
                <View key={i} className="flex-1 items-center gap-1 justify-end" style={{ height: '100%' }}>
                  <Text style={{ fontSize: 8, fontFamily: Fonts.heading, color: Colors.textMuted }}>{w.co2 > 0 ? `${w.co2}` : ''}</Text>
                  <View className="w-full overflow-hidden justify-end" style={{ backgroundColor: Colors.surface, borderRadius: 4, height: 80 }}>
                    <View style={{ width: '100%', height: `${Math.max(4, (w.co2 / maxWeekCO2) * 100)}%`, backgroundColor: Colors.primary, borderRadius: 4, opacity: 0.85 }} />
                  </View>
                  <Text style={{ fontSize: 9, fontFamily: Fonts.body, color: Colors.textMuted, textAlign: 'center' }}>{w.week}</Text>
                </View>
              ))}
            </View>
            <MutedText className="text-[10px] text-right mt-1">kg CO₂ per week</MutedText>
          </View>
        )}

        {categories.length > 0 && (
          <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 12 }}>
            <SectionTitle>By category</SectionTitle>
            <View style={{ gap: 10 }}>
              {categories.map((c) => (
                <View key={c.category} className="flex-row items-center gap-2">
                  <Text style={{ fontSize: 22, width: 30 }}>{CATEGORY_EMOJI[c.category] ?? '🌍'}</Text>
                  <Text className="font-body text-secondary text-sm capitalize" style={{ width: 80 }}>{c.category}</Text>
                  <View className="flex-1 overflow-hidden" style={{ height: 8, backgroundColor: Colors.surface, borderRadius: 4 }}>
                    <View style={{ height: '100%', width: `${(c.count / maxCatCount) * 100}%`, backgroundColor: Colors.primary, borderRadius: 4 }} />
                  </View>
                  <MutedText className="text-xs text-right" style={{ width: 28 }}>{c.count}</MutedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {!loading && totalActions === 0 && (
          <EmptyState emoji="🌱" title="No missions logged yet" hint="Complete your first daily mission to start building your field record." />
        )}

        <MissionsCard />
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/impact-bank.tsx"
git commit -m "refactor: migrate impact bank screen to NativeWind"
```

---

## Task 14: Migrate app/(tabs)/friends.tsx

**Files:**
- Modify: `app/(tabs)/friends.tsx`

- [ ] **Step 1: Rewrite `app/(tabs)/friends.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import Background from '@/components/Background'
import { AppTextInput, Card, EmptyState, Heading, MutedText, PillButton } from '@/components/ui'
import { Colors, Fonts, Radius } from '@/constants/theme'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

type LeaderboardUser = { id: string; username: string; avatar_url: string; xp: number; level: number; current_streak: number; country: string | null }
type Tab = 'friends' | 'global'

export default function FriendsScreen() {
  const { session } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>('friends')
  const [friendLeaderboard, setFriendLB] = useState<LeaderboardUser[]>([])
  const [globalLeaderboard, setGlobalLB] = useState<LeaderboardUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<LeaderboardUser[]>([])
  const [following, setFollowing] = useState<Set<string>>(new Set())

  useEffect(() => { if (!session?.user?.id) return; fetchFriendLeaderboard(); fetchGlobalLeaderboard() }, [session])

  const enrichWithStreaks = async (profiles: any[]): Promise<LeaderboardUser[]> => {
    if (!profiles.length) return []
    const { data } = await supabase.from('streaks').select('user_id, current_streak').in('user_id', profiles.map((p) => p.id))
    const map: Record<string, number> = {}; data?.forEach((s) => { map[s.user_id] = s.current_streak })
    return profiles.map((p) => ({ ...p, current_streak: map[p.id] ?? 0 }))
  }

  const fetchFriendLeaderboard = async () => {
    const userId = session!.user.id
    const { data: followData } = await supabase.from('friendships').select('following_id').eq('follower_id', userId)
    const ids = [userId, ...(followData?.map((f) => f.following_id) ?? [])]
    setFollowing(new Set(followData?.map((f) => f.following_id) ?? []))
    const { data } = await supabase.from('profiles').select('id, username, avatar_url, xp, level, country').in('id', ids).order('xp', { ascending: false }).limit(50)
    setFriendLB(await enrichWithStreaks(data ?? []))
  }

  const fetchGlobalLeaderboard = async () => {
    const { data } = await supabase.from('profiles').select('id, username, avatar_url, xp, level, country').order('xp', { ascending: false }).limit(100)
    setGlobalLB(await enrichWithStreaks(data ?? []))
  }

  const searchUsers = async (q: string) => {
    if (q.length < 2) { setSearchResults([]); return }
    const { data } = await supabase.from('profiles').select('id, username, avatar_url, xp, level, country').ilike('username', `%${q}%`).neq('id', session?.user?.id).limit(20)
    setSearchResults(await enrichWithStreaks(data ?? []))
  }

  const toggleFollow = async (targetId: string) => {
    const userId = session!.user.id
    if (following.has(targetId)) {
      await supabase.from('friendships').delete().eq('follower_id', userId).eq('following_id', targetId)
      setFollowing((prev) => { const next = new Set(prev); next.delete(targetId); return next })
    } else {
      await supabase.from('friendships').upsert({ follower_id: userId, following_id: targetId })
      setFollowing((prev) => new Set([...prev, targetId]))
    }
    fetchFriendLeaderboard()
  }

  const renderUser = ({ item, index }: { item: LeaderboardUser; index: number }) => {
    const isMe = item.id === session?.user?.id
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`
    const isFollowing = following.has(item.id)
    return (
      <Card row className={`gap-3 p-[14px] ${isMe ? 'border-primary border-[1.5px]' : ''}`}>
        <Text style={{ fontFamily: Fonts.heading, color: Colors.textSecondary, fontSize: 17, width: 32, textAlign: 'center' }}>{medal}</Text>
        <Text style={{ fontSize: 26 }}>{item.avatar_url}</Text>
        <View className="flex-1">
          <Heading className="text-md">{item.username}{isMe ? ' · you' : ''}</Heading>
          <MutedText className="text-xs mt-[2px]">Lv.{item.level} · 🔥{item.current_streak}{item.country ? ` · ${item.country}` : ''}</MutedText>
        </View>
        <View className="items-end gap-1">
          <Text style={{ fontFamily: Fonts.heading, fontSize: 13, color: Colors.xpGold }}>⭐ {item.xp}</Text>
          {!isMe && (
            <PillButton label={isFollowing ? 'Following' : 'Follow'} outlined={isFollowing} onPress={() => toggleFollow(item.id)} />
          )}
        </View>
      </Card>
    )
  }

  const data = activeTab === 'friends' ? friendLeaderboard : globalLeaderboard

  return (
    <View className="flex-1">
      <Background />
      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12, gap: 16 }}>
        <Heading className="text-3xl">Agent Rankings</Heading>
        <View className="flex-row gap-2">
          {(['friends', 'global'] as Tab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              className="flex-1 py-[10px] rounded-md items-center border"
              style={{
                backgroundColor: activeTab === tab ? Colors.primary : Colors.surface,
                borderColor: activeTab === tab ? Colors.primary : Colors.border,
              }}
              onPress={() => { setActiveTab(tab); setSearchQuery(''); setSearchResults([]) }}
            >
              <Text style={{
                fontFamily: activeTab === tab ? Fonts.heading : Fonts.body,
                fontSize: 13, color: activeTab === tab ? '#fff' : Colors.textMuted,
              }}>
                {tab === 'friends' ? '👥 My Squad' : '🌍 Global Ops'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {activeTab === 'friends' && (
        <View className="px-5 pb-2">
          <AppTextInput
            placeholder="Find agents by username…"
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            autoCapitalize="none"
            onChangeText={(q) => { setSearchQuery(q); searchUsers(q) }}
          />
        </View>
      )}

      {searchResults.length > 0 && (
        <Card className="mx-5 mb-2">
          {searchResults.map((item) => (
            <View key={item.id} className="flex-row items-center gap-[10px] p-3 border-b border-border-light">
              <Text style={{ fontSize: 24 }}>{item.avatar_url}</Text>
              <View className="flex-1">
                <Heading className="text-md">{item.username}</Heading>
                <MutedText className="text-xs">Lv.{item.level} · ⭐{item.xp}</MutedText>
              </View>
              <PillButton label={following.has(item.id) ? 'Following' : 'Follow'} outlined={following.has(item.id)} onPress={() => toggleFollow(item.id)} />
            </View>
          ))}
        </Card>
      )}

      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        renderItem={renderUser}
        contentContainerStyle={{ padding: 20, gap: 8 }}
        ListEmptyComponent={
          <EmptyState
            emoji={activeTab === 'friends' ? '👥' : '🌍'}
            title={activeTab === 'friends' ? 'No agents yet!' : 'No data yet'}
            hint={activeTab === 'friends' ? 'Search above to find and follow fellow agents.' : 'Be the first agent to deploy!'}
          />
        }
      />
    </View>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/friends.tsx"
git commit -m "refactor: migrate friends screen to NativeWind"
```

---

## Task 15: Migrate app/(tabs)/profile.tsx

**Files:**
- Modify: `app/(tabs)/profile.tsx`

Dynamic XP bar width (`width: \`${progress * 100}%\``) remains inline.

- [ ] **Step 1: Rewrite `app/(tabs)/profile.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Background from '@/components/Background'
import { Card, EmptyState, Heading, MutedText, SectionTitle } from '@/components/ui'
import { Colors, Fonts, LEVEL_NAMES, Radius, Shadow, XP_PER_LEVEL } from '@/constants/theme'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

type Badge = { id: string; name: string; description: string; category: string; image_url: string | null; condition_type: string; condition_value: number; earned: boolean; earned_at?: string }

export default function ProfileScreen() {
  const { session, profile, signOut } = useAuthStore()
  const [badges, setBadges] = useState<Badge[]>([])
  const [streak, setStreak] = useState({ current: 0, longest: 0 })
  const [totalCompletions, setCompletions] = useState(0)
  const [totalCO2, setCO2] = useState(0)

  useEffect(() => { if (session?.user?.id) { fetchBadges(); fetchStats() } }, [session])

  const fetchBadges = async () => {
    const userId = session!.user.id
    const [{ data: all }, { data: earned }] = await Promise.all([
      supabase.from('badges').select('*'),
      supabase.from('user_badges').select('badge_id, earned_at').eq('user_id', userId),
    ])
    const earnedMap: Record<string, string> = {}; earned?.forEach((e) => { earnedMap[e.badge_id] = e.earned_at })
    setBadges((all ?? []).map((b) => ({ ...b, earned: !!earnedMap[b.id], earned_at: earnedMap[b.id] })))
  }

  const fetchStats = async () => {
    const userId = session!.user.id
    const { data: s } = await supabase.from('streaks').select('current_streak, longest_streak').eq('user_id', userId).maybeSingle()
    if (s) setStreak({ current: s.current_streak, longest: s.longest_streak })
    const { count } = await supabase.from('completions').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    setCompletions(count ?? 0)
    const { data: completionData } = await supabase.from('completions').select('action_id').eq('user_id', userId)
    if (completionData?.length) {
      const { data: actions } = await supabase.from('actions').select('co2_equivalent').in('id', completionData.map((c) => c.action_id))
      setCO2(Math.round((actions?.reduce((sum, a) => sum + (a.co2_equivalent ?? 0), 0) ?? 0) * 10) / 10)
    }
  }

  const handleSignOut = () => Alert.alert('Sign out', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign out', style: 'destructive', onPress: signOut },
  ])

  const level = profile?.level ?? 1
  const xp = profile?.xp ?? 0
  const levelName = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)]
  const currentXP = XP_PER_LEVEL[level - 1] ?? 0
  const nextXP = XP_PER_LEVEL[level] ?? XP_PER_LEVEL[XP_PER_LEVEL.length - 1]
  const progress = Math.min((xp - currentXP) / (nextXP - currentXP), 1)
  const earnedBadges = badges.filter((b) => b.earned)
  const lockedBadges = badges.filter((b) => !b.earned)
  const STATS = [
    { emoji: '🔥', value: streak.current, label: 'Streak' },
    { emoji: '✅', value: totalCompletions, label: 'Missions' },
    { emoji: '🌍', value: `${totalCO2}kg`, label: 'CO₂ saved' },
    { emoji: '⭐', value: xp, label: 'Total XP' },
  ]

  return (
    <View className="flex-1">
      <Background />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="items-center gap-2 px-7" style={{ paddingTop: 70, paddingBottom: 28 }}>
          <Text style={{ fontSize: 72, marginBottom: 4 }}>{profile?.avatar_url ?? '🌱'}</Text>
          <Heading className="text-2xl">@{profile?.username}</Heading>
          <View className="bg-primary-light rounded-full px-[14px] py-1">
            <Text style={{ fontSize: 13, fontFamily: Fonts.heading, color: Colors.primary }}>
              Rank: {levelName} · Lv.{level}
            </Text>
          </View>
          <View className="w-full gap-[6px] mt-2">
            <View className="w-full overflow-hidden" style={{ height: 10, backgroundColor: Colors.surface, borderRadius: Radius.full }}>
              <View style={{ height: '100%', width: `${progress * 100}%`, backgroundColor: Colors.primary, borderRadius: Radius.full }} />
            </View>
            <MutedText className="text-xs text-right">{xp} / {nextXP} XP</MutedText>
          </View>
        </View>

        <View className="flex-row gap-2 px-5 mt-1">
          {STATS.map((s) => (
            <Card key={s.label} className="flex-1 p-3 items-center gap-1">
              <Text style={{ fontSize: 20 }}>{s.emoji}</Text>
              <Heading className="text-lg">{s.value}</Heading>
              <MutedText className="text-[10px] text-center">{s.label}</MutedText>
            </Card>
          ))}
        </View>

        <View className="p-5 gap-[14px]">
          <SectionTitle>Badges {earnedBadges.length > 0 ? `(${earnedBadges.length})` : ''}</SectionTitle>
          {badges.length === 0 ? (
            <EmptyState emoji="🎖️" title="" hint="Complete missions to earn badges!" className="pt-8" />
          ) : (
            <>
              <View className="flex-row flex-wrap gap-[10px]">
                {earnedBadges.map((b) => (
                  <Card key={b.id} className="p-3 items-center gap-1" style={{ width: '30%' }}>
                    <Text style={{ fontSize: 32 }}>{b.image_url ?? '🎖️'}</Text>
                    <Heading className="text-xs text-center">{b.name}</Heading>
                    <MutedText className="text-[10px] text-center" style={{ lineHeight: 14 }}>{b.description}</MutedText>
                  </Card>
                ))}
              </View>
              {lockedBadges.length > 0 && (
                <>
                  <MutedText className="text-sm mt-1">Locked</MutedText>
                  <View className="flex-row flex-wrap gap-[10px]">
                    {lockedBadges.map((b) => (
                      <Card key={b.id} className="p-3 items-center gap-1 opacity-45" style={{ width: '30%' }}>
                        <Text style={{ fontSize: 32, opacity: 0.5 }}>🔒</Text>
                        <MutedText className="text-xs text-center">{b.name}</MutedText>
                        <MutedText className="text-[10px] text-center" style={{ lineHeight: 14 }}>{b.description}</MutedText>
                      </Card>
                    ))}
                  </View>
                </>
              )}
            </>
          )}
        </View>

        <TouchableOpacity
          className="mx-5 mt-2 p-[14px] rounded-lg border items-center"
          style={{ borderWidth: 1.5, borderColor: Colors.error }}
          onPress={handleSignOut}
        >
          <Text style={{ color: Colors.error, fontFamily: Fonts.heading, fontSize: 15 }}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/profile.tsx"
git commit -m "refactor: migrate profile screen to NativeWind"
```

---

## Task 16: Migrate app/impact-report.tsx

**Files:**
- Modify: `app/impact-report.tsx`

Animation values (`fadeAnim`, `slideAnim`, `equivAnims`) remain inline. Country bar widths (computed percentages) remain inline.

- [ ] **Step 1: Rewrite `app/impact-report.tsx`**

```tsx
import * as Haptics from 'expo-haptics'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Animated, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native'
import Background from '@/components/Background'
import { BodyText, Heading, MutedText, PillBadge, PrimaryButton, SectionTitle } from '@/components/ui'
import { Colors, Fonts, Radius, Shadow } from '@/constants/theme'
import { supabase } from '@/lib/supabase'
import { useActionStore } from '@/store/actionStore'
import { useAuthStore } from '@/store/authStore'

type CountryRow = { country: string; completions: number }

const toFlag = (c: string) => {
  if (!c || c.length !== 2) return '🌍'
  const o = 0x1f1e6 - 65
  return String.fromCodePoint(c.toUpperCase().charCodeAt(0) + o) + String.fromCodePoint(c.toUpperCase().charCodeAt(1) + o)
}

const CO2_EQUIV = (kg: number) => [
  { emoji: '🌳', value: Math.max(1, Math.round(kg / 21)), unit: 'trees', desc: 'absorbing CO₂ for a year' },
  { emoji: '🚗', value: Math.max(1, Math.round(kg / 0.12)), unit: 'km', desc: 'not driven by car' },
  { emoji: '🏠', value: Math.max(1, Math.round(kg / 8.5)), unit: 'homes', desc: 'powered for a day' },
  { emoji: '📱', value: Math.max(1, Math.round(kg * 200)), unit: 'phones', desc: 'fully charged' },
]

export default function ImpactReportScreen() {
  const { todaysAction, todaysImpactReport } = useActionStore()
  const { profile } = useAuthStore()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(60)).current
  const equivAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current
  const [countries, setCountries] = useState<CountryRow[]>([])
  const [showEquiv, setShowEquiv] = useState(false)

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
    ]).start(() => {
      setShowEquiv(true)
      equivAnims.forEach((anim, i) => { setTimeout(() => { Animated.spring(anim, { toValue: 1, tension: 80, useNativeDriver: true }).start() }, i * 150) })
    })
    if (todaysAction?.id) fetchCountries(todaysAction.id)
  }, [])

  const fetchCountries = async (actionId: string) => {
    const { data } = await supabase.from('completions').select('profiles!inner(country)').eq('action_id', actionId)
    const map: Record<string, number> = {}
    data?.forEach((c: any) => { const country = c.profiles?.country; if (country) map[country] = (map[country] ?? 0) + 1 })
    setCountries(Object.entries(map).map(([country, completions]) => ({ country, completions })).sort((a, b) => b.completions - a.completions).slice(0, 8))
  }

  const co2 = todaysImpactReport?.co2_saved_kg ?? 0
  const completions = todaysImpactReport?.total_completions ?? 0
  const imageUrl = todaysImpactReport?.generated_image_url
  const equivalents = CO2_EQUIV(co2)
  const maxCountry = countries[0]?.completions ?? 1

  const handleShare = async () => {
    await Share.share({
      message: `🌍 ${completions.toLocaleString()} agents deployed today on ActApp!\n\nMission: "${todaysAction?.title}"\n\nTogether we saved ~${co2}kg CO₂ — like ${Math.round(co2 / 21)} trees! 🌳\n\nJoin the mission 👉 actapp.earth`,
    })
  }

  return (
    <View className="flex-1">
      <Background />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 40, gap: 16 }} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          className="self-end items-center justify-center"
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 4 }}
          onPress={() => router.back()}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>✕</Text>
        </TouchableOpacity>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], gap: 16 }}>
          {/* Header card */}
          <View
            className="rounded-xl p-[22px] gap-[10px] items-center border border-border"
            style={[{ backgroundColor: Colors.surfaceDark }, Shadow.md]}
          >
            <PillBadge label="MISSION COMPLETE" className="self-center" />
            <Heading className="text-3xl text-center">Mission Debrief</Heading>
            <MutedText className="text-sm">{new Date().toDateString()}</MutedText>
            {todaysAction && (
              <View className="bg-surface rounded-md p-3 w-full border-l-4 border-primary">
                <BodyText className="text-md text-center" style={{ lineHeight: 22 }}>{todaysAction.title}</BodyText>
              </View>
            )}
          </View>

          {/* AI image */}
          {imageUrl ? (
            <View style={{ height: 200, borderRadius: Radius.xl, overflow: 'hidden' }}>
              <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={400} />
            </View>
          ) : (
            <View className="items-center justify-center gap-2 border border-border" style={{ height: 140, backgroundColor: Colors.surface, borderRadius: Radius.xl }}>
              <Text style={{ fontSize: 48 }}>🌍</Text>
              <MutedText className="text-sm">Impact image generating…</MutedText>
            </View>
          )}

          {/* Big number */}
          <View
            className="rounded-xl p-7 items-center gap-[6px] border"
            style={[{ backgroundColor: Colors.surfaceDark, borderColor: Colors.primary + '40' }, Shadow.md]}
          >
            <Text style={{ fontSize: 72, fontFamily: Fonts.heading, color: Colors.primary, letterSpacing: -2 }}>
              {completions.toLocaleString()}
            </Text>
            <BodyText className="text-center text-md">agents deployed today</BodyText>
            {co2 > 0 && (
              <Text style={{ fontSize: 15, fontFamily: Fonts.heading, color: Colors.xpGold, marginTop: 4 }}>
                {co2.toLocaleString()}kg CO₂ saved together
              </Text>
            )}
          </View>

          {/* CO₂ equivalents */}
          {co2 > 0 && (
            <View>
              <SectionTitle className="mb-[10px]">That's the same as…</SectionTitle>
              <View className="flex-row flex-wrap gap-2">
                {equivalents.map((eq, i) => (
                  <Animated.View
                    key={i}
                    className="border border-border rounded-lg p-[14px] items-center gap-1"
                    style={{
                      width: '47.5%', backgroundColor: Colors.surfaceDark,
                      opacity: showEquiv ? equivAnims[i] : 0,
                      transform: [{ scale: showEquiv ? equivAnims[i] : 0 }],
                    }}
                  >
                    <Text style={{ fontSize: 28 }}>{eq.emoji}</Text>
                    <Text style={{ fontSize: 26, fontFamily: Fonts.heading, color: Colors.text }}>{eq.value.toLocaleString()}</Text>
                    <Text style={{ fontSize: 13, fontFamily: Fonts.heading, color: Colors.primary }}>{eq.unit}</Text>
                    <Text style={{ fontSize: 10, fontFamily: Fonts.body, color: Colors.textMuted, textAlign: 'center', lineHeight: 13 }}>{eq.desc}</Text>
                  </Animated.View>
                ))}
              </View>
            </View>
          )}

          {/* Country breakdown */}
          {countries.length > 0 && (
            <View className="rounded-xl p-[18px] border border-border" style={{ backgroundColor: Colors.surfaceDark }}>
              <SectionTitle className="mb-[14px]">🌐 By country</SectionTitle>
              {countries.map((row, i) => (
                <View key={row.country} className="flex-row items-center gap-2" style={{ marginBottom: 10 }}>
                  <Text style={{ width: 20, fontSize: 11, fontFamily: Fonts.heading, color: Colors.textMuted, textAlign: 'center' }}>{i + 1}</Text>
                  <Text style={{ fontSize: 20 }}>{toFlag(row.country)}</Text>
                  <BodyText className="flex-1 text-sm" numberOfLines={1}>{row.country}</BodyText>
                  <View className="overflow-hidden" style={{ flex: 2, height: 6, backgroundColor: Colors.surface, borderRadius: 3 }}>
                    <View style={{ height: '100%', width: `${Math.max(4, (row.completions / maxCountry) * 100)}%`, backgroundColor: Colors.primary, borderRadius: 3 }} />
                  </View>
                  <Text style={{ width: 36, fontSize: 11, fontFamily: Fonts.heading, color: Colors.textSecondary, textAlign: 'right' }}>{row.completions}</Text>
                </View>
              ))}
            </View>
          )}

          {/* XP banner */}
          <View
            className="rounded-md p-[14px] items-center border"
            style={{ backgroundColor: Colors.xpGold + '20', borderColor: Colors.xpGold + '40' }}
          >
            <Text style={{ fontSize: 13, fontFamily: Fonts.heading, color: Colors.xpGold, textAlign: 'center', lineHeight: 20 }}>
              ⭐ +XP earned · 🔥 Streak active · Agent {profile?.username ?? ''} — mission logged
            </Text>
          </View>

          <PrimaryButton onPress={handleShare} label="Share your mission 🌍" />

          <MutedText className="text-center text-sm">Mission logged. Agent, stand by for tomorrow's briefing. 🌱</MutedText>
        </Animated.View>
      </ScrollView>
    </View>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/impact-report.tsx
git commit -m "refactor: migrate impact report screen to NativeWind"
```

---

## Task 17: Delete constants/styles.ts and final verification

**Files:**
- Delete: `constants/styles.ts`

- [ ] **Step 1: Verify no remaining imports of constants/styles**

```bash
grep -r "constants/styles" /path/to/project/app /path/to/project/components --include="*.tsx" --include="*.ts"
```

Expected: no output (zero matches).

- [ ] **Step 2: Verify no remaining StyleSheet.create calls**

```bash
grep -r "StyleSheet\.create" /path/to/project/app /path/to/project/components --include="*.tsx" --include="*.ts"
```

Expected: no output (zero matches).

- [ ] **Step 3: Delete the file**

```bash
rm constants/styles.ts
```

- [ ] **Step 4: Start the app and do a full smoke test**

```bash
npx expo start --clear
```

Navigate through every screen — Today, Impact Bank, Friends, Profile, Impact Report, Auth, Onboarding — and verify visual output matches the pre-migration UI.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "refactor: complete NativeWind migration, delete constants/styles.ts"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
| --- | --- |
| Install NativeWind v4 + Tailwind CSS v3 | Task 1 |
| Create tailwind.config.js with brand tokens | Task 2 |
| Create global.css + import in _layout.tsx | Tasks 2 & 3 |
| Babel plugin | Task 3 |
| 10 UI primitives in components/ui/ | Task 4 |
| Migrate Background.tsx | Task 5 |
| Migrate AppLogo.tsx | Task 5 |
| Migrate SwipeToComplete.tsx | Task 6 |
| Migrate MissionsCard.tsx | Task 7 |
| Migrate app/(tabs)/_layout.tsx | Task 8 |
| Migrate app/(auth)/phone.tsx | Task 9 |
| Migrate app/(auth)/verify.tsx | Task 10 |
| Migrate app/onboarding.tsx | Task 11 |
| Migrate app/(tabs)/index.tsx | Task 12 |
| Migrate app/(tabs)/impact-bank.tsx | Task 13 |
| Migrate app/(tabs)/friends.tsx | Task 14 |
| Migrate app/(tabs)/profile.tsx | Task 15 |
| Migrate app/impact-report.tsx | Task 16 |
| Delete constants/styles.ts | Task 17 |
| Dynamic styles remain inline | All migration tasks |
| Shadows remain as inline style= | All migration tasks |

**No placeholders found.** All code steps show complete file content.

**Type consistency:** All UI primitives export named exports matching their import in every migration task. `Shadow.sm/md/lg` referenced throughout matches `constants/theme.ts` export.
