# 🌊 WaveTube

**WaveTube is like YouTube, but better.**

A full-featured video-sharing platform — video uploads and playback, Shorts (vertical full-screen feed), a social feed with posts and polls, channels, subscriptions, direct messages with voice/video calls, live notifications, VIP perks, and a full admin control panel. Built entirely through prompting (vibe-coded), no manual coding.

🔗 **Live site:** https://revx8199-cloud.github.io/WAVETUBE/

---

## ✨ Features

### Core platform
- Custom video player (progress bar, buffering indicator, volume, fullscreen)
- **Shorts** — TikTok/YouTube-style vertical full-screen feed with autoplay, likes/dislikes, comments, share
- Channels with avatars, subscriptions, and subscriber notifications
- Social feed: text/image posts, polls with live vote counts, comments, likes/dislikes
- Direct messages with voice/video calls (browser push notifications when closed, via service worker)
- Real-time updates (new posts, notifications) via Supabase Realtime
- Presence/heartbeat system (online status tracking)
- Save videos / Watch Later lists, playlists
- Light and dark theme, persisted in local storage
- Multi-language UI: Polish, English, Russian, Spanish

### VIP & Admin systems
- **VIP panel** — perks for VIP-listed users (custom name colors/fonts, avatar frames, emoji styles, badges)
- **Admin panel / Studio** — user management, mute/ban controls, badge color customization, site-wide announcements
- Report system for flagging content (videos, posts)
- Stats panel for tracking platform activity

### Security
- XSS protection on user-generated content (posts, comments, profile fields)
- Row-level security policies configured in Supabase
- Rate limiting on post submissions, like/dislike spam protection (server-side, per-user tracking)

---

## 🛠️ Tech Stack

- **Frontend:** Vanilla HTML/CSS/JavaScript (multi-file: logic split across core.js, videos.js, channel.js, posts.js, messages.js, admin.js, translations.js)
- **Backend:** [Supabase](https://supabase.com) — Auth, Postgres database, Realtime subscriptions, Row-Level Security
- **Hosting:** GitHub Pages
- **Fonts:** Google Fonts (30+ display fonts for custom username styling)

---

## 📁 Project Structure

```
WAVETUBE/
├── index.html         # Markup + page structure
├── style.css           # Styles
├── core.js             # Core app logic, comments, settings, i18n engine
├── videos.js            # Video player, Shorts feed, upload
├── channel.js            # Channel pages
├── posts.js              # Social feed, polls, channel Home/Shorts tabs
├── messages.js            # Direct messages, voice/video calls
├── admin.js               # Admin panel / Studio
├── translations.js        # pl/en/ru/es translations
└── sw.js                  # Service worker (push notifications)
```

---

## 🚀 About this project

WaveTube is a solo passion project, built entirely through prompt-driven development with Claude — no code written by hand, just iteration through natural language and testing. It started as a simple video page and grew into a full social platform with its own moderation and VIP infrastructure.

---

## 📌 Status

Actively developed. New features are added regularly.
