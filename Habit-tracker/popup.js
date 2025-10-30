// popup.js (module)

/** -------------------------------
 * Storage helpers (chrome.storage.local)
 * -------------------------------- */
const storage = {
    async get(keys) {
        return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
    },
    async set(obj) {
        return new Promise((resolve) => chrome.storage.local.set(obj, resolve));
    }
};

// Keys: habits[], records{ [date]: { [habitId]: {status, reason, updatedAt, completedAt} } }
async function loadAll() {
    const { habits = [], records = {} } = await storage.get(["habits", "records"]);
    return { habits, records };
}
async function saveHabits(habits) {
    await storage.set({ habits });
}
async function saveRecords(records) {
    await storage.set({ records });
}

/** -------------------------------
 * Date utilities
 * -------------------------------- */
const pad = (n) => String(n).padStart(2, "0");
const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromYmd = (y, m, d) => new Date(Number(y), Number(m) - 1, Number(d));
const fmtLong = (d) =>
    d.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" });
const monthDays = (y, m) => new Date(y, m, 0).getDate(); // m: 1-12
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const startOfWeek = (d) => { const x = new Date(d); const day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day); return x; }; // Monday
const endOfWeek = (d) => addDays(startOfWeek(d), 6);

/** -------------------------------
 * Business logic
 * -------------------------------- */
// if a day has zero habits globally, we count discipline as 0% (no free 100s)
function isPerfectDay(habits, dayRecord) {
    if (!habits.length) return false;
    if (!dayRecord) return false;
    for (const h of habits) {
        const item = dayRecord[h.id];
        if (!item || item.status !== "done") return false;
    }
    return true;
}
function dayPercent(habits, dayRecord) {
    return isPerfectDay(habits, dayRecord) ? 100 : 0;
}

function summarizeReasons(dayRecord) {
    const reasons = [];
    if (!dayRecord) return reasons;
    for (const hid in dayRecord) {
        const it = dayRecord[hid];
        if (it.status === "failed" && it.reason?.trim()) reasons.push(it.reason.trim());
    }
    return reasons;
}

async function setHabitStatus(dateKey, habitId, status, reason) {
    const { records } = await loadAll();
    const day = records[dateKey] || {};
    const now = Date.now();
    day[habitId] = {
        ...(day[habitId] || {}),
        status,
        reason: status === "failed" ? (reason ?? (day[habitId]?.reason || "")) : "",
        updatedAt: now,
        completedAt: status === "done" ? now : (day[habitId]?.completedAt || null)
    };
    records[dateKey] = day;
    await saveRecords(records);
}

async function clearHabitStatus(dateKey, habitId) {
    const { records } = await loadAll();
    const day = records[dateKey] || {};
    if (day[habitId]) {
        delete day[habitId];
        records[dateKey] = day;
        await saveRecords(records);
    }
}

/** -------------------------------
 * UI: Tabs
 * -------------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function setupTabs() {
    $$(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            $$(".tab-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const tab = btn.dataset.tab;
            $$(".tab-panel").forEach(p => p.classList.remove("active"));
            $(`#tab-${tab}`).classList.add("active");
        });
    });

    $$(".subtab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            $$(".subtab-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const sub = btn.dataset.subtab;
            $$(".report-panel").forEach(p => p.classList.remove("active"));
            $(`#report-${sub}`).classList.add("active");
        });
    });
}

/** -------------------------------
 * HABITS TAB (CRUD)
 * -------------------------------- */
