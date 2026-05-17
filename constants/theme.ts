// ── MISSION: ACTAPP — FOREST GREEN + ORANGE-RED THEME ─────────

export const Colors = {
  // Gradient stops — deep forest green (matching pitch deck)
  gradientA: '#0B1F0C',
  gradientB: '#163318',
  gradientC: '#1A3D1C',
  gradientD: '#0B1F0C',

  // Brand green (CTAs, success, highlights)
  primary: '#5ABF50',
  primaryDark: '#3D9E34',
  primaryLight: 'rgba(90,191,80,0.18)',

  // Mission orange-red (badges, labels, pills — like pitch deck)
  accent: '#D4553A',
  accentLight: 'rgba(212,85,58,0.18)',

  // Surfaces
  background: '#0B1F0C',
  surface: 'rgba(255,255,255,0.07)',
  surfaceStrong: 'rgba(255,255,255,0.13)',
  surfaceAlt: 'rgba(255,255,255,0.04)',
  surfaceDark: 'rgba(0,0,0,0.45)',
  pill: '#D4553A',

  // Text
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.75)',
  textMuted: 'rgba(255,255,255,0.45)',

  // Borders
  border: 'rgba(255,255,255,0.13)',
  borderLight: 'rgba(255,255,255,0.07)',

  // Gamification
  xpGold: '#FFD166',
  streakOrange: '#FF8C42',
  levelPurple: '#C084FC',
  kindGem: '#60A5FA',        // blue — Kind Gems (community quests)
  kindGemLight: 'rgba(96,165,250,0.18)',

  // Status
  success: '#5ABF50',
  error: '#FF6B6B',
}

export const Fonts = {
  heading: 'ChakraPetch_700Bold',
  body: 'Schoolbell_400Regular',
  fallback: 'System',
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
}

export const Radius = {
  sm: 6,
  md: 12,
  lg: 20,
  xl: 28,
  full: 999,
}

// Forest green gradient (top-left → bottom-right, like pitch deck)
export const BG_GRADIENT = ['#0B1F0C', '#163318', '#1A3D1C'] as const
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
    shadowColor: '#5ABF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
}

export const XP_PER_LEVEL = [
  0, 500, 1500, 3000, 5000, 8000, 12000, 17000, 23000, 30000,
]

export const LEVEL_NAMES = [
  'Recruit', 'Operative', 'Field Agent', 'Special Agent',
  'Handler', 'Commander', 'Director', 'Chief', 'Legend', 'Guardian',
]

export function getLevelFromXP(xp: number): number {
  for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
    if (xp >= XP_PER_LEVEL[i]) return i + 1
  }
  return 1
}

export function getXPForNextLevel(level: number): number {
  return XP_PER_LEVEL[level] ?? XP_PER_LEVEL[XP_PER_LEVEL.length - 1]
}
