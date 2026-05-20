const { Colors, Fonts, Radius } = require("./constants/tokens");

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: {
				primary: Colors.primary,
				"primary-dark": Colors.primaryDark,
				"primary-light": Colors.primaryLight,
				accent: Colors.accent,
				"accent-light": Colors.accentLight,
				background: Colors.background,
				surface: Colors.surface,
				"surface-strong": Colors.surfaceStrong,
				"surface-alt": Colors.surfaceAlt,
				"surface-dark": Colors.surfaceDark,
				secondary: Colors.textSecondary,
				muted: Colors.textMuted,
				border: Colors.border,
				"border-light": Colors.borderLight,
				"xp-gold": Colors.xpGold,
				"streak-orange": Colors.streakOrange,
				"level-purple": Colors.levelPurple,
				"kind-gem": Colors.kindGem,
				"kind-gem-light": Colors.kindGemLight,
				error: Colors.error,
				success: Colors.success,
				text: Colors.text,
			},
			fontFamily: {
				heading: [Fonts.heading],
				body: [Fonts.body],
			},
			fontSize: {
				xs: `${Fonts.sizes.xs}px`,
				sm: `${Fonts.sizes.sm}px`,
				md: `${Fonts.sizes.md}px`,
				lg: `${Fonts.sizes.lg}px`,
				xl: `${Fonts.sizes.xl}px`,
				"2xl": `${Fonts.sizes.xxl}px`,
				"3xl": `${Fonts.sizes.xxxl}px`,
				hero: `${Fonts.sizes.hero}px`,
			},
			borderRadius: {
				sm: `${Radius.sm}px`,
				md: `${Radius.md}px`,
				lg: `${Radius.lg}px`,
				xl: `${Radius.xl}px`,
				full: `${Radius.full}px`,
			},
		},
	},
	plugins: [],
};
