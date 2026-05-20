import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, Text, View } from "react-native";
import AppLogo from "@/components/AppLogo";
import Background from "@/components/Background";
import SwipeToComplete from "@/components/SwipeToComplete";
import {
	BodyText,
	EmptyState,
	Heading,
	MutedText,
	PillBadge,
	SectionTitle,
} from "@/components/ui";
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
	}, [session, fetchTodaysAction, fetchStreak]);

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
		<View className="flex-1">
			<Background />
			<ScrollView
				contentContainerStyle={{ paddingBottom: 40 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Header */}
				<View
					style={{
						paddingHorizontal: 24,
						paddingTop: 60,
						paddingBottom: 24,
						gap: 14,
					}}
				>
					<View className="flex-row items-center justify-between">
						<AppLogo size="sm" />
						<View style={{ alignItems: "flex-end", gap: 4 }}>
							<View
								className="rounded-full px-3 py-[5] border"
								style={{
									backgroundColor: `${Colors.xpGold}20`,
									borderColor: `${Colors.xpGold}40`,
								}}
							>
								<Text
									style={{
										fontSize: 13,
										fontFamily: Fonts.heading,
										color: Colors.xpGold,
									}}
								>
									⭐ {profile?.xp ?? 0} XP
								</Text>
							</View>
							<View
								className="rounded-full px-3 py-[5] border"
								style={{
									backgroundColor: Colors.kindGemLight,
									borderColor: `${Colors.kindGem}40`,
								}}
							>
								<Text
									style={{
										fontSize: 13,
										fontFamily: Fonts.heading,
										color: Colors.kindGem,
									}}
								>
									💎 {profile?.kind_gems ?? 0}
								</Text>
							</View>
						</View>
					</View>

					<PillBadge label="MISSION: ACT" />
					<Heading className="text-lg">
						Agent {profile?.avatar_url} {profile?.username ?? ""}
					</Heading>
					<MutedText className="text-xs">
						Rank: {levelName} · Lv.{profile?.level}
					</MutedText>

					<View className="flex-row items-center gap-3">
						<View
							className="flex-row items-center gap-[6] rounded-full px-[14] py-2"
							style={{ backgroundColor: `${Colors.streakOrange}28` }}
						>
							<Text style={{ fontSize: 18 }}>🔥</Text>
							<Text
								style={{
									fontSize: 20,
									fontFamily: Fonts.heading,
									color: Colors.streakOrange,
								}}
							>
								{streak?.current_streak ?? 0}
							</Text>
							<BodyText
								className="text-sm"
								style={{ color: Colors.streakOrange }}
							>
								day streak
							</BodyText>
						</View>
						<MutedText className="text-sm">
							Best: {streak?.longest_streak ?? 0}
						</MutedText>
					</View>
				</View>

				{/* Daily Mission */}
				<View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 12 }}>
					<SectionTitle>🌍 Daily Mission</SectionTitle>
					{loading ? (
						<View
							className="rounded-xl bg-surface"
							style={{ height: 260, borderRadius: Radius.xl }}
						/>
					) : todaysAction ? (
						<View
							style={[
								{
									backgroundColor: Colors.surfaceDark,
									borderRadius: Radius.xl,
									padding: 22,
									gap: 12,
									borderWidth: isCarbon ? 1.5 : 1,
									borderColor: isCarbon ? Colors.primary : Colors.border,
								},
								Shadow.md,
							]}
						>
							<View className="flex-row items-center justify-between">
								<Text style={{ fontSize: 40 }}>
									{CATEGORY_EMOJI[todaysAction.category] ?? "🌍"}
								</Text>
								<View
									className="rounded-full px-3 py-1"
									style={{ backgroundColor: Colors.primaryLight }}
								>
									<Text
										style={{
											fontSize: 11,
											fontFamily: Fonts.heading,
											color: Colors.primary,
											textTransform: "uppercase",
											letterSpacing: 0.5,
										}}
									>
										{todaysAction.category}
									</Text>
								</View>
							</View>
							<Heading className="text-2xl" style={{ lineHeight: 30 }}>
								{todaysAction.title}
							</Heading>
							<BodyText className="text-md" style={{ lineHeight: 22 }}>
								{todaysAction.description}
							</BodyText>
							<View className="flex-row justify-between bg-surface rounded-md p-3">
								<MutedText className="text-sm">Impact per person</MutedText>
								<Heading className="text-sm text-primary">
									{todaysAction.co2_equivalent > 0
										? `~${todaysAction.co2_equivalent}kg CO₂`
										: todaysAction.impact_unit}
								</Heading>
							</View>
							<View className="items-center" style={{ marginTop: 4 }}>
								<SwipeToComplete
									onComplete={handleComplete}
									disabled={isCarbon || completing}
								/>
								{xpOpacity && (
									<Animated.Text
										style={{
											position: "absolute",
											fontSize: 20,
											fontFamily: Fonts.heading,
											opacity: xpOpacity,
											transform: [{ translateY: xpY }],
											color: Colors.xpGold,
										}}
									>
										+XP ⭐
									</Animated.Text>
								)}
							</View>
						</View>
					) : (
						<EmptyState
							emoji="☀️"
							title=""
							hint="No mission briefing yet — check back soon, Agent."
						/>
					)}
				</View>

				{/* Community Op */}
				{(todaysCommunityAction || loading) && (
					<View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 12 }}>
						<SectionTitle>💎 Community Op</SectionTitle>
						{loading ? (
							<View
								className="rounded-xl bg-surface"
								style={{ height: 180, borderRadius: Radius.xl }}
							/>
						) : (
							<View
								style={[
									{
										backgroundColor: "rgba(30,50,80,0.7)",
										borderRadius: Radius.xl,
										padding: 22,
										gap: 12,
										borderWidth: isCommunity ? 1.5 : 1,
										borderColor: isCommunity
											? Colors.kindGem
											: `${Colors.kindGem}40`,
									},
									Shadow.md,
								]}
							>
								<View className="flex-row items-center justify-between">
									<Text style={{ fontSize: 40 }}>🤝</Text>
									<View
										className="rounded-full px-3 py-1 border"
										style={{
											backgroundColor: Colors.kindGemLight,
											borderColor: `${Colors.kindGem}50`,
										}}
									>
										<Text
											style={{
												fontSize: 13,
												fontFamily: Fonts.heading,
												color: Colors.kindGem,
											}}
										>
											+{todaysCommunityAction?.gem_reward} 💎
										</Text>
									</View>
								</View>
								<Heading className="text-xl" style={{ lineHeight: 26 }}>
									{todaysCommunityAction?.title}
								</Heading>
								<BodyText className="text-md" style={{ lineHeight: 22 }}>
									{todaysCommunityAction?.description}
								</BodyText>
								<View className="items-center" style={{ marginTop: 4 }}>
									<SwipeToComplete
										onComplete={handleCompleteComm}
										disabled={isCommunity || completingComm}
										color="blue"
									/>
									{gemOpacity && (
										<Animated.Text
											style={{
												position: "absolute",
												fontSize: 20,
												fontFamily: Fonts.heading,
												opacity: gemOpacity,
												transform: [{ translateY: gemY }],
												color: Colors.kindGem,
											}}
										>
											+{todaysCommunityAction?.gem_reward} 💎
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
					style={{
						backgroundColor: Colors.accentLight,
						borderColor: `${Colors.accent}30`,
					}}
				>
					<Text style={{ fontSize: 22, marginTop: 1 }}>💡</Text>
					<BodyText className="flex-1 text-sm" style={{ lineHeight: 20 }}>
						Every mission you complete is multiplied by every agent doing the
						same. You're never operating alone.
					</BodyText>
				</View>
			</ScrollView>
		</View>
	);
}
