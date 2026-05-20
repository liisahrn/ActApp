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
