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
