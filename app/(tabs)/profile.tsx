import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Background from "@/components/Background";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Heading } from "@/components/ui/Heading";
import { MutedText } from "@/components/ui/MutedText";
import { SectionTitle } from "@/components/ui/SectionTitle";
import {
	Colors,
	Fonts,
	LEVEL_NAMES,
	Radius,
	XP_PER_LEVEL,
} from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

type Badge = {
	id: string;
	name: string;
	description: string;
	category: string;
	image_url: string | null;
	condition_type: string;
	condition_value: number;
	earned: boolean;
	earned_at?: string;
};

export default function ProfileScreen() {
	const { session, profile, signOut } = useAuthStore();
	const [badges, setBadges] = useState<Badge[]>([]);
	const [streak, setStreak] = useState({ current: 0, longest: 0 });
	const [totalCompletions, setCompletions] = useState(0);
	const [totalCO2, setCO2] = useState(0);

	// biome-ignore lint/correctness/useExhaustiveDependencies: fetchBadges and fetchStats are defined in component scope; session is the correct trigger
	useEffect(() => {
		if (session?.user?.id) {
			fetchBadges();
			fetchStats();
		}
	}, [session]);

	const fetchBadges = async () => {
		const userId = session?.user.id;
		const [{ data: all }, { data: earned }] = await Promise.all([
			supabase.from("badges").select("*"),
			supabase
				.from("user_badges")
				.select("badge_id, earned_at")
				.eq("user_id", userId),
		]);
		const earnedMap: Record<string, string> = {};
		earned?.forEach((e) => {
			earnedMap[e.badge_id] = e.earned_at;
		});
		setBadges(
			(all ?? []).map((b) => ({
				...b,
				earned: !!earnedMap[b.id],
				earned_at: earnedMap[b.id],
			})),
		);
	};

	const fetchStats = async () => {
		const userId = session?.user.id;
		const { data: s } = await supabase
			.from("streaks")
			.select("current_streak, longest_streak")
			.eq("user_id", userId)
			.maybeSingle();
		if (s)
			setStreak({ current: s.current_streak, longest: s.longest_streak });
		const { count } = await supabase
			.from("completions")
			.select("*", { count: "exact", head: true })
			.eq("user_id", userId);
		setCompletions(count ?? 0);
		const { data: completionData } = await supabase
			.from("completions")
			.select("action_id")
			.eq("user_id", userId);
		if (completionData?.length) {
			const { data: actions } = await supabase
				.from("actions")
				.select("co2_equivalent")
				.in(
					"id",
					completionData.map((c) => c.action_id),
				);
			setCO2(
				Math.round(
					(actions?.reduce(
						(sum, a) => sum + (a.co2_equivalent ?? 0),
						0,
					) ?? 0) * 10,
				) / 10,
			);
		}
	};

	const handleSignOut = () =>
		Alert.alert("Sign out", "Are you sure?", [
			{ text: "Cancel", style: "cancel" },
			{ text: "Sign out", style: "destructive", onPress: signOut },
		]);

	const level = profile?.level ?? 1;
	const xp = profile?.xp ?? 0;
	const levelName = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
	const currentXP = XP_PER_LEVEL[level - 1] ?? 0;
	const nextXP = XP_PER_LEVEL[level] ?? XP_PER_LEVEL[XP_PER_LEVEL.length - 1];
	const progress = Math.min((xp - currentXP) / (nextXP - currentXP), 1);
	const earnedBadges = badges.filter((b) => b.earned);
	const lockedBadges = badges.filter((b) => !b.earned);
	const STATS = [
		{ emoji: "🔥", value: streak.current, label: "Streak" },
		{ emoji: "✅", value: totalCompletions, label: "Missions" },
		{ emoji: "🌍", value: `${totalCO2}kg`, label: "CO₂ saved" },
		{ emoji: "⭐", value: xp, label: "Total XP" },
	];

	return (
		<View className="flex-1">
			<Background />
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 110 }}
			>
				<View
					className="items-center gap-2 px-7"
					style={{ paddingTop: 60, paddingBottom: 28 }}
				>
					<Text style={{ fontSize: 72, marginBottom: 4 }}>
						{profile?.avatar_url ?? "🌱"}
					</Text>
					<Heading className="text-2xl">@{profile?.username}</Heading>
					<View className="bg-primary-light rounded-full px-[14] py-1">
						<Text
							style={{
								fontSize: 13,
								fontFamily: Fonts.heading,
								color: Colors.primary,
							}}
						>
							Rank: {levelName} · Lv.{level}
						</Text>
					</View>
					<View className="w-full gap-[6] mt-2">
						<View
							className="w-full overflow-hidden"
							style={{
								height: 10,
								backgroundColor: Colors.surface,
								borderRadius: Radius.full,
							}}
						>
							<View
								style={{
									height: "100%",
									width: `${progress * 100}%`,
									backgroundColor: Colors.primary,
									borderRadius: Radius.full,
								}}
							/>
						</View>
						<MutedText className="text-xs text-right">
							{xp} / {nextXP} XP
						</MutedText>
					</View>
				</View>

				<View className="flex-row gap-2 px-5 mt-1">
					{STATS.map((s) => (
						<Card
							key={s.label}
							className="flex-1 p-3 items-center gap-1"
						>
							<Text style={{ fontSize: 20 }}>{s.emoji}</Text>
							<Heading className="text-lg">{s.value}</Heading>
							<MutedText className="text-[10] text-center">
								{s.label}
							</MutedText>
						</Card>
					))}
				</View>

				<View className="p-5 gap-[14]">
					<SectionTitle>
						Badges{" "}
						{earnedBadges.length > 0
							? `(${earnedBadges.length})`
							: ""}
					</SectionTitle>
					{badges.length === 0 ? (
						<EmptyState
							emoji="🎖️"
							title=""
							hint="Complete missions to earn badges!"
							className="pt-8"
						/>
					) : (
						<>
							<View className="flex-row flex-wrap gap-[10]">
								{earnedBadges.map((b) => (
									<Card
										key={b.id}
										className="p-3 items-center gap-1"
										style={{ width: "30%" }}
									>
										<Text style={{ fontSize: 32 }}>
											{b.image_url ?? "🎖️"}
										</Text>
										<Heading className="text-xs text-center">
											{b.name}
										</Heading>
										<MutedText
											className="text-[10] text-center"
											style={{ lineHeight: 14 }}
										>
											{b.description}
										</MutedText>
									</Card>
								))}
							</View>
							{lockedBadges.length > 0 && (
								<>
									<MutedText className="text-sm mt-1">
										Locked
									</MutedText>
									<View className="flex-row flex-wrap gap-[10]">
										{lockedBadges.map((b) => (
											<Card
												key={b.id}
												className="p-3 items-center gap-1 opacity-45"
												style={{ width: "30%" }}
											>
												<Text
													style={{
														fontSize: 32,
														opacity: 0.5,
													}}
												>
													🔒
												</Text>
												<MutedText className="text-xs text-center">
													{b.name}
												</MutedText>
												<MutedText
													className="text-[10] text-center"
													style={{ lineHeight: 14 }}
												>
													{b.description}
												</MutedText>
											</Card>
										))}
									</View>
								</>
							)}
						</>
					)}
				</View>

				<TouchableOpacity
					className="mx-5 mt-2 p-[14] rounded-lg border items-center"
					style={{ borderWidth: 1.5, borderColor: Colors.error }}
					onPress={handleSignOut}
				>
					<Text
						style={{
							color: Colors.error,
							fontFamily: Fonts.heading,
							fontSize: 15,
						}}
					>
						Sign out
					</Text>
				</TouchableOpacity>
			</ScrollView>
		</View>
	);
}
