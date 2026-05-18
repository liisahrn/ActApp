# Agent Instructions


You're working inside the **WAT framework** (Workflows, Agents, Tools). This architecture separates concerns so that probabilistic AI handles reasoning while deterministic code handles execution. That separation is what makes this system reliable.

## The WAT Architecture

**Leyer 1: Workflows (The Instructions)**
- Markdown SOPs stored in `workflows/`
- Each workflow defines the objective, required inputs, which tools to use, expected outputs, and how to handle edge cases
- Written in plain language, the same way you'd brief someone on your team


**Layer 2: Agents (The Decision-Maker)**
- This is your role. You're responsible for intelligent coordination.
- Read the relevant workflow, run tools in the correct sequence, handle failures gracefully, and ask clarifying questions when needed
- You connect intent to execution without trying to do everything yourself
- Example: If you need to pull data from a website, don't attempt it directly. Read `workflows/scrape_website.md`, figure out the required inputs, then execute
`tools/scrape_single_site.py`


**Layer 3: Tools (The Execution)**
- Python scripts in `tools/` that do the actual work
- API calls, data transformations, file operations, database queries
- Credentials and API keys are stored in `.env`
- These scripts are consistent, testable, and fast


**Why this matters:** 
When AI tries to handle every step directly, accuracy drops fast.
If each step is 90% accurate, you're down to 59% success after just five steps. By offloading execution to deterministic scripts, you stay focused on orchestration and decision-making where you excel.



## How to Operate

**1. Look for existing tools first**
Before building anything new, check `tools/` based on what your workflow requires. Only create new scripts when nothing exists for that task.


**3. Keep workflows current**

Workflows should evolve as you learn. When you find better metho constraints, or encounter recurring issues, update the workflow. create or overwrite workflows without asking unless I explicitly your instructions and need to be preserved and refined, not toss

## The Self-Improvement Loop
Every failure is a chance to make the system stronger:

1. Identify what broke
2. Fix the tool


## File structure

.tmp/   
# Temporary files (scraped data, intermediate exports). Regenerated as needed.

tools/
# Python scripts for deterministic execution

workflows/ 
# Markdown SOPs defining what to do and how

.env 
# API keys and environment variables (NEVER store secrets anywhere elese)
credentials. json, token. json # Google Auth (gitignored)


**Core principle:** Local files are just for processing. Anything I need to see or use lives in cloud services. Everything in `.tmp/` is disposable.


## Bottom Line

You sit between what I want (workflows) and what actually gets done (tools). Your job is to read instructions, make smart decisions, call the right tools, recover from errors, and keep improving the system as you go.


## Build me an Expo React Native app for a gamified climate mindset platform with login, profiles, streaks and challenges. Prepare it for iOS App Store deployment.

npx expo prebuild
npx expo build:ios


## My Project: ACTAPP

A gamified climate action app for Gen Z built with React Native (Expo) + Supabase.

### Stack
- Frontend: React Native (Expo)
- Backend: Supabase (auth, database, real-time)

### Core MVP features
- Onboarding flow (interests, causes, location)
- User accounts (email/Google/Apple login)
- Daily/weekly action system with streaks & points
- Impact dashboard (CO₂, water, waste tracked)
- Community groups & challenges
- Clean, modern Gen Z UI
```

