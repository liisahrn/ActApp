import { StyleSheet, Text, View } from "react-native";
import { Colors, Fonts } from "@/constants/theme";

type Props = {
	size?: "sm" | "md" | "lg";
	showTagline?: boolean;
};

export default function AppLogo({ size = "md", showTagline = false }: Props) {
	const globeSize = size === "sm" ? 32 : size === "md" ? 50 : 70;
	const textSize = size === "sm" ? 16 : size === "md" ? 24 : 34;
	const overlap = Math.round(globeSize * 0.32);
	const rowWidth = globeSize * 3 - overlap * 2;

	return (
		<View style={styles.container}>
			{/* Globe trio + ACTAPP overlay */}
			<View style={[styles.logoBox, { width: rowWidth, height: globeSize }]}>
				{/* Three overlapping globes */}
				<View style={styles.globeRow}>
					<Text style={{ fontSize: globeSize, lineHeight: globeSize }}>🌍</Text>
					<Text
						style={{
							fontSize: globeSize,
							lineHeight: globeSize,
							marginLeft: -overlap,
						}}
					>
						🌍
					</Text>
					<Text
						style={{
							fontSize: globeSize,
							lineHeight: globeSize,
							marginLeft: -overlap,
						}}
					>
						🌍
					</Text>
				</View>

				{/* ACTAPP stencil text on top */}
				<View style={styles.textOverlay}>
					<Text style={[styles.actText, { fontSize: textSize }]}>ACTAPP</Text>
				</View>
			</View>

			{/* Mission tagline pill */}
			{showTagline && (
				<View style={styles.pill}>
					<Text style={styles.pillText}>ONE MISSION. EVERYONE. EVERY DAY.</Text>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		gap: 14,
	},
	logoBox: {
		position: "relative",
		alignItems: "center",
		justifyContent: "center",
	},
	globeRow: {
		flexDirection: "row",
		alignItems: "center",
		position: "absolute",
	},
	textOverlay: {
		position: "absolute",
		alignItems: "center",
		justifyContent: "center",
	},
	actText: {
		fontFamily: Fonts.heading,
		color: "#FFFFFF",
		letterSpacing: 2,
		textShadowColor: "rgba(0,0,0,0.95)",
		textShadowOffset: { width: 0, height: 2 },
		textShadowRadius: 6,
	},
	pill: {
		backgroundColor: Colors.accent,
		borderRadius: 999,
		paddingHorizontal: 18,
		paddingVertical: 8,
	},
	pillText: {
		fontFamily: Fonts.body,
		color: "#FFFFFF",
		fontSize: 12,
		letterSpacing: 1.5,
	},
});
