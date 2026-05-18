// ── SHARED STYLES ─────────────────────────────────────────────
// Import S from here and use via style={[S.card, localStyle]}
// This keeps every screen file small and consistent.

import { StyleSheet } from 'react-native'
import { Colors, Fonts, Radius, Shadow } from './theme'

export const S = StyleSheet.create({
  // ── Layout ───────────────────────────────────────────────────
  fill:       { flex: 1 },
  row:        { flexDirection: 'row', alignItems: 'center' },
  center:     { alignItems: 'center', justifyContent: 'center' },

  // ── Cards ────────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceDark,
    borderRadius: Radius.lg,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },

  // ── Text ─────────────────────────────────────────────────────
  heading:   { fontFamily: Fonts.heading, color: Colors.text },
  body:      { fontFamily: Fonts.body,    color: Colors.textSecondary },
  muted:     { fontFamily: Fonts.body,    color: Colors.textMuted },
  sectionTitle: { fontSize: Fonts.sizes.lg, fontFamily: Fonts.heading, color: Colors.text },

  // ── Inputs ───────────────────────────────────────────────────
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: Fonts.sizes.md,
    fontFamily: Fonts.body,
    color: Colors.text,
  },

  // ── Buttons ──────────────────────────────────────────────────
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 15,
    alignItems: 'center',
    ...Shadow.lg,
  },
  primaryBtnText: { color: '#fff', fontFamily: Fonts.heading, fontSize: Fonts.sizes.lg },
  pillBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillBtnText: { color: '#fff', fontSize: Fonts.sizes.xs, fontFamily: Fonts.heading },

  // ── Badges ───────────────────────────────────────────────────
  missionBadge: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  missionBadgeText: { fontSize: Fonts.sizes.xs, fontFamily: Fonts.heading, color: '#fff', letterSpacing: 1.5 },

  // ── Empty states ─────────────────────────────────────────────
  empty:      { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyText:  { fontSize: Fonts.sizes.lg, fontFamily: Fonts.heading, color: Colors.text },
  emptyHint:  { fontSize: Fonts.sizes.sm, fontFamily: Fonts.body, color: Colors.textMuted, textAlign: 'center', paddingHorizontal: 20 },
})
