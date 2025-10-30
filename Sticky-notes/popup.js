const MAX_TABS = 10;
let tabs = [];
let activeTab = 0;
let listMode = false;
let saveTimeout;
let lastSavedTime = '';
let theme = 'light';
let customTheme = { style: 'gradient', color1: '#1a1a2e', color2: '#16213e' };

const tabsContainer = document.getElementById('tabs-container');
const noteInput = document.getElementById('noteInput');
const statusBar = document.getElementById('statusBar');
const listModeBtn = document.getElementById('listModeBtn');
const exportBtn = document.getElementById('exportBtn');
const copyBtn = document.getElementById('copyBtn');
const themeSelect = document.getElementById('themeSelect');
const customThemeControls = document.getElementById('customThemeControls');
const customStyleSelect = document.getElementById('customStyleSelect');
const color1Picker = document.getElementById('color1');
const color2Picker = document.getElementById('color2');

// --- Fake Data Mapping ---
const fakerMap = {
  name: () => fakerName(),
  email: () => fakerEmail(),
  phone: () => fakerPhone(),
  address: () => fakerAddress(),
  pan: () => fakerPAN(),
  password: () => fakerPassword()
};

// --- Theme Logic ---
function applyTheme() {
  document.body.className = theme;
  if (theme === 'custom') {
    let bg = customTheme.style === 'solid'
      ? customTheme.color1
      : `linear-gradient(135deg, ${customTheme.color1}, ${customTheme.color2})`;
    document.body.style.background = bg;
  } else if (theme === 'random') {
    const c1 = randomColor();
    const c2 = randomColor();
    document.body.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
  } else {
    document.body.style.background = '';
  }
}

function randomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

// --- Tabs UI ---
function renderTabs() {
  tabsContainer.innerHTML = '';
  tabs.forEach((tab, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'tab-wrapper';

    const el = document.createElement('div');
    el.className = 'tab' + (index === activeTab ? ' active' : '');
    el.title = tab.name;

    if (tab.renaming) {
      const input = document.createElement('input');
      input.className = 'rename-input';
      input.value = tab.name;
      input.addEventListener('blur', () => finishRename(index, input.value));
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') input.blur();
      });
      input.focus();
      el.appendChild(input);
    } else {
      const span = document.createElement('span');
      span.className = 'tab-title';
      span.textContent = tab.name;
      el.appendChild(span);

      const rename = document.createElement('span');
      rename.className = 'rename-icon';
      rename.textContent = '🖉';
      rename.title = 'Rename';
      rename.addEventListener('click', (e) => {
        e.stopPropagation();
        tab.renaming = true;
        renderTabs();
      });
      el.appendChild(rename);

      if (tabs.length > 1) {
        const close = document.createElement('span');
        close.className = 'close-icon';
        close.textContent = '✕';
        close.title = 'Delete tab';
        close.addEventListener('click', (e) => {
          e.stopPropagation();
          tabs.splice(index, 1);
          if (activeTab >= tabs.length) activeTab = tabs.length - 1;
          renderTabs();
          noteInput.value = tabs[activeTab].content;
          autoSave();
        });
        el.appendChild(close);
      }

      el.addEventListener('click', () => {
        tabs[activeTab].content = noteInput.value;
        activeTab = index;
        noteInput.value = tabs[activeTab].content;
        renderTabs();
        autoSave();
      });
    }

    wrapper.appendChild(el);
    tabsContainer.appendChild(wrapper);
  });

  if (tabs.length < MAX_TABS) {
    const add = document.createElement('div');
    add.className = 'tab add-tab';
    add.textContent = '+';
    add.title = 'New tab';
    add.addEventListener('click', () => {
      tabs[activeTab].content = noteInput.value;
      tabs.push({ name: `Tab ${tabs.length + 1}`, content: '' });
      activeTab = tabs.length - 1;
      renderTabs();
      noteInput.value = '';
      autoSave();
    });
    tabsContainer.appendChild(add);
  }
}

function finishRename(index, newName) {
  tabs[index].name = newName || `Tab ${index + 1}`;
  tabs[index].renaming = false;
  renderTabs();
  autoSave();
}

function autoSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    tabs[activeTab].content = noteInput.value;
    chrome.storage.local.set({ tabs, theme, customTheme }, () => {
      lastSavedTime = new Date().toLocaleTimeString();
      updateStatusBar();
    });
  }, 500);
}

function updateStatusBar() {
  statusBar.textContent = `Last saved at ${lastSavedTime}`;
}

// --- Button Events ---
listModeBtn.addEventListener('click', () => {
  listMode = !listMode;
  listModeBtn.classList.toggle('active', listMode);
  autoSave();
});

copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(noteInput.value);
});

