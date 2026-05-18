import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Colors, Fonts, Radius, Shadow, LEVEL_NAMES, XP_PER_LEVEL } from '@/constants/theme'
import { S } from '@/constants/styles'
import Background from '@/components/Background'

type Badge = {
  id: string; name: string; description: string; category: string
  image_url: string | null; condition_type: string; condition_value: number
  earned: boolean; earned_at?: string
}

export default function ProfileScreen() {
  const { session, profile, signOut } = useAuthStore()
  const [badges, setBadges]                 = useState<Badge[]>([])
  const [streak, setStreak]                 = useState({ current: 0, longest: 0 })
  const [totalCompletions, setCompletions]  = useState(0)
  const [totalCO2, setCO2]                  = useState(0)

  useEffect(() => { if (session?.user?.id) { fetchBadges(); fetchStats() } }, [session])

  const fetchBadges = async () => {
    const userId = session!.user.id
    const [{ data: all }, { data: earned }] = await Promise.all([
      supabase.from('badges').select('*'),
      supabase.from('user_badges').select('badge_id, earned_at').eq('user_id', userId),
    ])
    const earnedMap: Record<string, string> = {}
    earned?.forEach(e => { earnedMap[e.badge_id] = e.earned_at })
    setBadges((all ?? []).map(b => ({ ...b, earned: !!earnedMap[b.id], earned_at: earnedMap[b.id] })))
  }

  const fetchStats = async () => {
    const userId = session!.user.id
    const { data: s } = await supabase.from('streaks').select('current_streak, longest_streak').eq('user_id', userId).maybeSingle()
    if (s) setStreak({ current: s.current_streak, longest: s.longest_streak })

    const { count } = await supabase.from('completions').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    setCompletions(count ?? 0)

    const { data: completionData } = await supabase.from('completions').select('action_id').eq('user_id', userId)
    if (completionData?.length) {
      const { data: actions } = await supabase.from('actions').select('co2_equivalent').in('id', completionData.map(c => c.action_id))
      setCO2(Math.round((actions?.reduce((sum, a) => sum + (a.co2_equivalent ?? 0), 0) ?? 0) * 10) / 10)
    }
  }

  const handleSignOut = () => Alert.alert('Sign out', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign out', style: 'destructive', onPress: signOut },
  ])

  const level        = profile?.level ?? 1
  const xp           = profile?.xp ?? 0
  const levelName    = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)]
  const currentXP    = XP_PER_LEVEL[level - 1] ?? 0
  const nextXP       = XP_PER_LEVEL[level] ?? XP_PER_LEVEL[XP_PER_LEVEL.length - 1]
  const progress     = Math.min((xp - currentXP) / (nextXP - currentXP), 1)
  const earnedBadges = badges.filter(b => b.earned)
  const lockedBadges = badges.filter(b => !b.earned)

  const STATS = [
    { emoji: '🔥', value: streak.current,  label: 'Streak' },
    { emoji: '✅', value: totalCompletions, label: 'Missions' },
    { emoji: '🌍', value: `${totalCO2}kg`, label: 'CO₂ saved' },
    { emoji: '⭐', value: xp,              label: 'Total XP' },
  ]

  return (
    <View style={S.fill}>
      <Background />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={{ fontSize: 72, marginBottom: 4 }}>{profile?.avatar_url ?? '🌱'}</Text>
          <Text style={[S.heading, { fontSize: Fonts.sizes.xxl }]}>@{profile?.username}</Text>
          <View style={styles.levelPill}><Text style={styles.levelPillText}>Rank: {levelName} · Lv.{level}</Text></View>
          <View style={{ width: '100%', gap: 6, marginTop: 8 }}>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBarFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={[S.muted, { fontSize: Fonts.sizes.xs, textAlign: 'right' }]}>{xp} / {nextXP} XP</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {STATS.map(s => (
            <View key={s.label} style={[S.card, styles.statCard]}>
              <Text style={{ fontSize: 20 }}>{s.emoji}</Text>
              <Text style={[S.heading, { fontSize: Fonts.sizes.lg }]}>{s.value}</Text>
              <Text style={[S.muted, { fontSize: 10, textAlign: 'center' }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Badges */}
        <View style={{ padding: 20, gap: 14 }}>
          <Text style={S.sectionTitle}>Badges {earnedBadges.length > 0 ? `(${earnedBadges.length})` : ''}</Text>
          {badges.length === 0 ? (
            <View style={[S.empty, { paddingTop: 32 }]}>
              <Text style={S.emptyEmoji}>🎖️</Text>
              <Text style={[S.body, { fontSize: Fonts.sizes.md }]}>Complete missions to earn badges!</Text>
            </View>
          ) : (
            <>
              <View style={styles.badgeGrid}>
                {earnedBadges.map(b => (
                  <View key={b.id} style={[S.card, styles.badgeCard]}>
                    <Text style={{ fontSize: 32 }}>{b.image_url ?? '🎖️'}</Text>
                    <Text style={[S.heading, { fontSize: Fonts.sizes.xs, textAlign: 'center' }]}>{b.name}</Text>
                    <Text style={[S.muted, { fontSize: 10, textAlign: 'center', lineHeight: 14 }]}>{b.description}</Text>
                  </View>
                ))}
              </View>
              {lockedBadges.length > 0 && (
                <>
                  <Text style={[S.muted, { fontSize: Fonts.sizes.sm, marginTop: 4 }]}>Locked</Text>
                  <View style={styles.badgeGrid}>
                    {lockedBadges.map(b => (
                      <View key={b.id} style={[S.card, styles.badgeCard, { opacity: 0.45 }]}>
                        <Text style={{ fontSize: 32, opacity: 0.5 }}>🔒</Text>
                        <Text style={[S.muted, { fontSize: Fonts.sizes.xs, textAlign: 'center' }]}>{b.name}</Text>
                        <Text style={[S.muted, { fontSize: 10, textAlign: 'center', lineHeight: 14 }]}>{b.description}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </>
          )}
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  hero:         { alignItems: 'center', paddingTop: 70, paddingBottom: 28, gap: 8, paddingHorizontal: 28 },
  levelPill:    { backgroundColor: Colors.primaryLight, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 4 },
  levelPillText:{ fontSize: Fonts.sizes.sm, fontFamily: Fonts.heading, color: Colors.primary },
  xpBarBg:      { height: 10, backgroundColor: Colors.surface, borderRadius: Radius.full, overflow: 'hidden', width: '100%' },
  xpBarFill:    { height: '100%', backgroundColor: Colors.primary, borderRadius: Radius.full },
  statsRow:     { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginTop: 4 },
  statCard:     { flex: 1, padding: 12, alignItems: 'center', gap: 4 },
  badgeGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeCard:    { width: '30%', padding: 12, alignItems: 'center', gap: 4 },
  signOutBtn:   { margin: 20, marginTop: 8, padding: 14, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.error, alignItems: 'center' },
  signOutText:  { color: Colors.error, fontFamily: Fonts.heading, fontSize: Fonts.sizes.md },
})
