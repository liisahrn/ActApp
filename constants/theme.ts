import { Colors, Fonts, Radius } from './tokens'

export { Colors, Fonts, Radius }

// Forest green gradient (top-left → bottom-right, like pitch deck)
export const BG_GRADIENT = [Colors.gradientA, Colors.gradientB, Colors.gradientC] as const
export const BG_GRADIENT_START = { x: 0, y: 0 }
export const BG_GRADIENT_END = { x: 1, y: 1 }

export const Shadow = {
	sm: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 2,
	},
	md: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.4,
		shadowRadius: 12,
		elevation: 5,
	},
	lg: {
		shadowColor: Colors.primary,
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.4,
		shadowRadius: 16,
		elevation: 10,
	},
};

export const XP_PER_LEVEL = [
	0, 500, 1500, 3000, 5000, 8000, 12000, 17000, 23000, 30000,
];

export const LEVEL_NAMES = [
	"Recruit",
	"Operative",
	"Field Agent",
	"Special Agent",
	"Handler",
	"Commander",
	"Director",
	"Chief",
	"Legend",
	"Guardian",
];

export function getLevelFromXP(xp: number): number {
	for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
		if (xp >= XP_PER_LEVEL[i]) return i + 1;
	}
	return 1;
}

export function getXPForNextLevel(level: number): number {
	return XP_PER_LEVEL[level] ?? XP_PER_LEVEL[XP_PER_LEVEL.length - 1];
}
