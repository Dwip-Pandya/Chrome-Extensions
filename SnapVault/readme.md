# SnapVault – Quick Screenshot + Notes Chrome Extension

SnapVault is a lightweight, fully frontend **Chrome Extension** that allows you to quickly capture screenshots of your active browser tabs, add notes for context, and manage them efficiently — all **without a backend**. It’s perfect for developers, designers, students, or anyone who wants to save and organize web page snapshots with additional information.

---

## Features

### 1. Capture Screenshots
- Capture the **current visible tab** as a PNG image.
- Add a **text note** describing the screenshot or context.
- Inline messages show feedback when a screenshot is captured or saved.

### 2. Sidebar Navigation
- **Home Tab:** Capture screenshots and add notes.
- **Screenshots Tab:** Browse all saved screenshots.
- **Date Filter:** Search screenshots by date.
- **Clear Filter:** Reset the date filter to show all screenshots.

### 3. Manage Screenshots
- **View Full Size:** Open a screenshot in a new tab to see it in full resolution.
- **Visit Original Page:** Click the **URL link** under the screenshot title to revisit the exact page where the screenshot was taken.
- **Download:** Save screenshots as PNG files with a timestamped filename.
- **Delete:** Remove unwanted screenshots from storage.

### 4. Storage
- Saves screenshots, notes, timestamps, and tab info locally using `chrome.storage.local`.
- Fully frontend, no server or backend needed.

### 5. UI / UX
- Clean sidebar layout with **Home** and **Screenshots** tabs.
- Inline success/error messages for better user feedback.
- Responsive design, works in the extension popup.

---

## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer Mode** in the top right corner.
4. Click **Load unpacked** and select the folder containing this extension.
5. Pin the extension to your toolbar for easy access.

---

## Usage

1. Click the SnapVault extension icon.
2. **Home Tab:**
   - Click **Capture Current Tab** to take a screenshot.
   - Add a **note** in the textarea.
   - Click **Save Screenshot & Note** to store it.
3. **Screenshots Tab:**
   - Browse saved screenshots.
   - Click the **URL link** to revisit the original webpage.
   - Filter by date or clear the filter.
   - Click **View Full Size**, **Download**, or **Delete** as needed.

---

## Technical Details

- **Technologies:** HTML, CSS, JavaScript, Chrome Extension APIs.
- **Storage:** `chrome.storage.local` for offline and local storage.
- **Notifications:** Inline messages replace alert popups (CSP-safe).
- **Popup Size:** Optimized for extension popup (responsive) with clear sidebar layout.

---

## Screenshots

![Home Tab](screenshots/home-tab.png)  
*Capture screenshots and add notes.*

![Screenshots Tab](screenshots/screenshots-tab.png)  
*Browse, visit original pages, filter, view, download, or delete saved screenshots.*

---

## License

This project is open source and available under the **MIT License**.
