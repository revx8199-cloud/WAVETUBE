# 🌊 WaveTube

**WaveTube is like YouTube, but better.**

A full-featured video-sharing platform built as a single-page web app — video uploads and playback, a social feed with posts and polls, channels, subscriptions, live notifications, VIP perks, and a full admin control panel. Built entirely through prompting (vibe-coded), no manual coding.

🔗 **Live site:** https://revx8199-cloud.github.io/WAVETUBE/

---

## ✨ Features

### Core platform
- Custom video player (progress bar, buffering indicator, volume, fullscreen)
- Channels with avatars, subscriptions, and subscriber notifications
- Social feed: text/image posts, polls with live vote counts, comments, likes
- Real-time updates (new posts, notifications) via Supabase Realtime
- Presence/heartbeat system (online status tracking)
- Save videos / Watch Later lists
- Light and dark theme, persisted in local storage
- Multi-language UI (Polish, Russian)

### VIP & Admin systems
- **VIP panel** — perks for VIP-listed users (custom name colors/fonts, badges)
- **Admin panel** — user management, mute/ban controls, badge color customization
- **Admin console** — moderation tools and platform oversight
- Report system for flagging content
- Stats panel for tracking platform activity

### Security
- XSS protection on user-generated content (posts, comments, profile fields)
- Row-level security policies configured in Supabase
- Rate limiting on post submissions

---

## 🛠️ Tech Stack

- **Frontend:** Vanilla HTML/CSS/JavaScript (single-file architecture)
- **Backend:** [Supabase](https://supabase.com) — Auth, Postgres database, Realtime subscriptions, Row-Level Security
- **Hosting:** GitHub Pages
- **Fonts:** Google Fonts (30+ display fonts for custom username styling)

---

## 📁 Project Structure

```
WAVETUBE/
├── index.html      # Entire application (UI, styles, and logic)
└── музыка.mp3       # Audio asset
```

---

## 🚀 About this project

WaveTube is a solo passion project, built entirely through prompt-driven development with Claude — no code written by hand, just iteration through natural language and testing. It started as a simple video page and grew into a full social platform with its own moderation and VIP infrastructure.

---

## 📌 Status

Actively developed. New features are added regularly.
