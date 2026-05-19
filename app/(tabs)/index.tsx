import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, View } from "react-native";
import AppLogo from "@/components/AppLogo";
import Background from "@/components/Background";
import SwipeToComplete from "@/components/SwipeToComplete";
import { S } from "@/constants/styles";
import { Colors, Fonts, LEVEL_NAMES, Radius, Shadow } from "@/constants/theme";
import { useActionStore } from "@/store/actionStore";
import { useAuthStore } from "@/store/authStore";

const CATEGORY_EMOJI: Record<string, string> = {
	energy: "⚡",
	transport: "🚲",
	food: "🥗",
	social: "💚",
	waste: "♻️",
	water: "💧",
	nature: "🌿",
	community: "🤝",
};

export default function TodayScreen() {
	const { session, profile } = useAuthStore();
	const {
		todaysAction,
		todaysCommunityAction,
		streak,
		hasCompletedToday,
		hasCompletedCommunityToday,
		loading,
		fetchTodaysAction,
		fetchStreak,
		completeAction,
		completeCommunityAction,
	} = useActionStore();

	const [completing, setCompleting] = useState(false);
	const [completingComm, setCompletingComm] = useState(false);
	const [justCompleted, setJustCompleted] = useState(false);
	const [justCompletedComm, setJustCompletedComm] = useState(false);
	const xpOpacity = useRef(new Animated.Value(0)).current;
	const xpY = useRef(new Animated.Value(0)).current;
	const gemOpacity = useRef(new Animated.Value(0)).current;
	const gemY = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		fetchTodaysAction();
		if (session?.user?.id) fetchStreak(session.user.id);
	}, [session]);

	const popAnimation = (opacity: Animated.Value, y: Animated.Value) => {
		opacity.setValue(0);
		y.setValue(0);
		Animated.parallel([
			Animated.timing(opacity, {
				toValue: 1,
				duration: 300,
				useNativeDriver: true,
			}),
			Animated.timing(y, {
				toValue: -40,
				duration: 800,
				useNativeDriver: true,
			}),
		]).start(() =>
			Animated.timing(opacity, {
				toValue: 0,
				duration: 400,
				useNativeDriver: true,
			}).start(),
		);
	};

	const handleComplete = async () => {
		if (!session?.user?.id || !todaysAction || hasCompletedToday || completing)
			return;
		setCompleting(true);
		await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
		await completeAction(session.user.id, todaysAction.id);
		setJustCompleted(true);
		popAnimation(xpOpacity, xpY);
		setCompleting(false);
		setTimeout(() => router.push("/impact-report"), 1500);
	};

	const handleCompleteComm = async () => {
		if (
			!session?.user?.id ||
			!todaysCommunityAction ||
			hasCompletedCommunityToday ||
			completingComm
		)
			return;
		setCompletingComm(true);
		await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
		await completeCommunityAction(session.user.id, todaysCommunityAction.id);
		setJustCompletedComm(true);
		popAnimation(gemOpacity, gemY);
		setCompletingComm(false);
	};

	const levelName =
		LEVEL_NAMES[Math.min((profile?.level ?? 1) - 1, LEVEL_NAMES.length - 1)];
	const isCarbon = hasCompletedToday || justCompleted;
	const isCommunity = hasCompletedCommunityToday || justCompletedComm;

	return (
		<View style={S.fill}>
			<Background />
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				{/* Header */}
				<View style={styles.header}>
					<View style={[S.row, { justifyContent: "space-between" }]}>
						<AppLogo size="sm" />
						<View style={{ alignItems: "flex-end", gap: 4 }}>
							<View style={styles.xpPill}>
								<Text style={styles.xpText}>⭐ {profile?.xp ?? 0} XP</Text>
							</View>
							<View style={styles.gemPill}>
								<Text style={styles.gemText}>💎 {profile?.kind_gems ?? 0}</Text>
							</View>
						</View>
					</View>

					<View style={S.missionBadge}>
						<Text style={S.missionBadgeText}>MISSION: ACT</Text>
					</View>
					<Text style={[S.heading, { fontSize: Fonts.sizes.lg }]}>
						Agent {profile?.avatar_url} {profile?.username ?? ""}
					</Text>
					<Text style={[S.muted, { fontSize: Fonts.sizes.xs }]}>
						Rank: {levelName} · Lv.{profile?.level}
					</Text>

					<View style={[S.row, { gap: 12 }]}>
						<View style={styles.streakBadge}>
							<Text style={{ fontSize: 18 }}>🔥</Text>
							<Text style={styles.streakNum}>
								{streak?.current_streak ?? 0}
							</Text>
							<Text
								style={[
									S.body,
									{ fontSize: Fonts.sizes.sm, color: Colors.streakOrange },
								]}
							>
								day streak
							</Text>
						</View>
						<Text style={[S.muted, { fontSize: Fonts.sizes.sm }]}>
							Best: {streak?.longest_streak ?? 0}
						</Text>
					</View>
				</View>

				{/* ── Climate Action ─────────────────────────────────── */}
				<View style={styles.section}>
					<Text style={S.sectionTitle}>🌍 Daily Mission</Text>
					{loading ? (
						<View style={styles.skeleton} />
					) : todaysAction ? (
						<View style={[styles.actionCard, isCarbon && styles.cardDoneGreen]}>
							<View style={[S.row, { justifyContent: "space-between" }]}>
								<Text style={{ fontSize: 40 }}>
									{CATEGORY_EMOJI[todaysAction.category] ?? "🌍"}
								</Text>
								<View style={styles.categoryTag}>
									<Text style={styles.categoryTagText}>
										{todaysAction.category}
									</Text>
								</View>
							</View>
							<Text
								style={[
									S.heading,
									{ fontSize: Fonts.sizes.xxl, lineHeight: 30 },
								]}
							>
								{todaysAction.title}
							</Text>
							<Text
								style={[S.body, { fontSize: Fonts.sizes.md, lineHeight: 22 }]}
							>
								{todaysAction.description}
							</Text>
							<View style={styles.impactRow}>
								<Text style={[S.muted, { fontSize: Fonts.sizes.sm }]}>
									Impact per person
								</Text>
								<Text
									style={[
										S.heading,
										{ fontSize: Fonts.sizes.sm, color: Colors.primary },
									]}
								>
									{todaysAction.co2_equivalent > 0
										? `~${todaysAction.co2_equivalent}kg CO₂`
										: todaysAction.impact_unit}
								</Text>
							</View>
							<View style={{ alignItems: "center", marginTop: 4 }}>
								<SwipeToComplete
									onComplete={handleComplete}
									disabled={isCarbon || completing}
								/>
								{xpOpacity && (
									<Animated.Text
										style={[
											styles.popup,
											{
												opacity: xpOpacity,
												transform: [{ translateY: xpY }],
												color: Colors.xpGold,
											},
										]}
									>
										+XP ⭐
									</Animated.Text>
								)}
							</View>
						</View>
					) : (
						<View style={styles.emptyCard}>
							<Text style={{ fontSize: 48 }}>☀️</Text>
							<Text style={[S.body, { textAlign: "center", lineHeight: 22 }]}>
								No mission briefing yet — check back soon, Agent.
							</Text>
						</View>
					)}
				</View>

				{/* ── Community Quest ────────────────────────────────── */}
				{(todaysCommunityAction || loading) && (
					<View style={styles.section}>
						<Text style={S.sectionTitle}>💎 Community Op</Text>
						{loading ? (
							<View style={[styles.skeleton, { height: 180 }]} />
						) : (
							<View
								style={[
									styles.communityCard,
									isCommunity && styles.cardDoneBlue,
								]}
							>
								<View style={[S.row, { justifyContent: "space-between" }]}>
									<Text style={{ fontSize: 40 }}>🤝</Text>
									<View style={styles.gemRewardTag}>
										<Text style={styles.gemRewardText}>
											+{todaysCommunityAction!.gem_reward} 💎
										</Text>
									</View>
								</View>
								<Text
									style={[
										S.heading,
										{ fontSize: Fonts.sizes.xl, lineHeight: 26 },
									]}
								>
									{todaysCommunityAction!.title}
								</Text>
								<Text
									style={[S.body, { fontSize: Fonts.sizes.md, lineHeight: 22 }]}
								>
									{todaysCommunityAction!.description}
								</Text>
								<View style={{ alignItems: "center", marginTop: 4 }}>
									<SwipeToComplete
										onComplete={handleCompleteComm}
										disabled={isCommunity || completingComm}
										color="blue"
									/>
									{gemOpacity && (
										<Animated.Text
											style={[
												styles.popup,
												{
													opacity: gemOpacity,
													transform: [{ translateY: gemY }],
													color: Colors.kindGem,
												},
											]}
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
				<View style={styles.tipCard}>
					<Text style={{ fontSize: 22, marginTop: 1 }}>💡</Text>
					<Text
						style={[
							S.body,
							{ flex: 1, fontSize: Fonts.sizes.sm, lineHeight: 20 },
						]}
					>
						Every mission you complete is multiplied by every agent doing the
						same. You're never operating alone.
					</Text>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	content: { paddingBottom: 40 },
	header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24, gap: 14 },

	// ── Stat pills ───────────────────────────────────────────────
	xpPill: {
		backgroundColor: Colors.xpGold + "20",
		borderRadius: Radius.full,
		paddingHorizontal: 12,
		paddingVertical: 5,
		borderWidth: 1,
		borderColor: Colors.xpGold + "40",
	},
	xpText: {
		fontSize: Fonts.sizes.sm,
		fontFamily: Fonts.heading,
		color: Colors.xpGold,
	},
	gemPill: {
		backgroundColor: Colors.kindGemLight,
		borderRadius: Radius.full,
		paddingHorizontal: 12,
		paddingVertical: 5,
		borderWidth: 1,
		borderColor: Colors.kindGem + "40",
	},
	gemText: {
		fontSize: Fonts.sizes.sm,
		fontFamily: Fonts.heading,
		color: Colors.kindGem,
	},
	streakBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor: Colors.streakOrange + "28",
		borderRadius: Radius.full,
		paddingHorizontal: 14,
		paddingVertical: 8,
	},
	streakNum: {
		fontSize: Fonts.sizes.xl,
		fontFamily: Fonts.heading,
		color: Colors.streakOrange,
	},

	// ── Cards ────────────────────────────────────────────────────
	section: { paddingHorizontal: 20, paddingTop: 20, gap: 12 },
	skeleton: {
		height: 260,
		borderRadius: Radius.xl,
		backgroundColor: Colors.surface,
	},
	actionCard: {
		backgroundColor: Colors.surfaceDark,
		borderRadius: Radius.xl,
		padding: 22,
		gap: 12,
		...Shadow.md,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	communityCard: {
		backgroundColor: "rgba(30,50,80,0.7)",
		borderRadius: Radius.xl,
		padding: 22,
		gap: 12,
		...Shadow.md,
		borderWidth: 1,
		borderColor: Colors.kindGem + "40",
	},
	cardDoneGreen: { borderColor: Colors.primary, borderWidth: 1.5 },
	cardDoneBlue: { borderColor: Colors.kindGem, borderWidth: 1.5 },
	emptyCard: {
		alignItems: "center",
		padding: 40,
		gap: 12,
		backgroundColor: Colors.surfaceDark,
		borderRadius: Radius.xl,
		borderWidth: 1,
		borderColor: Colors.border,
	},

	// ── Action details ───────────────────────────────────────────
	categoryTag: {
		backgroundColor: Colors.primaryLight,
		borderRadius: Radius.full,
		paddingHorizontal: 12,
		paddingVertical: 4,
	},
	categoryTagText: {
		fontSize: Fonts.sizes.xs,
		fontFamily: Fonts.heading,
		color: Colors.primary,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	gemRewardTag: {
		backgroundColor: Colors.kindGemLight,
		borderRadius: Radius.full,
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderWidth: 1,
		borderColor: Colors.kindGem + "50",
	},
	gemRewardText: {
		fontSize: Fonts.sizes.sm,
		fontFamily: Fonts.heading,
		color: Colors.kindGem,
	},
	impactRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		backgroundColor: Colors.surface,
		borderRadius: Radius.md,
		padding: 12,
	},
	popup: {
		position: "absolute",
		fontSize: Fonts.sizes.xl,
		fontFamily: Fonts.heading,
	},

	// ── Tip ─────────────────────────────────────────────────────
	tipCard: {
		margin: 20,
		marginTop: 12,
		flexDirection: "row",
		gap: 12,
		backgroundColor: Colors.accentLight,
		borderRadius: Radius.lg,
		padding: 16,
		alignItems: "flex-start",
		borderWidth: 1,
		borderColor: Colors.accent + "30",
	},
});