async function renderHabitsTab() {
    const { habits } = await loadAll();
    const list = $("#habit-list");
    list.innerHTML = "";
    const tpl = $("#habit-item-template");

    for (const h of habits) {
        const li = tpl.content.firstElementChild.cloneNode(true);
        $(".habit-name", li).textContent = h.name;
        const nameEl = $(".habit-name", li);
        $(".edit", li).addEventListener("click", async () => {
            const newName = prompt("Rename habit:", h.name);
            if (newName && newName.trim() && newName.trim() !== h.name) {
                h.name = newName.trim();
                await saveHabits(habits);
                nameEl.textContent = h.name;
                await refreshToday();
                await refreshTimeline(true);
                await refreshReportsAfterHabitChange();
            }
        });
        $(".delete", li).addEventListener("click", async () => {
            if (!confirm(`Delete habit "${h.name}"? This removes it from all days.`)) return;
            // remove habit + purge from records
            const idx = habits.findIndex(x => x.id === h.id);
            if (idx >= 0) habits.splice(idx, 1);
            const { records } = await loadAll();
            for (const d in records) {
                if (records[d][h.id]) delete records[d][h.id];
            }
            await saveHabits(habits);
            await saveRecords(records);
            li.remove();
            await refreshToday();
            await refreshTimeline(true);
            await refreshReportsAfterHabitChange();
        });
        list.appendChild(li);
    }

    $("#habit-add").onclick = async () => {
        const input = $("#habit-input");
        const name = input.value.trim();
        if (!name) return;
        const newHabit = { id: crypto.randomUUID(), name, createdAt: Date.now() };
        habits.push(newHabit);
        await saveHabits(habits);
        input.value = "";
        await renderHabitsTab();
        await refreshToday();
        await refreshTimeline(true);
        await refreshReportsAfterHabitChange();
    };
}

/** -------------------------------
 * TODAY TAB
 * -------------------------------- */
async function refreshToday() {
    const today = new Date();
    const key = toKey(today);
    const { habits, records } = await loadAll();
    const dayRec = records[key] || {};

    $("#today-date-label").textContent = fmtLong(today);
    $("#today-subtitle").textContent = habits.length ? `${habits.length} habit(s)` : `Create habits first`;

    const ul = $("#today-habit-list");
    ul.innerHTML = "";
    $("#today-empty-habits").classList.toggle("hidden", habits.length > 0);

    const tpl = $("#today-row-template");
    for (const h of habits) {
        const li = tpl.content.firstElementChild.cloneNode(true);
        $(".row-title", li).textContent = h.name;

        const done = $(".status-done", li);
        const failed = $(".status-failed", li);
        const clear = $(".clear", li);
        const reasonRow = $(".reason-row", li);
        const reason = $(".reason", li);

        // unique radio group per habit
        const group = `status-${h.id}`;
        done.name = group;
        failed.name = group;

        const current = dayRec[h.id];
        if (current?.status === "done") done.checked = true;
        if (current?.status === "failed") {
            failed.checked = true;
            reasonRow.classList.remove("hidden");
            reason.value = current.reason || "";
        }

        done.addEventListener("change", async () => {
            if (done.checked) {
                reasonRow.classList.add("hidden");
                reason.value = "";
                await setHabitStatus(key, h.id, "done", "");
                await updateTodayMeter();
                await updateTimelineCardForDate(key); // live sync
                await refreshReportLiveImpact(key);
            }
        });
        failed.addEventListener("change", async () => {
            if (failed.checked) {
                reasonRow.classList.remove("hidden");
                await setHabitStatus(key, h.id, "failed", reason.value.trim());
                await updateTodayMeter();
                await updateTimelineCardForDate(key);
                await refreshReportLiveImpact(key);
            }
        });
        reason.addEventListener("input", async () => {
            if (failed.checked) {
                await setHabitStatus(key, h.id, "failed", reason.value.trim());
                await updateTodayMeter();
                await updateTimelineCardForDate(key);
                await refreshReportLiveImpact(key);
            }
        });
        clear.addEventListener("click", async () => {
            done.checked = false;
            failed.checked = false;
            reasonRow.classList.add("hidden");
            reason.value = "";
            await clearHabitStatus(key, h.id);
            await updateTodayMeter();
            await updateTimelineCardForDate(key);
            await refreshReportLiveImpact(key);
        });

        ul.appendChild(li);
    }

    await updateTodayMeter();
}

async function updateTodayMeter() {
    const today = toKey(new Date());
    const { habits, records } = await loadAll();
    const pct = dayPercent(habits, records[today]);
    $("#today-meter").style.width = pct + "%";
    $("#today-meter-text").textContent = pct + "%";
}

/** -------------------------------
 * TIMELINE TAB (infinite forward scroll)
 * -------------------------------- */
let timelineState = {
    anchor: toKey(new Date()), // start at today
    loadedCount: 0,
    batch: 14,
    indexOffset: 0, // days from anchor
};

