import { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, Share } from 'react-native'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { Image } from 'expo-image'
import { supabase } from '@/lib/supabase'
import { useActionStore } from '@/store/actionStore'
import { useAuthStore } from '@/store/authStore'
import { Colors, Fonts, Radius, Shadow } from '@/constants/theme'
import { S } from '@/constants/styles'
import Background from '@/components/Background'

type CountryRow = { country: string; completions: number }

// Convert 2-letter ISO code → flag emoji
const toFlag = (c: string) => {
  if (!c || c.length !== 2) return '🌍'
  const o = 0x1F1E6 - 65
  return String.fromCodePoint(c.toUpperCase().charCodeAt(0) + o) +
         String.fromCodePoint(c.toUpperCase().charCodeAt(1) + o)
}

const CO2_EQUIV = (kg: number) => [
  { emoji: '🌳', value: Math.max(1, Math.round(kg / 21)),   unit: 'trees',  desc: 'absorbing CO₂ for a year' },
  { emoji: '🚗', value: Math.max(1, Math.round(kg / 0.12)), unit: 'km',     desc: 'not driven by car' },
  { emoji: '🏠', value: Math.max(1, Math.round(kg / 8.5)),  unit: 'homes',  desc: 'powered for a day' },
  { emoji: '📱', value: Math.max(1, Math.round(kg * 200)),  unit: 'phones', desc: 'fully charged' },
]

