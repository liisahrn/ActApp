# NativeWind Migration Design

**Date:** 2026-05-19
**Status:** Approved

## Objective

Replace all `StyleSheet.create` usage across the codebase with NativeWind (Tailwind CSS for React Native). Extract repeated style patterns as reusable UI primitive components. Delete `constants/styles.ts`.

## Scope

14 files currently use `StyleSheet.create`:

**Components**
- `components/AppLogo.tsx`
- `components/Background.tsx`
- `components/MissionsCard.tsx`
- `components/SwipeToComplete.tsx`

**Screens**
- `app/_layout.tsx`
- `app/impact-report.tsx`
- `app/onboarding.tsx`
- `app/(tabs)/_layout.tsx`
- `app/(tabs)/index.tsx`
- `app/(tabs)/impact-bank.tsx`
- `app/(tabs)/friends.tsx`
- `app/(tabs)/profile.tsx`
- `app/(auth)/phone.tsx`
- `app/(auth)/verify.tsx`

**Shared styles (deleted)**
- `constants/styles.ts` — deleted entirely, replaced by UI primitives

## Architecture

### Layer 1: NativeWind setup

Install and configure NativeWind so Tailwind class names work in React Native:

1. Install `nativewind` and `tailwindcss`
2. Add NativeWind preset to `babel.config.js`
3. Create `tailwind.config.js` with content paths covering `app/**` and `components/**`
4. Create `global.css` with Tailwind directives (`@tailwind base/components/utilities`)
5. Import `global.css` in `app/_layout.tsx`

### Layer 2: Token mapping (`tailwind.config.js`)

`constants/theme.ts` remains the runtime source of truth for dynamic styles. Its tokens are **also** registered in `tailwind.config.js` so class names reflect the brand:

| Token | Tailwind key | Example class |
| --- | --- | --- |
| `Colors.primary` (`#5ABF50`) | `colors.primary` | `bg-primary`, `text-primary` |
| `Colors.accent` (`#D4553A`) | `colors.accent` | `bg-accent` |
| `Colors.surface` | `colors.surface` | `bg-surface` |
| `Colors.surfaceDark` | `colors.surface-dark` | `bg-surface-dark` |
| `Colors.text` | `colors.text` | `text-default` |
| `Colors.textSecondary` | `colors.text-secondary` | `text-secondary` |
| `Colors.textMuted` | `colors.text-muted` | `text-muted` |
| `Colors.border` | `colors.border` | `border-border` |
| `Colors.xpGold` | `colors.xp-gold` | `text-xp-gold` |
| `Colors.streakOrange` | `colors.streak-orange` | `text-streak-orange` |
| `Colors.kindGem` | `colors.kind-gem` | `text-kind-gem` |
| `Fonts.heading` (ChakraPetch) | `fontFamily.heading` | `font-heading` |
| `Fonts.body` (Schoolbell) | `fontFamily.body` | `font-body` |
| `Fonts.sizes.*` | `fontSize.*` | `text-xs`, `text-hero` |
| `Radius.sm/md/lg/xl/full` | `borderRadius.*` | `rounded-sm`, `rounded-lg` |

**Shadows** are kept as inline `style={}` objects from `constants/theme.ts`. React Native's 5-prop shadow model (`shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`, `elevation`) cannot be expressed as a single Tailwind class.

### Layer 3: UI primitives (`components/ui/`)

A small set of primitive components replaces `constants/styles.ts`. Each encapsulates NativeWind classes so consumers use the component, not style constants.

| Component | Props | Replaces |
| --- | --- | --- |
| `<Card>` | `row?: boolean`, `className?`, `style?` | `S.card`, `S.rowCard` |
| `<PrimaryButton>` | `onPress`, `disabled?`, `className?`, `children` | `S.primaryBtn` + `S.primaryBtnText` |
| `<PillBadge>` | `label`, `color?` | `S.missionBadge` + `S.missionBadgeText` |
| `<PillButton>` | `onPress`, `children` | `S.pillBtn` + `S.pillBtnText` |
| `<SectionTitle>` | `children`, `className?` | `S.sectionTitle` |
| `<Heading>` | `children`, `className?` | `S.heading` |
| `<BodyText>` | `children`, `className?` | `S.body` |
| `<MutedText>` | `children`, `className?` | `S.muted` |
| `<AppTextInput>` | standard TextInput props | `S.input` |
| `<EmptyState>` | `emoji`, `title`, `hint?` | `S.empty` + `S.emptyText` + `S.emptyHint` |

All primitives accept an optional `className` prop for one-off overrides and an optional `style` prop for dynamic values.

### Layer 4: Migration rule per file

For each of the 14 files:

1. Delete the `StyleSheet` import and all `StyleSheet.create({})` blocks
2. Replace static style objects with `className` strings on JSX elements
3. Replace usages of `S.*` shared styles with the appropriate UI primitive component
4. Dynamic styles (computed at runtime from props, state, or theme values) stay as inline `style={}` — this is expected and fully supported by NativeWind
5. Mixed cases: use both `className` (static) and `style` (dynamic) on the same element

**Dynamic style examples that stay inline:**
- `opacity: 0.25 + 0.75 * pct`
- `backgroundColor: accentColor + "60"`
- `backgroundColor: i < count ? color : Colors.surface`
- `borderColor: diffColor` (where `diffColor` is computed from `mission.difficulty`)
- All `Shadow.*` objects from `constants/theme.ts`

## What changes

| File | Change |
| --- | --- |
| `constants/styles.ts` | Deleted |
| `constants/theme.ts` | Unchanged (still used for runtime dynamic values) |
| `tailwind.config.js` | Created — registers brand tokens |
| `global.css` | Created — Tailwind directives |
| `babel.config.js` | Updated — NativeWind preset added |
| `components/ui/` | Created — 10 primitive components |
| 14 styled files | `StyleSheet` removed, `className` + primitives adopted |

## What does not change

- `constants/theme.ts` — remains the authoritative token source for dynamic styles
- All business logic, state management, and data fetching
- Animations and gesture handling
- The `Background` component's `LinearGradient` (uses runtime gradient values from theme)

## Out of scope

- Redesigning any UI
- Adding new screens or features
- Migrating shadows to CSS (not feasible in React Native)
