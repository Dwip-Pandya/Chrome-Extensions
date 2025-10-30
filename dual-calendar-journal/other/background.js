// Background script for Dual Calendar Journal Extension

// Handle installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Dual Calendar Journal installed');

        // Set default settings
        chrome.storage.local.set({
            'defaultTheme': 'light',
            'firstRun': true
        });
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('Dual Calendar Journal started');
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'exportData':
            handleDataExport(sendResponse);
            return true; // Keep message channel open for async response

        case 'importData':
            handleDataImport(request.data, sendResponse);
            return true;

        case 'exportLogs':
            handleLogsExport(request.calendar, sendResponse);
            return true;

        case 'clearLogs':
            handleLogsClear(request.calendar, request.beforeDate, sendResponse);
            return true;

        case 'getLogStats':
            handleLogStats(sendResponse);
            return true;

        case 'syncWithGoogleCalendar':
            // Future implementation for Google Calendar sync
            sendResponse({ success: false, message: 'Google Calendar sync not yet implemented' });
            break;

        default:
            sendResponse({ error: 'Unknown action' });
    }
});

// Handle data export
function handleDataExport(sendResponse) {
    chrome.storage.local.get(null, (data) => {
        const exportData = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            workEntries: data.workCalendarEntries || {},
            personalEntries: data.personalCalendarEntries || {},
            workLogs: data.workCalendarLog || {},
            personalLogs: data.personalCalendarLog || {},
            settings: {
                theme: data.calendarTheme || 'light'
            }
        };

        sendResponse({
            success: true,
            data: exportData
        });
    });
}

// Handle data import
function handleDataImport(importData, sendResponse) {
    try {
        const dataToStore = {};

        if (importData.workEntries) {
            dataToStore.workCalendarEntries = importData.workEntries;
        }

        if (importData.personalEntries) {
            dataToStore.personalCalendarEntries = importData.personalEntries;
        }

        if (importData.workLogs) {
            dataToStore.workCalendarLog = importData.workLogs;
        }

        if (importData.personalLogs) {
            dataToStore.personalCalendarLog = importData.personalLogs;
        }

        if (importData.settings) {
            if (importData.settings.theme) {
                dataToStore.calendarTheme = importData.settings.theme;
            }
        }

        chrome.storage.local.set(dataToStore, () => {
            sendResponse({
                success: true,
                message: 'Data imported successfully'
            });
        });

    } catch (error) {
        sendResponse({
            success: false,
            message: 'Failed to import data: ' + error.message
        });
    }
}

// Handle logs export
function handleLogsExport(calendar, sendResponse) {
    const keys = calendar ?
        [calendar === 'work' ? 'workCalendarLog' : 'personalCalendarLog'] :
        ['workCalendarLog', 'personalCalendarLog'];

    chrome.storage.local.get(keys, (data) => {
        const exportData = {
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            calendar: calendar || 'all',
            logs: {}
        };

        if (calendar) {
            exportData.logs[calendar] = data[keys[0]] || {};
        } else {
            exportData.logs.work = data.workCalendarLog || {};
            exportData.logs.personal = data.personalCalendarLog || {};
        }

        sendResponse({
            success: true,
            data: JSON.stringify(exportData, null, 2)
        });
    });
}

// Handle logs clearing
function handleLogsClear(calendar, beforeDate, sendResponse) {
    if (!calendar || (calendar !== 'work' && calendar !== 'personal')) {
        sendResponse({
            success: false,
            message: 'Invalid calendar type'
        });
        return;
    }

    const logKey = calendar === 'work' ? 'workCalendarLog' : 'personalCalendarLog';

    chrome.storage.local.get([logKey], (data) => {
        if (beforeDate) {
            const logs = data[logKey] || {};
            const cutoffDate = new Date(beforeDate);

            Object.keys(logs).forEach(dateKey => {
                const logDate = new Date(dateKey);
                if (logDate < cutoffDate) {
                    delete logs[dateKey];
                }
            });

            chrome.storage.local.set({ [logKey]: logs }, () => {
                sendResponse({
                    success: true,
                    message: `Cleared ${calendar} logs before ${beforeDate}`
                });
            });
        } else {
            chrome.storage.local.remove([logKey], () => {
                sendResponse({
                    success: true,
                    message: `Cleared all ${calendar} logs`
                });
            });
        }
    });
}

// Handle log statistics
function handleLogStats(sendResponse) {
    chrome.storage.local.get(['workCalendarLog', 'personalCalendarLog'], (data) => {
        const workLogs = data.workCalendarLog || {};
        const personalLogs = data.personalCalendarLog || {};

        const stats = {
            totalActions: 0,
            actionCounts: { create: 0, edit: 0, delete: 0 },
            calendarCounts: { work: 0, personal: 0 },
            dateRange: { earliest: null, latest: null },
            dailyActivity: {}
        };

        [
            { calendar: 'work', logs: workLogs },
            { calendar: 'personal', logs: personalLogs }
        ].forEach(({ calendar, logs }) => {
            Object.entries(logs).forEach(([date, dayLogs]) => {
                if (!stats.dailyActivity[date]) {
                    stats.dailyActivity[date] = { work: 0, personal: 0 };
                }

                dayLogs.forEach(log => {
                    stats.totalActions++;
                    stats.actionCounts[log.action] = (stats.actionCounts[log.action] || 0) + 1;
                    stats.calendarCounts[calendar]++;
                    stats.dailyActivity[date][calendar]++;

                    const logDate = new Date(log.timestamp);
                    if (!stats.dateRange.earliest || logDate < stats.dateRange.earliest) {
                        stats.dateRange.earliest = logDate;
                    }
                    if (!stats.dateRange.latest || logDate > stats.dateRange.latest) {
                        stats.dateRange.latest = logDate;
                    }
                });
            });
        });

        sendResponse({
            success: true,
            stats: stats
        });
    });
}

// Set up context menus (optional feature)
chrome.contextMenus.create({
    id: 'quickEntry',
    title: 'Quick Journal Entry',
    contexts: ['page']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'quickEntry') {
        // Open extension popup or create a quick entry
        chrome.action.openPopup();
    }
});

// Handle alarm for daily reminders (future feature)
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'dailyJournalReminder') {
        // Send notification reminder
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Daily Journal Reminder',
            message: 'Don\'t forget to write in your journal today!'
        });
    }
});

// Utility function to create daily reminder
function createDailyReminder() {
    chrome.alarms.create('dailyJournalReminder', {
        when: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
        periodInMinutes: 24 * 60 // Repeat every 24 hours
    });
}