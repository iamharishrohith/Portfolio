# ⚔️ Solo Leveling Portfolio (The Monarch System)

> *"I am the architect of my own destiny."*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React Native](https://img.shields.io/badge/React_Native-Expo-blue?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**The Monarch System** is a high-fidelity, gamified portfolio ecosystem inspired by the hit webtoon/anime *Solo Leveling*. It transforms standard developer portfolio features into a "System" interface, complete with leveling, quests, and stats.

## 🌌 System Overview

This project is a monorepo containing two powerful interfaces:

### 1. 🖥️ The Web Portal (Next.js)
A public-facing portfolio that feels like a "Hunter's Status Screen".
- **Dynamic "Ability Tree":** visualize skills and proficiency.
- **Quest Log:** Track daily coding habits and contributions.
- **Dungeon Records:** Showcase projects with case studies and metrics.
- **System Logs:** A dynamic blog/article section.
- **Live Analytics:** Track visitor "System Activity".

### 2. 📱 The Admin App (React Native / Expo)
A mobile companion app acting as the "Player's Menu".
- **CMS on the Go:** Manage projects, skills, and testimonials from your phone.
- **Real-time Updates:** Changes in the app reflect instantly on the web via Supabase.
- **Daily Protocols:** Check off daily quests (habits) and track XP gain.
- **Secure Access:** Biometric/Pin-protected "Admin Mode".

## 🛠️ Tech Stack & Arsenal

- **Core:** Next.js 14 (App Router), React Native (Expo SDK 50)
- **Styling:** Tailwind CSS (NativeWind for mobile)
- **Database:** Supabase (PostgreSQL) + Row Level Security (RLS)
- **Auth:** Supabase Auth (Email/Password)
- **State:** React Context + Hooks (`useGameState`)
- **Assets:** FontAwesome, Lucide React Native, Lottie Animations

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+
- Supabase Account

### 1. Clone the "System"
```bash
git clone https://github.com/iamharishrohith/Portfolio.git
cd Portfolio
```

### 2. Configure Environment (`.env.local`)
Create a `.env.local` file in both `website` and `app` directories:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### 3. Initialize the Web Portal
```bash
cd website
npm install
npm run dev
# Portal opens at localhost:3000
```

### 4. Initialize the Mobile App
```bash
cd ../app
npm install
npx expo start
# Scan QR code with Expo Go
```

## 🛡️ Database Schema
The system relies on a robust PostgreSQL schema with RLS policies.
- `profiles`: Stores Hunter stats (XP, Level, Rank).
- `projects`: "Dungeon Instances" (Portfolio items).
- `skills`: "Abilities" with proficiency tracking.
- `quests`: Daily habits and "System Directives".

## 🤝 Contributing
The System is closed source for now, but "Guild Applications" (PRs) are welcome for bug fixes.

---
*"Arise."*