exportBtn.addEventListener('click', () => {
  tabs[activeTab].content = noteInput.value;
  const data = JSON.stringify({ tabs }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'stickynotes_backup.json';
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('clearTab').addEventListener('click', () => {
  noteInput.value = '';
  autoSave();
});

// --- Text Input ---
noteInput.addEventListener('input', autoSave);

noteInput.addEventListener('keydown', (e) => {
  const bullet = '• ';
  if (listMode && e.key === 'Enter') {
    e.preventDefault();
    const start = noteInput.selectionStart;
    const indent = noteInput.value.lastIndexOf('\n', start - 1) >= 0
      ? noteInput.value.slice(noteInput.value.lastIndexOf('\n', start - 1) + 1, start).match(/^\t*/)[0]
      : '';
    const newLine = '\n' + indent + bullet;
    noteInput.value = noteInput.value.slice(0, start) + newLine + noteInput.value.slice(start);
    noteInput.selectionStart = noteInput.selectionEnd = start + newLine.length;
    autoSave();
  }
});

// --- Theme Events ---
themeSelect.addEventListener('change', () => {
  theme = themeSelect.value;
  customThemeControls.style.display = theme === 'custom' ? 'block' : 'none';
  applyTheme();
  autoSave();
});

customStyleSelect.addEventListener('change', () => {
  customTheme.style = customStyleSelect.value;
  color2Picker.style.display = customTheme.style === 'gradient' ? 'inline-block' : 'none';
  applyTheme();
  autoSave();
});

color1Picker.addEventListener('input', () => {
  customTheme.color1 = color1Picker.value;
  applyTheme();
  autoSave();
});

color2Picker.addEventListener('input', () => {
  customTheme.color2 = color2Picker.value;
  applyTheme();
  autoSave();
});

// --- Keyboard Shortcuts ---
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'c') {
    const selection = window.getSelection().toString();
    if (!selection) {
      e.preventDefault();
      copyBtn.click();
    }
  }
  if (e.ctrlKey && e.key === 'e') { e.preventDefault(); exportBtn.click(); }
  if (e.ctrlKey && e.key === 't') {
    e.preventDefault();
    let next = ['light', 'dark', 'custom', 'random'];
    theme = next[(next.indexOf(theme) + 1) % next.length];
    themeSelect.value = theme;
    customThemeControls.style.display = theme === 'custom' ? 'block' : 'none';
    applyTheme();
    autoSave();
  }
  if (e.ctrlKey && e.key === 'l') { e.preventDefault(); listModeBtn.click(); }
  if (e.ctrlKey && /^\d$/.test(e.key)) {
    const n = +e.key - 1;
    if (tabs[n]) {
      tabs[activeTab].content = noteInput.value;
      activeTab = n;
      noteInput.value = tabs[activeTab].content;
      renderTabs(); autoSave();
    }
  }
});

// --- Initialize from Storage ---
chrome.storage.local.get(['tabs', 'theme', 'customTheme'], (res) => {
  tabs = res.tabs?.length ? res.tabs : [{ name: '1', content: '' }];
  theme = res.theme || 'light';
  customTheme = res.customTheme || customTheme;
  themeSelect.value = theme;
  customThemeControls.style.display = theme === 'custom' ? 'block' : 'none';
  color1Picker.value = customTheme.color1;
  color2Picker.value = customTheme.color2;
  customStyleSelect.value = customTheme.style;
  applyTheme();
  renderTabs();
  noteInput.value = tabs[activeTab].content;
  noteInput.focus();
  lastSavedTime = new Date().toLocaleTimeString();
  updateStatusBar();
});

// --- Fake Data Insertion ---
async function appendFakeData(type) {
  const lines = noteInput.value.trim().split('\n');
  const existing = {};

  for (const line of lines) {
    const [label] = line.split(':');
    if (label) existing[label.trim().toLowerCase()] = line;
  }

  let value;
  if (type === 'name' || type === 'address') {
    value = await fakerMap[type]();
  } else {
    value = fakerMap[type]();
  }

  if (value instanceof Promise) {
    value = await value;
  }

  existing[type] = `${capitalize(type)}: ${value}`;
  noteInput.value = Object.values(existing).join('\n');
  autoSave();
}

document.querySelectorAll('#fakerControls button').forEach(btn => {
  btn.addEventListener('click', () => appendFakeData(btn.dataset.type));
});

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- Fake Data Generators ---
async function fakerName() {
  const res = await fetch('https://randomuser.me/api/');
  const data = await res.json();
  const user = data.results[0].name;
  return `${user.first} ${user.last}`;
}

function fakerEmail() {
  const lines = noteInput.value.trim().split('\n');
  let nameLine = lines.find(line => line.toLowerCase().startsWith('name:'));
  if (nameLine) {
    const name = nameLine.split(':')[1].trim().toLowerCase().replace(/\s+/g, '.');
    return `${name}@gmail.com`;
  }
  return `user${Math.floor(Math.random() * 10000)}@gmail.com`;
}

function fakerPhone() {
  return '9' + Math.floor(100000000 + Math.random() * 900000000);
}

async function fakerAddress() {
  try {
    const res = await fetch('https://fakerapi.it/api/v1/addresses?_quantity=1');
    const data = await res.json();
    const addr = data.data[0];
    return `${addr.buildingNumber} ${addr.streetName}, ${addr.city}, ${addr.country} - ${addr.zipcode}`;
  } catch (err) {
    console.warn('Address API failed, using fallback');
    return fallbackAddress();
  }
}

function fallbackAddress() {
  const streets = ['Main St', 'High St', 'Park Ave', 'Broadway', 'Fifth Ave'];
  const cities = ['New York', 'London', 'Berlin', 'Tokyo', 'Paris'];
  const countries = ['USA', 'UK', 'Germany', 'Japan', 'France'];
  return `${Math.floor(Math.random() * 900 + 100)} ${streets[Math.floor(Math.random() * streets.length)]}, ${cities[Math.floor(Math.random() * cities.length)]}, ${countries[Math.floor(Math.random() * countries.length)]}`;
}


function fakerPAN() {
  const chars = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `${chars()}${chars()}${chars()}${chars()}${chars()}${Math.floor(Math.random() * 10000)}`;
}

function fakerPassword() {
  return Math.random().toString(36).slice(-8);
}

// clock
function startLiveClock() {
  const clockEl = document.getElementById('liveClock');
  if (!clockEl) return;
  setInterval(() => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString();
    clockEl.textContent = `${date} • ${time}`;
  }, 1000);
}

startLiveClock();
