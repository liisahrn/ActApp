# ActApp

**A gamified climate action app for Gen Z.**

![Expo](https://img.shields.io/badge/Expo-55-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.83-61DAFB?logo=react&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-backend-3ECF8E?logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)

---

## What is ActApp?

ActApp turns everyday climate actions into a game. Users complete daily challenges, build streaks, earn XP and badges, and track their real-world impact — CO₂ saved, water conserved, waste reduced. Built for Gen Z with a dark, modern UI and a community layer that makes sustainability feel social.

---

## Features

| Feature | Status |
| --- | --- |
| Onboarding flow (interests, causes, location) | ✅ Built |
| Email / Google / Apple auth | ✅ Built |
| Daily & weekly actions with streaks | ✅ Built |
| XP, levels & badges | ✅ Built |
| Impact dashboard (CO₂, water, waste) | ✅ Built |
| Shareable impact reports | ✅ Built |
| Push notifications | ✅ Built |
| Community groups & challenges | 🚧 In progress |
| iOS App Store deployment | 🚧 In progress |

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Expo (React Native) |
| Language | TypeScript |
| Backend / Auth / DB | Supabase |
| State management | Zustand |
| Navigation | Expo Router |
| Animations | React Native Reanimated |

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- A [Supabase](https://supabase.com) project

### Install

```bash
git clone https://github.com/your-org/ActApp.git
cd ActApp
```

### Environment

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Database

Apply the schema to your Supabase project:

```bash
# In the Supabase dashboard SQL editor, run:
supabase/schema.sql
```

### Run

```bash
npx expo start
```

Press `i` for iOS simulator, `a` for Android, or scan the QR code with Expo Go.

---

## Project Structure

```text
app/              # Screens (Expo Router file-based routing)
  _layout.tsx     # Root layout & auth guard
  index.tsx       # Home / actions feed
  onboarding.tsx  # Onboarding flow
  impact-report.tsx

components/       # Reusable UI components
store/            # Zustand state (auth, actions)
lib/              # Supabase client
constants/        # Theme, styles
supabase/         # DB schema
assets/           # Icons, images
```

---

## Contributing

1. Branch from `main` using the format `your-name/feature-description`
2. Run the app locally and verify your changes
3. Open a pull request against `main` with a clear description of what changed and why