async function renderInitialTimeline() {
    const wrap = $("#timeline");
    wrap.innerHTML = "";
    timelineState.loadedCount = 0;
    timelineState.indexOffset = 0;
    await loadMoreDays();
    const scroller = $("#timeline");
    scroller.removeEventListener("scroll", onTimelineScroll);
    scroller.addEventListener("scroll", onTimelineScroll);
}

async function loadMoreDays() {
    $("#timeline-spinner").classList.remove("hidden");
    const { habits, records } = await loadAll();
    const wrap = $("#timeline");
    const tpl = $("#timeline-day-template");

    for (let i = 0; i < timelineState.batch; i++) {
        const idx = timelineState.indexOffset + i;
        const d = addDays(fromYmd(...timelineState.anchor.split("-")), idx);
        const key = toKey(d);
        const dayRec = records[key] || {};
        const pct = dayPercent(habits, dayRec);

        const card = tpl.content.firstElementChild.cloneNode(true);
        $(".day-title", card).textContent = fmtLong(d);
        $(".day-subtitle", card).textContent = habits.length ? `${habits.length} habit(s)` : `No habits`;
        $(".pill-value", card).textContent = pct + "%";
        $(".day-summary", card).textContent = `${Object.values(dayRec).filter(x => x?.status === "done").length}/${habits.length} done`;

        // details editor
        const dayList = $(".day-habits", card);
        await buildDayEditor(dayList, habits, key, dayRec);

        wrap.appendChild(card);
    }
    timelineState.loadedCount += timelineState.batch;
    timelineState.indexOffset += timelineState.batch;
    $("#timeline-spinner").classList.add("hidden");
}

async function buildDayEditor(ul, habits, dateKey, dayRec) {
    ul.innerHTML = "";
    const tpl = $("#today-row-template");
    for (const h of habits) {
        const li = tpl.content.firstElementChild.cloneNode(true);
        $(".row-title", li).textContent = h.name;

        const done = $(".status-done", li);
        const failed = $(".status-failed", li);
        const clear = $(".clear", li);
        const reasonRow = $(".reason-row", li);
        const reason = $(".reason", li);

        const group = `status-${dateKey}-${h.id}`;
        done.name = group;
        failed.name = group;

        const current = dayRec[h.id];
        if (current?.status === "done") done.checked = true;
        if (current?.status === "failed") {
            failed.checked = true;
            reasonRow.classList.remove("hidden");
            reason.value = current.reason || "";
        }

        done.addEventListener("change", async () => {
            if (done.checked) {
                reasonRow.classList.add("hidden");
                reason.value = "";
                await setHabitStatus(dateKey, h.id, "done", "");
                await updateTimelineCardForDate(dateKey);
                await refreshReportLiveImpact(dateKey);
                await updateTodayMeter();
            }
        });
        failed.addEventListener("change", async () => {
            if (failed.checked) {
                reasonRow.classList.remove("hidden");
                await setHabitStatus(dateKey, h.id, "failed", reason.value.trim());
                await updateTimelineCardForDate(dateKey);
                await refreshReportLiveImpact(dateKey);
                await updateTodayMeter();
            }
        });
        reason.addEventListener("input", async () => {
            if (failed.checked) {
                await setHabitStatus(dateKey, h.id, "failed", reason.value.trim());
                await updateTimelineCardForDate(dateKey);
                await refreshReportLiveImpact(dateKey);
                await updateTodayMeter();
            }
        });
        clear.addEventListener("click", async () => {
            done.checked = false;
            failed.checked = false;
            reasonRow.classList.add("hidden");
            reason.value = "";
            await clearHabitStatus(dateKey, h.id);
            await updateTimelineCardForDate(dateKey);
            await refreshReportLiveImpact(dateKey);
            await updateTodayMeter();
        });

        ul.appendChild(li);
    }
}

async function updateTimelineCardForDate(dateKey) {
    // find the card and update the summary + pill
    const { habits, records } = await loadAll();
    const wrap = $("#timeline");
    const cards = $$(".day-card", wrap);
    for (const card of cards) {
        const title = $(".day-title", card).textContent;
        // match by dateKey
        const d = new Date(title);
        const k = toKey(d);
        if (k === dateKey) {
            const dayRec = records[dateKey] || {};
            $(".pill-value", card).textContent = dayPercent(habits, dayRec) + "%";
            $(".day-summary", card).textContent = `${Object.values(dayRec).filter(x => x?.status === "done").length}/${habits.length} done`;

            // also rebuild its editor inside details
            await buildDayEditor($(".day-habits", card), habits, dateKey, dayRec);
            break;
        }
    }
}

