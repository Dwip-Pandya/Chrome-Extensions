# 🔐 LockVault Password Manager

A secure, browser-based password manager Chrome extension that helps you store, organize, and manage login credentials with an elegant glassmorphism UI.

![LockVault](https://img.shields.io/badge/version-1.0.0-blue)
![Chrome Extension](https://img.shields.io/badge/platform-Chrome-green)
![License](https://img.shields.io/badge/license-MIT-orange)

## ✨ Features

### 🔑 Credential Management
- **Add/Edit/Delete** credentials with ease
- Store website URL, account name, username/email, and password
- **Password visibility toggle** (show/hide)
- **Copy to clipboard** for username and password with one click
- Visual feedback with notifications

### 🏷️ Smart Tag System
- **Organize credentials** with custom tags (e.g., Work, Social, Banking)
- **Filter by tags** to quickly find related credentials
- **"Undefined" category** for untagged credentials
- **Tag count badges** showing number of credentials per tag
- Click any tag badge to instantly filter

### 🔍 Search & Sort
- **Global search** across account names, URLs, usernames, and tags
- **Real-time filtering** as you type
- **Multiple sort options:**
  - A-Z (Alphabetical)
  - Z-A (Reverse alphabetical)
  - Recently Added
  - Recently Updated

### 📋 Activity Logging
- **Automatic logging** of all actions (Add, Edit, Delete, Import)
- **Timestamped entries** with readable dates
- **View logs** in dedicated modal
- **Download logs** as .log file for backup
- **Clear logs** option with confirmation

### 💾 Backup & Restore
- **Export all data** to JSON format
- **Import backup** to restore credentials
- Includes credentials and logs in export
- Safe data migration between devices

### 🎨 Beautiful UI/UX
- **Glassmorphism design** with backdrop blur effects
- **Dark mode** (default) and **Light mode** support
- **Smooth animations** and transitions
- **Responsive design** for all screen sizes
- **Floating logs button** for quick access
- **Toast notifications** for user feedback

### 🔒 Security Features
- All data stored locally using Chrome Storage API
- No cloud storage or external servers
- Data never leaves your browser
- Complete privacy and security

## 📦 Installation

### Method 1: Manual Installation (Development)

1. **Download or Clone** this repository
   ```bash
   git clone https://github.com/yourusername/lockvault.git
   ```

2. **Generate Icons**
   - Open `icon-generator.html` in your browser
   - Click "Download All Icons"
   - Create an `icons` folder in the extension directory
   - Move all downloaded PNG files to the `icons` folder

3. **Load Extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right corner)
   - Click **Load unpacked**
   - Select the LockVault extension folder

4. **Launch LockVault**
   - Click the LockVault icon in your Chrome toolbar
   - The full-page dashboard will open in a new tab

### Method 2: Chrome Web Store (Coming Soon)
*LockVault will be available on the Chrome Web Store soon for one-click installation.*

## 📂 File Structure

```
lockvault/
├── icons/
│   ├── icon16.png          # 16x16 icon
│   ├── icon32.png          # 32x32 icon
│   ├── icon48.png          # 48x48 icon
│   └── icon128.png         # 128x128 icon
├── manifest.json           # Extension configuration
├── background.js           # Service worker
├── dashboard.html          # Main UI
├── dashboard.js            # Core functionality
├── styles.css              # Glassmorphism styling
├── icon-generator.html     # Icon generator tool
└── README.md              # Documentation
```

## 🚀 Usage Guide

### Adding a New Credential

1. Click the **"➕ Add New Credential"** button in the top bar
2. Fill in the required fields:
   - Account Name (e.g., "Gmail Personal")
   - Website URL (e.g., "https://gmail.com")
   - Username/Email
   - Password
   - Tags (optional, comma-separated)
3. Click **"Save Credential"**

### Editing a Credential

1. Click the **✏️ Edit** button on any credential card
2. Modify the fields as needed
3. Click **"Update Credential"**

### Deleting a Credential

1. Click the **🗑️ Delete** button on any credential card
2. Confirm deletion in the modal
3. The credential will be permanently removed and logged

### Using Tags

- **Add tags** when creating/editing credentials (comma-separated)
- **Filter by tag** by clicking a tag badge or using the sidebar
- **View all credentials** by clicking "All Credentials"
- **View untagged** by clicking "Undefined"

### Searching Credentials

- Use the search bar to find credentials by:
  - Account name
  - Website URL
  - Username
  - Tag names
- Results update in real-time as you type

### Viewing Passwords

- Click the **👁️ Eye icon** in any credential card to reveal the password
- Click again to hide it
- Use the **📋 Copy button** to copy without revealing

### Backup & Restore

**To Export:**
1. Click **"📤 Export Backup"** in the sidebar
2. A JSON file will download with all your data
3. Store this file in a secure location

**To Import:**
1. Click **"📥 Import Backup"** in the sidebar
2. Select your previously exported JSON file
3. All credentials and logs will be restored

### Viewing Activity Logs

1. Click the **📋 floating button** (bottom-right corner)
2. View all logged actions with timestamps
3. **Download logs** for record-keeping
4. **Clear logs** if needed (with confirmation)

### Switching Themes

- Click the **theme toggle button** in the sidebar
- Toggle between Dark Mode (🌙) and Light Mode (☀️)
- Your preference is saved automatically

## 🛠️ Technical Details

### Technologies Used

- **HTML5** - Structure and markup
- **CSS3** - Glassmorphism styling with animations
- **JavaScript (ES6+)** - Core functionality
- **Chrome Extensions API** - Storage and browser integration
- **Chrome Storage API** - Local data persistence

### Storage

- Uses `chrome.storage.local` for all data storage
- No external databases or cloud services
- Data stored locally on your device
- Maximum storage: 5MB (Chrome limitation)

### Browser Compatibility

- **Chrome** (Manifest V3)
- **Edge** (Chromium-based)
- **Brave** (Chromium-based)
- **Opera** (Chromium-based)

*Note: Firefox is not currently supported as it uses a different manifest format.*

## 🔐 Security & Privacy

### Data Storage
- All credentials stored locally using Chrome's encrypted storage
- No data transmitted to external servers
- No analytics or tracking
- Complete offline functionality

### Recommendations
- Use a strong master password for your browser profile
- Regularly export backups and store them securely
- Keep your browser updated
- Use LockVault only on trusted devices

### Limitations
- Data is tied to your Chrome profile
- If you clear browser data, LockVault data will be lost
- Always maintain backups of your credentials

## 📝 Changelog

### Version 1.0.0 (Initial Release)
- ✅ Full credential management (Add, Edit, Delete)
- ✅ Tag system with filtering
- ✅ Global search functionality
- ✅ Multiple sort options
- ✅ Activity logging system
- ✅ Export/Import backup feature
- ✅ Dark/Light theme support
- ✅ Glassmorphism UI design
- ✅ Responsive layout
- ✅ Password visibility toggle
- ✅ Copy to clipboard functionality
- ✅ Toast notifications

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser version
- Screenshots (if applicable)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**LockVault Password Manager**
- Created with ❤️ for secure password management

## ⚠️ Disclaimer

This is a personal password manager for local storage. While we implement security best practices, please:
- Use at your own risk
- Always maintain backups
- Consider using additional security measures
- This tool is not a replacement for enterprise password management solutions

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/lockvault/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/lockvault/discussions)
- **Email**: support@lockvault.com

## 🌟 Show Your Support

If you find LockVault helpful, please:
- ⭐ Star this repository
- 🐦 Share on social media
- 📝 Write a review
- 🤝 Contribute to the project

---

**Made with 🔐 for password security enthusiasts**

*Last Updated: October 29, 2025*