# 🖼️ Wallpaper Dashboard – Chrome Extension

**Wallpaper Dashboard** is a sleek and functional Chrome extension that transforms your new tab into a dynamic wallpaper dashboard with weather, clock, customizable bookmarks, and sticky notes — all designed for a smooth and polished user experience.

---

# ✨ Features

- ✅ **Dynamic Wallpapers**  
  - Fetches random HD images from the Unsplash API
  - Smooth fade-in animation on wallpaper load
  - Download current wallpaper in full resolution
- 🌤 **Weather & Time Widget**  
  - Real-time weather using OpenWeatherMap API with automatic location detection
  - Live clock with second-by-second updates
  - Displays weather condition, temperature, current time, and date
- 📌 **Custom Bookmark Bar**  
  - Add up to 10 bookmarks from your Chrome bookmarks
  - Multi-select bookmarks via checkboxes with **"Select All"** option
  - Search bookmarks by name or URL
  - Remove bookmarks with a simple click
  - Bookmark icons with smooth hover animations
- 📝 **Sticky Notes**  
  - Add, drag, resize, minimize, and delete notes on the dashboard
  - Auto-save content, position, and size between sessions
  - Up to 10 notes with random color themes
  - Smart positioning to avoid overlap
- 🎨 **User Experience Enhancements**  
  - Glass-style blur effects with smooth animations
  - Responsive layout for all screen sizes
  - Toast notifications for actions like downloads and bookmark updates
- 🗓️ **Yearly Calendar**  
  - Glass-style Yearly Calendar
---

# 📦 Installation (Unpacked)

> ⚠ Not published on Chrome Web Store yet.

1. Download or clone this repository
2. Place all files in a folder named `Wallpaper-Dashboard`
3. Open Chrome and go to `chrome://extensions/`
4. Enable **Developer mode**
5. Click **"Load unpacked"**
6. Select the `Wallpaper-Dashboard` folder
7. Open a new tab to see your dashboard

---

# 🛠 How to Use

- Open a new tab to see a fresh HD wallpaper
- Click the download button (top-left) to save the wallpaper
- Click the **"+"** button at the bottom to open bookmark selection modal
- Search, select, and add bookmarks to your bottom bar (max 10)
- Drag, resize, minimize, or delete sticky notes as needed
- Notes and bookmarks are saved automatically and persist across sessions

---

# 📁 Backup & Restore

- Uses Chrome Storage API for automatic saving of bookmarks and notes
- No manual backup currently implemented

---

# 🛠 Tech Stack

- HTML5, CSS3 (glassmorphism, animations, responsive design)
- JavaScript ES6+
- Chrome Extension APIs (`chrome.bookmarks`, `chrome.storage`, `chrome.tabs`)
- Unsplash API for wallpapers
- OpenWeatherMap API for weather

---

# ✏ Author

Made with 💙 by Pandya Dwip A.  
Email – aydnapdwip@gmail.com  
LinkedIn – https://in.linkedin.com/in/pandya-dwip

---

# 📜 License

This project is open-source for personal use.  
Feel free to fork, improve, and customize it as you wish.