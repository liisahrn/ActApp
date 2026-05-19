import { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	TextInput,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { S } from "@/constants/styles";
import Background from "@/components/Background";

type LeaderboardUser = {
	id: string;
	username: string;
	avatar_url: string;
	xp: number;
	level: number;
	current_streak: number;
	country: string | null;
};
type Tab = "friends" | "global";

export default function FriendsScreen() {
	const { session } = useAuthStore();
	const [activeTab, setActiveTab] = useState<Tab>("friends");
	const [friendLeaderboard, setFriendLB] = useState<LeaderboardUser[]>([]);
	const [globalLeaderboard, setGlobalLB] = useState<LeaderboardUser[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<LeaderboardUser[]>([]);
	const [following, setFollowing] = useState<Set<string>>(new Set());

	useEffect(() => {
		if (!session?.user?.id) return;
		fetchFriendLeaderboard();
		fetchGlobalLeaderboard();
	}, [session]);

	const enrichWithStreaks = async (
		profiles: any[],
	): Promise<LeaderboardUser[]> => {
		if (!profiles.length) return [];
		const { data } = await supabase
			.from("streaks")
			.select("user_id, current_streak")
			.in(
				"user_id",
				profiles.map((p) => p.id),
			);
		const map: Record<string, number> = {};
		data?.forEach((s) => {
			map[s.user_id] = s.current_streak;
		});
		return profiles.map((p) => ({ ...p, current_streak: map[p.id] ?? 0 }));
	};

	const fetchFriendLeaderboard = async () => {
		const userId = session!.user.id;
		const { data: followData } = await supabase
			.from("friendships")
			.select("following_id")
			.eq("follower_id", userId);
		const ids = [userId, ...(followData?.map((f) => f.following_id) ?? [])];
		setFollowing(new Set(followData?.map((f) => f.following_id) ?? []));
		const { data } = await supabase
			.from("profiles")
			.select("id, username, avatar_url, xp, level, country")
			.in("id", ids)
			.order("xp", { ascending: false })
			.limit(50);
		setFriendLB(await enrichWithStreaks(data ?? []));
	};

	const fetchGlobalLeaderboard = async () => {
		const { data } = await supabase
			.from("profiles")
			.select("id, username, avatar_url, xp, level, country")
			.order("xp", { ascending: false })
			.limit(100);
		setGlobalLB(await enrichWithStreaks(data ?? []));
	};

	const searchUsers = async (q: string) => {
		if (q.length < 2) {
			setSearchResults([]);
			return;
		}
		const { data } = await supabase
			.from("profiles")
			.select("id, username, avatar_url, xp, level, country")
			.ilike("username", `%${q}%`)
			.neq("id", session?.user?.id)
			.limit(20);
		setSearchResults(await enrichWithStreaks(data ?? []));
	};

	const toggleFollow = async (targetId: string) => {
		const userId = session!.user.id;
		if (following.has(targetId)) {
			await supabase
				.from("friendships")
				.delete()
				.eq("follower_id", userId)
				.eq("following_id", targetId);
			setFollowing((prev) => {
				const next = new Set(prev);
				next.delete(targetId);
				return next;
			});
		} else {
			await supabase
				.from("friendships")
				.upsert({ follower_id: userId, following_id: targetId });
			setFollowing((prev) => new Set([...prev, targetId]));
		}
		fetchFriendLeaderboard();
	};

	const renderUser = ({
		item,
		index,
	}: {
		item: LeaderboardUser;
		index: number;
	}) => {
		const isMe = item.id === session?.user?.id;
		const medal =
			index === 0
				? "🥇"
				: index === 1
					? "🥈"
					: index === 2
						? "🥉"
						: `${index + 1}`;
		const isFollowing = following.has(item.id);
		return (
			<View style={[S.rowCard, isMe && styles.meRow]}>
				<Text style={styles.rank}>{medal}</Text>
				<Text style={{ fontSize: 26 }}>{item.avatar_url}</Text>
				<View style={S.fill}>
					<Text style={[S.heading, { fontSize: Fonts.sizes.md }]}>
						{item.username}
						{isMe ? " · you" : ""}
					</Text>
					<Text style={[S.muted, { fontSize: Fonts.sizes.xs, marginTop: 2 }]}>
						Lv.{item.level} · 🔥{item.current_streak}
						{item.country ? ` · ${item.country}` : ""}
					</Text>
				</View>
				<View style={{ alignItems: "flex-end", gap: 4 }}>
					<Text style={styles.xp}>⭐ {item.xp}</Text>
					{!isMe && (
						<TouchableOpacity
							style={[S.pillBtn, isFollowing && styles.followingBtn]}
							onPress={() => toggleFollow(item.id)}
						>
							<Text style={[S.pillBtnText, { fontSize: 10 }]}>
								{isFollowing ? "Following" : "Follow"}
							</Text>
						</TouchableOpacity>
					)}
				</View>
			</View>
		);
	};

	const data = activeTab === "friends" ? friendLeaderboard : globalLeaderboard;

	return (
		<View style={S.fill}>
			<Background />

			<View style={styles.header}>
				<Text style={[S.heading, { fontSize: Fonts.sizes.xxxl }]}>
					Agent Rankings
				</Text>
				<View style={styles.tabs}>
					{(["friends", "global"] as Tab[]).map((tab) => (
						<TouchableOpacity
							key={tab}
							style={[styles.tab, activeTab === tab && styles.tabActive]}
							onPress={() => {
								setActiveTab(tab);
								setSearchQuery("");
								setSearchResults([]);
							}}
						>
							<Text
								style={[
									S.muted,
									{ fontSize: Fonts.sizes.sm },
									activeTab === tab && styles.tabTextActive,
								]}
							>
								{tab === "friends" ? "👥 My Squad" : "🌍 Global Ops"}
							</Text>
						</TouchableOpacity>
					))}
				</View>
			</View>

			{/* Search (friends tab only) */}
			{activeTab === "friends" && (
				<View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
					<TextInput
						style={S.input}
						placeholder="Find agents by username…"
						placeholderTextColor={Colors.textMuted}
						value={searchQuery}
						autoCapitalize="none"
						onChangeText={(q) => {
							setSearchQuery(q);
							searchUsers(q);
						}}
					/>
				</View>
			)}

			{/* Search results dropdown */}
			{searchResults.length > 0 && (
				<View style={[S.card, { marginHorizontal: 20, marginBottom: 8 }]}>
					{searchResults.map((item) => (
						<View
							key={item.id}
							style={[
								S.row,
								{
									padding: 12,
									gap: 10,
									borderBottomWidth: 1,
									borderBottomColor: Colors.borderLight,
								},
							]}
						>
							<Text style={{ fontSize: 24 }}>{item.avatar_url}</Text>
							<View style={S.fill}>
								<Text style={[S.heading, { fontSize: Fonts.sizes.md }]}>
									{item.username}
								</Text>
								<Text style={[S.muted, { fontSize: Fonts.sizes.xs }]}>
									Lv.{item.level} · ⭐{item.xp}
								</Text>
							</View>
							<TouchableOpacity
								style={[
									S.pillBtn,
									following.has(item.id) && styles.followingBtn,
								]}
								onPress={() => toggleFollow(item.id)}
							>
								<Text style={[S.pillBtnText, { fontSize: 10 }]}>
									{following.has(item.id) ? "Following" : "Follow"}
								</Text>
							</TouchableOpacity>
						</View>
					))}
				</View>
			)}

			<FlatList
				data={data}
				keyExtractor={(i) => i.id}
				renderItem={renderUser}
				contentContainerStyle={{ padding: 20, gap: 8 }}
				ListEmptyComponent={
					<View style={S.empty}>
						<Text style={S.emptyEmoji}>
							{activeTab === "friends" ? "👥" : "🌍"}
						</Text>
						<Text style={S.emptyText}>
							{activeTab === "friends" ? "No agents yet!" : "No data yet"}
						</Text>
						<Text style={S.emptyHint}>
							{activeTab === "friends"
								? "Search above to find and follow fellow agents."
								: "Be the first agent to deploy!"}
						</Text>
					</View>
				}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12, gap: 16 },
	tabs: { flexDirection: "row", gap: 8 },
	tab: {
		flex: 1,
		paddingVertical: 10,
		borderRadius: Radius.md,
		backgroundColor: Colors.surface,
		borderWidth: 1,
		borderColor: Colors.border,
		alignItems: "center",
	},
	tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
	tabTextActive: { color: "#fff", fontFamily: Fonts.heading },
	meRow: { borderColor: Colors.primary, borderWidth: 1.5 },
	rank: {
		fontFamily: Fonts.heading,
		color: Colors.textSecondary,
		fontSize: Fonts.sizes.lg,
		width: 32,
		textAlign: "center",
	},
	xp: {
		fontFamily: Fonts.heading,
		fontSize: Fonts.sizes.sm,
		color: Colors.xpGold,
	},
	followingBtn: {
		backgroundColor: Colors.surface,
		borderWidth: 1,
		borderColor: Colors.primary,
	},
});