export default function ImpactReportScreen() {
  const { todaysAction, todaysImpactReport } = useActionStore()
  const { profile } = useAuthStore()

  const fadeAnim  = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(60)).current
  // 4 staggered animations — one per equiv card
  const equivAnims = useRef([0,1,2,3].map(() => new Animated.Value(0))).current

  const [countries, setCountries] = useState<CountryRow[]>([])
  const [showEquiv, setShowEquiv] = useState(false)

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
    ]).start(() => {
      setShowEquiv(true)
      equivAnims.forEach((anim, i) => {
        setTimeout(() => {
          Animated.spring(anim, { toValue: 1, tension: 80, useNativeDriver: true }).start()
        }, i * 150)
      })
    })
    if (todaysAction?.id) fetchCountries(todaysAction.id)
  }, [])

  const fetchCountries = async (actionId: string) => {
    const { data } = await supabase
      .from('completions')
      .select('profiles!inner(country)')
      .eq('action_id', actionId)
    const map: Record<string, number> = {}
    data?.forEach((c: any) => {
      const country = c.profiles?.country
      if (country) map[country] = (map[country] ?? 0) + 1
    })
    setCountries(
      Object.entries(map)
        .map(([country, completions]) => ({ country, completions }))
        .sort((a, b) => b.completions - a.completions)
        .slice(0, 8)
    )
  }

  const co2        = todaysImpactReport?.co2_saved_kg ?? 0
  const completions = todaysImpactReport?.total_completions ?? 0
  const imageUrl   = todaysImpactReport?.generated_image_url
  const equivalents = CO2_EQUIV(co2)
  const maxCountry = countries[0]?.completions ?? 1

  const handleShare = async () => {
    await Share.share({
      message: `🌍 ${completions.toLocaleString()} agents deployed today on ActApp!\n\nMission: "${todaysAction?.title}"\n\nTogether we saved ~${co2}kg CO₂ — like ${Math.round(co2 / 21)} trees! 🌳\n\nJoin the mission 👉 actapp.earth`,
    })
  }

  return (
    <View style={S.fill}>
      <Background />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], gap: 16 }}>

          {/* ── Header card ─────────────────────────────────── */}
          <View style={styles.headerCard}>
            <View style={[S.missionBadge, { alignSelf: 'center' }]}>
              <Text style={S.missionBadgeText}>MISSION COMPLETE</Text>
            </View>
            <Text style={styles.title}>Mission Debrief</Text>
            <Text style={[S.muted, { fontSize: Fonts.sizes.sm }]}>{new Date().toDateString()}</Text>
            {todaysAction && (
              <View style={styles.actionBox}>
                <Text style={[S.body, { fontSize: Fonts.sizes.md, textAlign: 'center' }]}>{todaysAction.title}</Text>
              </View>
            )}
          </View>

          {/* ── AI-generated image ──────────────────────────── */}
          {imageUrl ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" transition={400} />
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={{ fontSize: 48 }}>🌍</Text>
              <Text style={[S.muted, { fontSize: Fonts.sizes.sm }]}>Impact image generating…</Text>
            </View>
          )}

          {/* ── Global participation ─────────────────────────── */}
          <View style={styles.bigNumCard}>
            <Text style={styles.bigNum}>{completions.toLocaleString()}</Text>
            <Text style={[S.body, { textAlign: 'center', fontSize: Fonts.sizes.md }]}>agents deployed today</Text>
            {co2 > 0 && (
              <Text style={styles.co2Line}>{co2.toLocaleString()}kg CO₂ saved together</Text>
            )}
          </View>

          {/* ── Real-life CO₂ equivalents ────────────────────── */}
          {co2 > 0 && (
            <View>
              <Text style={[S.sectionTitle, { marginBottom: 10 }]}>That's the same as…</Text>
              <View style={styles.equivGrid}>
                {equivalents.map((eq, i) => (
                  <Animated.View
                    key={i}
                    style={[styles.equivCard, {
                      opacity: showEquiv ? equivAnims[i] : 0,
                      transform: [{ scale: showEquiv ? equivAnims[i] : 0 }],
                    }]}
                  >
                    <Text style={styles.equivEmoji}>{eq.emoji}</Text>
                    <Text style={styles.equivValue}>{eq.value.toLocaleString()}</Text>
                    <Text style={styles.equivUnit}>{eq.unit}</Text>
                    <Text style={styles.equivDesc}>{eq.desc}</Text>
                  </Animated.View>
                ))}
              </View>
            </View>
          )}

          {/* ── Country breakdown ────────────────────────────── */}
          {countries.length > 0 && (
            <View style={styles.sectionCard}>
              <Text style={[S.sectionTitle, { marginBottom: 14 }]}>🌐 By country</Text>
              {countries.map((row, i) => (
                <View key={row.country} style={styles.countryRow}>
                  <Text style={styles.countryRank}>{i + 1}</Text>
                  <Text style={styles.countryFlag}>{toFlag(row.country)}</Text>
                  <Text style={[S.body, { flex: 1, fontSize: Fonts.sizes.sm }]} numberOfLines={1}>
                    {row.country}
                  </Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${Math.max(4, (row.completions / maxCountry) * 100)}%` }]} />
                  </View>
                  <Text style={styles.countryCount}>{row.completions}</Text>
                </View>
              ))}
            </View>
          )}

          {/* ── Personal XP banner ──────────────────────────── */}
          <View style={styles.xpBanner}>
            <Text style={styles.xpBannerText}>
              ⭐ +XP earned · 🔥 Streak active · Agent {profile?.username ?? ''} — mission logged
            </Text>
          </View>

          {/* ── Share ───────────────────────────────────────── */}
          <TouchableOpacity style={S.primaryBtn} onPress={handleShare} activeOpacity={0.85}>
            <Text style={S.primaryBtnText}>Share your mission 🌍</Text>
          </TouchableOpacity>

          <Text style={[S.muted, { textAlign: 'center', fontSize: Fonts.sizes.sm }]}>
            Mission logged. Agent, stand by for tomorrow's briefing. 🌱
          </Text>

        </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  content:   { padding: 20, paddingTop: 56, paddingBottom: 40, gap: 16 },
  closeBtn:  { alignSelf: 'flex-end', width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  closeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // ── Header ─────────────────────────────────────────────────────
  headerCard: { backgroundColor: Colors.surfaceDark, borderRadius: Radius.xl, padding: 22, gap: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, ...Shadow.md },
  title:      { fontSize: Fonts.sizes.xxxl, fontFamily: Fonts.heading, color: Colors.text, textAlign: 'center' },
  actionBox:  { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 12, borderLeftWidth: 4, borderLeftColor: Colors.primary, width: '100%' },

  // ── Image ──────────────────────────────────────────────────────
  imageContainer:  { height: 200, borderRadius: Radius.xl, overflow: 'hidden' },
  image:           { width: '100%', height: '100%' },
  imagePlaceholder:{ height: 140, backgroundColor: Colors.surface, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: Colors.border },

  // ── Big number ─────────────────────────────────────────────────
  bigNumCard: { backgroundColor: Colors.surfaceDark, borderRadius: Radius.xl, padding: 28, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.primary + '40', ...Shadow.md },
  bigNum:     { fontSize: 72, fontFamily: Fonts.heading, color: Colors.primary, letterSpacing: -2 },
  co2Line:    { fontSize: Fonts.sizes.md, fontFamily: Fonts.heading, color: Colors.xpGold, marginTop: 4 },

  // ── Equivalents 2×2 grid ───────────────────────────────────────
  equivGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  equivCard: { width: '47.5%', backgroundColor: Colors.surfaceDark, borderRadius: Radius.lg, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: Colors.border },
  equivEmoji:{ fontSize: 28 },
  equivValue:{ fontSize: Fonts.sizes.xxl, fontFamily: Fonts.heading, color: Colors.text },
  equivUnit: { fontSize: Fonts.sizes.sm, fontFamily: Fonts.heading, color: Colors.primary },
  equivDesc: { fontSize: 10, fontFamily: Fonts.body, color: Colors.textMuted, textAlign: 'center', lineHeight: 13 },

  // ── Country breakdown ──────────────────────────────────────────
  sectionCard:  { backgroundColor: Colors.surfaceDark, borderRadius: Radius.xl, padding: 18, borderWidth: 1, borderColor: Colors.border },
  countryRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  countryRank:  { width: 20, fontSize: Fonts.sizes.xs, fontFamily: Fonts.heading, color: Colors.textMuted, textAlign: 'center' },
  countryFlag:  { fontSize: 20 },
  barTrack:     { flex: 2, height: 6, backgroundColor: Colors.surface, borderRadius: 3, overflow: 'hidden' },
  barFill:      { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  countryCount: { width: 36, fontSize: Fonts.sizes.xs, fontFamily: Fonts.heading, color: Colors.textSecondary, textAlign: 'right' },

  // ── XP banner ──────────────────────────────────────────────────
  xpBanner:     { backgroundColor: Colors.xpGold + '20', borderRadius: Radius.md, padding: 14, borderWidth: 1, borderColor: Colors.xpGold + '40', alignItems: 'center' },
  xpBannerText: { fontSize: Fonts.sizes.sm, fontFamily: Fonts.heading, color: Colors.xpGold, textAlign: 'center', lineHeight: 20 },
})