async function refreshTimeline(reset = false) {
    if (reset) {
        await renderInitialTimeline();
    } else {
        // update all pills quickly
        const { habits, records } = await loadAll();
        const wrap = $("#timeline");
        const cards = $$(".day-card", wrap);
        for (const card of cards) {
            const d = new Date($(".day-title", card).textContent);
            const k = toKey(d);
            const dayRec = records[k] || {};
            $(".pill-value", card).textContent = dayPercent(habits, dayRec) + "%";
            $(".day-summary", card).textContent = `${Object.values(dayRec).filter(x => x?.status === "done").length}/${habits.length} done`;
        }
    }
}

async function onTimelineScroll(e) {
    const el = e.target;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
        await loadMoreDays();
    }
}

/** -------------------------------
 * REPORTS
 * -------------------------------- */
function fillDayMonthYearSelects(prefix, date = new Date()) {
    const ySel = $(`#${prefix}-year`);
    const mSel = $(`#${prefix}-month`);
    const dSel = $(`#${prefix}-day`);

    if (ySel) {
        ySel.innerHTML = "";
        const currentYear = new Date().getFullYear();
        for (let y = currentYear - 3; y <= currentYear + 3; y++) {
            const opt = document.createElement("option"); opt.value = String(y); opt.textContent = y;
            if (y === date.getFullYear()) opt.selected = true;
            ySel.appendChild(opt);
        }
    }
    if (mSel) {
        mSel.innerHTML = "";
        for (let m = 1; m <= 12; m++) {
            const opt = document.createElement("option"); opt.value = String(m); opt.textContent = new Date(2000, m - 1, 1).toLocaleString(undefined, { month: "short" });
            if (m === date.getMonth() + 1) opt.selected = true;
            mSel.appendChild(opt);
        }
    }
    if (dSel) {
        dSel.innerHTML = "";
        const year = Number(ySel.value);
        const month = Number(mSel.value);
        const days = monthDays(year, month);
        for (let d = 1; d <= days; d++) {
            const opt = document.createElement("option"); opt.value = String(d); opt.textContent = d;
            if (d === date.getDate()) opt.selected = true;
            dSel.appendChild(opt);
        }
    }
}

async function loadDailyReport() {
    const y = $("#daily-year").value;
    const m = $("#daily-month").value;
    const d = $("#daily-day").value;
    const key = `${y}-${pad(m)}-${pad(d)}`;
    const { habits, records } = await loadAll();
    const dayRec = records[key] || {};
    $("#daily-summary").innerHTML =
        `<div><strong>${fmtLong(fromYmd(y, m, d))}</strong></div>
     <div class="muted">${Object.values(dayRec).filter(x => x?.status === "done").length}/${habits.length} done — Discipline: <strong>${dayPercent(habits, dayRec)}%</strong></div>`;

    const ul = $("#daily-details");
    ul.innerHTML = "";
    const tpl = $("#today-row-template");
    for (const h of habits) {
        const li = tpl.content.firstElementChild.cloneNode(true);
        $(".row-title", li).textContent = h.name;
        // render static (no radio behavior here) — show status snapshot
        const current = dayRec[h.id];
        const controls = $(".row-controls", li);
        controls.innerHTML = "";
        const badge = document.createElement("span");
        badge.className = "chip";
        badge.textContent = current?.status === "done" ? "Done" : (current?.status === "failed" ? "Failed" : "Not set");
        controls.appendChild(badge);
        const timeInfo = document.createElement("span");
        timeInfo.className = "muted";
        if (current?.completedAt && current?.status === "done") {
            timeInfo.textContent = " • Completed at " + new Date(current.completedAt).toLocaleTimeString();
            controls.appendChild(timeInfo);
        }
        const rr = $(".reason-row", li);
        if (current?.status === "failed") {
            rr.classList.remove("hidden");
            $(".reason", li).value = current.reason || "";
            $(".reason", li).readOnly = true;
        } else {
            rr.remove();
        }
        ul.appendChild(li);
    }
}

