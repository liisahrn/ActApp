// CommonJS — consumed by tailwind.config.js (Node) and imported by theme.ts (TypeScript)
const Colors = {
	gradientA: "#0B1F0C",
	gradientB: "#163318",
	gradientC: "#1A3D1C",
	gradientD: "#0B1F0C",
	primary: "#5ABF50",
	primaryDark: "#3D9E34",
	primaryLight: "rgba(90,191,80,0.18)",
	accent: "#D4553A",
	accentLight: "rgba(212,85,58,0.18)",
	background: "#0B1F0C",
	surface: "rgba(255,255,255,0.07)",
	surfaceStrong: "rgba(255,255,255,0.13)",
	surfaceAlt: "rgba(255,255,255,0.04)",
	surfaceDark: "rgba(0,0,0,0.45)",
	pill: "#D4553A",
	text: "#FFFFFF",
	textSecondary: "rgba(255,255,255,0.75)",
	textMuted: "rgba(255,255,255,0.45)",
	border: "rgba(255,255,255,0.13)",
	borderLight: "rgba(255,255,255,0.07)",
	xpGold: "#FFD166",
	streakOrange: "#FF8C42",
	levelPurple: "#C084FC",
	kindGem: "#60A5FA",
	kindGemLight: "rgba(96,165,250,0.18)",
	success: "#5ABF50",
	error: "#FF6B6B",
};

const Fonts = {
	heading: "ChakraPetch_700Bold",
	body: "Schoolbell_400Regular",
	fallback: "System",
	sizes: {
		xs: 11,
		sm: 13,
		md: 15,
		lg: 17,
		xl: 20,
		xxl: 26,
		xxxl: 34,
		hero: 52,
	},
};

const Radius = { sm: 6, md: 12, lg: 20, xl: 28, full: 999 };

module.exports = { Colors, Fonts, Radius };
