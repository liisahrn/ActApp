import { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, ScrollView, Alert,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useActionStore, Mission } from '@/store/actionStore'
import { useAuthStore } from '@/store/authStore'
import { Colors, Fonts, Radius, Shadow } from '@/constants/theme'
import { S } from '@/constants/styles'

const DIFFICULTY_COLOR = { easy: Colors.primary, medium: Colors.xpGold, hard: Colors.streakOrange }
const CATEGORY_EMOJI: Record<string, string> = {
  transport: '🚲', food: '🥗', energy: '💡', water: '🚿',
  waste: '♻️', nature: '🌿', community: '🤝',
}

// ── Dot progress row ─────────────────────────────────────────────
function ProgressDots({ count, goal, color }: { count: number; goal: number; color: string }) {
  return (
    <View style={[S.row, { gap: 4, flexWrap: 'wrap' }]}>
      {Array.from({ length: goal }).map((_, i) => (
        <View key={i} style={[dots.dot, { backgroundColor: i < count ? color : Colors.surface, borderColor: i < count ? color : Colors.border }]} />
      ))}
    </View>
  )
}

// ── Mission detail bottom sheet ──────────────────────────────────
function MissionModal({ mission, onClose, onPledge, onLog, onClaim }: {
  mission: Mission
  onClose: () => void
  onPledge: () => void
  onLog: () => void
  onClaim: () => void
}) {
  const t = new Date().toISOString().split('T')[0]
  const alreadyLoggedToday = mission.last_logged_date === t
  const diffColor  = DIFFICULTY_COLOR[mission.difficulty]
  const accentColor = mission.gem_reward > 0 ? Colors.kindGem : Colors.primary
  const daysLeft   = Math.max(0, Math.ceil((new Date(mission.end_date).getTime() - Date.now()) / 86400000))
  const rewardText = mission.xp_reward > 0 ? `⭐ ${mission.xp_reward} XP` : `💎 ${mission.gem_reward}`
  const pct        = mission.pledged ? mission.count / mission.goal_count : 0

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 8 }}>

            {/* Header row */}
            <View style={[S.row, { justifyContent: 'space-between', alignItems: 'flex-start' }]}>
              <View style={[S.row, { gap: 10, flex: 1 }]}>
                {/* Badge fades in as you progress */}
                <Text style={{ fontSize: 44, opacity: mission.pledged ? 0.4 + 0.6 * pct : 0.3 }}>
                  {mission.badge_emoji}
                </Text>
                <View style={{ gap: 5, flex: 1 }}>
                  <View style={[S.row, { gap: 6, flexWrap: 'wrap' }]}>
                    <View style={[modal.typePill, mission.mission_type === 'monthly' && { backgroundColor: Colors.accent + '22', borderColor: Colors.accent }]}>
                      <Text style={[modal.typeText, mission.mission_type === 'monthly' && { color: Colors.accent }]}>
                        {mission.mission_type.toUpperCase()}
                      </Text>
                    </View>
                    <View style={[modal.diffPill, { borderColor: diffColor }]}>
                      <Text style={[modal.diffText, { color: diffColor }]}>{mission.difficulty.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={[S.muted, { fontSize: Fonts.sizes.xs }]}>{daysLeft} days left · {rewardText}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={modal.closeBtn}>
                <Text style={{ color: Colors.textMuted, fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={[S.heading, { fontSize: Fonts.sizes.xxl, lineHeight: 30 }]}>{mission.title}</Text>

            {/* Pledge text — switches tense on completion */}
            <View style={[modal.pledgeBox, mission.completed && { borderLeftColor: Colors.primary, backgroundColor: Colors.primaryLight }]}>
              <Text style={[S.muted, { fontSize: Fonts.sizes.xs, marginBottom: 6 }]}>
                {mission.completed ? 'COMPLETED ✅' : 'YOUR PLEDGE'}
              </Text>
              <Text style={[S.body, { fontSize: Fonts.sizes.md, lineHeight: 22, color: Colors.text }]}>
                "{mission.completed ? mission.pledge_text_past : mission.pledge_text}"
              </Text>
            </View>

            {/* Progress dots (only shown once pledged) */}
            {mission.pledged && (
              <View style={{ gap: 8 }}>
                <View style={[S.row, { justifyContent: 'space-between' }]}>
                  <Text style={[S.muted, { fontSize: Fonts.sizes.xs }]}>
                    {mission.completed ? 'Done!' : `${mission.count} of ${mission.goal_count} check-ins`}
                  </Text>
                  <Text style={[S.muted, { fontSize: Fonts.sizes.xs }]}>{Math.round(pct * 100)}%</Text>
                </View>
                <ProgressDots count={mission.count} goal={mission.goal_count} color={accentColor} />
              </View>
            )}

            {/* Description */}
            <Text style={[S.body, { fontSize: Fonts.sizes.md, lineHeight: 23 }]}>{mission.description}</Text>

            {/* Impact */}
            <View style={modal.impactRow}>
              <Text style={{ fontSize: 22 }}>{CATEGORY_EMOJI[mission.category] ?? '🌍'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[S.muted, { fontSize: Fonts.sizes.xs }]}>ESTIMATED IMPACT</Text>
                <Text style={[S.heading, { fontSize: Fonts.sizes.md, color: Colors.primary }]}>{mission.impact_summary}</Text>
              </View>
            </View>

          </ScrollView>

          {/* CTAs */}
          <View style={{ paddingTop: 16, gap: 10 }}>
            {!mission.pledged && (
              <TouchableOpacity style={S.primaryBtn} onPress={onPledge} activeOpacity={0.85}>
                <Text style={S.primaryBtnText}>Take the Pledge 🤝</Text>
              </TouchableOpacity>
            )}
            {mission.pledged && !mission.completed && (
              <TouchableOpacity
                style={[S.primaryBtn, alreadyLoggedToday && { opacity: 0.5 }]}
                onPress={onLog}
                disabled={alreadyLoggedToday}
                activeOpacity={0.85}
              >
                <Text style={S.primaryBtnText}>
                  {alreadyLoggedToday ? '✅ Logged for today' : 'Did it today ✓'}
                </Text>
              </TouchableOpacity>
            )}
            {mission.completed && !mission.claimed && (
              <TouchableOpacity style={[S.primaryBtn, { backgroundColor: Colors.xpGold }]} onPress={onClaim} activeOpacity={0.85}>
                <Text style={[S.primaryBtnText, { color: '#000' }]}>Claim Reward {rewardText} 🎉</Text>
              </TouchableOpacity>
            )}
            {mission.claimed && (
              <View style={modal.claimedBanner}>
                <Text style={[S.heading, { fontSize: Fonts.sizes.md, color: Colors.primary }]}>✅ Reward Claimed!</Text>
              </View>
            )}
            <TouchableOpacity onPress={onClose} style={{ paddingVertical: 8 }}>
              <Text style={[S.muted, { textAlign: 'center' }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ── Mission tile card ─────────────────────────────────────────────
function MissionTile({ mission, onPress }: { mission: Mission; onPress: () => void }) {
  const diffColor   = DIFFICULTY_COLOR[mission.difficulty]
  const accentColor = mission.gem_reward > 0 ? Colors.kindGem : Colors.primary
  const pct         = mission.pledged ? mission.count / mission.goal_count : 0
  const daysLeft    = Math.max(0, Math.ceil((new Date(mission.end_date).getTime() - Date.now()) / 86400000))
  const t           = new Date().toISOString().split('T')[0]
  const loggedToday = mission.last_logged_date === t

  // Badge opacity: 0.25 before pledge, fills in as progress builds
  const emojiOpacity = mission.completed ? 1 : mission.pledged ? 0.25 + 0.75 * pct : 0.25

  let statusEl = null
  if (mission.claimed)
    statusEl = <Text style={[tile.status, { color: Colors.textMuted }]}>✅ done</Text>
  else if (mission.completed)
    statusEl = <Text style={[tile.status, { color: Colors.xpGold }]}>🎁 claim!</Text>
  else if (loggedToday)
    statusEl = <Text style={[tile.status, { color: Colors.primary }]}>✓ logged today</Text>
  else if (mission.pledged)
    statusEl = <Text style={[tile.status, { color: Colors.textMuted }]}>in progress</Text>
  else
    statusEl = <Text style={[tile.status, { color: Colors.textMuted }]}>tap to pledge</Text>

  return (
    <TouchableOpacity
      style={[
        tile.card,
        mission.pledged && !mission.completed && { borderColor: accentColor + '60', borderWidth: 1.5 },
        mission.completed && !mission.claimed && { borderColor: Colors.xpGold, borderWidth: 1.5 },
        mission.claimed && { opacity: 0.6 },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Fading badge */}
      <Text style={{ fontSize: 34, opacity: emojiOpacity, marginBottom: 6 }}>{mission.badge_emoji}</Text>

      <Text style={[S.heading, { fontSize: Fonts.sizes.sm, lineHeight: 17 }]} numberOfLines={2}>{mission.title}</Text>
      <Text style={[S.muted, { fontSize: Fonts.sizes.xs, marginTop: 3 }]}>{daysLeft}d left</Text>

      {/* Mini progress dots */}
      {mission.pledged && (
        <View style={{ marginTop: 8 }}>
          <ProgressDots count={mission.count} goal={mission.goal_count} color={accentColor} />
        </View>
      )}

      <View style={[tile.diffPill, { borderColor: diffColor, marginTop: 8 }]}>
        <Text style={[tile.diffText, { color: diffColor }]}>{mission.difficulty}</Text>
      </View>

      <View style={{ marginTop: 6 }}>{statusEl}</View>
    </TouchableOpacity>
  )
}

// ── Main export ──────────────────────────────────────────────────
export default function MissionsCard() {
  const { missions, pledgeMission, logMissionDay, claimMissionReward } = useActionStore()
  const { session } = useAuthStore()
  const [selected, setSelected] = useState<Mission | null>(null)

  if (!missions.length) return null
  const userId = session?.user?.id

  // Keep selected in sync with store state
  const syncSelected = (id: string) =>
    setSelected(missions.find(m => m.id === id) ?? null)

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

  const weekly  = missions.filter(m => m.mission_type === 'weekly')
  const monthly = missions.filter(m => m.mission_type === 'monthly')

  return (
    <View style={styles.container}>

      {weekly.length > 0 && (
        <>
          <View style={[S.row, { justifyContent: 'space-between' }]}>
            <Text style={S.sectionTitle}>📅 Weekly Missions</Text>
            <Text style={[S.muted, { fontSize: Fonts.sizes.xs }]}>Check in each day you do it</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
            {weekly.map(m => <MissionTile key={m.id} mission={m} onPress={() => setSelected(m)} />)}
          </ScrollView>
        </>
      )}

      {monthly.length > 0 && (
        <>
          <View style={[S.row, { justifyContent: 'space-between', marginTop: weekly.length > 0 ? 8 : 0 }]}>
            <Text style={S.sectionTitle}>🏆 Monthly Missions</Text>
            <Text style={[S.muted, { fontSize: Fonts.sizes.xs }]}>Log each time you do it</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
            {monthly.map(m => <MissionTile key={m.id} mission={m} onPress={() => setSelected(m)} />)}
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

// ── Styles ────────────────────────────────────────────────────────
const dots = StyleSheet.create({
  dot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1 },
})

const tile = StyleSheet.create({
  card:     { width: 148, backgroundColor: Colors.surfaceDark, borderRadius: Radius.xl, padding: 14, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  diffPill: { alignSelf: 'flex-start', borderRadius: Radius.full, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1 },
  diffText: { fontSize: 9, fontFamily: Fonts.heading, letterSpacing: 0.3 },
  status:   { fontSize: 10, fontFamily: Fonts.body },
})

const modal = StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: '#101E11', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36, maxHeight: '88%', borderTopWidth: 1, borderColor: Colors.border },
  closeBtn:    { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  typePill:    { backgroundColor: Colors.primary + '22', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: Colors.primary },
  typeText:    { fontSize: 9, fontFamily: Fonts.heading, color: Colors.primary, letterSpacing: 0.5 },
  diffPill:    { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  diffText:    { fontSize: 9, fontFamily: Fonts.heading, letterSpacing: 0.5 },
  pledgeBox:   { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 16, borderLeftWidth: 3, borderLeftColor: Colors.border },
  impactRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 14 },
  claimedBanner: { backgroundColor: Colors.primaryLight, borderRadius: Radius.md, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.primary },
})

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 20, gap: 12 },
})