function weekDateRange(baseDate = new Date()) {
    const s = startOfWeek(baseDate);
    const e = endOfWeek(baseDate);
    return { start: s, end: e };
}

let weeklyCursor = new Date();
function setWeeklyRangeLabel() {
    const { start, end } = weekDateRange(weeklyCursor);
    $("#weekly-range").textContent = `${fmtLong(start)} – ${fmtLong(end)}`;
}

async function loadWeeklyReport() {
    const { start, end } = weekDateRange(weeklyCursor);
    const { habits, records } = await loadAll();

    const bars = $("#weekly-bars");
    bars.innerHTML = "";
    let perfectCount = 0;
    let totalDays = 0;

    for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
        const key = toKey(d);
        const pct = dayPercent(habits, records[key]);
        if (pct === 100) perfectCount++;
        totalDays++;

        const row = document.createElement("div"); row.className = "bar";
        const label = document.createElement("div"); label.className = "label"; label.textContent = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
        const track = document.createElement("div"); track.className = "track";
        const fill = document.createElement("div"); fill.className = "fill"; fill.style.width = pct + "%";
        const num = document.createElement("div"); num.className = "pct"; num.textContent = pct + "%";
        track.appendChild(fill);
        row.appendChild(label); row.appendChild(track); row.appendChild(num);
        bars.appendChild(row);
    }

    $("#weekly-summary").innerHTML = `<strong>${perfectCount}</strong> / ${totalDays} perfect day(s) this week`;
    setWeeklyRangeLabel();
}

async function loadMonthlyReport() {
    const y = Number($("#monthly-year").value);
    const m = Number($("#monthly-month").value);
    const { habits, records } = await loadAll();
    const days = monthDays(y, m);

    let perfect = 0;
    let reasonsAgg = {};
    const daysUl = $("#monthly-days");
    daysUl.innerHTML = "";

    for (let d = 1; d <= days; d++) {
        const key = `${y}-${pad(m)}-${pad(d)}`;
        const pct = dayPercent(habits, records[key]);
        if (pct === 100) perfect++;
        const li = document.createElement("li");
        li.className = "habit-item";
        li.innerHTML = `<div>${new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</div>
                    <div><strong>${pct}%</strong></div>`;
        daysUl.appendChild(li);

        const reasons = summarizeReasons(records[key]);
        for (const r of reasons) {
            reasonsAgg[r] = (reasonsAgg[r] || 0) + 1;
        }
    }

    const pctMonth = Math.round((perfect / days) * 100);
    $("#monthly-meter").style.width = pctMonth + "%";
    $("#monthly-meter-text").textContent = pctMonth + "%";
    $("#monthly-summary").innerHTML = `<strong>${perfect}</strong> / ${days} perfect day(s) — (100% only when all habits are done)`;

    // Reasons summary
    const sorted = Object.entries(reasonsAgg).sort((a, b) => b[1] - a[1]).slice(0, 8);
    $("#monthly-reasons").innerHTML = sorted.length
        ? `<div><strong>Top failure reasons</strong></div>` + sorted.map(([r, c]) => `<div class="muted">• ${r} <span style="float:right">×${c}</span></div>`).join("")
        : `<div class="muted">No failure reasons recorded this month.</div>`;
}

async function loadYearlyReport() {
    const y = Number($("#yearly-year").value);
    const { habits, records } = await loadAll();
    const grid = $("#yearly-grid");
    grid.innerHTML = "";

    let best = { m: null, pct: -1 }, worst = { m: null, pct: 101 };

    for (let m = 1; m <= 12; m++) {
        const days = monthDays(y, m);
        let perfect = 0;
        for (let d = 1; d <= days; d++) {
            const key = `${y}-${pad(m)}-${pad(d)}`;
            const pct = dayPercent(habits, records[key]);
            if (pct === 100) perfect++;
        }
        const pctMonth = Math.round((perfect / days) * 100);
        if (pctMonth > best.pct) best = { m, pct: pctMonth };
        if (pctMonth < worst.pct) worst = { m, pct: pctMonth };

        const cell = document.createElement("div"); cell.className = "month-cell";
        cell.innerHTML = `
      <div class="mname">${new Date(y, m - 1, 1).toLocaleString(undefined, { month: "long" })}</div>
      <div class="mbar"><div class="mfill" style="width:${pctMonth}%"></div></div>
      <div class="mpct">${pctMonth}%</div>
      <div class="muted" style="margin-top:6px">${perfect}/${days} perfect days</div>`;
        grid.appendChild(cell);
    }

    $("#yearly-summary").innerHTML = `
    <div><strong>${y}</strong> overview</div>
    <div class="muted">Best: ${best.m ? new Date(y, best.m - 1, 1).toLocaleString(undefined, { month: "long" }) + " (" + best.pct + "%)" : "—"}</div>
    <div class="muted">Worst: ${worst.m ? new Date(y, worst.m - 1, 1).toLocaleString(undefined, { month: "long" }) + " (" + worst.pct + "%)" : "—"}</div>
  `;
}

