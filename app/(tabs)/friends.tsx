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
      <Card row className={`gap-3 p-[14] ${isMe ? 'border-primary border-[1.5]' : ''}`}>
        <Text style={{ fontFamily: Fonts.heading, color: Colors.textSecondary, fontSize: 17, width: 32, textAlign: 'center' }}>{medal}</Text>
        <Text style={{ fontSize: 26 }}>{item.avatar_url}</Text>
        <View className="flex-1">
          <Heading className="text-md">{item.username}{isMe ? ' · you' : ''}</Heading>
          <MutedText className="text-xs mt-[2]">Lv.{item.level} · 🔥{item.current_streak}{item.country ? ` · ${item.country}` : ''}</MutedText>
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
              className="flex-1 py-[10] rounded-md items-center border"
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
            <View key={item.id} className="flex-row items-center gap-[10] p-3 border-b border-border-light">
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
