# Dual Calendar Journal Chrome Extension

A comprehensive Chrome extension for dual-mode daily journaling with separate work and personal calendars.

## Features

### Phase 1 (Current)
- **Dual Calendar Modes**: Toggle between Work and Personal calendars
- **Monthly Calendar View**: Clean, intuitive interface with visual entry indicators
- **Entry Management**: Add, edit, and delete journal entries with titles and summaries
- **Tag System**: Predefined and custom tags for better organization
- **Mood Tracking**: Emoji-based mood selector for personal entries
- **Theme Support**: Multiple themes including Light, Dark, Ocean, Nature, and Violet
- **Local Storage**: All data stored securely in browser's localStorage
- **Password Protection**: Optional PIN/password protection for personal calendar
- **Activity Logging**: Comprehensive day-wise logs for all user actions
- **Log Management**: View, filter, search, and export activity logs

### Phase 2 (Planned)
- Advanced analytics and statistics
- Data export/import functionality
- Google Calendar integration
- Cloud synchronization
- Enhanced security features

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the extension directory
5. The extension icon should appear in your browser toolbar

## File Structure

```
dual-calendar-journal/
├── manifest.json          # Extension manifest
├── popup.html             # Main popup interface
├── script/popup.js               # Main application logic
├── other/background.js          # Background service worker
├── styles/styles.css             # All styling and themes
├── icons/                 # Extension icons (16x16, 32x32, 48x48, 128x128)
└── README.md             # Documentation
```

## Usage

### Getting Started
1. Click the extension icon to open the calendar
2. Toggle between **Work** and **Personal** modes using the header buttons
3. Click any calendar day to add or view entries
4. Use the theme button (🎨) to customize appearance

### Adding Entries
1. Click on any calendar day
2. Fill in optional title and summary (required)
3. Select mood (Personal calendar only)
4. Add tags by typing or clicking suggested tags
5. Click "Save" to store your entry

### Personal Calendar Security
- First time accessing Personal mode: set a password
- Password required each session to access personal entries
- Use "Set New Password" to change existing password

### Viewing Activity Logs
1. Click the logs button (📋) in the header
2. Use filters to view specific:
   - Calendar types (Work/Personal/All)
   - Actions (Create/Edit/Delete/All)
   - Specific dates
3. Export logs to JSON format
4. View activity statistics

### Log Features
- **Permanent Storage**: Logs persist even when entries are deleted
- **Detailed Tracking**: Records all changes with timestamps
- **Separate Logs**: Work and Personal calendars have separate log files
- **Search & Filter**: Find specific activities quickly
- **Export Capability**: Download logs for backup or analysis

### Themes
Available themes:
- ☀️ Light (default)
- 🌙 Dark
- 💙 Ocean
- 💚 Nature
- 💜 Violet
- 🎲 Random

## Data Storage

All data is stored locally in your browser using localStorage:
- `workCalendarEntries`: Work calendar journal entries
- `personalCalendarEntries`: Personal calendar journal entries
- `workCalendarLog`: Complete activity log for work calendar
- `personalCalendarLog`: Complete activity log for personal calendar
- `personalCalendarPassword`: Encrypted password for personal access
- `calendarTheme`: Selected theme preference

### Log Format
Activity logs are stored in JSON format with the following structure:
```json
{
  "2025-08-10": [
    {
      "timestamp": "2025-08-10T09:15:23Z",
      "action": "create",
      "entryId": "entry-001",
      "calendar": "work",
      "details": {
        "title": "Team Meeting",
        "summary": "Discussed project deadlines",
        "tags": ["meeting", "urgent"]
      }
    }
  ]
}
```

## Development

### Prerequisites
- Chrome browser with Developer mode enabled
- Basic knowledge of HTML, CSS, and JavaScript

### Local Development
1. Make changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test changes in the popup

### Adding New Features
The codebase is modular and well-structured:
- **popup.js**: Main application class `DualCalendarJournal`
- **styles.css**: Theme system with CSS custom properties
- **background.js**: Service worker for advanced features

## Customization

### Adding New Themes
1. Add theme variables in `styles.css`:
```css
[data-theme="mytheme"] {
  --bg-primary: #your-color;
  --accent-work: #your-accent;
  /* ... other variables */
}
```

2. Add theme option in `popup.html`:
```html
<button class="theme-option" data-theme="mytheme">🎨 My Theme</button>
```

### Adding New Tag Categories
Modify the tag arrays in `popup.js`:
```javascript
this.workTags = ['your', 'custom', 'tags'];
this.personalTags = ['more', 'custom', 'tags'];
```

## Security

- Passwords are encoded using base64 (basic protection)
- All data remains local to your browser
- No external data transmission in current version
- Future versions will implement proper encryption

## Browser Compatibility

- Chrome (Manifest V3)
- Edge (Chromium-based)
- Other Chromium-based browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Future Roadmap

### Phase 2 Features
- [ ] Advanced statistics and analytics
- [ ] Data export (JSON, CSV formats)
- [ ] Data import functionality
- [ ] Enhanced password security
- [ ] Backup and restore
- [ ] Search functionality

### Phase 3 Features
- [ ] Google Calendar integration
- [ ] Cloud synchronization
- [ ] Cross-device access
- [ ] Collaborative features
- [ ] API for third-party integrations

## License

MIT License - see LICENSE file for details

## Support

For issues, feature requests, or questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include browser version and error messages if applicable

## Changelog

### v1.0.0 (Current)
- Initial release
- Dual calendar functionality
- Basic entry management
- Theme system
- Password protection
- Tag system
- Mood tracking
- Local storage implementation

---

**Note**: This extension is currently in active development. Features and interfaces may change between versions.