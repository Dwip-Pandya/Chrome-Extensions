# Installation Guide - Dual Calendar Journal

## Quick Installation Steps

### 1. Download the Extension Files
Create a new folder on your computer called `dual-calendar-journal` and save all the provided files:

```
dual-calendar-journal/
├── manifest.json
├── popup.html
├── script / popup.js
├── other / background.js
├── styles / styles.css
├── README.md
└── icons/ (create this folder and add icons)
```

### 2. Create Icon Files
Since icons aren't provided in the code, you'll need to create simple icon files or download them:

**Option A: Create Simple Icons**
1. Create an `icons` folder in your extension directory
2. Create four PNG files with the following names and sizes:
   - `icon16.png` (16x16 pixels)
   - `icon32.png` (32x32 pixels)  
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)

You can create simple colored squares or use any calendar/journal icon you prefer.

**Option B: Use Placeholder Icons (Temporary)**
If you want to test quickly, you can temporarily comment out the icon references in `manifest.json` by adding `//` before the icon lines.

### 3. Load the Extension in Chrome

1. **Open Chrome Extensions Page**
   - Go to `chrome://extensions/` in your browser
   - Or click the three dots menu → More tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner

3. **Load Unpacked Extension**
   - Click "Load unpacked" button
   - Navigate to and select your `dual-calendar-journal` folder
   - Click "Select Folder"

4. **Verify Installation**
   - The extension should appear in your extensions list
   - You should see the extension icon in your browser toolbar
   - If there are any errors, they'll be displayed in red

### 4. Test the Extension

1. **Click the Extension Icon**
   - The calendar popup should open
   - Default view shows the Work calendar

2. **Test Basic Functionality**
   - Click on different days to add entries
   - Toggle between Work and Personal modes
   - Try different themes using the theme button (🎨)

3. **Test Personal Calendar Protection**
   - Switch to Personal mode
   - Set up a password when prompted
   - Verify password protection works

## Troubleshooting

### Common Issues

**Extension won't load:**
- Check that all files are in the correct folder
- Ensure `manifest.json` is valid (no syntax errors)
- Look for error messages in the Extensions page

**Icons not showing:**
- Create the icon files as described above
- Or temporarily remove icon references from manifest.json

**Popup doesn't open:**
- Check the browser console for JavaScript errors
- Ensure popup.js and popup.html are in the root directory
- Verify popup.html has correct script reference

**Storage issues:**
- Make sure you're testing on `http://` or `https://` pages
- localStorage might not work on `file://` URLs
- Check browser settings allow extensions to access storage

### Development Tips

**Reloading Changes:**
1. Make your code changes
2. Go to `chrome://extensions/`
3. Click the refresh/reload icon on your extension
4. Test the changes

**Debugging:**
1. Right-click the extension icon → "Inspect popup"
2. Use the Developer Tools console to see errors
3. Check the Console tab for JavaScript errors

**Storage Inspection:**
1. Open popup, then inspect it
2. Go to Application tab → Local Storage
3. View stored entries and settings

## File Descriptions

### Required Files

**manifest.json** - Extension configuration and permissions
**popup.html** - Main user interface
**popup.js** - All application logic and functionality  
**styles.css** - Styling and themes
**background.js** - Background service worker

### Optional Files

**README.md** - Documentation
**package.json** - Project metadata (for development)

## Advanced Configuration

### Customizing Default Settings

You can modify default settings by editing the following in `popup.js`:

```javascript
// Change default tags
this.workTags = ['your', 'custom', 'work', 'tags'];
this.personalTags = ['your', 'personal', 'tags'];

// Change default theme
// In loadTheme() method, change 'light' to your preferred theme
const theme = localStorage.getItem('calendarTheme') || 'dark';
```

### Adding Custom Themes

1. Edit `styles.css` to add new theme variables:
```css
[data-theme="mytheme"] {
  --bg-primary: #your-background;
  --accent-work: #your-work-color;
  --accent-personal: #your-personal-color;
  /* ... other variables */
}
```

2. Add the theme option in `popup.html`:
```html
<button class="theme-option" data-theme="mytheme">🎨 My Theme</button>
```

### Modifying Calendar Behavior

**Change calendar start day:**
Currently starts on Sunday. To change to Monday, modify the calendar rendering logic in `popup.js`.

**Add more mood options:**
Edit the mood selector in `popup.html` and add corresponding styles.

## Publishing to Chrome Web Store (Future)

When ready to publish:

1. **Prepare for Review**
   - Add proper icons (PNG format, correct sizes)
   - Write detailed description
   - Take screenshots for store listing
   - Test thoroughly across different Chrome versions

2. **Create Store Listing**
   - Go to Chrome Web Store Developer Dashboard
   - Pay one-time $5 developer registration fee
   - Upload packaged extension (.zip file)
   - Fill out store listing details

3. **Package Extension**
   ```bash
   # Remove development files and create zip
   zip -r dual-calendar-journal.zip . -x '*.git*' 'node_modules/*' '*.DS_Store' 'package*.json' 'INSTALLATION_GUIDE.md'
   ```

## Security Considerations

### Current Implementation
- Basic password encoding (base64)
- Local storage only
- No external connections

### For Production Use
Consider implementing:
- Proper password hashing (bcrypt or similar)
- Data encryption for sensitive entries
- Backup mechanisms
- Import/export with encryption

## Performance Tips

### Storage Optimization
- Current implementation stores all entries in memory
- For heavy users, consider:
  - Lazy loading of old entries
  - Data pagination
  - IndexedDB for large datasets

### UI Optimization
- Calendar renders efficiently for current month
- Modal system minimizes DOM manipulation
- CSS animations are hardware-accelerated

## Backup and Migration

### Manual Backup
Users can manually backup data by:
1. Opening browser Developer Tools
2. Going to Application → Local Storage
3. Copying the calendar entry data

### Future Backup Features
Planned features include:
- One-click export to JSON
- Automatic backup reminders
- Cloud storage integration

## Browser Permissions Explained

The extension requests minimal permissions:

**"storage"** - To save journal entries locally
**"activeTab"** - For potential future features (currently unused)
**Host permissions for googleapis.com** - For future Google Calendar sync

## Development Roadmap

### Immediate Improvements (v1.1)
- [ ] Better icon set
- [ ] Enhanced password security  
- [ ] Search functionality
- [ ] Entry templates

### Phase 2 Features (v2.0)
- [ ] Statistics and analytics
- [ ] Data export/import
- [ ] Multiple calendar support
- [ ] Recurring entry templates

### Phase 3 Features (v3.0)
- [ ] Google Calendar sync
- [ ] Cloud backup
- [ ] Sharing capabilities
- [ ] Mobile companion

## Support and Community

### Getting Help
- Check the README for common solutions
- Review browser console for error messages
- Search existing GitHub issues

### Contributing
- Fork the repository
- Create feature branches
- Submit pull requests
- Follow existing code style

### Reporting Issues
Include the following information:
- Chrome version
- Operating system
- Steps to reproduce
- Error messages or console output
- Expected vs actual behavior

---

**Happy Journaling!** 📝✨

This extension is designed to help you maintain consistent journaling habits while keeping your work and personal reflections organized and secure.