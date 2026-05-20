import * as Haptics from "expo-haptics";
import { useState } from "react";
import {
	Alert,
	Modal,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { Colors, Fonts, Radius, Shadow } from "@/constants/theme";
import { type Mission, useActionStore } from "@/store/actionStore";
import { useAuthStore } from "@/store/authStore";
import { PrimaryButton } from "./ui/PrimaryButton";
import { SectionTitle } from "./ui/SectionTitle";

const DIFFICULTY_COLOR = {
	easy: Colors.primary,
	medium: Colors.xpGold,
	hard: Colors.streakOrange,
};
const CATEGORY_EMOJI: Record<string, string> = {
	transport: "🚲",
	food: "🥗",
	energy: "💡",
	water: "🚿",
	waste: "♻️",
	nature: "🌿",
	community: "🤝",
};

function ProgressDots({
	count,
	goal,
	color,
}: {
	count: number;
	goal: number;
	color: string;
}) {
	return (
		<View className="flex-row items-center flex-wrap gap-1">
			{Array.from({ length: goal }, (_, i) => i).map((dot) => (
				<View
					key={dot}
					style={{
						width: 8,
						height: 8,
						borderRadius: 4,
						borderWidth: 1,
						backgroundColor: dot < count ? color : Colors.surface,
						borderColor: dot < count ? color : Colors.border,
					}}
				/>
			))}
		</View>
	);
}

function MissionModal({
	mission,
	onClose,
	onPledge,
	onLog,
	onClaim,
}: {
	mission: Mission;
	onClose: () => void;
	onPledge: () => void;
	onLog: () => void;
	onClaim: () => void;
}) {
	const t = new Date().toISOString().split("T")[0];
	const alreadyLoggedToday = mission.last_logged_date === t;
	const diffColor = DIFFICULTY_COLOR[mission.difficulty];
	const accentColor = mission.gem_reward > 0 ? Colors.kindGem : Colors.primary;
	const daysLeft = Math.max(
		0,
		Math.ceil((new Date(mission.end_date).getTime() - Date.now()) / 86400000),
	);
	const rewardText =
		mission.xp_reward > 0
			? `⭐ ${mission.xp_reward} XP`
			: `💎 ${mission.gem_reward}`;
	const pct = mission.pledged ? mission.count / mission.goal_count : 0;

	return (
		<Modal visible animationType="slide" transparent onRequestClose={onClose}>
			<View
				className="flex-1 justify-end"
				style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
			>
				<View
					className="border-t border-border"
					style={{
						backgroundColor: "#101E11",
						borderTopLeftRadius: 28,
						borderTopRightRadius: 28,
						padding: 24,
						paddingBottom: 36,
						maxHeight: "88%",
					}}
				>
					<ScrollView
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ gap: 16, paddingBottom: 8 }}
					>
						<View className="flex-row items-start justify-between">
							<View className="flex-row gap-[10] flex-1">
								<Text
									style={{
										fontSize: 44,
										opacity: mission.pledged ? 0.4 + 0.6 * pct : 0.3,
									}}
								>
									{mission.badge_emoji}
								</Text>
								<View style={{ gap: 5, flex: 1 }}>
									<View className="flex-row gap-[6] flex-wrap">
										<View
											className="rounded-full px-2 py-[3] border"
											style={{
												backgroundColor:
													mission.mission_type === "monthly"
														? `${Colors.accent}22`
														: `${Colors.primary}22`,
												borderColor:
													mission.mission_type === "monthly"
														? Colors.accent
														: Colors.primary,
											}}
										>
											<Text
												style={{
													fontSize: 9,
													fontFamily: Fonts.heading,
													letterSpacing: 0.5,
													color:
														mission.mission_type === "monthly"
															? Colors.accent
															: Colors.primary,
												}}
											>
												{mission.mission_type.toUpperCase()}
											</Text>
										</View>
										<View
											className="rounded-full px-2 py-[3] border"
											style={{ borderColor: diffColor }}
										>
											<Text
												style={{
													fontSize: 9,
													fontFamily: Fonts.heading,
													letterSpacing: 0.5,
													color: diffColor,
												}}
											>
												{mission.difficulty.toUpperCase()}
											</Text>
										</View>
									</View>
									<Text className="font-body text-muted text-xs">
										{daysLeft} days left · {rewardText}
									</Text>
								</View>
							</View>
							<TouchableOpacity
								onPress={onClose}
								className="w-8 h-8 items-center justify-center"
							>
								<Text style={{ color: Colors.textMuted, fontSize: 18 }}>✕</Text>
							</TouchableOpacity>
						</View>

						<Text
							className="font-heading text-white text-2xl"
							style={{ lineHeight: 30 }}
						>
							{mission.title}
						</Text>

						<View
							className="rounded-lg p-4 border-l-[3]"
							style={{
								backgroundColor: mission.completed
									? Colors.primaryLight
									: Colors.surface,
								borderLeftColor: mission.completed
									? Colors.primary
									: Colors.border,
							}}
						>
							<Text className="font-body text-muted text-xs mb-[6]">
								{mission.completed ? "COMPLETED ✅" : "YOUR PLEDGE"}
							</Text>
							<Text
								className="font-body text-white text-md"
								style={{ lineHeight: 22 }}
							>
								"
								{mission.completed
									? mission.pledge_text_past
									: mission.pledge_text}
								"
							</Text>
						</View>

						{mission.pledged && (
							<View style={{ gap: 8 }}>
								<View className="flex-row justify-between">
									<Text className="font-body text-muted text-xs">
										{mission.completed
											? "Done!"
											: `${mission.count} of ${mission.goal_count} check-ins`}
									</Text>
									<Text className="font-body text-muted text-xs">
										{Math.round(pct * 100)}%
									</Text>
								</View>
								<ProgressDots
									count={mission.count}
									goal={mission.goal_count}
									color={accentColor}
								/>
							</View>
						)}

						<Text
							className="font-body text-secondary text-md"
							style={{ lineHeight: 23 }}
						>
							{mission.description}
						</Text>

						<View className="flex-row items-center gap-3 bg-surface rounded-md p-[14]">
							<Text style={{ fontSize: 22 }}>
								{CATEGORY_EMOJI[mission.category] ?? "🌍"}
							</Text>
							<View className="flex-1">
								<Text className="font-body text-muted text-xs">
									ESTIMATED IMPACT
								</Text>
								<Text className="font-heading text-primary text-md">
									{mission.impact_summary}
								</Text>
							</View>
						</View>
					</ScrollView>

					<View style={{ paddingTop: 16, gap: 10 }}>
						{!mission.pledged && (
							<PrimaryButton onPress={onPledge} label="Take the Pledge 🤝" />
						)}
						{mission.pledged && !mission.completed && (
							<PrimaryButton
								onPress={onLog}
								disabled={alreadyLoggedToday}
								label={
									alreadyLoggedToday ? "✅ Logged for today" : "Did it today ✓"
								}
							/>
						)}
						{mission.completed && !mission.claimed && (
							<TouchableOpacity
								className="rounded-lg py-4 items-center bg-xp-gold"
								style={Shadow.lg}
								onPress={onClaim}
								activeOpacity={0.85}
							>
								<Text className="text-black font-heading text-lg">
									Claim Reward {rewardText} 🎉
								</Text>
							</TouchableOpacity>
						)}
						{mission.claimed && (
							<View className="bg-primary-light rounded-md p-[14] items-center border border-primary">
								<Text className="font-heading text-primary text-md">
									✅ Reward Claimed!
								</Text>
							</View>
						)}
						<TouchableOpacity onPress={onClose} className="py-2">
							<Text className="font-body text-muted text-center">Close</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
}

