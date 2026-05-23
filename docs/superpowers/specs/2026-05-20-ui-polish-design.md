# UI Polish Pass — Implementation Spec

**Goal:** Fix spacing inconsistencies, colour token violations, and the tab bar active-state across the three main screens (Today, Friends, Profile) and the tab layout.

**Scope:** Six targeted changes. No structural refactors, no new components, no new screens.

**Files touched:**
- `app/(tabs)/_layout.tsx` — tab bar
- `app/(tabs)/index.tsx` — Today screen header + community op card + bottom padding
- `app/(tabs)/impact-bank.tsx` — bottom padding only
- `app/(tabs)/friends.tsx` — bottom padding only
- `app/(tabs)/profile.tsx` — top padding + bottom padding

---

## Change 1 — Today screen header layout

**File:** `app/(tabs)/index.tsx`

**Problem:** The XP and gem badges are stacked vertically in the top-right corner (`flexDirection: column`, `alignItems: flex-end`). This looks cramped and odd, especially with the gem sitting below the XP.

**Fix:** Place both pills in a horizontal row on the same line as the logo. The logo row becomes `alignItems: "center"` and the right side becomes `flexDirection: "row"` with `gap: 6`.

**Before:**
```tsx
<View style={{ alignItems: "flex-end", gap: 4 }}>
  <View className="rounded-full px-3 py-[5] border" style={{ backgroundColor: `${Colors.xpGold}20`, borderColor: `${Colors.xpGold}40` }}>
    <Text style={{ fontSize: 13, fontFamily: Fonts.heading, color: Colors.xpGold }}>⭐ {profile?.xp ?? 0} XP</Text>
  </View>
  <View className="rounded-full px-3 py-[5] border" style={{ backgroundColor: Colors.kindGemLight, borderColor: `${Colors.kindGem}40` }}>
    <Text style={{ fontSize: 13, fontFamily: Fonts.heading, color: Colors.kindGem }}>💎 {profile?.kind_gems ?? 0}</Text>
  </View>
</View>
```

**After:**
```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
  <View className="rounded-full px-3 py-[5] border" style={{ backgroundColor: `${Colors.xpGold}20`, borderColor: `${Colors.xpGold}40` }}>
    <Text style={{ fontSize: 13, fontFamily: Fonts.heading, color: Colors.xpGold }}>⭐ {profile?.xp ?? 0} XP</Text>
  </View>
  <View className="rounded-full px-3 py-[5] border" style={{ backgroundColor: Colors.kindGemLight, borderColor: `${Colors.kindGem}40` }}>
    <Text style={{ fontSize: 13, fontFamily: Fonts.heading, color: Colors.kindGem }}>💎 {profile?.kind_gems ?? 0}</Text>
  </View>
</View>
```

The outer row `flex-row items-center justify-between` already exists — only the inner right-side View changes.

---

## Change 2 — Today screen header horizontal padding

**File:** `app/(tabs)/index.tsx`

**Problem:** The header `View` uses `paddingHorizontal: 24` while every section below it uses `paddingHorizontal: 20`. This creates a 4px misalignment visible against card edges.

**Fix:** Change `paddingHorizontal: 24` → `20` in the header style object.

```tsx
// Before
style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24, gap: 14 }}

// After
style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 24, gap: 14 }}
```

---

## Change 3 — Community Op card background colour

**File:** `app/(tabs)/index.tsx`

**Problem:** The Community Op card uses a hardcoded `backgroundColor: "rgba(30,50,80,0.7)"` — a dark navy blue that isn't in the design token system and looks disconnected from the rest of the UI.

**Fix:** Replace with `Colors.surfaceDark` (the same dark surface used on the Daily Mission card and other cards). The blue tint is preserved through the border colour `${Colors.kindGem}40` which is already there.

```tsx
// Before
backgroundColor: "rgba(30,50,80,0.7)",

// After
backgroundColor: Colors.surfaceDark,
```

---

## Change 4 — Tab bar: active state + background colour

**File:** `app/(tabs)/_layout.tsx`

**Problem:**
1. The `LinearGradient` starts at `rgba(0,0,0,0.6)` which reads as dark grey rather than dark green.
2. The active tab only changes label font-family and colour — the emoji dimming/brightening is subtle and easy to miss.

**Fix:**
1. Update gradient to dark green: `["rgba(15,38,17,0.97)", "rgba(8,20,9,0.99)"]`
2. Wrap the emoji + label in a `View` that gets a `primaryLight` (green) background pill when focused. The pill is only behind the emoji; the label sits below it.
3. Inactive emojis at `opacity: 0.35`, active at `1` and slightly larger (`fontSize: 22` vs `20`).

**Updated `TabIcon` component:**
```tsx
function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: "center", gap: 3 }}>
      <View
        style={{
          paddingHorizontal: 14,
          paddingVertical: 4,
          borderRadius: 14,
          backgroundColor: focused ? Colors.primaryLight : "transparent",
        }}
      >
        <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.35 }}>
          {emoji}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: Fonts.heading,
          fontSize: 9,
          color: focused ? Colors.primary : Colors.textMuted,
          textAlign: "center",
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}
```

**Updated `tabBarStyle`:**
```tsx
tabBarStyle: {
  borderTopWidth: 1,
  borderTopColor: `${Colors.primary}22`,  // subtle green tint instead of white
  height: 82,
  paddingBottom: 14,
  paddingTop: 8,
  backgroundColor: "transparent",
},
```

**Updated `tabBarBackground` gradient:**
```tsx
tabBarBackground: () => (
  <LinearGradient
    colors={["rgba(15,38,17,0.97)", "rgba(8,20,9,0.99)"]}
    style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
  />
),
```

---

## Change 5 — Profile screen top padding

**File:** `app/(tabs)/profile.tsx`

**Problem:** The Profile ScrollView content starts at `paddingTop: 70`, while Today and Friends both use `paddingTop: 60`. This makes the profile avatar sit noticeably lower than content on other screens.

**Fix:**
```tsx
// Before
style={{ paddingTop: 70, paddingBottom: 28 }}

// After
style={{ paddingTop: 60, paddingBottom: 110 }}
```

(Bottom padding also bumped here — see Change 6.)

---

## Change 6 — Screen bottom padding for floating content clearance

**Files:** `app/(tabs)/index.tsx`, `app/(tabs)/impact-bank.tsx`, `app/(tabs)/friends.tsx`, `app/(tabs)/profile.tsx`

**Problem:** All screens use `paddingBottom: 40` or less. The tab bar is 82px tall plus the safe area (~34px on iPhone), so the last item on each screen is partially obscured.

**Fix:** Bump `paddingBottom` to `110` on all four tab screens.

| File | Location | Before | After |
|------|----------|--------|-------|
| `index.tsx` | `ScrollView contentContainerStyle` | `40` | `110` |
| `impact-bank.tsx` | `ScrollView contentContainerStyle` | `40` | `110` |
| `friends.tsx` | `FlatList contentContainerStyle` | `padding: 20, gap: 8` | `padding: 20, paddingBottom: 110, gap: 8` |
| `profile.tsx` | outer View `style` | `paddingBottom: 28` | `paddingBottom: 110` |

---

## What is NOT changing

- `PillBadge` accent colour — red/orange on "MISSION: ACT" is intentional (urgency/classified feel)
- Friends tab toggle border radius — `rounded-md` vs `rounded-lg` is a minor inconsistency left for a later pass
- Badge grid `width: "30%"` on Profile — left for a later pass
- No new components created
- No changes to `constants/tokens.js` or `constants/theme.ts`
