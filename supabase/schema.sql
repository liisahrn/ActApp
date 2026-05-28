-- ============================================================
-- ActApp — Full Database Schema
-- Run this in Supabase Studio: SQL Editor → New query → Run
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PROFILES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE,
  avatar_url  TEXT,
  xp          INTEGER NOT NULL DEFAULT 0,
  level       INTEGER NOT NULL DEFAULT 1,
  timezone    TEXT NOT NULL DEFAULT 'UTC',
  country     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ── ACTIONS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS actions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'general',
  action_type     TEXT NOT NULL DEFAULT 'carbon' CHECK (action_type IN ('carbon', 'community')),
  co2_equivalent  NUMERIC(10,3) NOT NULL DEFAULT 0,
  impact_unit     TEXT NOT NULL DEFAULT 'kg CO₂',
  gem_reward      INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'published')),
  publish_date    DATE,
  ai_prompt_used  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published actions" ON actions FOR SELECT USING (status = 'published');

-- ── COMPLETIONS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS completions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_id     UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  streak_day    INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, action_id)
);

ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own completions" ON completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read their own completions" ON completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can read all completions" ON completions FOR SELECT USING (true);

-- ── STREAKS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS streaks (
  user_id                UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak         INTEGER NOT NULL DEFAULT 0,
  longest_streak         INTEGER NOT NULL DEFAULT 0,
  last_completion_date   DATE
);

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own streak" ON streaks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read streaks for leaderboard" ON streaks FOR SELECT USING (true);

-- ── BADGES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  description      TEXT NOT NULL,
  category         TEXT NOT NULL DEFAULT 'general',
  image_url        TEXT,
  condition_type   TEXT NOT NULL,
  condition_value  INTEGER NOT NULL DEFAULT 1
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read badges" ON badges FOR SELECT USING (true);

-- ── USER_BADGES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_badges (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id   UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can insert badges" ON user_badges FOR INSERT WITH CHECK (true);

-- ── FRIENDSHIPS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS friendships (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their friendships" ON friendships FOR ALL USING (auth.uid() = follower_id);
CREATE POLICY "Anyone can see who follows whom" ON friendships FOR SELECT USING (true);

-- ── GROUPS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS groups (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'school' CHECK (type IN ('school', 'company')),
  country       TEXT,
  admin_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read groups" ON groups FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create groups" ON groups FOR INSERT WITH CHECK (auth.uid() = admin_user_id);

-- ── GROUP_MEMBERS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS group_members (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id    UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  joined_at   TIMESTAMPTZ,
  UNIQUE(group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their group memberships" ON group_members FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Group admins can manage members" ON group_members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM groups WHERE id = group_members.group_id AND admin_user_id = auth.uid())
);
CREATE POLICY "Anyone can read group members" ON group_members FOR SELECT USING (true);

-- ── IMPACT_REPORTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS impact_reports (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_id             UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  date                  DATE NOT NULL UNIQUE,
  total_completions     INTEGER NOT NULL DEFAULT 0,
  co2_saved_kg          NUMERIC(12,3) NOT NULL DEFAULT 0,
  generated_image_url   TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE impact_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read impact reports" ON impact_reports FOR SELECT USING (true);

-- ── PUSH_TOKENS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_tokens (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  expo_push_token   TEXT NOT NULL UNIQUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their push tokens" ON push_tokens FOR ALL USING (auth.uid() = user_id);

-- ── SEED: STARTER BADGES ──────────────────────────────────────
INSERT INTO badges (name, description, category, image_url, condition_type, condition_value) VALUES
  ('First Step',      'Complete your first action',          'milestone', '🌱', 'completions', 1),
  ('Week Warrior',    'Complete 7 actions in a row',         'streak',    '🔥', 'streak',      7),
  ('Month Legend',    'Complete 30 actions in a row',        'streak',    '⚡', 'streak',      30),
  ('Energy Hero',     'Complete 5 energy actions',           'energy',    '💡', 'category',    5),
  ('Green Commuter',  'Complete 5 transport actions',        'transport', '🚲', 'category',    5),
  ('Plant-Based',     'Complete 5 food actions',             'food',      '🥗', 'category',    5),
  ('Community Hero',  'Complete 5 social actions',           'social',    '💚', 'category',    5),
  ('Eco Warrior',     'Reach 500 XP',                        'xp',        '🏅', 'xp',          500),
  ('Climate Champion','Reach 5,000 XP',                      'xp',        '🏆', 'xp',          5000),
  ('Planet Saver',    'Save 100kg of CO₂ total',             'impact',    '🌍', 'co2',         100)
ON CONFLICT DO NOTHING;

-- ── SEED: SAMPLE ACTIONS (for testing) ────────────────────────
INSERT INTO actions (title, description, category, action_type, co2_equivalent, gem_reward, impact_unit, status, publish_date) VALUES
  (
    'Turn off lights in empty rooms',
    'Walk through your home and switch off any lights left on in rooms no one is using. It sounds tiny — but if everyone does it, the numbers are wild.',
    'energy', 'carbon', 0.5, 0, 'kg CO₂', 'published', CURRENT_DATE
  ),
  (
    'Tell a friend something you appreciate about them',
    'Send a genuine message to someone you care about. Positive social connections make climate action feel communal, not lonely.',
    'social', 'community', 0.0, 10, 'good deed', 'published', CURRENT_DATE
  ),
  (
    'Walk or cycle instead of driving today',
    'For any journey under 3km today, choose your feet or a bike instead of a car or bus. Your body and the planet will thank you.',
    'transport', 'carbon', 1.2, 0, 'kg CO₂', 'published', CURRENT_DATE + 1
  )
ON CONFLICT DO NOTHING;