function MissionTile({
	mission,
	onPress,
}: {
	mission: Mission;
	onPress: () => void;
}) {
	const diffColor = DIFFICULTY_COLOR[mission.difficulty];
	const accentColor = mission.gem_reward > 0 ? Colors.kindGem : Colors.primary;
	const pct = mission.pledged ? mission.count / mission.goal_count : 0;
	const daysLeft = Math.max(
		0,
		Math.ceil((new Date(mission.end_date).getTime() - Date.now()) / 86400000),
	);
	const t = new Date().toISOString().split("T")[0];
	const loggedToday = mission.last_logged_date === t;
	const emojiOpacity = mission.completed
		? 1
		: mission.pledged
			? 0.25 + 0.75 * pct
			: 0.25;

	let statusEl = null;
	if (mission.claimed)
		statusEl = (
			<Text
				style={{
					fontSize: 10,
					fontFamily: Fonts.body,
					color: Colors.textMuted,
				}}
			>
				✅ done
			</Text>
		);
	else if (mission.completed)
		statusEl = (
			<Text
				style={{ fontSize: 10, fontFamily: Fonts.body, color: Colors.xpGold }}
			>
				🎁 claim!
			</Text>
		);
	else if (loggedToday)
		statusEl = (
			<Text
				style={{ fontSize: 10, fontFamily: Fonts.body, color: Colors.primary }}
			>
				✓ logged today
			</Text>
		);
	else if (mission.pledged)
		statusEl = (
			<Text
				style={{
					fontSize: 10,
					fontFamily: Fonts.body,
					color: Colors.textMuted,
				}}
			>
				in progress
			</Text>
		);
	else
		statusEl = (
			<Text
				style={{
					fontSize: 10,
					fontFamily: Fonts.body,
					color: Colors.textMuted,
				}}
			>
				tap to pledge
			</Text>
		);

	return (
		<TouchableOpacity
			style={[
				{
					width: 148,
					backgroundColor: Colors.surfaceDark,
					borderRadius: Radius.xl,
					padding: 14,
					borderWidth:
						mission.pledged && !mission.completed
							? 1.5
							: mission.completed && !mission.claimed
								? 1.5
								: 1,
					borderColor:
						mission.pledged && !mission.completed
							? `${accentColor}60`
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
			<Text style={{ fontSize: 34, opacity: emojiOpacity, marginBottom: 6 }}>
				{mission.badge_emoji}
			</Text>
			<Text
				className="font-heading text-white text-sm"
				style={{ lineHeight: 17 }}
				numberOfLines={2}
			>
				{mission.title}
			</Text>
			<Text className="font-body text-muted text-xs" style={{ marginTop: 3 }}>
				{daysLeft}d left
			</Text>

			{mission.pledged && (
				<View style={{ marginTop: 8 }}>
					<ProgressDots
						count={mission.count}
						goal={mission.goal_count}
						color={accentColor}
					/>
				</View>
			)}

			<View
				className="self-start rounded-full px-[7] py-[2] border"
				style={{ borderColor: diffColor, marginTop: 8 }}
			>
				<Text
					style={{
						fontSize: 9,
						fontFamily: Fonts.heading,
						letterSpacing: 0.3,
						color: diffColor,
					}}
				>
					{mission.difficulty}
				</Text>
			</View>

			<View style={{ marginTop: 6 }}>{statusEl}</View>
		</TouchableOpacity>
	);
}

export default function MissionsCard() {
	const { missions, pledgeMission, logMissionDay, claimMissionReward } =
		useActionStore();
	const { session } = useAuthStore();
	const [selected, setSelected] = useState<Mission | null>(null);

	if (!missions.length) return null;
	const userId = session?.user?.id;
	const syncSelected = (id: string) =>
		setSelected(missions.find((m) => m.id === id) ?? null);

	const handlePledge = async () => {
		if (!userId || !selected) return;
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		await pledgeMission(userId, selected.id);
		syncSelected(selected.id);
	};
	const handleLog = async () => {
		if (!userId || !selected) return;
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		await logMissionDay(userId, selected.id);
		syncSelected(selected.id);
	};
	const handleClaim = async () => {
		if (!userId || !selected) return;
		await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
		const { xpEarned, gemsEarned } = await claimMissionReward(
			userId,
			selected.id,
		);
		syncSelected(selected.id);
		const reward = xpEarned > 0 ? `+${xpEarned} XP ⭐` : `+${gemsEarned} 💎`;
		Alert.alert(
			"Reward Claimed! 🎉",
			`You earned ${reward} for completing this mission.`,
		);
	};

	const weekly = missions.filter((m) => m.mission_type === "weekly");
	const monthly = missions.filter((m) => m.mission_type === "monthly");

	return (
		<View className="px-5 pt-5 gap-3">
			{weekly.length > 0 && (
				<>
					<View className="flex-row items-center justify-between">
						<SectionTitle>📅 Weekly Missions</SectionTitle>
						<Text className="font-body text-muted text-xs">
							Check in each day you do it
						</Text>
					</View>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
					>
						{weekly.map((m) => (
							<MissionTile
								key={m.id}
								mission={m}
								onPress={() => setSelected(m)}
							/>
						))}
					</ScrollView>
				</>
			)}

			{monthly.length > 0 && (
				<>
					<View
						className="flex-row items-center justify-between"
						style={{ marginTop: weekly.length > 0 ? 8 : 0 }}
					>
						<SectionTitle>🏆 Monthly Missions</SectionTitle>
						<Text className="font-body text-muted text-xs">
							Log each time you do it
						</Text>
					</View>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
					>
						{monthly.map((m) => (
							<MissionTile
								key={m.id}
								mission={m}
								onPress={() => setSelected(m)}
							/>
						))}
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
	);
}
