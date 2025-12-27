# 🌌 AniVerse

AniVerse is a modern, dark-themed anime discovery web app that lets users explore trending anime, search titles in real time, and view detailed information — powered by the **Jikan API (MyAnimeList)**.

Designed with a clean streaming-style UI, AniVerse focuses on clarity, performance, and a smooth browsing experience.

---

## ✨ Features

- 🎬 **Trending Hero Slider**
  - Displays **unique trending anime** (no duplicates)
  - Auto-rotating Swiper carousel
  - Clean dark overlay for perfect readability

- 🔍 **Real-time Anime Search**
  - Search anime instantly using the Jikan API
  - Automatically switches from homepage to results view
  - Clearing the search restores the default homepage

- 📺 **Trending Anime Grid**
  - Popular anime list with hover effects
  - Genre chips, scores, and quick previews

- ⏳ **Coming Soon Section**
  - Upcoming / high-scoring anime
  - Horizontal Swiper carousel

- 🪟 **Anime Details Modal**
  - Poster, synopsis, score, status, episodes, and genres
  - Smooth open/close animations

- 🌑 **Dark Mode Only**
  - No theme toggle
  - Consistent visuals
  - No white overlays or contrast issues

---

## 🛠️ Tech Stack

- **HTML5**
- **CSS3** (Custom dark-mode design system)
- **Vanilla JavaScript**
- **Swiper.js** (carousels)
- **Boxicons** (icons)
- **Jikan API** (MyAnimeList REST API)

---

## 📂 Project Structure

AniVerse/
│
├── index.html # Main HTML file
├── style.css # Dark-mode UI styles
├── index.js # App logic & API handling
├── favicon.svg # Project favicon
└── README.md # Project documentation


---

## 🚀 How to Run Locally

### Option 1: Open directly
1. Download or clone the repository
2. Open `index.html` in your browser

### Option 2: Using Live Server (Recommended)
1. Open the project in **VS Code**
2. Install **Live Server**
3. Right-click `index.html` → **Open with Live Server**

---

## 🔗 API Used

- **Jikan API v4**
  - Endpoint: `https://api.jikan.moe/v4/anime`
  - No API key required
  - Rate-limited (handled with delays in JS)

---

## 🧠 App Behavior Summary

- **Default page**
  - Hero slider visible
  - Trending anime list shown

- **When searching**
  - Hero section hidden
  - Search results displayed

- **When search is cleared**
  - Hero section restored
  - Trending list reloaded

---

## ⚠️ Notes

- This project is **frontend-only**
- All data comes from a public API
- Image availability depends on MyAnimeList data
- Built for learning, portfolio, and UI experimentation

---

## 📸 Preview

> Dark-themed anime discovery inspired by modern streaming platforms.

---

## 👤 Author

**AniVerse**  
© 2025 AniVerse. All rights reserved.

---

## 📄 License

This project is for **educational and portfolio purposes**.  
All anime data and images belong to their respective owners via MyAnimeList.

