import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Background from "@/components/Background";
import MissionsCard from "@/components/MissionsCard";
import { S } from "@/constants/styles";
import { Colors, Fonts, Radius, Shadow } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useActionStore } from "@/store/actionStore";
import { useAuthStore } from "@/store/authStore";

type WeekRow = { week: string; co2: number; count: number };
type CategoryRow = { category: string; count: number; co2: number };

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

const CO2_EQUIV = (kg: number) => [
	{
		emoji: "🌳",
		value: Math.max(0, +(kg / 21).toFixed(1)),
		label: "trees\nabsorbing CO₂",
	},
	{
		emoji: "🚗",
		value: Math.max(0, Math.round(kg / 0.12)),
		label: "km not\ndriven by car",
	},
	{
		emoji: "🏠",
		value: Math.max(0, +(kg / 8.5).toFixed(1)),
		label: "homes\npowered a day",
	},
	{
		emoji: "📱",
		value: Math.max(0, Math.round(kg * 200)),
		label: "phones\nfully charged",
	},
];

export default function ImpactBankScreen() {
	const { session } = useAuthStore();
	const { missions, fetchMissions } = useActionStore();

	const [totalCO2, setTotalCO2] = useState(0);
	const [totalActions, setTotalActions] = useState(0);
	const [weeks, setWeeks] = useState<WeekRow[]>([]);
	const [categories, setCategories] = useState<CategoryRow[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!session?.user?.id) return;
		fetchMissions(session.user.id);
		fetchImpact(session.user.id);
	}, [session]);

	const fetchImpact = async (userId: string) => {
		setLoading(true);

		// Step 1: get all completions for this user
		const { data: completionRows } = await supabase
			.from("completions")
			.select("action_id, created_at")
			.eq("user_id", userId)
			.order("created_at", { ascending: false });

		if (!completionRows?.length) {
			setLoading(false);
			return;
		}

		// Step 2: get action details for those IDs
		const actionIds = [...new Set(completionRows.map((c) => c.action_id))];
		const { data: actionRows } = await supabase
			.from("actions")
			.select("id, co2_equivalent, category, action_type")
			.in("id", actionIds);

		const actionMap: Record<
			string,
			{ co2_equivalent: number; category: string; action_type: string }
		> = {};
		actionRows?.forEach((a) => {
			actionMap[a.id] = a;
		});

		// Merge
		const completions = completionRows.map((c) => ({
			...c,
			action: actionMap[c.action_id] ?? null,
		}));

		setTotalActions(completions.length);

		// Filter to carbon missions only for CO₂
		const carbon = completions.filter(
			(c) => c.action?.action_type === "carbon",
		);
		const co2 = carbon.reduce(
			(sum, c) => sum + (c.action?.co2_equivalent ?? 0),
			0,
		);
		setTotalCO2(Math.round(co2 * 10) / 10);

		// Weekly breakdown (last 8 weeks)
		const weekMap: Record<string, WeekRow> = {};
		carbon.forEach((c) => {
			const d = new Date(c.created_at);
			const mon = new Date(d);
			mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
			const key = mon.toISOString().split("T")[0];
			const label = `${mon.getDate()}/${mon.getMonth() + 1}`;
			if (!weekMap[key]) weekMap[key] = { week: label, co2: 0, count: 0 };
			weekMap[key].co2 += c.action?.co2_equivalent ?? 0;
			weekMap[key].count += 1;
		});
		const sortedWeeks = Object.entries(weekMap)
			.sort((a, b) => a[0].localeCompare(b[0]))
			.slice(-8)
			.map(([, v]) => ({ ...v, co2: Math.round(v.co2 * 10) / 10 }));
		setWeeks(sortedWeeks);

		// Category breakdown (all completions)
		const catMap: Record<string, CategoryRow> = {};
		completions.forEach((c) => {
			const cat = c.action?.category ?? "other";
			if (!catMap[cat]) catMap[cat] = { category: cat, count: 0, co2: 0 };
			catMap[cat].count += 1;
			catMap[cat].co2 += c.action?.co2_equivalent ?? 0;
		});
		setCategories(Object.values(catMap).sort((a, b) => b.count - a.count));

		setLoading(false);
	};

	const equivalents = CO2_EQUIV(totalCO2);
	const maxWeekCO2 = Math.max(...weeks.map((w) => w.co2), 0.1);
	const maxCatCount = Math.max(...categories.map((c) => c.count), 1);

	return (
		<View style={S.fill}>
			<Background />
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				{/* Header */}
				<View style={styles.header}>
					<View style={S.missionBadge}>
						<Text style={S.missionBadgeText}>IMPACT BANK</Text>
					</View>
					<Text style={[S.heading, { fontSize: Fonts.sizes.xxxl }]}>
						Field Record
					</Text>
					<Text style={[S.muted, { fontSize: Fonts.sizes.sm }]}>
						Your mission history. Every deployment counted.
					</Text>
				</View>

				{/* ── Big CO₂ total ─────────────────────────────────────── */}
				<View style={styles.heroCard}>
					<Text style={[S.muted, { fontSize: Fonts.sizes.sm }]}>
						TOTAL CO₂ SAVED
					</Text>
					<Text style={styles.bigCO2}>{loading ? "…" : `${totalCO2}kg`}</Text>
					<Text style={[S.muted, { fontSize: Fonts.sizes.sm }]}>
						{totalActions} missions completed
					</Text>
				</View>

				{/* ── Real-life equivalents ─────────────────────────────── */}
				{totalCO2 > 0 && (
					<View style={styles.section}>
						<Text style={S.sectionTitle}>That's the same as…</Text>
						<View style={styles.equivGrid}>
							{equivalents.map((eq, i) => (
								<View key={i} style={styles.equivCard}>
									<Text style={{ fontSize: 26 }}>{eq.emoji}</Text>
									<Text style={styles.equivValue}>
										{eq.value.toLocaleString()}
									</Text>
									<Text style={styles.equivLabel}>{eq.label}</Text>
								</View>
							))}
						</View>
					</View>
				)}

				{/* ── Weekly history bars ───────────────────────────────── */}
				{weeks.length > 0 && (
					<View style={styles.section}>
						<Text style={S.sectionTitle}>Week by week</Text>
						<View style={styles.barChart}>
							{weeks.map((w, i) => (
								<View key={i} style={styles.barCol}>
									<Text style={styles.barValue}>
										{w.co2 > 0 ? `${w.co2}` : ""}
									</Text>
									<View style={styles.barTrack}>
										<View
											style={[
												styles.barFill,
												{
													height: `${Math.max(4, (w.co2 / maxWeekCO2) * 100)}%`,
												},
											]}
										/>
									</View>
									<Text style={styles.barLabel}>{w.week}</Text>
								</View>
							))}
						</View>
						<Text
							style={[
								S.muted,
								{ fontSize: 10, textAlign: "right", marginTop: 4 },
							]}
						>
							kg CO₂ per week
						</Text>
					</View>
				)}

				{/* ── Category breakdown ────────────────────────────────── */}
				{categories.length > 0 && (
					<View style={styles.section}>
						<Text style={S.sectionTitle}>By category</Text>
						<View style={styles.catList}>
							{categories.map((c) => (
								<View key={c.category} style={styles.catRow}>
									<Text style={{ fontSize: 22, width: 30 }}>
										{CATEGORY_EMOJI[c.category] ?? "🌍"}
									</Text>
									<Text
										style={[
											S.body,
											{
												width: 80,
												fontSize: Fonts.sizes.sm,
												textTransform: "capitalize",
											},
										]}
									>
										{c.category}
									</Text>
									<View style={styles.catBarTrack}>
										<View
											style={[
												styles.catBarFill,
												{ width: `${(c.count / maxCatCount) * 100}%` },
											]}
										/>
									</View>
									<Text
										style={[
											S.muted,
											{
												fontSize: Fonts.sizes.xs,
												width: 28,
												textAlign: "right",
											},
										]}
									>
										{c.count}
									</Text>
								</View>
							))}
						</View>
					</View>
				)}

				{/* ── Empty state ───────────────────────────────────────── */}
				{!loading && totalActions === 0 && (
					<View style={S.empty}>
						<Text style={S.emptyEmoji}>🌱</Text>
						<Text style={S.emptyText}>No missions logged yet</Text>
						<Text style={S.emptyHint}>
							Complete your first daily mission to start building your field
							record.
						</Text>
					</View>
				)}

				{/* ── Missions ─────────────────────────────────────────── */}
				<MissionsCard />

				<View style={{ height: 20 }} />
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	content: { paddingBottom: 40 },
	header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, gap: 8 },

	// ── Hero CO₂ ───────────────────────────────────────────────────
	heroCard: {
		marginHorizontal: 20,
		backgroundColor: Colors.surfaceDark,
		borderRadius: Radius.xl,
		padding: 28,
		alignItems: "center",
		gap: 6,
		borderWidth: 1,
		borderColor: Colors.primary + "40",
		...Shadow.md,
	},
	bigCO2: {
		fontSize: 64,
		fontFamily: Fonts.heading,
		color: Colors.primary,
		letterSpacing: -2,
	},

	// ── Equivalents ────────────────────────────────────────────────
	section: { paddingHorizontal: 20, paddingTop: 24, gap: 12 },
	equivGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
	equivCard: {
		width: "47.5%",
		backgroundColor: Colors.surfaceDark,
		borderRadius: Radius.lg,
		padding: 14,
		alignItems: "center",
		gap: 4,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	equivValue: {
		fontSize: Fonts.sizes.xl,
		fontFamily: Fonts.heading,
		color: Colors.text,
	},
	equivLabel: {
		fontSize: 10,
		fontFamily: Fonts.body,
		color: Colors.textMuted,
		textAlign: "center",
		lineHeight: 14,
	},

	// ── Bar chart ──────────────────────────────────────────────────
	barChart: {
		flexDirection: "row",
		alignItems: "flex-end",
		gap: 6,
		height: 120,
	},
	barCol: {
		flex: 1,
		alignItems: "center",
		gap: 4,
		height: "100%",
		justifyContent: "flex-end",
	},
	barValue: { fontSize: 8, fontFamily: Fonts.heading, color: Colors.textMuted },
	barTrack: {
		width: "100%",
		backgroundColor: Colors.surface,
		borderRadius: 4,
		overflow: "hidden",
		height: 80,
		justifyContent: "flex-end",
	},
	barFill: {
		width: "100%",
		backgroundColor: Colors.primary,
		borderRadius: 4,
		opacity: 0.85,
	},
	barLabel: {
		fontSize: 9,
		fontFamily: Fonts.body,
		color: Colors.textMuted,
		textAlign: "center",
	},

	// ── Category ──────────────────────────────────────────────────
	catList: { gap: 10 },
	catRow: { flexDirection: "row", alignItems: "center", gap: 8 },
	catBarTrack: {
		flex: 1,
		height: 8,
		backgroundColor: Colors.surface,
		borderRadius: 4,
		overflow: "hidden",
	},
	catBarFill: {
		height: "100%",
		backgroundColor: Colors.primary,
		borderRadius: 4,
	},
});
