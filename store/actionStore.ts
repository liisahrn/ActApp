import { create } from "zustand";
import { supabase } from "@/lib/supabase";

type Action = {
	id: string;
	title: string;
	description: string;
	category: string;
	action_type: "carbon" | "community";
	co2_equivalent: number;
	impact_unit: string;
	gem_reward: number;
	publish_date: string;
};

type ImpactReport = {
	id: string;
	action_id: string;
	date: string;
	total_completions: number;
	co2_saved_kg: number;
	generated_image_url: string | null;
};

type Streak = {
	current_streak: number;
	longest_streak: number;
	last_completion_date: string | null;
};

export type Mission = {
	id: string;
	title: string;
	pledge_text: string;
	pledge_text_past: string;
	description: string;
	category: string;
	mission_type: "weekly" | "monthly";
	difficulty: "easy" | "medium" | "hard";
	impact_summary: string;
	goal_count: number;
	xp_reward: number;
	gem_reward: number;
	badge_emoji: string;
	start_date: string;
	end_date: string;
	// from user_missions join
	pledged: boolean;
	completed: boolean;
	claimed: boolean;
	count: number;
	last_logged_date: string | null;
};

type ActionState = {
	todaysAction: Action | null;
	todaysCommunityAction: Action | null;
	todaysImpactReport: ImpactReport | null;
	streak: Streak | null;
	hasCompletedToday: boolean;
	hasCompletedCommunityToday: boolean;
	missions: Mission[];
	loading: boolean;
	fetchTodaysAction: () => Promise<void>;
	fetchStreak: (userId: string) => Promise<void>;
	fetchMissions: (userId: string) => Promise<void>;
	pledgeMission: (userId: string, missionId: string) => Promise<void>;
	logMissionDay: (userId: string, missionId: string) => Promise<void>;
	claimMissionReward: (
		userId: string,
		missionId: string,
	) => Promise<{ xpEarned: number; gemsEarned: number }>;
	completeAction: (
		userId: string,
		actionId: string,
	) => Promise<{ xpEarned: number }>;
	completeCommunityAction: (
		userId: string,
		actionId: string,
	) => Promise<{ gemsEarned: number }>;
};

const today = () => new Date().toISOString().split("T")[0];