async function refreshReportsAfterHabitChange() {
    // Recompute the currently visible report panel if any
    const active = $(".subtab-btn.active")?.dataset.subtab || "daily";
    if (active === "daily") await loadDailyReport();
    if (active === "weekly") await loadWeeklyReport();
    if (active === "monthly") await loadMonthlyReport();
    if (active === "yearly") await loadYearlyReport();
}

async function refreshReportLiveImpact(dateKey) {
    // if daily report shows this date, refresh daily
    const y = $("#daily-year")?.value;
    const m = $("#daily-month")?.value;
    const d = $("#daily-day")?.value;
    if (y && m && d) {
        const k = `${y}-${pad(m)}-${pad(d)}`;
        if (k === dateKey && $("#report-daily").classList.contains("active")) {
            await loadDailyReport();
        }
    }
    // always refresh weekly label/bars if visible
    if ($("#report-weekly").classList.contains("active")) await loadWeeklyReport();
    if ($("#report-monthly").classList.contains("active")) await loadMonthlyReport();
    if ($("#report-yearly").classList.contains("active")) await loadYearlyReport();
}

/** -------------------------------
 * INIT
 * -------------------------------- */
function setupReportSelectors() {
    // Daily
    fillDayMonthYearSelects("daily", new Date());
    $("#daily-year").addEventListener("change", () => fillDayMonthYearSelects("daily", fromYmd($("#daily-year").value, $("#daily-month").value, 1)));
    $("#daily-month").addEventListener("change", () => fillDayMonthYearSelects("daily", fromYmd($("#daily-year").value, $("#daily-month").value, 1)));
    $("#daily-load").addEventListener("click", loadDailyReport);

    // Weekly
    $("#weekly-prev").addEventListener("click", async () => {
        weeklyCursor = addDays(weeklyCursor, -7);
        await loadWeeklyReport();
    });
    $("#weekly-next").addEventListener("click", async () => {
        weeklyCursor = addDays(weeklyCursor, 7);
        await loadWeeklyReport();
    });

    // Monthly
    // seed month/year with current
    const now = new Date();
    const mm = $("#monthly-month"), my = $("#monthly-year");
    for (let m = 1; m <= 12; m++) {
        const opt = document.createElement("option");
        opt.value = String(m);
        opt.textContent = new Date(2000, m - 1, 1).toLocaleString(undefined, { month: "long" });
        if (m === now.getMonth() + 1) opt.selected = true;
        mm.appendChild(opt);
    }
    const currentYear = now.getFullYear();
    for (let y = currentYear - 3; y <= currentYear + 3; y++) {
        const opt = document.createElement("option");
        opt.value = String(y);
        opt.textContent = y;
        if (y === currentYear) opt.selected = true;
        my.appendChild(opt);
    }
    $("#monthly-load").addEventListener("click", loadMonthlyReport);

    // Yearly
    const yy = $("#yearly-year");
    for (let y = currentYear - 3; y <= currentYear + 3; y++) {
        const opt = document.createElement("option");
        opt.value = String(y);
        opt.textContent = y;
        if (y === currentYear) opt.selected = true;
        yy.appendChild(opt);
    }
    $("#yearly-load").addEventListener("click", loadYearlyReport);
}

document.addEventListener("DOMContentLoaded", async () => {
    setupTabs();
    setupReportSelectors();

    await renderHabitsTab();
    await refreshToday();
    await renderInitialTimeline();

    // Initial reports
    await loadDailyReport();
    await loadWeeklyReport();
    await loadMonthlyReport();
    await loadYearlyReport();
});