export const useActionStore = create<ActionState>((set, get) => ({
	todaysAction: null,
	todaysCommunityAction: null,
	todaysImpactReport: null,
	streak: null,
	hasCompletedToday: false,
	hasCompletedCommunityToday: false,
	missions: [],
	loading: false,

	fetchTodaysAction: async () => {
		set({ loading: true });
		try {
			const t = today();
			const [{ data: carbon }, { data: community }, { data: report }] =
				await Promise.all([
					supabase
						.from("actions")
						.select("*")
						.eq("status", "published")
						.eq("publish_date", t)
						.eq("action_type", "carbon")
						.maybeSingle(),
					supabase
						.from("actions")
						.select("*")
						.eq("status", "published")
						.eq("publish_date", t)
						.eq("action_type", "community")
						.maybeSingle(),
					supabase
						.from("impact_reports")
						.select("*")
						.eq("date", t)
						.maybeSingle(),
				]);
			set({
				todaysAction: carbon ?? null,
				todaysCommunityAction: community ?? null,
				todaysImpactReport: report ?? null,
				loading: false,
			});
		} catch {
			set({ loading: false });
		}
	},

	fetchStreak: async (userId: string) => {
		const t = today();
		const { data } = await supabase
			.from("streaks")
			.select("*")
			.eq("user_id", userId)
			.single();
		if (data)
			set({
				streak: data,
				hasCompletedToday: data.last_completion_date === t,
			});

		const { data: communityAction } = await supabase
			.from("actions")
			.select("id")
			.eq("status", "published")
			.eq("publish_date", t)
			.eq("action_type", "community")
			.maybeSingle();
		if (communityAction) {
			const { data: done } = await supabase
				.from("completions")
				.select("id")
				.eq("user_id", userId)
				.eq("action_id", communityAction.id)
				.maybeSingle();
			set({ hasCompletedCommunityToday: !!done });
		}
	},

	fetchMissions: async (userId: string) => {
		const t = today();
		const [{ data: missionRows }, { data: pledgeRows }] = await Promise.all(
			[
				supabase
					.from("missions")
					.select("*")
					.lte("start_date", t)
					.gte("end_date", t)
					.order("mission_type")
					.order("created_at"),
				supabase
					.from("user_missions")
					.select("*")
					.eq("user_id", userId),
			],
		);
		if (!missionRows) return;
		const pledgeMap: Record<
			string,
			{
				pledged: boolean;
				completed: boolean;
				claimed: boolean;
				count: number;
				last_logged_date: string | null;
			}
		> = {};
		pledgeRows?.forEach((p) => {
			pledgeMap[p.mission_id] = {
				pledged: true,
				completed: p.completed,
				claimed: p.claimed,
				count: p.count ?? 0,
				last_logged_date: p.last_logged_date ?? null,
			};
		});
		set({
			missions: missionRows.map((m) => ({
				...m,
				pledged: !!pledgeMap[m.id],
				completed: pledgeMap[m.id]?.completed ?? false,
				claimed: pledgeMap[m.id]?.claimed ?? false,
				count: pledgeMap[m.id]?.count ?? 0,
				last_logged_date: pledgeMap[m.id]?.last_logged_date ?? null,
			})),
		});
	},

	pledgeMission: async (userId: string, missionId: string) => {
		await supabase
			.from("user_missions")
			.insert({ user_id: userId, mission_id: missionId });
		set((state) => ({
			missions: state.missions.map((m) =>
				m.id === missionId ? { ...m, pledged: true } : m,
			),
		}));
	},

	logMissionDay: async (userId: string, missionId: string) => {
		const t = today();
		const mission = get().missions.find((m) => m.id === missionId);
		if (!mission || !mission.pledged || mission.completed) return;
		if (mission.last_logged_date === t) return; // already logged today

		const newCount = mission.count + 1;
		const nowComplete = newCount >= mission.goal_count;

		await supabase
			.from("user_missions")
			.update({
				count: newCount,
				last_logged_date: t,
				completed: nowComplete,
				completed_at: nowComplete ? new Date().toISOString() : null,
			})
			.eq("user_id", userId)
			.eq("mission_id", missionId);

		set((state) => ({
			missions: state.missions.map((m) =>
				m.id === missionId
					? {
							...m,
							count: newCount,
							last_logged_date: t,
							completed: nowComplete,
						}
					: m,
			),
		}));
	},

	claimMissionReward: async (userId: string, missionId: string) => {
		const mission = get().missions.find((m) => m.id === missionId);
		if (!mission || !mission.completed || mission.claimed)
			return { xpEarned: 0, gemsEarned: 0 };

		await supabase
			.from("user_missions")
			.update({ claimed: true })
			.eq("user_id", userId)
			.eq("mission_id", missionId);

		if (mission.xp_reward > 0) {
			const { data: profile } = await supabase
				.from("profiles")
				.select("xp")
				.eq("id", userId)
				.single();
			if (profile) {
				const newXP = (profile.xp ?? 0) + mission.xp_reward;
				await supabase
					.from("profiles")
					.update({ xp: newXP, level: Math.floor(newXP / 500) + 1 })
					.eq("id", userId);
			}
		}
		if (mission.gem_reward > 0) {
			const { data: profile } = await supabase
				.from("profiles")
				.select("kind_gems")
				.eq("id", userId)
				.single();
			if (profile) {
				await supabase
					.from("profiles")
					.update({
						kind_gems:
							(profile.kind_gems ?? 0) + mission.gem_reward,
					})
					.eq("id", userId);
			}
		}

		set((state) => ({
			missions: state.missions.map((m) =>
				m.id === missionId ? { ...m, claimed: true } : m,
			),
		}));
		return { xpEarned: mission.xp_reward, gemsEarned: mission.gem_reward };
	},

	completeAction: async (userId: string, actionId: string) => {
		const streak = get().streak;
		const newStreakDay = (streak?.current_streak ?? 0) + 1;
		const xpEarned = 50 + Math.min(newStreakDay * 10, 100);
		const t = today();

		await Promise.all([
			supabase.from("completions").insert({
				user_id: userId,
				action_id: actionId,
				streak_day: newStreakDay,
			}),
			supabase.from("streaks").upsert({
				user_id: userId,
				current_streak: newStreakDay,
				longest_streak: Math.max(
					newStreakDay,
					streak?.longest_streak ?? 0,
				),
				last_completion_date: t,
			}),
		]);

		const { data: profile } = await supabase
			.from("profiles")
			.select("xp")
			.eq("id", userId)
			.single();
		if (profile) {
			const newXP = (profile.xp ?? 0) + xpEarned;
			await supabase
				.from("profiles")
				.update({ xp: newXP, level: Math.floor(newXP / 500) + 1 })
				.eq("id", userId);
		}

		set({
			hasCompletedToday: true,
			streak: {
				current_streak: newStreakDay,
				longest_streak: Math.max(
					newStreakDay,
					streak?.longest_streak ?? 0,
				),
				last_completion_date: t,
			},
		});
		return { xpEarned };
	},

	completeCommunityAction: async (userId: string, actionId: string) => {
		const action = get().todaysCommunityAction;
		const gemsEarned = action?.gem_reward ?? 10;

		await supabase
			.from("completions")
			.insert({ user_id: userId, action_id: actionId, streak_day: 0 });

		const { data: profile } = await supabase
			.from("profiles")
			.select("kind_gems")
			.eq("id", userId)
			.single();
		if (profile) {
			await supabase
				.from("profiles")
				.update({ kind_gems: (profile.kind_gems ?? 0) + gemsEarned })
				.eq("id", userId);
		}

		set({ hasCompletedCommunityToday: true });
		return { gemsEarned };
	},
}));
