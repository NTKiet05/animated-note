const ALL_CATEGORIES = "all";
const FONT_SIZE_FORMATS = {
  2: { name: "small", css: "0.82rem" },
  3: { name: "normal", css: "1rem" },
  5: { name: "large", css: "1.5rem" },
  6: { name: "xlarge", css: "2rem" },
};
const FONT_SIZE_CSS = Object.fromEntries(
  Object.values(FONT_SIZE_FORMATS).map(({ name, css }) => [name, css]),
);
const COMMENT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const state = {
  user: null,
  authMode: "login",
  notes: [],
  categories: [],
  activeCategoryId: ALL_CATEGORIES,
  systemFilter: "all",
  activeTag: null,
  viewMode: "grid",
  query: "",
  noteDialogMode: "create",
  editingCategoryId: null,
  calendarDate: new Date(),
  soundEnabled: localStorage.getItem("mau_sound_enabled") !== "false",
  theme: localStorage.getItem("mau_theme") || "light",
  currentStickers: [],
  currentDoodle: null,
  currentChecklist: [],
  currentPattern: "blank",
  unlockedNoteIds: new Set(),
  pendingPinNote: null,
};

const elements = {
  authView: document.querySelector("#authView"),
  appView: document.querySelector("#appView"),
  authForm: document.querySelector("#authForm"),
  loginTab: document.querySelector("#loginTab"),
  signupTab: document.querySelector("#signupTab"),
  authUsername: document.querySelector("#authUsername"),
  authPassword: document.querySelector("#authPassword"),
  authMessage: document.querySelector("#authMessage"),
  authSubmitButton: document.querySelector("#authSubmitButton"),
  forgotPasswordLink: document.querySelector("#forgotPasswordLink"),
  accountEmail: document.querySelector("#accountEmail"),
  logoutButton: document.querySelector("#logoutButton"),
  saveStatus: document.querySelector("#saveStatus"),
  soundToggleButton: document.querySelector("#soundToggleButton"),
  soundIcon: document.querySelector("#soundIcon"),
  soundBtnText: document.querySelector("#soundBtnText"),
  themeToggleButton: document.querySelector("#themeToggleButton"),
  themeIcon: document.querySelector("#themeIcon"),
  themeBtnText: document.querySelector("#themeBtnText"),
  openSettingsButton: document.querySelector("#openSettingsButton"),
  viewGridBtn: document.querySelector("#viewGridBtn"),
  viewCorkboardBtn: document.querySelector("#viewCorkboardBtn"),
  viewCalendarBtn: document.querySelector("#viewCalendarBtn"),
  searchInput: document.querySelector("#searchInput"),
  newNoteButton: document.querySelector("#newNoteButton"),
  emptyAddButton: document.querySelector("#emptyAddButton"),
  totalCount: document.querySelector("#totalCount"),
  visibleCount: document.querySelector("#visibleCount"),
  filterCaption: document.querySelector("#filterCaption"),
  emptyTrashButton: document.querySelector("#emptyTrashButton"),
  filterAllBtn: document.querySelector("#filterAllBtn"),
  countAllNotes: document.querySelector("#countAllNotes"),
  filterPinnedBtn: document.querySelector("#filterPinnedBtn"),
  countPinnedNotes: document.querySelector("#countPinnedNotes"),
  filterArchivedBtn: document.querySelector("#filterArchivedBtn"),
  countArchivedNotes: document.querySelector("#countArchivedNotes"),
  filterTrashBtn: document.querySelector("#filterTrashBtn"),
  countTrashNotes: document.querySelector("#countTrashNotes"),
  categoryList: document.querySelector("#categoryList"),
  manageCategoriesButton: document.querySelector("#manageCategoriesButton"),
  tagsSection: document.querySelector("#tagsSection"),
  tagsCloud: document.querySelector("#tagsCloud"),
  calendarView: document.querySelector("#calendarView"),
  calendarTitle: document.querySelector("#calendarTitle"),
  calendarGrid: document.querySelector("#calendarGrid"),
  calendarPrevMonthBtn: document.querySelector("#calendarPrevMonthBtn"),
  calendarNextMonthBtn: document.querySelector("#calendarNextMonthBtn"),
  notesGrid: document.querySelector("#notesGrid"),
  emptyState: document.querySelector("#emptyState"),
  emptyMessage: document.querySelector("#emptyMessage"),
  noteDialog: document.querySelector("#noteDialog"),
  noteForm: document.querySelector("#noteForm"),
  noteId: document.querySelector("#noteId"),
  noteDetailsPanel: document.querySelector("#noteDetailsPanel"),
  noteSummaryTitle: document.querySelector("#noteSummaryTitle"),
  noteSummaryCategory: document.querySelector("#noteSummaryCategory"),
  noteSummaryDate: document.querySelector("#noteSummaryDate"),
  noteTitle: document.querySelector("#noteTitle"),
  noteCategory: document.querySelector("#noteCategory"),
  noteDate: document.querySelector("#noteDate"),
  patternPicker: document.querySelector("#patternPicker"),
  stickersSelector: document.querySelector("#stickersSelector"),
  clearStickersButton: document.querySelector("#clearStickersButton"),
  noteContent: document.querySelector("#noteContent"),
  noteFormatToolbar: document.querySelector("#noteFormatToolbar"),
  noteFontSize: document.querySelector("#noteFontSize"),
  noteTextColor: document.querySelector("#noteTextColor"),
  applyTextColorButton: document.querySelector("#applyTextColorButton"),
  noteHighlightColor: document.querySelector("#noteHighlightColor"),
  applyHighlightButton: document.querySelector("#applyHighlightButton"),
  addChecklistButton: document.querySelector("#addChecklistButton"),
  openDoodleButton: document.querySelector("#openDoodleButton"),
  addCommentButton: document.querySelector("#addCommentButton"),
  clearNoteFormat: document.querySelector("#clearNoteFormat"),
  noteContentView: document.querySelector("#noteContentView"),
  doodlePreviewBox: document.querySelector("#doodlePreviewBox"),
  doodlePreviewImg: document.querySelector("#doodlePreviewImg"),
  removeDoodleButton: document.querySelector("#removeDoodleButton"),
  checklistBuilder: document.querySelector("#checklistBuilder"),
  addChecklistItemBtn: document.querySelector("#addChecklistItemBtn"),
  checklistItemsList: document.querySelector("#checklistItemsList"),
  noteTagsInput: document.querySelector("#noteTagsInput"),
  noteModalBody: document.querySelector(".note-modal-body"),
  notePinned: document.querySelector("#notePinned"),
  noteLockedCheckbox: document.querySelector("#noteLockedCheckbox"),
  notePinWrapper: document.querySelector("#notePinWrapper"),
  notePinInput: document.querySelector("#notePinInput"),
  dialogEyebrow: document.querySelector("#dialogEyebrow"),
  dialogTitle: document.querySelector("#dialogTitle"),
  closeDialogButton: document.querySelector("#closeDialogButton"),
  cancelButton: document.querySelector("#cancelButton"),
  editNoteButton: document.querySelector("#editNoteButton"),
  expandNoteButton: document.querySelector("#expandNoteButton"),
  expandNoteButtonLabel: document.querySelector("#expandNoteButtonLabel"),
  exportPngButton: document.querySelector("#exportPngButton"),
  shareNoteButton: document.querySelector("#shareNoteButton"),
  archiveNoteButton: document.querySelector("#archiveNoteButton"),
  restoreNoteButton: document.querySelector("#restoreNoteButton"),
  deleteNoteButton: document.querySelector("#deleteNoteButton"),
  saveNoteButton: document.querySelector("#saveNoteButton"),
  noteReadingPanel: document.querySelector("#noteReadingPanel"),
  readingPanelTitle: document.querySelector("#readingPanelTitle"),
  readingPanelCategory: document.querySelector("#readingPanelCategory"),
  readingPanelDate: document.querySelector("#readingPanelDate"),
  readingPanelScroll: document.querySelector("#readingPanelScroll"),
  readingPanelContent: document.querySelector("#readingPanelContent"),
  closeReadingPanelButton: document.querySelector("#closeReadingPanelButton"),
  editFromReadingPanelButton: document.querySelector("#editFromReadingPanelButton"),
  commentComposer: document.querySelector("#commentComposer"),
  commentText: document.querySelector("#commentText"),
  cancelCommentButton: document.querySelector("#cancelCommentButton"),
  dismissCommentButton: document.querySelector("#dismissCommentButton"),
  saveCommentButton: document.querySelector("#saveCommentButton"),
  commentPopover: document.querySelector("#commentPopover"),
  commentPopoverText: document.querySelector("#commentPopoverText"),
  closeCommentPopoverButton: document.querySelector("#closeCommentPopoverButton"),
  deleteCommentButton: document.querySelector("#deleteCommentButton"),
  categoryDialog: document.querySelector("#categoryDialog"),
  categoryForm: document.querySelector("#categoryForm"),
  categoryName: document.querySelector("#categoryName"),
  addCategoryButton: document.querySelector("#addCategoryButton"),
  categoryManagerList: document.querySelector("#categoryManagerList"),
  categoryTotal: document.querySelector("#categoryTotal"),
  closeCategoryDialogButton: document.querySelector("#closeCategoryDialogButton"),
  doneCategoryButton: document.querySelector("#doneCategoryButton"),
  doodleDialog: document.querySelector("#doodleDialog"),
  doodleDialogTitle: document.querySelector("#doodleDialogTitle"),
  closeDoodleDialogBtn: document.querySelector("#closeDoodleDialogBtn"),
  doodlePenTool: document.querySelector("#doodlePenTool"),
  doodleEraserTool: document.querySelector("#doodleEraserTool"),
  doodleColorPicker: document.querySelector("#doodleColorPicker"),
  doodleLineWidth: document.querySelector("#doodleLineWidth"),
  doodleUndoBtn: document.querySelector("#doodleUndoBtn"),
  doodleClearBtn: document.querySelector("#doodleClearBtn"),
  doodleCanvas: document.querySelector("#doodleCanvas"),
  cancelDoodleBtn: document.querySelector("#cancelDoodleBtn"),
  saveDoodleBtn: document.querySelector("#saveDoodleBtn"),
  settingsDialog: document.querySelector("#settingsDialog"),
  settingsDialogTitle: document.querySelector("#settingsDialogTitle"),
  closeSettingsDialogBtn: document.querySelector("#closeSettingsDialogBtn"),
  changePasswordForm: document.querySelector("#changePasswordForm"),
  currentPasswordInput: document.querySelector("#currentPasswordInput"),
  newPasswordInput: document.querySelector("#newPasswordInput"),
  changePasswordMessage: document.querySelector("#changePasswordMessage"),
  submitChangePasswordBtn: document.querySelector("#submitChangePasswordBtn"),
  backupDataBtn: document.querySelector("#backupDataBtn"),
  restoreFileInput: document.querySelector("#restoreFileInput"),
  doneSettingsBtn: document.querySelector("#doneSettingsBtn"),
  resetPasswordDialog: document.querySelector("#resetPasswordDialog"),
  resetPasswordForm: document.querySelector("#resetPasswordForm"),
  closeResetPasswordBtn: document.querySelector("#closeResetPasswordBtn"),
  resetUsernameInput: document.querySelector("#resetUsernameInput"),
  resetRecoveryKeyInput: document.querySelector("#resetRecoveryKeyInput"),
  resetNewPasswordInput: document.querySelector("#resetNewPasswordInput"),
  resetPasswordMessage: document.querySelector("#resetPasswordMessage"),
  cancelResetPasswordBtn: document.querySelector("#cancelResetPasswordBtn"),
  submitResetPasswordBtn: document.querySelector("#submitResetPasswordBtn"),
  shareLinkDialog: document.querySelector("#shareLinkDialog"),
  shareLinkTitle: document.querySelector("#shareLinkTitle"),
  closeShareLinkBtn: document.querySelector("#closeShareLinkBtn"),
  shareLinkInput: document.querySelector("#shareLinkInput"),
  copyShareLinkBtn: document.querySelector("#copyShareLinkBtn"),
  unshareNoteBtn: document.querySelector("#unshareNoteBtn"),
  doneShareLinkBtn: document.querySelector("#doneShareLinkBtn"),
  publicNoteDialog: document.querySelector("#publicNoteDialog"),
  publicNoteCategory: document.querySelector("#publicNoteCategory"),
  publicNoteTitle: document.querySelector("#publicNoteTitle"),
  closePublicNoteBtn: document.querySelector("#closePublicNoteBtn"),
  publicNoteBody: document.querySelector("#publicNoteBody"),
  publicNoteDate: document.querySelector("#publicNoteDate"),
  publicNoteContent: document.querySelector("#publicNoteContent"),
  publicNoteChecklist: document.querySelector("#publicNoteChecklist"),
  publicNoteDoodle: document.querySelector("#publicNoteDoodle"),
  donePublicNoteBtn: document.querySelector("#donePublicNoteBtn"),
  recoveryNoticeDialog: document.querySelector("#recoveryNoticeDialog"),
  recoveryNoticeTitle: document.querySelector("#recoveryNoticeTitle"),
  recoveryKeyText: document.querySelector("#recoveryKeyText"),
  copyRecoveryKeyBtn: document.querySelector("#copyRecoveryKeyBtn"),
  closeRecoveryNoticeBtn: document.querySelector("#closeRecoveryNoticeBtn"),
  pinPromptDialog: document.querySelector("#pinPromptDialog"),
  pinPromptForm: document.querySelector("#pinPromptForm"),
  pinPromptTitle: document.querySelector("#pinPromptTitle"),
  closePinPromptBtn: document.querySelector("#closePinPromptBtn"),
  pinPromptInput: document.querySelector("#pinPromptInput"),
  pinPromptMessage: document.querySelector("#pinPromptMessage"),
  cancelPinPromptBtn: document.querySelector("#cancelPinPromptBtn"),
  submitPinPromptBtn: document.querySelector("#submitPinPromptBtn"),
  toast: document.querySelector("#toast"),
  exportDialog: document.querySelector("#exportDialog"),
  closeExportDialogBtn: document.querySelector("#closeExportDialogBtn"),
  cancelExportBtn: document.querySelector("#cancelExportBtn"),
  confirmExportBtn: document.querySelector("#confirmExportBtn"),
  exportPreviewCanvas: document.querySelector("#exportPreviewCanvas"),
  exportTemplateSelector: document.querySelector("#exportTemplateSelector"),
};

let toastTimer;
let savedEditorRange = null;
let caretScrollFrame = 0;
let fontSizeSyncFrame = 0;
let selectionUnlockFrame = 0;
let suppressSelectionTracking = false;
let editorComments = [];
let pendingCommentSelection = null;
let activeCommentId = null;

let audioCtx = null;
function getAudioContext() {
  if (!audioCtx && typeof window !== "undefined") {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  return audioCtx;
}

function playPaperSound(type = "rustle") {
  if (!state.soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  const now = ctx.currentTime;
  if (type === "rustle" || type === "tear") {
    const duration = type === "tear" ? 0.22 : 0.12;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = type === "tear" ? "bandpass" : "lowpass";
    filter.frequency.setValueAtTime(type === "tear" ? 1800 : 1100, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(type === "tear" ? 0.15 : 0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  } else if (type === "click" || type === "pin") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(type === "pin" ? 540 : 380, now);
    osc.frequency.exponentialRampToValueAtTime(type === "pin" ? 280 : 200, now + 0.06);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }
}

function initTheme() {
  document.documentElement.dataset.theme = state.theme;
  const isChalkboard = state.theme === "chalkboard";
  if (elements.themeIcon) {
    elements.themeIcon.innerHTML = isChalkboard
      ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
      : '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
  }
  if (elements.themeBtnText) {
    elements.themeBtnText.textContent = isChalkboard
      ? "Chế độ Sáng (Màu giấy)"
      : "Chế độ Bảng đen";
  }
}

function toggleTheme() {
  state.theme = state.theme === "chalkboard" ? "light" : "chalkboard";
  localStorage.setItem("mau_theme", state.theme);
  initTheme();
  playPaperSound("rustle");
}

function updateSoundUI() {
  if (elements.soundIcon) {
    elements.soundIcon.innerHTML = state.soundEnabled
      ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>'
      : '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
  }
  if (elements.soundBtnText) {
    elements.soundBtnText.textContent = state.soundEnabled
      ? "Âm thanh giấy: Bật"
      : "Âm thanh giấy: Tắt";
  }
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  localStorage.setItem("mau_sound_enabled", String(state.soundEnabled));
  updateSoundUI();
  if (state.soundEnabled) playPaperSound("click");
}

if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

function stringHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function allTagsWithCounts() {
  const counts = new Map();
  state.notes.forEach((note) => {
    if (!note.is_trashed && Array.isArray(note.tags)) {
      note.tags.forEach((tag) => {
        if (tag) counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    }
  });
  return counts;
}

function renderTags() {
  const tagCounts = allTagsWithCounts();
  const sorted = [...tagCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "vi"));
  if (sorted.length === 0) {
    elements.tagsSection.hidden = true;
    return;
  }
  elements.tagsSection.hidden = false;
  const badges = sorted.map(([tag, count]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `tag-badge${state.activeTag === tag ? " active" : ""}`;
    btn.innerHTML = `#${tag} <span class="tag-badge-count">(${count})</span>`;
    btn.addEventListener("click", () => {
      state.activeTag = state.activeTag === tag ? null : tag;
      render();
    });
    return btn;
  });
  elements.tagsCloud.replaceChildren(...badges);
}

function setSystemFilter(filter) {
  state.systemFilter = filter;
  state.activeTag = null;
  elements.filterAllBtn.classList.toggle("active", filter === "all");
  elements.filterPinnedBtn.classList.toggle("active", filter === "pinned");
  elements.filterArchivedBtn.classList.toggle("active", filter === "archived");
  elements.filterTrashBtn.classList.toggle("active", filter === "trash");
  elements.emptyTrashButton.hidden = filter !== "trash";
  playPaperSound("rustle");
  render();
}

function setViewMode(mode) {
  state.viewMode = mode;
  elements.viewGridBtn.classList.toggle("active", mode === "grid");
  elements.viewCorkboardBtn.classList.toggle("active", mode === "corkboard");
  elements.viewCalendarBtn.classList.toggle("active", mode === "calendar");
  playPaperSound("rustle");
  render();
}

function renderCalendar() {
  const current = state.calendarDate;
  const year = current.getFullYear();
  const month = current.getMonth();
  elements.calendarTitle.textContent = `Tháng ${month + 1}, ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const weekdays = ["Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7", "CN"];
  const gridCells = weekdays.map((day) => {
    const el = document.createElement("div");
    el.className = "calendar-weekday";
    el.textContent = day;
    return el;
  });

  const todayStr = todayForDateInput();
  const activeNotes = state.notes.filter((n) => !n.is_trashed && !n.is_archived);

  for (let i = offset - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const cell = document.createElement("div");
    cell.className = "calendar-day-cell other-month";
    cell.innerHTML = `<span class="calendar-day-number">${day}</span>`;
    gridCells.push(cell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const cell = document.createElement("div");
    cell.className = `calendar-day-cell${dateStr === todayStr ? " today" : ""}`;
    const num = document.createElement("span");
    num.className = "calendar-day-number";
    num.textContent = day;
    cell.append(num);

    const dayNotes = activeNotes.filter((n) => n.note_date === dateStr);
    dayNotes.forEach((note) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = `calendar-note-chip color-${note.color}`;
      chip.textContent = note.title;
      chip.title = note.title;
      chip.addEventListener("click", (e) => {
        e.stopPropagation();
        openViewDialog(note);
      });
      cell.append(chip);
    });

    cell.addEventListener("click", () => {
      openCreateDialog();
      elements.noteDate.value = dateStr;
      updateNoteDetailsSummary();
    });

    gridCells.push(cell);
  }

  const totalCells = gridCells.length - 7;
  const remaining = (7 - (totalCells % 7)) % 7;
  for (let day = 1; day <= remaining; day++) {
    const cell = document.createElement("div");
    cell.className = "calendar-day-cell other-month";
    cell.innerHTML = `<span class="calendar-day-number">${day}</span>`;
    gridCells.push(cell);
  }

  elements.calendarGrid.replaceChildren(...gridCells);
}

// Checklist in editor
function renderChecklistEditor() {
  const items = state.currentChecklist || [];
  elements.checklistItemsList.replaceChildren(
    ...items.map((item, index) => {
      const row = document.createElement("div");
      row.className = "checklist-item-row";

      const chk = document.createElement("input");
      chk.type = "checkbox";
      chk.className = "checklist-checkbox";
      chk.checked = item.done === true;
      chk.addEventListener("change", () => {
        item.done = chk.checked;
        txt.classList.toggle("done", chk.checked);
        playPaperSound("pin");
      });

      const txt = document.createElement("input");
      txt.type = "text";
      txt.className = `checklist-item-input${item.done ? " done" : ""}`;
      txt.value = item.text || "";
      txt.placeholder = "Việc cần làm...";
      txt.addEventListener("input", () => {
        item.text = txt.value;
      });

      const del = document.createElement("button");
      del.type = "button";
      del.className = "checklist-remove-btn";
      del.textContent = "×";
      del.title = "Xóa mục này";
      del.addEventListener("click", () => {
        state.currentChecklist.splice(index, 1);
        renderChecklistEditor();
      });

      row.append(chk, txt, del);
      return row;
    }),
  );
}

function addChecklistItem(text = "", done = false) {
  if (!state.currentChecklist) state.currentChecklist = [];
  state.currentChecklist.push({ id: crypto.randomUUID(), text, done });
  renderChecklistEditor();
  playPaperSound("click");
  const inputs = elements.checklistItemsList.querySelectorAll(".checklist-item-input");
  const last = inputs[inputs.length - 1];
  if (last) last.focus();
}

// Doodle canvas
let doodleDrawing = false;
let doodleCtx = null;
let doodleHistory = [];

function setupDoodleCanvas() {
  const canvas = elements.doodleCanvas;
  if (!canvas) return;
  doodleCtx = canvas.getContext("2d");
  doodleCtx.lineCap = "round";
  doodleCtx.lineJoin = "round";

  function getCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }

  function start(e) {
    e.preventDefault();
    doodleDrawing = true;
    doodleHistory.push(doodleCtx.getImageData(0, 0, canvas.width, canvas.height));
    if (doodleHistory.length > 20) doodleHistory.shift();
    const { x, y } = getCoords(e);
    doodleCtx.beginPath();
    doodleCtx.moveTo(x, y);
  }

  function move(e) {
    if (!doodleDrawing) return;
    e.preventDefault();
    const { x, y } = getCoords(e);
    const isEraser = elements.doodleEraserTool.classList.contains("active");
    doodleCtx.lineWidth = Number(elements.doodleLineWidth.value);
    if (isEraser) {
      doodleCtx.globalCompositeOperation = "destination-out";
    } else {
      doodleCtx.globalCompositeOperation = "source-over";
      doodleCtx.strokeStyle = elements.doodleColorPicker.value;
    }
    doodleCtx.lineTo(x, y);
    doodleCtx.stroke();
  }

  function stop() {
    doodleDrawing = false;
  }

  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", stop);
  canvas.addEventListener("touchstart", start, { passive: false });
  canvas.addEventListener("touchmove", move, { passive: false });
  window.addEventListener("touchend", stop);
}

function openDoodleDialog() {
  doodleHistory = [];
  const canvas = elements.doodleCanvas;
  doodleCtx = canvas.getContext("2d");
  doodleCtx.clearRect(0, 0, canvas.width, canvas.height);
  if (state.currentDoodle) {
    const img = new Image();
    img.onload = () => doodleCtx.drawImage(img, 0, 0);
    img.src = state.currentDoodle;
  }
  elements.doodleDialog.showModal();
}

function saveDoodle() {
  const canvas = elements.doodleCanvas;
  state.currentDoodle = canvas.toDataURL("image/png");
  elements.doodlePreviewImg.src = state.currentDoodle;
  elements.doodlePreviewBox.hidden = false;
  elements.doodleDialog.close();
  playPaperSound("rustle");
}

function removeDoodle() {
  state.currentDoodle = null;
  elements.doodlePreviewBox.hidden = true;
  elements.doodlePreviewImg.src = "";
  playPaperSound("tear");
}

function drawCanvasRoundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(typeof radius === "number" ? radius : 16, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function wrapCanvasText(ctx, text, maxWidth) {
  if (!text) return [];
  const lines = [];
  const paragraphs = text.split("\n");
  for (const para of paragraphs) {
    if (!para.trim()) {
      lines.push("");
      continue;
    }
    const words = para.split(" ");
    let curLine = words[0];
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = curLine + " " + word;
      if (ctx.measureText(testLine).width <= maxWidth) {
        curLine = testLine;
      } else {
        lines.push(curLine);
        curLine = word;
      }
    }
    lines.push(curLine);
  }
  return lines;
}

const EXPORT_COLORS = {
  yellow: { bg: "#fff3a8", dark: "#eed868" },
  blue: { bg: "#d0e8ff", dark: "#a6d1fc" },
  pink: { bg: "#ffd6e5", dark: "#fbb6ce" },
  green: { bg: "#d5f3c5", dark: "#b6e49e" },
  purple: { bg: "#e8dcff", dark: "#d1beff" },
};

async function drawNoteExportCanvas(canvas, note, template = "card", isPreview = false) {
  if (!canvas || !note) return;
  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  } catch (_) {}

  let doodleImg = null;
  if (note.doodle) {
    try {
      doodleImg = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = note.doodle;
      });
    } catch (_) {
      doodleImg = null;
    }
  }

  const colorKey = note.color || "yellow";
  const palette = EXPORT_COLORS[colorKey] || EXPORT_COLORS.yellow;
  const categoryName = (categoryNameForNote(note) || "GHI CHÚ").toUpperCase();
  const dateStr = note.note_date ? formatNoteDate(note.note_date) : "";
  const titleStr = note.title || "Mẩu Ghi Chú";
  const contentStr = (note.content || "").trim();
  const checklist = Array.isArray(note.checklist) ? note.checklist : [];
  const stickers = Array.isArray(note.stickers) ? note.stickers : [];
  const pattern = note.paper_pattern || "blank";

  const ctx = canvas.getContext("2d");

  if (template === "card") {
    // TEMPLATE 1: Tấm Ghi Chú Dán Trên Bảng (Sticky Note Card)
    const cardW = 680;
    const paddingX = 40;
    const contentW = cardW - paddingX * 2;

    ctx.font = "bold 26px 'Mali Local', cursive, sans-serif";
    const titleLines = wrapCanvasText(ctx, titleStr, contentW);
    const titleH = Math.max(1, titleLines.length) * 34;

    ctx.font = "17px 'Nunito Local', sans-serif";
    const bodyLines = contentStr ? wrapCanvasText(ctx, contentStr, contentW) : [];
    const bodyH = bodyLines.length * 28;

    const checklistH = checklist.length > 0 ? (checklist.length * 30 + 36) : 0;
    const doodleH = doodleImg ? 200 : 0;
    const footerH = 60;
    const metaTopH = 50;

    const innerH = metaTopH + titleH + 16 + (bodyH ? bodyH + 16 : 0) + (checklistH ? checklistH + 16 : 0) + (doodleH ? doodleH + 16 : 0) + footerH + 40;
    const cardH = Math.max(420, innerH);

    const margin = 28;
    canvas.width = cardW + margin * 2;
    canvas.height = cardH + margin * 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cardX = margin;
    const cardY = margin;

    // 1. Drop shadow
    ctx.fillStyle = "#25252a";
    drawCanvasRoundRect(ctx, cardX + 8, cardY + 10, cardW, cardH, 20);
    ctx.fill();

    // 2. Paper background
    ctx.fillStyle = palette.bg;
    drawCanvasRoundRect(ctx, cardX, cardY, cardW, cardH, 20);
    ctx.fill();

    // 3. Paper pattern (lined / grid / dot)
    ctx.save();
    drawCanvasRoundRect(ctx, cardX, cardY, cardW, cardH, 20);
    ctx.clip();
    if (pattern === "lined") {
      ctx.strokeStyle = "rgba(37, 37, 42, 0.1)";
      ctx.lineWidth = 1.5;
      for (let y = cardY + 100; y < cardY + cardH - 50; y += 30) {
        ctx.beginPath();
        ctx.moveTo(cardX + 24, y);
        ctx.lineTo(cardX + cardW - 24, y);
        ctx.stroke();
      }
    } else if (pattern === "grid") {
      ctx.strokeStyle = "rgba(37, 37, 42, 0.08)";
      ctx.lineWidth = 1.2;
      for (let x = cardX + 24; x < cardX + cardW - 20; x += 28) {
        ctx.beginPath();
        ctx.moveTo(x, cardY + 20);
        ctx.lineTo(x, cardY + cardH - 20);
        ctx.stroke();
      }
      for (let y = cardY + 24; y < cardY + cardH - 20; y += 28) {
        ctx.beginPath();
        ctx.moveTo(cardX + 20, y);
        ctx.lineTo(cardX + cardW - 20, y);
        ctx.stroke();
      }
    } else if (pattern === "dot") {
      ctx.fillStyle = "rgba(37, 37, 42, 0.18)";
      for (let x = cardX + 30; x < cardX + cardW - 24; x += 26) {
        for (let y = cardY + 30; y < cardY + cardH - 24; y += 26) {
          ctx.beginPath();
          ctx.arc(x, y, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();

    // 4. Card outline
    ctx.strokeStyle = "#25252a";
    ctx.lineWidth = 3;
    drawCanvasRoundRect(ctx, cardX, cardY, cardW, cardH, 20);
    ctx.stroke();

    // 5. Category Pill Badge (top-left)
    ctx.font = "bold 13px 'Nunito Local', sans-serif";
    const catMetrics = ctx.measureText(categoryName);
    const pillW = Math.max(90, catMetrics.width + 30);
    const pillH = 28;
    const pillX = cardX + paddingX;
    const pillY = cardY + 26;

    ctx.fillStyle = "#ffffff";
    drawCanvasRoundRect(ctx, pillX, pillY, pillW, pillH, 14);
    ctx.fill();
    ctx.strokeStyle = "#25252a";
    ctx.lineWidth = 2;
    drawCanvasRoundRect(ctx, pillX, pillY, pillW, pillH, 14);
    ctx.stroke();

    ctx.fillStyle = "#25252a";
    ctx.fillText(categoryName, pillX + 15, pillY + 19);

    // 6. Stickers / Washi tape
    if (stickers.length > 0) {
      stickers.forEach((s) => {
        if (s === "tape-left") {
          ctx.save();
          ctx.translate(cardX + 30, cardY + 2);
          ctx.rotate(-0.15);
          ctx.fillStyle = "rgba(255, 248, 204, 0.85)";
          ctx.fillRect(-28, -8, 64, 20);
          ctx.strokeStyle = "rgba(37, 37, 42, 0.25)";
          ctx.setLineDash([4, 3]);
          ctx.strokeRect(-28, -8, 64, 20);
          ctx.restore();
        } else if (s === "tape-right") {
          ctx.save();
          ctx.translate(cardX + cardW - 30, cardY + 2);
          ctx.rotate(0.15);
          ctx.fillStyle = "rgba(255, 248, 204, 0.85)";
          ctx.fillRect(-36, -8, 64, 20);
          ctx.strokeStyle = "rgba(37, 37, 42, 0.25)";
          ctx.setLineDash([4, 3]);
          ctx.strokeRect(-36, -8, 64, 20);
          ctx.restore();
        } else if (s === "pin-red" || s === "pin-blue") {
          const pinColor = s === "pin-red" ? "#e03131" : "#1971c2";
          ctx.save();
          ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
          ctx.beginPath();
          ctx.ellipse(cardX + cardW / 2 + 3, cardY + 17, 8, 4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = pinColor;
          ctx.beginPath();
          ctx.arc(cardX + cardW / 2, cardY + 12, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#25252a";
          ctx.lineWidth = 1.8;
          ctx.stroke();
          ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
          ctx.beginPath();
          ctx.arc(cardX + cardW / 2 - 3, cardY + 9, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (s === "star") {
          ctx.font = "24px sans-serif";
          ctx.fillText("⭐", cardX + cardW - 60, cardY + 48);
        } else if (s === "heart") {
          ctx.font = "24px sans-serif";
          ctx.fillText("❤️", cardX + cardW - 60, cardY + 48);
        }
      });
    } else {
      ctx.save();
      ctx.translate(cardX + cardW / 2, cardY - 4);
      ctx.rotate(-0.02);
      ctx.fillStyle = "rgba(240, 232, 200, 0.9)";
      ctx.fillRect(-55, -8, 110, 22);
      ctx.strokeStyle = "rgba(65, 55, 45, 0.35)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(-55, -8, 110, 22);
      ctx.restore();
    }

    // 7. Title
    let curY = cardY + 86;
    ctx.fillStyle = "#25252a";
    ctx.font = "bold 26px 'Mali Local', cursive, sans-serif";
    for (const tLine of titleLines) {
      ctx.fillText(tLine, cardX + paddingX, curY);
      curY += 34;
    }
    curY += 10;

    // 8. Body Content
    if (bodyLines.length > 0) {
      ctx.font = "18px 'Nunito Local', sans-serif";
      ctx.fillStyle = "#25252a";
      for (const bLine of bodyLines) {
        ctx.fillText(bLine, cardX + paddingX, curY);
        curY += 28;
      }
      curY += 14;
    }

    // 9. Checklist
    if (checklist.length > 0) {
      ctx.font = "bold 18px 'Nunito Local', sans-serif";
      ctx.fillStyle = "#25252a";
      ctx.fillText("Việc cần làm:", cardX + paddingX, curY);
      curY += 26;

      ctx.font = "17px 'Nunito Local', sans-serif";
      for (const item of checklist) {
        const cbX = cardX + paddingX;
        const cbY = curY - 15;
        ctx.fillStyle = "#ffffff";
        drawCanvasRoundRect(ctx, cbX, cbY, 18, 18, 4);
        ctx.fill();
        ctx.strokeStyle = "#25252a";
        ctx.lineWidth = 1.8;
        drawCanvasRoundRect(ctx, cbX, cbY, 18, 18, 4);
        ctx.stroke();

        if (item.done) {
          ctx.fillStyle = "#2b8a3e";
          ctx.font = "bold 15px sans-serif";
          ctx.fillText("✓", cbX + 3, cbY + 14);
          ctx.font = "17px 'Nunito Local', sans-serif";
          ctx.fillStyle = "#75737b";
          ctx.fillText(item.text, cbX + 28, curY);
          const textW = ctx.measureText(item.text).width;
          ctx.strokeStyle = "#75737b";
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(cbX + 28, curY - 5);
          ctx.lineTo(cbX + 28 + textW, curY - 5);
          ctx.stroke();
        } else {
          ctx.fillStyle = "#25252a";
          ctx.fillText(item.text, cbX + 28, curY);
        }
        curY += 28;
      }
      curY += 10;
    }

    // 10. Doodle
    if (doodleImg) {
      const boxW = contentW;
      const boxH = 170;
      const boxX = cardX + paddingX;
      const boxY = curY;

      ctx.fillStyle = "#ffffff";
      drawCanvasRoundRect(ctx, boxX, boxY, boxW, boxH, 14);
      ctx.fill();
      ctx.strokeStyle = "rgba(37, 37, 42, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 5]);
      drawCanvasRoundRect(ctx, boxX, boxY, boxW, boxH, 14);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = "bold 12px 'Mali Local', cursive, sans-serif";
      ctx.fillStyle = "#75737b";
      ctx.fillText("Nét vẽ tay:", boxX + 12, boxY + 20);

      const maxDrawW = boxW - 32;
      const maxDrawH = boxH - 36;
      const ratio = Math.min(maxDrawW / doodleImg.width, maxDrawH / doodleImg.height, 1);
      const drawW = doodleImg.width * ratio;
      const drawH = doodleImg.height * ratio;
      const drawX = boxX + (boxW - drawW) / 2;
      const drawY = boxY + 24 + (maxDrawH - drawH) / 2;

      ctx.drawImage(doodleImg, drawX, drawY, drawW, drawH);
      curY += boxH + 20;
    }

    // 11. Dashed divider
    curY = cardY + cardH - 52;
    ctx.setLineDash([7, 6]);
    ctx.strokeStyle = "rgba(37, 37, 42, 0.32)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cardX + paddingX, curY);
    ctx.lineTo(cardX + cardW - paddingX, curY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 12. Footer
    curY += 32;
    ctx.font = "14px 'Nunito Local', sans-serif";
    ctx.fillStyle = "#5d5b63";
    if (dateStr) {
      ctx.fillText(`Ngày ${dateStr}`, cardX + paddingX, curY);
    } else {
      ctx.fillText("Mẩu Ghi Chú", cardX + paddingX, curY);
    }

    ctx.font = "italic 14px 'Mali Local', cursive, sans-serif";
    const brandStr = "Mẩu Ghi Chú ✎";
    const brandW = ctx.measureText(brandStr).width;
    ctx.fillText(brandStr, cardX + cardW - paddingX - brandW, curY);

  } else if (template === "journal") {
    // TEMPLATE 2: Trang Sổ Tay Đầy Đủ
    canvas.width = 760;
    canvas.height = 1040;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fbf7ee";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(37, 37, 42, 0.25)";
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    ctx.strokeStyle = "rgba(180, 195, 215, 0.65)";
    ctx.lineWidth = 1.2;
    for (let y = 140; y < canvas.height - 50; y += 32) {
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(canvas.width - 30, y);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(235, 110, 110, 0.65)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(90, 20);
    ctx.lineTo(90, canvas.height - 20);
    ctx.stroke();

    ctx.save();
    ctx.translate(canvas.width / 2, 8);
    ctx.fillStyle = "rgba(220, 205, 175, 0.88)";
    ctx.fillRect(-60, -4, 120, 22);
    ctx.strokeStyle = "rgba(65, 55, 45, 0.3)";
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(-60, -4, 120, 22);
    ctx.restore();

    ctx.font = "bold 14px 'Nunito Local', sans-serif";
    ctx.fillStyle = "#6c63a8";
    ctx.fillText(categoryName, 110, 68);

    if (dateStr) {
      ctx.font = "14px 'Nunito Local', sans-serif";
      ctx.fillStyle = "#6c6875";
      ctx.fillText(`Ngày: ${dateStr}`, canvas.width - 220, 68);
    }

    ctx.font = "bold 32px 'Mali Local', cursive, sans-serif";
    ctx.fillStyle = "#25252a";
    ctx.fillText(titleStr, 110, 120);

    let curY = 166;
    ctx.font = "19px 'Nunito Local', sans-serif";
    ctx.fillStyle = "#25252a";
    const journalLines = wrapCanvasText(ctx, contentStr, canvas.width - 150);
    for (const jLine of journalLines) {
      if (curY > canvas.height - 280) break;
      ctx.fillText(jLine, 110, curY);
      curY += 32;
    }

    if (checklist.length > 0 && curY < canvas.height - 220) {
      curY += 12;
      ctx.font = "bold 18px 'Nunito Local', sans-serif";
      ctx.fillText("Việc cần làm:", 110, curY);
      curY += 30;
      ctx.font = "17px 'Nunito Local', sans-serif";
      for (const item of checklist) {
        if (curY > canvas.height - 180) break;
        ctx.fillText(item.done ? `☑ ${item.text}` : `☐ ${item.text}`, 115, curY);
        curY += 28;
      }
    }

    if (doodleImg && curY < canvas.height - 160) {
      const dH = Math.min(180, canvas.height - curY - 70);
      const dW = Math.min(260, (doodleImg.width / doodleImg.height) * dH);
      ctx.drawImage(doodleImg, 110, curY + 10, dW, dH);
    }

    ctx.fillStyle = "#7e7a88";
    ctx.font = "italic 14px 'Mali Local', cursive, sans-serif";
    ctx.fillText("Mẩu Ghi Chú — nhật ký nét vẽ tay", 110, canvas.height - 24);

  } else if (template === "polaroid") {
    // TEMPLATE 3: Khung Ảnh Polaroid Vintage
    canvas.width = 720;
    canvas.height = 890;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const margin = 24;
    const fW = canvas.width - margin * 2;
    const fH = canvas.height - margin * 2;
    const fX = margin;
    const fY = margin;

    ctx.fillStyle = "rgba(37, 37, 42, 0.16)";
    drawCanvasRoundRect(ctx, fX + 6, fY + 8, fW, fH, 16);
    ctx.fill();

    ctx.fillStyle = "#faf8f5";
    drawCanvasRoundRect(ctx, fX, fY, fW, fH, 16);
    ctx.fill();
    ctx.strokeStyle = "#25252a";
    ctx.lineWidth = 2.5;
    drawCanvasRoundRect(ctx, fX, fY, fW, fH, 16);
    ctx.stroke();

    const photoX = fX + 36;
    const photoY = fY + 36;
    const photoW = fW - 72;
    const photoH = fH - 160;

    ctx.fillStyle = palette.bg;
    ctx.fillRect(photoX, photoY, photoW, photoH);

    ctx.save();
    ctx.beginPath();
    ctx.rect(photoX, photoY, photoW, photoH);
    ctx.clip();
    if (pattern === "lined" || pattern === "grid") {
      ctx.strokeStyle = "rgba(37, 37, 42, 0.08)";
      ctx.lineWidth = 1.2;
      for (let y = photoY + 28; y < photoY + photoH; y += 28) {
        ctx.beginPath();
        ctx.moveTo(photoX, y);
        ctx.lineTo(photoX + photoW, y);
        ctx.stroke();
      }
    }
    ctx.restore();

    ctx.strokeStyle = "#25252a";
    ctx.lineWidth = 2;
    ctx.strokeRect(photoX, photoY, photoW, photoH);

    ctx.font = "bold 22px 'Mali Local', cursive, sans-serif";
    ctx.fillStyle = "#25252a";
    ctx.fillText(titleStr, photoX + 24, photoY + 42);

    let curY = photoY + 76;
    ctx.font = "16px 'Nunito Local', sans-serif";
    const polaroidLines = wrapCanvasText(ctx, contentStr, photoW - 48);
    for (const pLine of polaroidLines) {
      if (curY > photoY + photoH - (doodleImg ? 180 : 30)) break;
      ctx.fillText(pLine, photoX + 24, curY);
      curY += 26;
    }

    if (doodleImg) {
      const dH = Math.min(160, photoY + photoH - curY - 14);
      const dW = Math.min(photoW - 48, (doodleImg.width / doodleImg.height) * dH);
      const dX = photoX + (photoW - dW) / 2;
      ctx.drawImage(doodleImg, dX, curY + 6, dW, dH);
    }

    const chinY = photoY + photoH + 28;
    ctx.font = "bold 24px 'Mali Local', cursive, sans-serif";
    ctx.fillStyle = "#25252a";
    ctx.textAlign = "center";
    ctx.fillText(titleStr, canvas.width / 2, chinY + 34);

    if (dateStr) {
      ctx.font = "14px 'Nunito Local', sans-serif";
      ctx.fillStyle = "#75737b";
      ctx.fillText(dateStr, canvas.width / 2, chinY + 62);
    }
    ctx.textAlign = "start";
  }
}

function updateExportTemplateUI() {
  if (!elements.exportTemplateSelector) return;
  const checkedVal = elements.exportTemplateSelector.querySelector('input[name="exportTemplate"]:checked')?.value || "card";
  elements.exportTemplateSelector.querySelectorAll(".export-template-card").forEach((card) => {
    const option = card.closest(".export-template-option");
    const radio = option?.querySelector('input[name="exportTemplate"]');
    const isChecked = radio ? radio.value === checkedVal : false;
    card.classList.toggle("active", isChecked);
  });
}

function openExportDialog(note) {
  if (!note) return;
  state.exportingNote = note;
  const defaultOption = elements.exportTemplateSelector?.querySelector('input[value="card"]');
  if (defaultOption) defaultOption.checked = true;
  updateExportTemplateUI();
  if (elements.exportDialog) {
    elements.exportDialog.showModal();
    renderExportPreview();
  }
}

async function renderExportPreview() {
  if (!elements.exportPreviewCanvas || !state.exportingNote) return;
  const template = elements.exportTemplateSelector?.querySelector('input[name="exportTemplate"]:checked')?.value || "card";
  updateExportTemplateUI();
  await drawNoteExportCanvas(elements.exportPreviewCanvas, state.exportingNote, template, true);
}

async function downloadNoteAsPng(note, template) {
  const offscreenCanvas = document.createElement("canvas");
  await drawNoteExportCanvas(offscreenCanvas, note, template, false);
  offscreenCanvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const rawTitle = note.title ? normalized(note.title).replace(/\s+/g, "-") : "note";
    link.download = `mau-ghi-chu-${template}-${rawTitle}.png`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    playPaperSound("rustle");
    showToast("Đã tải mẩu ghi chú dạng ảnh PNG!");
  }, "image/png");
}

async function exportNoteToPng(note) {
  openExportDialog(note);
}

async function openShareDialog(note) {
  try {
    const res = await request(`/api/notes/${note.id}/share`, { method: "POST" });
    const fullUrl = `${window.location.origin}/?share=${res.share_token}`;
    elements.shareLinkInput.value = fullUrl;
    elements.shareLinkDialog.dataset.noteId = note.id;
    elements.shareLinkDialog.showModal();
  } catch (err) {
    showToast(err.message, true);
  }
}

async function unshareNote(noteId) {
  if (!noteId) return;
  try {
    await request(`/api/notes/${noteId}/share`, {
      method: "POST",
      body: JSON.stringify({ unshare: true }),
    });
    elements.shareLinkDialog.close();
    showToast("Đã ngừng chia sẻ ghi chú này.");
  } catch (err) {
    showToast(err.message, true);
  }
}

async function checkPublicShare() {
  const params = new URLSearchParams(window.location.search);
  const shareToken = params.get("share");
  if (!shareToken) return;

  try {
    const res = await request(`/api/share/${shareToken}`);
    if (res.note) {
      const note = res.note;
      elements.publicNoteTitle.textContent = note.title;
      elements.publicNoteCategory.textContent = note.category || "Ghi chú";
      elements.publicNoteDate.textContent = note.note_date ? `Ngày ${formatNoteDate(note.note_date)}` : "";
      renderRichContent(elements.publicNoteContent, note);

      if (note.checklist && note.checklist.length > 0) {
        elements.publicNoteChecklist.replaceChildren(
          ...note.checklist.map((item) => {
            const div = document.createElement("div");
            div.className = `card-checklist-item${item.done ? " done" : ""}`;
            div.innerHTML = `<span>${item.done ? "☑" : "☐"}</span> <span>${item.text}</span>`;
            return div;
          }),
        );
      } else {
        elements.publicNoteChecklist.replaceChildren();
      }

      if (note.doodle) {
        elements.publicNoteDoodle.innerHTML = `<img src="${note.doodle}" alt="Nét vẽ tay" style="max-width:100%; border-radius:8px;" />`;
      } else {
        elements.publicNoteDoodle.innerHTML = "";
      }

      elements.publicNoteDialog.showModal();
    }
  } catch (err) {
    showToast(err.message, true);
  }
}

async function downloadBackup() {
  try {
    const backup = await request("/api/backup");
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `mau-ghi-chu-backup-${todayForDateInput()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Đã tải bản sao lưu về máy.");
  } catch (err) {
    showToast(err.message, true);
  }
}

async function uploadRestore(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const json = JSON.parse(text);
    const result = await request("/api/restore", {
      method: "POST",
      body: JSON.stringify(json),
    });
    await loadData();
    elements.settingsDialog.close();
    showToast(`Đã phục hồi ${result.notes_count} ghi chú và ${result.categories_count} nhóm.`);
  } catch (err) {
    showToast("File sao lưu không hợp lệ: " + err.message, true);
  }
}

async function emptyTrash() {
  if (!window.confirm("Dọn sạch toàn bộ thùng rác? Các ghi chú trong thùng rác sẽ bị xóa vĩnh viễn.")) return;
  try {
    await request("/api/trash", { method: "DELETE" });
    state.notes = state.notes.filter((n) => !n.is_trashed);
    render();
    playPaperSound("tear");
    showToast("Đã dọn sạch thùng rác.");
  } catch (err) {
    showToast(err.message, true);
  }
}

async function restoreNote(note) {
  try {
    await request(`/api/notes/${note.id}/restore`, { method: "POST" });
    note.is_trashed = false;
    note.trashed_at = null;
    closeNoteDialog();
    render();
    playPaperSound("pin");
    showToast("Đã khôi phục ghi chú.");
  } catch (err) {
    showToast(err.message, true);
  }
}

async function toggleArchiveNote(note) {
  const isArchived = !note.is_archived;
  try {
    await request(`/api/notes/${note.id}/${isArchived ? "archive" : "unarchive"}`, { method: "POST" });
    note.is_archived = isArchived;
    closeNoteDialog();
    render();
    playPaperSound("rustle");
    showToast(isArchived ? "Đã chuyển vào lưu trữ." : "Đã chuyển ra khỏi lưu trữ.");
  } catch (err) {
    showToast(err.message, true);
  }
}

async function request(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(url, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && !url.startsWith("/api/auth/")) showAuth();
    throw new Error(payload.error || "Không thể xử lý yêu cầu.");
  }
  return payload;
}


function setAuthMode(mode) {
  state.authMode = mode;
  const signingUp = mode === "signup";
  elements.loginTab.classList.toggle("active", !signingUp);
  elements.signupTab.classList.toggle("active", signingUp);
  elements.loginTab.setAttribute("aria-selected", String(!signingUp));
  elements.signupTab.setAttribute("aria-selected", String(signingUp));
  elements.authPassword.autocomplete = signingUp ? "new-password" : "current-password";
  elements.authSubmitButton.textContent = signingUp ? "Tạo tài khoản" : "Đăng nhập";
  elements.authMessage.textContent = "";
  elements.authMessage.classList.remove("success");
}


function showAuth(message = "") {
  state.user = null;
  state.notes = [];
  state.categories = [];
  closeNoteDialog();
  closeCategoryDialog();
  elements.appView.hidden = true;
  elements.authView.hidden = false;
  elements.authMessage.textContent = message;
  elements.authMessage.classList.toggle("success", Boolean(message));
  requestAnimationFrame(() => elements.authUsername.focus());
}


function showApp(user) {
  state.user = user;
  elements.accountEmail.textContent = user.username || "Tài khoản của bạn";
  elements.authView.hidden = true;
  elements.appView.hidden = false;
}


async function submitAuth(event) {
  event.preventDefault();
  const signingUp = state.authMode === "signup";
  elements.authSubmitButton.disabled = true;
  elements.authMessage.textContent = "";
  elements.authMessage.classList.remove("success");

  try {
    const payload = await request(`/api/auth/${state.authMode}`, {
      method: "POST",
      body: JSON.stringify({
        username: elements.authUsername.value.trim(),
        password: elements.authPassword.value,
      }),
    });

    if (payload.user) {
      elements.authForm.reset();
      showApp(payload.user);
      await loadData();
      showToast(signingUp ? "Đã tạo tài khoản." : "Đăng nhập thành công.");
      if (signingUp && payload.recovery_key) {
        elements.recoveryKeyText.textContent = payload.recovery_key;
        elements.recoveryNoticeDialog.showModal();
      }
    }
  } catch (error) {
    elements.authMessage.textContent = error.message;
  } finally {
    elements.authSubmitButton.disabled = false;
    elements.authSubmitButton.textContent = state.authMode === "signup" ? "Tạo tài khoản" : "Đăng nhập";
  }
}


async function signOut() {
  elements.logoutButton.disabled = true;
  try {
    await request("/api/auth/logout", { method: "POST" });
    showAuth("Bạn đã đăng xuất an toàn.");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    elements.logoutButton.disabled = false;
  }
}


async function bootstrap() {
  initTheme();
  setupDoodleCanvas();
  checkPublicShare();

  try {
    const session = await request("/api/auth/session");
    if (!session.user) {
      showAuth();
      return;
    }
    showApp(session.user);
    await loadData();
  } catch (error) {
    showAuth(error.message);
    elements.authMessage.classList.remove("success");
  }
}


function setConnectionStatus(mode, text) {
  if (!elements.saveStatus) return;
  elements.saveStatus.classList.remove("connected", "error");
  if (mode) elements.saveStatus.classList.add(mode);
  const span = elements.saveStatus.querySelector("span:last-child");
  if (span) span.textContent = text;
}


function showToast(message, isError = false) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.toggle("error", isError);
  elements.toast.classList.add("show");
  toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2800);
}


function normalized(value) {
  return String(value || "")
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}


function colorToHex(value) {
  const color = String(value || "").trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(color)) return color;
  const match = color.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*[\d.]+)?\s*\)$/);
  if (!match) return "";
  return `#${match.slice(1, 4).map((part) => Number(part).toString(16).padStart(2, "0")).join("")}`;
}


function richRunsForNote(note) {
  if (Array.isArray(note?.content_rich) && note.content_rich.length > 0) return note.content_rich;
  return note?.content ? [{ text: note.content }] : [];
}


function renderRichContent(container, note, emptyText = "") {
  const runs = richRunsForNote(note);
  if (runs.length === 0) {
    container.textContent = emptyText;
    return;
  }

  function createRunSpan(run, text, underline = run.underline) {
    const span = document.createElement("span");
    span.textContent = text;
    if (run.bold) {
      span.dataset.bold = "true";
      span.style.fontWeight = "800";
    }
    if (underline) {
      span.dataset.underline = "true";
      span.style.textDecoration = "underline";
      span.style.textUnderlineOffset = "2px";
    }
    if (/^#[0-9a-f]{6}$/i.test(run.color || "")) {
      span.dataset.color = run.color.toLowerCase();
      span.style.color = run.color;
    }
    if (/^#[0-9a-f]{6}$/i.test(run.highlight || "")) {
      span.dataset.highlight = run.highlight.toLowerCase();
      span.style.backgroundColor = run.highlight;
    }
    if (["small", "normal", "large", "xlarge"].includes(run.size)) {
      span.dataset.size = run.size;
    }
    if (FONT_SIZE_CSS[run.size]) span.style.fontSize = FONT_SIZE_CSS[run.size];
    if (COMMENT_ID_PATTERN.test(String(run.comment_id || ""))) {
      span.dataset.commentId = run.comment_id;
      span.classList.add("comment-anchor");
      span.title = "Nhấn để xem chú thích";
      if (container !== elements.noteContent) {
        span.tabIndex = 0;
        span.setAttribute("role", "button");
      }
    }
    return span;
  }

  const nodes = runs.flatMap((run) => {
    const text = String(run.text || "");
    if (!run.underline) return [createRunSpan(run, text, false)];
    return text.split(/(\s+)/).filter(Boolean).map((part) =>
      createRunSpan(run, part, /\S/.test(part)));
  });
  container.replaceChildren(...nodes);
}


function sameRunStyle(left, right) {
  return left.bold === right.bold
    && left.underline === right.underline
    && left.color === right.color
    && left.highlight === right.highlight
    && left.size === right.size
    && left.comment_id === right.comment_id;
}


function serializeRichEditor() {
  const runs = [];
  const blockTags = new Set(["DIV", "P", "LI", "H1", "H2", "H3", "BLOCKQUOTE"]);

  function push(text, parent = elements.noteContent) {
    const cleanText = String(text || "").replace(/\u200b/g, "");
    if (!cleanText) return;
    const format = {
      bold: false,
      underline: false,
      size: "normal",
      color: "",
      highlight: "",
      commentId: "",
    };
    const ancestors = [];
    for (let current = parent; current && current !== elements.noteContent; current = current.parentElement) {
      ancestors.unshift(current);
    }

    ancestors.forEach((current) => {
      if (current.dataset.clearFormat === "true") {
        format.bold = false;
        format.underline = false;
        format.size = "normal";
        format.color = "";
        format.highlight = "";
      }
      if (current.dataset.bold === "true") format.bold = true;
      if (current.dataset.underline === "true") format.underline = true;
      if (["small", "normal", "large", "xlarge"].includes(current.dataset.size)) {
        format.size = current.dataset.size;
      }
      if (/^#[0-9a-f]{6}$/i.test(current.dataset.color || "")) {
        format.color = current.dataset.color.toLowerCase();
      }
      if (/^#[0-9a-f]{6}$/i.test(current.dataset.highlight || "")) {
        format.highlight = current.dataset.highlight.toLowerCase();
      }
      if (COMMENT_ID_PATTERN.test(current.dataset.commentId || "")) {
        format.commentId = current.dataset.commentId;
      }

      // Tương thích với nội dung đang mở bằng phiên bản cũ, trước khi metadata được thêm vào.
      // Không đọc lại các style nền của nút "Xóa định dạng" thành định dạng mới.
      if (current.dataset.clearFormat !== "true") {
        if (current.tagName === "B" || current.tagName === "STRONG"
          || Number.parseInt(current.style.fontWeight, 10) >= 700) format.bold = true;
        if (current.tagName === "U" || current.style.textDecoration.includes("underline")) {
          format.underline = true;
        }
        const inlineColor = colorToHex(current.style.color);
        const inlineHighlight = colorToHex(current.style.backgroundColor);
        if (inlineColor) format.color = inlineColor;
        if (inlineHighlight) format.highlight = inlineHighlight;
        if (!current.dataset.size && current.style.fontSize) {
          const relativeSize = Number.parseFloat(current.style.fontSize);
          if (relativeSize <= 0.9) format.size = "small";
          else if (relativeSize >= 1.8) format.size = "xlarge";
          else if (relativeSize >= 1.2) format.size = "large";
          else format.size = "normal";
        }
      }
    });

    const run = {
      text: cleanText,
      bold: format.bold,
      underline: format.underline,
      size: format.size,
    };
    if (format.color) run.color = format.color;
    if (format.highlight) run.highlight = format.highlight;
    if (format.commentId) run.comment_id = format.commentId;

    const previous = runs.at(-1);
    if (previous && sameRunStyle(previous, run)) previous.text += cleanText;
    else runs.push(run);
  }

  function newline() {
    const last = runs.at(-1);
    if (last && !last.text.endsWith("\n")) last.text += "\n";
  }

  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      push(node.nodeValue || "", node.parentElement || elements.noteContent);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (node.tagName === "BR") {
      newline();
      return;
    }
    const isBlock = blockTags.has(node.tagName);
    if (isBlock && runs.length > 0) newline();
    node.childNodes.forEach(walk);
    if (isBlock) newline();
  }

  elements.noteContent.childNodes.forEach(walk);
  while (runs.length && !runs[0].text) runs.shift();
  while (runs.length && !runs.at(-1).text) runs.pop();
  const cleanedRuns = runs.filter((run) => run.text);
  return {
    content: cleanedRuns.map((run) => run.text).join(""),
    content_rich: cleanedRuns,
  };
}


function rememberEditorSelection() {
  if (suppressSelectionTracking) return;
  const selection = window.getSelection();
  if (!selection?.rangeCount) return;
  const range = selection.getRangeAt(0);
  if (elements.noteContent.contains(range.commonAncestorContainer)) {
    savedEditorRange = range.cloneRange();
    queueFontSizeControlSync(savedEditorRange);
  }
}


function currentEditorRange() {
  if (
    savedEditorRange
    && elements.noteContent.contains(savedEditorRange.startContainer)
    && elements.noteContent.contains(savedEditorRange.endContainer)
  ) {
    return savedEditorRange.cloneRange();
  }
  const range = document.createRange();
  range.selectNodeContents(elements.noteContent);
  range.collapse(false);
  return range;
}


function commitEditorRange(range, rangeToRemember = range) {
  suppressSelectionTracking = true;
  elements.noteContent.focus();
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  savedEditorRange = rangeToRemember.cloneRange();
  syncFontSizeControl(savedEditorRange);
  window.cancelAnimationFrame(selectionUnlockFrame);
  selectionUnlockFrame = window.requestAnimationFrame(() => {
    suppressSelectionTracking = false;
  });
}


function keepEditorCaretVisible() {
  window.cancelAnimationFrame(caretScrollFrame);
  caretScrollFrame = window.requestAnimationFrame(() => {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    if (!elements.noteContent.contains(range.startContainer)) return;

    const caretRect = range.getBoundingClientRect();
    if (!caretRect.height && !caretRect.width && !caretRect.top && !caretRect.left) return;
    const editorRect = elements.noteContent.getBoundingClientRect();
    const safeGap = 32;
    if (elements.noteContent.scrollHeight > elements.noteContent.clientHeight + 1) {
      if (caretRect.bottom > editorRect.bottom - safeGap) {
        elements.noteContent.scrollTop += caretRect.bottom - editorRect.bottom + safeGap;
      } else if (caretRect.top < editorRect.top + safeGap) {
        elements.noteContent.scrollTop -= editorRect.top + safeGap - caretRect.top;
      }
      return;
    }

    const modalRect = elements.noteModalBody.getBoundingClientRect();
    if (!modalRect.height) return;
    if (caretRect.bottom > modalRect.bottom - safeGap) {
      elements.noteModalBody.scrollTop += caretRect.bottom - modalRect.bottom + safeGap;
    } else if (caretRect.top < modalRect.top + safeGap) {
      elements.noteModalBody.scrollTop -= modalRect.top + safeGap - caretRect.top;
    }
  });
}


function cleanNodeText(value) {
  return String(value || "").replace(/\u200b/g, "");
}


function editorOffsetForBoundary(container, offset) {
  const before = document.createRange();
  before.selectNodeContents(elements.noteContent);
  before.setEnd(container, offset);
  return cleanNodeText(before.toString()).length;
}


function editorOffsetsForRange(range) {
  return {
    start: editorOffsetForBoundary(range.startContainer, range.startOffset),
    end: editorOffsetForBoundary(range.endContainer, range.endOffset),
  };
}


function rawOffsetForCleanOffset(text, cleanOffset) {
  if (cleanOffset <= 0) return 0;
  let seen = 0;
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] !== "\u200b") seen += 1;
    if (seen === cleanOffset) return index + 1;
  }
  return text.length;
}


function editorBoundaryAtOffset(targetOffset) {
  const walker = document.createTreeWalker(elements.noteContent, NodeFilter.SHOW_TEXT);
  let traversed = 0;
  let lastTextNode = null;
  while (walker.nextNode()) {
    const textNode = walker.currentNode;
    const rawText = textNode.nodeValue || "";
    const length = cleanNodeText(rawText).length;
    if (targetOffset <= traversed + length) {
      return {
        node: textNode,
        offset: rawOffsetForCleanOffset(rawText, Math.max(0, targetOffset - traversed)),
      };
    }
    traversed += length;
    lastTextNode = textNode;
  }
  if (lastTextNode) return { node: lastTextNode, offset: (lastTextNode.nodeValue || "").length };
  return { node: elements.noteContent, offset: 0 };
}


function editorRangeFromOffsets(start, end) {
  const startBoundary = editorBoundaryAtOffset(start);
  const endBoundary = editorBoundaryAtOffset(end);
  const range = document.createRange();
  range.setStart(startBoundary.node, startBoundary.offset);
  range.setEnd(endBoundary.node, endBoundary.offset);
  return range;
}


function editorCaretAtOffset(targetOffset) {
  let traversed = 0;
  for (const child of elements.noteContent.childNodes) {
    const length = cleanNodeText(child.textContent).length;
    traversed += length;
    if (traversed === targetOffset) {
      const range = document.createRange();
      range.setStartAfter(child);
      range.collapse(true);
      return range;
    }
    if (traversed > targetOffset) break;
  }
  const boundary = editorBoundaryAtOffset(targetOffset);
  const range = document.createRange();
  range.setStart(boundary.node, boundary.offset);
  range.collapse(true);
  return range;
}


function fontSizeForNode(node) {
  const ancestors = [];
  let current = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  while (current && current !== elements.noteContent) {
    ancestors.unshift(current);
    current = current.parentElement;
  }

  let size = "normal";
  ancestors.forEach((element) => {
    if (element.dataset.clearFormat === "true") size = "normal";
    if (FONT_SIZE_CSS[element.dataset.size]) size = element.dataset.size;
  });
  return size;
}


function fontSizesInRange(range) {
  if (range.collapsed) {
    let node = range.startContainer;
    if (node === elements.noteContent && range.startOffset > 0) {
      node = elements.noteContent.childNodes[range.startOffset - 1] || node;
      while (node.lastChild) node = node.lastChild;
    }
    return new Set([fontSizeForNode(node)]);
  }

  const { start, end } = editorOffsetsForRange(range);
  const sizes = new Set();
  const walker = document.createTreeWalker(elements.noteContent, NodeFilter.SHOW_TEXT);
  let traversed = 0;
  while (walker.nextNode()) {
    const textNode = walker.currentNode;
    const length = cleanNodeText(textNode.nodeValue).length;
    const nodeEnd = traversed + length;
    if (nodeEnd > start && traversed < end) sizes.add(fontSizeForNode(textNode));
    traversed = nodeEnd;
    if (traversed >= end) break;
  }
  return sizes;
}


function syncFontSizeControl(range = savedEditorRange) {
  if (!range || !elements.noteContent.contains(range.commonAncestorContainer)) return;
  const sizes = fontSizesInRange(range);
  if (sizes.size !== 1) {
    elements.noteFontSize.value = "";
    return;
  }
  const [size] = sizes;
  const entry = Object.entries(FONT_SIZE_FORMATS).find(([, format]) => format.name === size);
  elements.noteFontSize.value = entry?.[0] || "3";
}


function queueFontSizeControlSync(range) {
  const queuedRange = range.cloneRange();
  window.cancelAnimationFrame(fontSizeSyncFrame);
  fontSizeSyncFrame = window.requestAnimationFrame(() => {
    if (
      elements.noteContent.contains(queuedRange.startContainer)
      && elements.noteContent.contains(queuedRange.endContainer)
    ) {
      syncFontSizeControl(queuedRange);
    }
  });
}


function selectedRunsState(runs, start, end, property) {
  let offset = 0;
  const selected = [];
  runs.forEach((run) => {
    const runEnd = offset + run.text.length;
    if (runEnd > start && offset < end && /\S/.test(run.text)) {
      selected.push(run[property] === true);
    }
    offset = runEnd;
  });
  return selected.length > 0 && selected.every(Boolean);
}


function formatSelectedRun(run, text, command, value, booleanValue) {
  if (command === "removeFormat") {
    return {
      text,
      size: "normal",
      ...(run.comment_id ? { comment_id: run.comment_id } : {}),
    };
  }
  const formatted = { ...run, text };
  if (command === "bold") {
    if (booleanValue) formatted.bold = true;
    else delete formatted.bold;
  }
  if (command === "underline") {
    if (booleanValue) formatted.underline = true;
    else delete formatted.underline;
  }
  if (command === "fontSize") {
    formatted.size = (FONT_SIZE_FORMATS[value] || FONT_SIZE_FORMATS[3]).name;
  }
  if (command === "foreColor" && /^#[0-9a-f]{6}$/i.test(value || "")) {
    formatted.color = value.toLowerCase();
  }
  if (command === "hiliteColor" && /^#[0-9a-f]{6}$/i.test(value || "")) {
    formatted.highlight = value.toLowerCase();
  }
  if (command === "comment" && COMMENT_ID_PATTERN.test(String(value || ""))) {
    formatted.comment_id = value;
  }
  return formatted;
}


function applyFormatToSelection(range, command, value) {
  const serialized = serializeRichEditor();
  const { start: rawStart, end: rawEnd } = editorOffsetsForRange(range);
  const start = Math.max(0, Math.min(rawStart, serialized.content.length));
  const end = Math.max(start, Math.min(rawEnd, serialized.content.length));
  const booleanValue = command === "bold" || command === "underline"
    ? !selectedRunsState(serialized.content_rich, start, end, command)
    : false;

  const nextRuns = [];
  let offset = 0;
  serialized.content_rich.forEach((run) => {
    const runStart = offset;
    const runEnd = runStart + run.text.length;
    const selectedStart = Math.max(start, runStart);
    const selectedEnd = Math.min(end, runEnd);
    if (selectedStart >= selectedEnd) {
      nextRuns.push({ ...run });
    } else {
      const beforeLength = selectedStart - runStart;
      const selectedLength = selectedEnd - selectedStart;
      if (beforeLength > 0) nextRuns.push({ ...run, text: run.text.slice(0, beforeLength) });
      nextRuns.push(formatSelectedRun(
        run,
        run.text.slice(beforeLength, beforeLength + selectedLength),
        command,
        value,
        booleanValue,
      ));
      if (selectedEnd < runEnd) {
        nextRuns.push({ ...run, text: run.text.slice(beforeLength + selectedLength) });
      }
    }
    offset = runEnd;
  });

  renderRichContent(elements.noteContent, { content_rich: nextRuns });
  const selectedRange = editorRangeFromOffsets(start, end);
  const caretRange = editorCaretAtOffset(end);
  commitEditorRange(caretRange, selectedRange);
}


function applyEditorFormat(command, value = null) {
  const range = currentEditorRange();

  if (command === "insertText") {
    range.deleteContents();
    const textNode = document.createTextNode(String(value || ""));
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);
    commitEditorRange(range);
    keepEditorCaretVisible();
    return;
  }

  if (range.collapsed) {
    const message = {
      bold: "Hãy chọn đoạn chữ cần in đậm.",
      underline: "Hãy chọn đoạn chữ cần gạch chân.",
      fontSize: "Hãy chọn đoạn chữ cần đổi cỡ.",
      hiliteColor: "Hãy chọn đoạn chữ cần highlight.",
      foreColor: "Hãy chọn đoạn chữ cần đổi màu.",
      removeFormat: "Hãy chọn đoạn chữ cần xóa định dạng.",
      comment: "Hãy chọn đoạn chữ cần thêm chú thích.",
    }[command];
    showToast(message || "Hãy chọn đoạn chữ cần định dạng.");
    return;
  }

  applyFormatToSelection(range, command, value);
}


function hideCommentComposer() {
  elements.commentComposer.hidden = true;
  elements.commentComposer.style.removeProperty("left");
  elements.commentComposer.style.removeProperty("top");
  pendingCommentSelection = null;
}


function hideCommentPopover() {
  elements.commentPopover.hidden = true;
  elements.commentPopover.style.removeProperty("left");
  elements.commentPopover.style.removeProperty("top");
  activeCommentId = null;
}


function positionCommentPanel(panel, anchor) {
  panel.hidden = false;
  window.requestAnimationFrame(() => {
    if (window.innerWidth <= 560) {
      panel.style.removeProperty("left");
      panel.style.removeProperty("top");
      return;
    }
    const anchorRect = anchor.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const gap = 10;
    const left = Math.max(12, Math.min(anchorRect.left, window.innerWidth - panelRect.width - 12));
    const top = anchorRect.bottom + panelRect.height + gap <= window.innerHeight
      ? anchorRect.bottom + gap
      : Math.max(12, anchorRect.top - panelRect.height - gap);
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  });
}


function beginComment() {
  if (!elements.noteDialog.classList.contains("expanded-edit")) return;
  const range = currentEditorRange();
  if (range.collapsed) {
    showToast("Hãy bôi đen đoạn chữ cần thêm chú thích.");
    return;
  }
  const { start, end } = editorOffsetsForRange(range);
  pendingCommentSelection = { start, end };
  hideCommentPopover();
  elements.commentText.value = "";
  positionCommentPanel(elements.commentComposer, elements.addCommentButton);
  window.requestAnimationFrame(() => elements.commentText.focus());
}


function saveComment() {
  const text = elements.commentText.value.trim();
  if (!text) {
    showToast("Hãy nhập nội dung chú thích.");
    elements.commentText.focus();
    return;
  }
  if (!pendingCommentSelection) return;

  const serialized = serializeRichEditor();
  const start = Math.max(0, Math.min(pendingCommentSelection.start, serialized.content.length));
  const end = Math.max(start, Math.min(pendingCommentSelection.end, serialized.content.length));
  if (start === end) {
    hideCommentComposer();
    showToast("Đoạn chữ đã chọn không còn tồn tại.", true);
    return;
  }

  const commentId = crypto.randomUUID();
  editorComments.push({ id: commentId, text });
  const range = editorRangeFromOffsets(start, end);
  applyFormatToSelection(range, "comment", commentId);
  hideCommentComposer();
  showToast("Đã thêm chú thích vào đoạn chữ.");
}


function showComment(commentId, anchor) {
  const comment = editorComments.find((item) => item.id === commentId);
  if (!comment) return;
  if (!elements.commentPopover.hidden && activeCommentId === commentId) {
    hideCommentPopover();
    return;
  }
  hideCommentComposer();
  activeCommentId = commentId;
  elements.commentPopoverText.textContent = comment.text;
  elements.deleteCommentButton.hidden = !elements.noteDialog.classList.contains("expanded-edit");
  positionCommentPanel(elements.commentPopover, anchor);
}


function handleCommentAnchor(event) {
  const anchor = event.target.closest?.(".comment-anchor");
  if (!anchor || !event.currentTarget.contains(anchor)) return;
  if (
    event.currentTarget === elements.noteContent
    && !elements.noteDialog.classList.contains("expanded-edit")
  ) return;
  if (event.type === "click" && event.currentTarget === elements.noteContent) {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) return;
  }
  showComment(anchor.dataset.commentId, anchor);
}


function handleCommentAnchorKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  const anchor = event.target.closest?.(".comment-anchor");
  if (!anchor || !event.currentTarget.contains(anchor)) return;
  event.preventDefault();
  showComment(anchor.dataset.commentId, anchor);
}


function deleteActiveComment() {
  if (!activeCommentId || !elements.noteDialog.classList.contains("expanded-edit")) return;
  const deletedId = activeCommentId;
  const serialized = serializeRichEditor();
  const nextRuns = serialized.content_rich.map((run) => {
    if (run.comment_id !== deletedId) return { ...run };
    const nextRun = { ...run };
    delete nextRun.comment_id;
    return nextRun;
  });
  editorComments = editorComments.filter((comment) => comment.id !== deletedId);
  renderRichContent(elements.noteContent, { content_rich: nextRuns });
  savedEditorRange = null;
  hideCommentPopover();
  elements.noteContent.focus();
  showToast("Đã xóa chú thích.");
}


function sortedCategories() {
  return [...state.categories].sort((left, right) => {
    const defaultDifference = Number(right.is_default) - Number(left.is_default);
    if (defaultDifference !== 0) return defaultDifference;
    return left.name.localeCompare(right.name, "vi");
  });
}


function defaultCategory() {
  return state.categories.find((category) => category.is_default) || state.categories[0] || null;
}


function categoryForNote(note) {
  return state.categories.find((category) => category.id === note.category_id)
    || state.categories.find((category) => normalized(category.name) === normalized(note.category))
    || defaultCategory();
}


function categoryNameForNote(note) {
  return categoryForNote(note)?.name || note.category || "Chung";
}


function categoryIdForNote(note) {
  return categoryForNote(note)?.id || "";
}


function filteredNotes() {
  const query = normalized(state.query.trim());
  return state.notes.filter((note) => {
    if (state.systemFilter === "trash") {
      if (!note.is_trashed) return false;
    } else {
      if (note.is_trashed) return false;
      if (state.systemFilter === "archived") {
        if (!note.is_archived) return false;
      } else if (state.systemFilter === "pinned") {
        if (!note.is_pinned || note.is_archived) return false;
      } else {
        if (note.is_archived) return false;
      }
    }

    if (state.activeTag) {
      if (!Array.isArray(note.tags) || !note.tags.includes(state.activeTag)) {
        return false;
      }
    }

    const categoryMatches = state.activeCategoryId === ALL_CATEGORIES
      || categoryIdForNote(note) === state.activeCategoryId;
    if (!categoryMatches) return false;

    if (!query) return true;
    const tagText = Array.isArray(note.tags) ? note.tags.join(" ") : "";
    const checklistText = Array.isArray(note.checklist) ? note.checklist.map((c) => c.text).join(" ") : "";
    return normalized(
      `${note.title} ${note.content} ${categoryNameForNote(note)} ${note.note_date || ""} ${tagText} ${checklistText}`,
    ).includes(query);
  });
}


function formatDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "gần đây";
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return new Intl.DateTimeFormat("vi-VN", sameDay
    ? { hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "2-digit", year: "numeric" }
  ).format(date);
}


function formatNoteDate(dateValue) {
  const match = String(dateValue || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  return `${match[3]}/${match[2]}/${match[1]}`;
}


function todayForDateInput() {
  const today = new Date();
  const year = String(today.getFullYear()).padStart(4, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}


function categoryCounts() {
  const counts = new Map(state.categories.map((category) => [category.id, 0]));
  state.notes.forEach((note) => {
    if (note.is_trashed || note.is_archived) return;
    const categoryId = categoryIdForNote(note);
    if (categoryId) counts.set(categoryId, (counts.get(categoryId) || 0) + 1);
  });
  return counts;
}


function renderCategorySelect(preferredCategoryId = elements.noteCategory.value) {
  const categories = sortedCategories();
  elements.noteCategory.replaceChildren();

  if (categories.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Chưa có nhóm ghi chú";
    option.disabled = true;
    option.selected = true;
    elements.noteCategory.append(option);
    updateNoteDetailsSummary();
    return;
  }

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    elements.noteCategory.append(option);
  });

  const selectedExists = categories.some((category) => category.id === preferredCategoryId);
  elements.noteCategory.value = selectedExists
    ? preferredCategoryId
    : (defaultCategory()?.id || categories[0].id);
  updateNoteDetailsSummary();
}


function updateNoteDetailsSummary() {
  const title = elements.noteTitle.value.trim() || "Chưa có tiêu đề";
  const selectedCategory = elements.noteCategory.selectedOptions[0]?.textContent?.trim()
    || "Chưa chọn nhóm";
  const date = elements.noteDate.value
    ? formatNoteDate(elements.noteDate.value)
    : "Chưa chọn ngày";

  elements.noteSummaryTitle.textContent = title;
  elements.noteSummaryCategory.textContent = selectedCategory;
  elements.noteSummaryDate.textContent = date;
  elements.noteSummaryTitle.closest("span").title = `Tiêu đề: ${title}`;
  elements.noteSummaryCategory.closest("span").title = `Nhóm: ${selectedCategory}`;
  elements.noteSummaryDate.closest("span").title = `Ngày: ${date}`;
}


function createFilterButton(labelText, count, categoryId, isActive = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `category-button${isActive ? " active" : ""}`;
  button.setAttribute("aria-pressed", String(isActive));

  const label = document.createElement("span");
  label.textContent = labelText;
  const badge = document.createElement("span");
  badge.className = "category-count";
  badge.textContent = count;
  button.append(label, badge);
  button.addEventListener("click", () => {
    state.systemFilter = "all";
    state.activeCategoryId = categoryId;
    state.activeTag = null;
    playPaperSound("rustle");
    render();
  });
  return button;
}


function renderCategories() {
  const counts = categoryCounts();
  const categories = sortedCategories();

  if (
    state.activeCategoryId !== ALL_CATEGORIES
    && !categories.some((category) => category.id === state.activeCategoryId)
  ) {
    state.activeCategoryId = ALL_CATEGORIES;
  }

  const allActiveCount = state.notes.filter((n) => !n.is_trashed && !n.is_archived).length;
  const pinnedCount = state.notes.filter((n) => !n.is_trashed && !n.is_archived && n.is_pinned).length;
  const archivedCount = state.notes.filter((n) => !n.is_trashed && n.is_archived).length;
  const trashCount = state.notes.filter((n) => n.is_trashed).length;

  if (elements.countAllNotes) elements.countAllNotes.textContent = allActiveCount;
  if (elements.countPinnedNotes) elements.countPinnedNotes.textContent = pinnedCount;
  if (elements.countArchivedNotes) elements.countArchivedNotes.textContent = archivedCount;
  if (elements.countTrashNotes) elements.countTrashNotes.textContent = trashCount;

  const isAllActive = state.systemFilter === "all" && state.activeCategoryId === ALL_CATEGORIES;
  const isPinnedActive = state.systemFilter === "pinned";
  const isArchivedActive = state.systemFilter === "archived";
  const isTrashActive = state.systemFilter === "trash";

  if (elements.filterAllBtn) {
    elements.filterAllBtn.classList.toggle("active", isAllActive);
    elements.filterAllBtn.setAttribute("aria-pressed", String(isAllActive));
  }
  if (elements.filterPinnedBtn) {
    elements.filterPinnedBtn.classList.toggle("active", isPinnedActive);
    elements.filterPinnedBtn.setAttribute("aria-pressed", String(isPinnedActive));
  }
  if (elements.filterArchivedBtn) {
    elements.filterArchivedBtn.classList.toggle("active", isArchivedActive);
    elements.filterArchivedBtn.setAttribute("aria-pressed", String(isArchivedActive));
  }
  if (elements.filterTrashBtn) {
    elements.filterTrashBtn.classList.toggle("active", isTrashActive);
    elements.filterTrashBtn.setAttribute("aria-pressed", String(isTrashActive));
  }

  const buttons = [];
  categories.forEach((category) => {
    const isCatActive = state.systemFilter === "all" && state.activeCategoryId === category.id;
    buttons.push(createFilterButton(category.name, counts.get(category.id) || 0, category.id, isCatActive));
  });
  elements.categoryList.replaceChildren(...buttons);
  renderCategoryManager();
}


function smallButton(label, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}


function renderCategoryManager() {
  const categories = sortedCategories();
  const counts = categoryCounts();
  elements.categoryTotal.textContent = `${categories.length} nhóm`;
  elements.categoryManagerList.replaceChildren();

  categories.forEach((category) => {
    const row = document.createElement("div");
    row.className = "category-manager-row";

    if (state.editingCategoryId === category.id) {
      const input = document.createElement("input");
      input.className = "category-rename-input";
      input.value = category.name;
      input.maxLength = 40;
      input.setAttribute("aria-label", `Tên mới cho nhóm ${category.name}`);

      const actions = document.createElement("div");
      actions.className = "category-row-actions";
      const saveButton = smallButton("Lưu", "mini-action-button save", () => renameCategory(category, input));
      const cancelButton = smallButton("Hủy", "mini-action-button", () => {
        state.editingCategoryId = null;
        renderCategoryManager();
      });
      actions.append(saveButton, cancelButton);
      row.append(input, actions);

      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.stopPropagation();
          renameCategory(category, input);
        } else if (event.key === "Escape") {
          event.preventDefault();
          state.editingCategoryId = null;
          renderCategoryManager();
        }
      });
      requestAnimationFrame(() => {
        input.focus();
        input.select();
      });
      elements.categoryManagerList.append(row);
      return;
    }

    const copy = document.createElement("div");
    copy.className = "category-row-copy";
    const name = document.createElement("strong");
    name.textContent = category.name;
    const meta = document.createElement("small");
    const noteCount = counts.get(category.id) || 0;
    meta.textContent = `${noteCount} ghi chú${category.is_default ? " · Nhóm mặc định" : ""}`;
    copy.append(name, meta);

    const actions = document.createElement("div");
    actions.className = "category-row-actions";
    const renameButton = smallButton("Đổi tên", "mini-action-button", () => {
      state.editingCategoryId = category.id;
      renderCategoryManager();
    });
    const deleteButton = smallButton("Xóa", "mini-action-button danger", () => deleteCategory(category));
    if (category.is_default) {
      deleteButton.disabled = true;
      deleteButton.title = "Nhóm mặc định không thể xóa";
    }
    actions.append(renameButton, deleteButton);
    row.append(copy, actions);
    elements.categoryManagerList.append(row);
  });
}


function permanentlyDeleteNote(note) {
  if (!window.confirm(`Xóa vĩnh viễn ghi chú “${note.title || "này"}”? Hành động này không thể hoàn tác.`)) return;
  request(`/api/notes/${note.id}`, { method: "DELETE" })
    .then(() => {
      state.notes = state.notes.filter((item) => item.id !== note.id);
      playPaperSound("tear");
      showToast("Đã xóa vĩnh viễn ghi chú.");
      render();
    })
    .catch((err) => showToast(err.message, true));
}


function createNoteCard(note) {
  const card = document.createElement("article");
  const patternClass = note.paper_pattern && note.paper_pattern !== "blank"
    ? ` note-paper-${note.paper_pattern}`
    : "";
  card.className = `note-card color-${note.color}${patternClass}`;
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `Xem ghi chú ${note.title}`);

  const tiltDeg = ((stringHash(String(note.id)) % 40) - 20) / 10;
  card.style.setProperty("--tilt", `${tiltDeg}deg`);

  if (Array.isArray(note.stickers) && note.stickers.length > 0) {
    note.stickers.forEach((sticker) => {
      const stEl = document.createElement("span");
      stEl.className = `note-sticker note-sticker-${sticker.type}`;
      if (sticker.type === "pin-red") {
        stEl.innerHTML = '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><circle cx="10" cy="10" r="7" fill="#e03131" stroke="#25252a" stroke-width="1.8"/><circle cx="7.5" cy="7.5" r="2.5" fill="#ffc9c9"/></svg>';
      } else if (sticker.type === "pin-blue") {
        stEl.innerHTML = '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><circle cx="10" cy="10" r="7" fill="#1971c2" stroke="#25252a" stroke-width="1.8"/><circle cx="7.5" cy="7.5" r="2.5" fill="#d0ebff"/></svg>';
      } else if (sticker.type === "star") {
        stEl.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="#fcc419" stroke="#25252a" stroke-width="1.8" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
      } else if (sticker.type === "heart") {
        stEl.innerHTML = '<svg viewBox="0 0 24 24" width="19" height="19" fill="#f06595" stroke="#25252a" stroke-width="1.8" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
      }
      card.append(stEl);
    });
  }

  const topLine = document.createElement("div");
  topLine.className = "card-topline";
  const category = document.createElement("span");
  category.className = "card-category";
  category.textContent = categoryNameForNote(note);
  topLine.append(category);

  if (note.is_pinned) {
    const pin = document.createElement("span");
    pin.className = "pin-mark";
    pin.textContent = "⌖";
    pin.title = "Đã ghim";
    topLine.append(pin);
  }

  if (note.is_locked) {
    const lock = document.createElement("span");
    lock.className = "card-lock-badge";
    lock.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';
    lock.title = "Đã khóa";
    topLine.append(lock);
  }

  const title = document.createElement("h2");
  title.textContent = note.title;
  card.append(topLine, title);

  const isLockedAndHidden = note.is_locked && !state.unlockedNoteIds.has(note.id);

  if (isLockedAndHidden) {
    const lockMsg = document.createElement("p");
    lockMsg.className = "card-content";
    lockMsg.style.fontStyle = "italic";
    lockMsg.style.opacity = "0.75";
    lockMsg.textContent = "Ghi chú này đã được khóa bằng mã PIN. Bấm vào để mở.";
    card.append(lockMsg);
  } else {
    const content = document.createElement("p");
    content.className = "card-content";
    content.textContent = note.content || "Chưa có nội dung.";
    card.append(content);

    if (note.doodle) {
      const doodleThumb = document.createElement("img");
      doodleThumb.className = "card-doodle-thumb";
      doodleThumb.src = note.doodle;
      doodleThumb.alt = "Nét vẽ tay";
      card.append(doodleThumb);
    }

    if (Array.isArray(note.checklist) && note.checklist.length > 0) {
      const clBox = document.createElement("div");
      clBox.className = "card-checklist";
      note.checklist.slice(0, 4).forEach((item) => {
        const itemRow = document.createElement("div");
        itemRow.className = `card-checklist-item${item.done ? " done" : ""}`;
        const itemChk = document.createElement("span");
        itemChk.textContent = item.done ? "☑" : "☐";
        itemChk.style.cursor = "pointer";
        itemChk.title = "Đánh dấu việc";
        itemChk.addEventListener("click", async (e) => {
          e.stopPropagation();
          item.done = !item.done;
          itemRow.classList.toggle("done", item.done);
          itemChk.textContent = item.done ? "☑" : "☐";
          playPaperSound("pin");
          try {
            await request(`/api/notes/${note.id}`, {
              method: "PUT",
              body: JSON.stringify({ ...note, checklist: note.checklist }),
            });
          } catch (err) {
            showToast(err.message, true);
          }
        });
        const itemTxt = document.createElement("span");
        itemTxt.textContent = item.text;
        itemRow.append(itemChk, itemTxt);
        clBox.append(itemRow);
      });
      if (note.checklist.length > 4) {
        const more = document.createElement("small");
        more.style.color = "var(--muted)";
        more.textContent = `+${note.checklist.length - 4} việc nữa...`;
        clBox.append(more);
      }
      card.append(clBox);
    }

    if (Array.isArray(note.tags) && note.tags.length > 0) {
      const tagsBox = document.createElement("div");
      tagsBox.className = "card-tags";
      note.tags.forEach((tag) => {
        const tagEl = document.createElement("span");
        tagEl.className = "card-tag-item";
        tagEl.textContent = `#${tag}`;
        tagsBox.append(tagEl);
      });
      card.append(tagsBox);
    }
  }

  const footer = document.createElement("div");
  footer.className = "card-footer";
  const date = document.createElement("span");
  date.textContent = note.note_date
    ? `Ngày ${formatNoteDate(note.note_date)}`
    : `Cập nhật ${formatDate(note.updated_at)}`;
  const hint = document.createElement("span");
  hint.className = "edit-hint";
  hint.textContent = "Xem →";
  footer.append(date, hint);
  card.append(footer);

  if (note.is_trashed) {
    const actionBar = document.createElement("div");
    actionBar.className = "card-action-bar";
    const restoreBtn = document.createElement("button");
    restoreBtn.type = "button";
    restoreBtn.className = "card-mini-btn";
    restoreBtn.textContent = "Khôi phục";
    restoreBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      restoreNote(note);
    });
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "card-mini-btn";
    delBtn.style.color = "#c92a2a";
    delBtn.textContent = "Xóa hẳn";
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      permanentlyDeleteNote(note);
    });
    actionBar.append(restoreBtn, delBtn);
    card.append(actionBar);
  }

  const handleCardClick = () => {
    if (note.is_locked && !state.unlockedNoteIds.has(note.id)) {
      state.pendingPinNote = note;
      elements.pinPromptTitle.textContent = `Mở khóa: ${note.title}`;
      elements.pinPromptInput.value = "";
      elements.pinPromptMessage.textContent = "";
      elements.pinPromptDialog.showModal();
      requestAnimationFrame(() => elements.pinPromptInput.focus());
      return;
    }
    openViewDialog(note);
  };

  card.addEventListener("click", handleCardClick);
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick();
    }
  });
  return card;
}


function renderNotes() {
  const isCalendar = state.viewMode === "calendar";
  elements.calendarView.hidden = !isCalendar;
  elements.notesGrid.hidden = isCalendar;

  if (isCalendar) {
    renderCalendar();
    elements.emptyState.hidden = true;
    elements.totalCount.textContent = state.notes.length;
    elements.visibleCount.textContent = `${state.notes.filter((n) => !n.is_trashed && !n.is_archived).length} ghi chú`;
    return;
  }

  const isCorkboard = state.viewMode === "corkboard";
  elements.notesGrid.classList.toggle("corkboard-mode", isCorkboard);

  const notes = filteredNotes();
  elements.notesGrid.replaceChildren(...notes.map(createNoteCard));
  elements.notesGrid.hidden = notes.length === 0;
  elements.emptyState.hidden = notes.length !== 0;
  elements.totalCount.textContent = state.notes.length;
  elements.visibleCount.textContent = `${notes.length} ghi chú`;

  let caption = "Tất cả ghi chú";
  if (state.systemFilter === "pinned") caption = "Ghi chú đã ghim";
  else if (state.systemFilter === "archived") caption = "Ghi chú lưu trữ";
  else if (state.systemFilter === "trash") caption = "Thùng rác";
  else if (state.activeCategoryId !== ALL_CATEGORIES) {
    const activeCategory = state.categories.find((category) => category.id === state.activeCategoryId);
    caption = activeCategory?.name || "Nhóm ghi chú";
  }
  if (state.activeTag) caption += ` (#${state.activeTag})`;
  elements.filterCaption.textContent = caption;

  elements.emptyTrashButton.hidden = state.systemFilter !== "trash" || notes.length === 0;

  if (state.notes.length === 0) {
    elements.emptyMessage.textContent = "Thêm ghi chú đầu tiên để bắt đầu nhé.";
  } else if (state.query.trim()) {
    elements.emptyMessage.textContent = "Không tìm thấy mẩu ghi chú nào khớp từ khóa.";
  } else if (state.systemFilter === "trash") {
    elements.emptyMessage.textContent = "Thùng rác trống tinh tươm.";
  } else if (state.systemFilter === "archived") {
    elements.emptyMessage.textContent = "Chưa có ghi chú nào được lưu trữ.";
  } else if (state.systemFilter === "pinned") {
    elements.emptyMessage.textContent = "Chưa có ghi chú nào được ghim lên đầu.";
  } else {
    elements.emptyMessage.textContent = "Nhóm này chưa có ghi chú nào.";
  }
}


function render() {
  renderCategories();
  renderTags();
  renderNotes();
}


function setExpandedView(expanded) {
  const isExpanded = Boolean(expanded);
  const isExpandedEdit = isExpanded && state.noteDialogMode !== "view";
  elements.noteDialog.classList.toggle("expanded-view", isExpanded);
  elements.noteDialog.classList.toggle("expanded-edit", isExpandedEdit);
  elements.noteReadingPanel.hidden = !isExpanded || isExpandedEdit;
  elements.addCommentButton.hidden = !isExpandedEdit;
  if (!isExpandedEdit) {
    hideCommentComposer();
    hideCommentPopover();
  }
  elements.expandNoteButton.setAttribute("aria-expanded", String(isExpanded));
  elements.expandNoteButton.setAttribute(
    "aria-label",
    isExpanded
      ? "Thu nhỏ ghi chú"
      : (state.noteDialogMode === "view" ? "Phóng to để đọc toàn bộ ghi chú" : "Phóng to trình soạn thảo"),
  );
  elements.expandNoteButtonLabel.textContent = isExpanded ? "Thu nhỏ" : "Phóng to";
  elements.expandNoteButton.title = isExpanded
    ? "Thu nhỏ ghi chú"
    : (state.noteDialogMode === "view" ? "Phóng to để đọc toàn bộ" : "Phóng to trình soạn thảo");
}


function updateNoteDialogStyle(color, pattern) {
  if (!elements.noteDialog) return;
  ["yellow", "blue", "pink", "green", "purple"].forEach((c) =>
    elements.noteDialog.classList.remove(`color-${c}`)
  );
  ["blank", "lined", "grid", "dot"].forEach((p) =>
    elements.noteDialog.classList.remove(`pattern-${p}`)
  );
  if (color) elements.noteDialog.classList.add(`color-${color}`);
  if (pattern) elements.noteDialog.classList.add(`pattern-${pattern}`);
}

function setNoteDialogMode(mode) {
  state.noteDialogMode = mode;
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const formControls = [
    ...elements.noteForm.querySelectorAll('input[name="color"]'),
    ...elements.patternPicker.querySelectorAll('input[name="pattern"]'),
    elements.noteCategory,
    elements.noteDate,
    elements.notePinned,
    elements.noteLockedCheckbox,
    elements.notePinInput,
    elements.noteTagsInput,
  ];

  elements.noteDialog.dataset.mode = mode;
  elements.noteDialog.classList.toggle("view-mode", isView);
  elements.noteTitle.readOnly = isView;
  elements.noteContent.contentEditable = String(!isView);
  elements.noteContent.setAttribute("aria-disabled", String(isView));
  elements.noteFormatToolbar.hidden = isView;
  if (isView) elements.addCommentButton.hidden = true;
  elements.noteContent.hidden = isView;
  elements.noteContentView.hidden = !isView;
  formControls.forEach((control) => { control.disabled = isView; });

  elements.stickersSelector.querySelectorAll(".sticker-btn").forEach((btn) => { btn.disabled = isView; });
  elements.clearStickersButton.disabled = isView;
  elements.addChecklistButton.disabled = isView;
  elements.addChecklistItemBtn.disabled = isView;
  elements.openDoodleButton.disabled = isView;
  elements.removeDoodleButton.disabled = isView;

  elements.exportPngButton.hidden = false;
  elements.shareNoteButton.hidden = !isView;
  elements.archiveNoteButton.hidden = !isView;

  elements.deleteNoteButton.hidden = !isEdit && !isView;
  elements.editNoteButton.hidden = !isView;
  elements.expandNoteButton.hidden = false;
  elements.saveNoteButton.hidden = isView;
  elements.cancelButton.textContent = isView ? "Đóng" : (isEdit ? "Hủy" : "Bỏ qua");

  if (!isView && !isEdit) setExpandedView(false);

  if (isView) {
    elements.dialogEyebrow.textContent = "Mẩu giấy đã lưu";
    elements.dialogTitle.textContent = "Xem ghi chú";
  } else if (isEdit) {
    elements.dialogEyebrow.textContent = "Chỉnh lại mẩu giấy";
    elements.dialogTitle.textContent = "Sửa ghi chú";
  } else {
    elements.dialogEyebrow.textContent = "Mẩu giấy mới";
    elements.dialogTitle.textContent = "Ghi lại một điều";
  }
}


function resetForm() {
  elements.noteForm.reset();
  elements.noteDetailsPanel.open = true;
  savedEditorRange = null;
  editorComments = [];
  hideCommentComposer();
  hideCommentPopover();
  elements.noteFontSize.value = "3";
  elements.noteId.value = "";
  elements.noteDate.value = todayForDateInput();
  elements.noteContent.replaceChildren();
  elements.noteTextColor.closest("label").style.setProperty("--chosen-color", elements.noteTextColor.value);
  elements.applyTextColorButton.style.setProperty("--text-color-preview", elements.noteTextColor.value);
  elements.noteHighlightColor.closest("label").style.setProperty("--chosen-color", elements.noteHighlightColor.value);
  elements.applyHighlightButton.style.setProperty("--highlight-preview", elements.noteHighlightColor.value);
  elements.noteContentView.textContent = "";
  elements.readingPanelContent.textContent = "";
  elements.readingPanelTitle.textContent = "Tiêu đề ghi chú";
  elements.readingPanelCategory.textContent = "Nhóm ghi chú";
  elements.readingPanelDate.textContent = "";
  elements.readingPanelDate.hidden = true;

  state.currentPattern = "blank";
  const defaultPatternRadio = elements.patternPicker.querySelector('input[value="blank"]');
  if (defaultPatternRadio) defaultPatternRadio.checked = true;

  state.currentStickers = [];
  state.currentDoodle = null;
  elements.doodlePreviewBox.hidden = true;
  elements.doodlePreviewImg.src = "";

  state.currentChecklist = [];
  renderChecklistEditor();

  elements.noteTagsInput.value = "";

  elements.noteLockedCheckbox.checked = false;
  elements.notePinWrapper.hidden = true;
  elements.notePinInput.value = "";

  elements.archiveNoteButton.hidden = true;
  elements.restoreNoteButton.hidden = true;

  renderCategorySelect(defaultCategory()?.id || "");
  updateNoteDetailsSummary();
  updateNoteDialogStyle("yellow", "blank");
  setNoteDialogMode("create");
}


function fillNoteForm(note) {
  elements.noteId.value = note.id;
  elements.noteTitle.value = note.title;
  elements.noteDate.value = note.note_date || "";
  editorComments = Array.isArray(note.comments)
    ? note.comments.map((comment) => ({ id: comment.id, text: comment.text }))
    : [];
  renderCategorySelect(categoryIdForNote(note));
  renderRichContent(elements.noteContent, note);
  renderRichContent(elements.noteContentView, note, "Chưa có nội dung.");
  elements.readingPanelTitle.textContent = note.title || "Ghi chú không có tiêu đề";
  elements.readingPanelCategory.textContent = categoryNameForNote(note);
  elements.readingPanelDate.textContent = note.note_date
    ? `Ngày ${formatNoteDate(note.note_date)}`
    : "";
  elements.readingPanelDate.hidden = !note.note_date;
  renderRichContent(elements.readingPanelContent, note, "Chưa có nội dung.");
  elements.notePinned.checked = note.is_pinned;
  const colorInput = elements.noteForm.querySelector(`input[name="color"][value="${note.color}"]`);
  if (colorInput) colorInput.checked = true;

  state.currentPattern = note.paper_pattern || "blank";
  const patRadio = elements.patternPicker.querySelector(`input[value="${state.currentPattern}"]`);
  if (patRadio) patRadio.checked = true;

  updateNoteDialogStyle(note.color, state.currentPattern);

  state.currentStickers = Array.isArray(note.stickers) ? [...note.stickers] : [];

  state.currentDoodle = note.doodle || null;
  if (state.currentDoodle) {
    elements.doodlePreviewImg.src = state.currentDoodle;
    elements.doodlePreviewBox.hidden = false;
  } else {
    elements.doodlePreviewBox.hidden = true;
    elements.doodlePreviewImg.src = "";
  }

  state.currentChecklist = Array.isArray(note.checklist)
    ? note.checklist.map((item) => ({ ...item }))
    : [];
  renderChecklistEditor();

  elements.noteTagsInput.value = Array.isArray(note.tags) ? note.tags.join(", ") : "";

  elements.noteLockedCheckbox.checked = Boolean(note.is_locked);
  elements.notePinWrapper.hidden = !note.is_locked;
  elements.notePinInput.value = note.pin_code || "";

  elements.archiveNoteButton.textContent = note.is_archived ? "Bỏ lưu trữ" : "Lưu trữ";
  elements.archiveNoteButton.hidden = Boolean(note.is_trashed);
  elements.restoreNoteButton.hidden = !note.is_trashed;
  elements.deleteNoteButton.textContent = note.is_trashed ? "Xóa vĩnh viễn" : "Bỏ vào thùng rác";

  updateNoteDetailsSummary();
}


function openCreateDialog() {
  if (state.categories.length === 0) {
    showToast("Chưa tải được danh mục nhóm. Hãy thử lại.", true);
    return;
  }

  resetForm();
  const preferredCategoryId = state.activeCategoryId !== ALL_CATEGORIES
    ? state.activeCategoryId
    : defaultCategory()?.id;
  renderCategorySelect(preferredCategoryId || "");
  elements.noteDialog.showModal();
  requestAnimationFrame(() => {
    elements.noteModalBody.scrollTop = 0;
    elements.noteTitle.focus();
  });
}


function openViewDialog(note) {
  resetForm();
  fillNoteForm(note);
  setNoteDialogMode("view");
  elements.noteDialog.showModal();
  requestAnimationFrame(() => {
    elements.noteModalBody.scrollTop = 0;
    elements.closeDialogButton.focus();
  });
}


function toggleExpandedView() {
  const willExpand = !elements.noteDialog.classList.contains("expanded-view");
  setExpandedView(willExpand);
  requestAnimationFrame(() => {
    if (willExpand && state.noteDialogMode === "view") {
      elements.readingPanelScroll.scrollTop = 0;
      elements.closeReadingPanelButton.focus();
    } else if (willExpand) {
      elements.noteModalBody.scrollTop = 0;
      elements.noteContent.focus();
    } else {
      elements.expandNoteButton.focus();
    }
  });
}


function collapseExpandedView() {
  setExpandedView(false);
  requestAnimationFrame(() => elements.expandNoteButton.focus());
}


function enterEditMode() {
  if (!elements.noteId.value) return;
  const keepExpanded = elements.noteDialog.classList.contains("expanded-view");
  setNoteDialogMode("edit");
  setExpandedView(keepExpanded);
  requestAnimationFrame(() => {
    elements.noteModalBody.scrollTop = 0;
    if (keepExpanded) {
      elements.noteContent.focus();
    } else {
      elements.noteTitle.focus();
      elements.noteTitle.setSelectionRange(elements.noteTitle.value.length, elements.noteTitle.value.length);
    }
  });
}


function closeNoteDialog() {
  setExpandedView(false);
  if (elements.noteDialog.open) elements.noteDialog.close();
}


function openCategoryDialog() {
  state.editingCategoryId = null;
  elements.categoryForm.reset();
  renderCategoryManager();
  elements.categoryDialog.showModal();
  requestAnimationFrame(() => elements.categoryName.focus());
}


function closeCategoryDialog() {
  if (elements.categoryDialog.open) elements.categoryDialog.close();
}


async function loadData() {
  setConnectionStatus("", "Đang kết nối...");
  try {
    const categoryPayload = await request("/api/categories");
    state.categories = categoryPayload.categories || [];
    const notePayload = await request("/api/notes");
    state.notes = notePayload.notes || [];
    setConnectionStatus("connected", "Dữ liệu đã an toàn");
    render();
  } catch (error) {
    setConnectionStatus("error", "Mất kết nối dữ liệu");
    showToast(error.message, true);
    render();
  }
}


async function saveNote(event) {
  event.preventDefault();
  if (state.noteDialogMode === "view") return;

  const noteId = elements.noteId.value;
  const richContent = serializeRichEditor();
  const usedCommentIds = new Set(
    richContent.content_rich.map((run) => run.comment_id).filter(Boolean),
  );

  const selectedPattern = elements.patternPicker.querySelector('input[name="pattern"]:checked')?.value || "blank";

  const rawTags = elements.noteTagsInput.value
    .split(/[,#\s]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  const tags = [...new Set(rawTags)].slice(0, 10);

  const isLocked = elements.noteLockedCheckbox.checked;
  const pinCode = isLocked ? elements.notePinInput.value.trim() : null;
  if (isLocked && (!pinCode || !/^\d{4,6}$/.test(pinCode))) {
    showToast("Mã PIN phải gồm từ 4 đến 6 chữ số.", true);
    elements.notePinInput.focus();
    return;
  }

  const existingNote = state.notes.find((n) => String(n.id) === String(noteId));

  const payload = {
    title: elements.noteTitle.value,
    category_id: elements.noteCategory.value,
    note_date: elements.noteDate.value,
    ...richContent,
    comments: editorComments.filter((comment) => usedCommentIds.has(comment.id)),
    color: new FormData(elements.noteForm).get("color"),
    is_pinned: elements.notePinned.checked,
    paper_pattern: selectedPattern,
    stickers: state.currentStickers || [],
    doodle: state.currentDoodle || null,
    checklist: (state.currentChecklist || []).filter((item) => item.text && item.text.trim()),
    tags,
    is_locked: isLocked,
    pin_code: pinCode,
    is_archived: existingNote?.is_archived || false,
    is_trashed: existingNote?.is_trashed || false,
  };

  elements.saveNoteButton.disabled = true;
  elements.saveNoteButton.textContent = "Đang lưu...";
  try {
    const saved = await request(noteId ? `/api/notes/${noteId}` : "/api/notes", {
      method: noteId ? "PUT" : "POST",
      body: JSON.stringify(payload),
    });
    const existingIndex = state.notes.findIndex((note) => note.id === saved.id);
    if (existingIndex >= 0) state.notes[existingIndex] = saved;
    else state.notes.push(saved);
    state.notes.sort((left, right) =>
      Number(right.is_pinned) - Number(left.is_pinned)
      || right.updated_at.localeCompare(left.updated_at));
    closeNoteDialog();
    playPaperSound("rustle");
    setConnectionStatus("connected", "Dữ liệu đã an toàn");
    showToast(noteId ? "Đã cập nhật ghi chú." : "Đã lưu ghi chú mới.");
    render();
  } catch (error) {
    setConnectionStatus("error", "Chưa lưu được dữ liệu");
    showToast(error.message, true);
  } finally {
    elements.saveNoteButton.disabled = false;
    elements.saveNoteButton.textContent = "Lưu ghi chú";
  }
}


async function deleteNote() {
  const noteId = elements.noteId.value;
  if (!noteId) return;
  const note = state.notes.find((item) => String(item.id) === noteId);
  if (!note) return;

  if (!note.is_trashed) {
    if (!window.confirm(`Chuyển ghi chú “${note.title || "này"}” vào thùng rác?`)) return;
    elements.deleteNoteButton.disabled = true;
    try {
      await request(`/api/notes/${noteId}/trash`, { method: "POST" });
      note.is_trashed = true;
      note.trashed_at = new Date().toISOString();
      closeNoteDialog();
      playPaperSound("tear");
      showToast("Đã chuyển ghi chú vào thùng rác.");
      render();
    } catch (error) {
      showToast(error.message, true);
    } finally {
      elements.deleteNoteButton.disabled = false;
    }
  } else {
    if (!window.confirm(`Xóa vĩnh viễn ghi chú “${note.title || "này"}”? Hành động này không thể hoàn tác.`)) return;
    elements.deleteNoteButton.disabled = true;
    try {
      await request(`/api/notes/${noteId}`, { method: "DELETE" });
      state.notes = state.notes.filter((item) => String(item.id) !== noteId);
      closeNoteDialog();
      playPaperSound("tear");
      showToast("Đã xóa vĩnh viễn ghi chú.");
      render();
    } catch (error) {
      showToast(error.message, true);
    } finally {
      elements.deleteNoteButton.disabled = false;
    }
  }
}


async function createCategory(event) {
  event.preventDefault();
  const name = elements.categoryName.value.trim();
  if (!name) {
    elements.categoryName.focus();
    showToast("Hãy nhập tên nhóm ghi chú.", true);
    return;
  }

  elements.addCategoryButton.disabled = true;
  try {
    const category = await request("/api/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    state.categories.push(category);
    elements.categoryName.value = "";
    render();
    renderCategorySelect(category.id);
    showToast(`Đã tạo nhóm “${category.name}”.`);
    elements.categoryName.focus();
  } catch (error) {
    showToast(error.message, true);
  } finally {
    elements.addCategoryButton.disabled = false;
  }
}


async function renameCategory(category, input) {
  const name = input.value.trim();
  if (!name) {
    input.focus();
    showToast("Tên nhóm không được để trống.", true);
    return;
  }

  input.disabled = true;
  try {
    const payload = await request(`/api/categories/${category.id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    });
    const updated = payload.category;
    state.categories = state.categories.map((item) => item.id === updated.id ? updated : item);
    state.notes = state.notes.map((note) => note.category_id === updated.id
      ? { ...note, category: updated.name }
      : note);
    state.editingCategoryId = null;
    render();
    renderCategorySelect(updated.id);
    showToast(`Đã đổi tên nhóm thành “${updated.name}”.`);
  } catch (error) {
    input.disabled = false;
    input.focus();
    showToast(error.message, true);
  }
}


async function deleteCategory(category) {
  if (category.is_default) return;
  const count = categoryCounts().get(category.id) || 0;
  const fallback = defaultCategory();
  const detail = count > 0
    ? ` ${count} ghi chú trong nhóm sẽ được chuyển sang “${fallback?.name || "Chung"}”.`
    : "";
  if (!window.confirm(`Xóa nhóm “${category.name}”?${detail}`)) return;

  try {
    const payload = await request(`/api/categories/${category.id}`, { method: "DELETE" });
    const fallbackCategory = payload.fallback_category || fallback;
    state.notes = state.notes.map((note) => note.category_id === category.id
      ? {
          ...note,
          category_id: fallbackCategory.id,
          category: fallbackCategory.name,
        }
      : note);
    state.categories = state.categories.filter((item) => item.id !== category.id);
    if (state.activeCategoryId === category.id) {
      state.activeCategoryId = fallbackCategory.id;
    }
    state.editingCategoryId = null;
    render();
    renderCategorySelect(fallbackCategory.id);
    showToast(payload.moved_notes > 0
      ? `Đã xóa nhóm và chuyển ${payload.moved_notes} ghi chú.`
      : "Đã xóa nhóm ghi chú.");
  } catch (error) {
    showToast(error.message, true);
  }
}


elements.noteFormatToolbar.querySelectorAll("[data-format-command]").forEach((button) => {
  button.addEventListener("mousedown", (event) => event.preventDefault());
  button.addEventListener("click", () => applyEditorFormat(button.dataset.formatCommand));
});
elements.noteFontSize.addEventListener("change", () => applyEditorFormat("fontSize", elements.noteFontSize.value));
elements.noteTextColor.addEventListener("input", () => {
  elements.noteTextColor.closest("label").style.setProperty("--chosen-color", elements.noteTextColor.value);
  elements.applyTextColorButton.style.setProperty("--text-color-preview", elements.noteTextColor.value);
});
elements.applyTextColorButton.addEventListener("mousedown", (event) => event.preventDefault());
elements.applyTextColorButton.addEventListener("click", () => {
  applyEditorFormat("foreColor", elements.noteTextColor.value);
});
elements.noteHighlightColor.addEventListener("input", () => {
  elements.noteHighlightColor.closest("label").style.setProperty("--chosen-color", elements.noteHighlightColor.value);
  elements.applyHighlightButton.style.setProperty("--highlight-preview", elements.noteHighlightColor.value);
});
elements.applyHighlightButton.addEventListener("mousedown", (event) => event.preventDefault());
elements.applyHighlightButton.addEventListener("click", () => {
  applyEditorFormat("hiliteColor", elements.noteHighlightColor.value);
});
elements.addCommentButton.addEventListener("mousedown", (event) => event.preventDefault());
elements.addCommentButton.addEventListener("click", beginComment);
elements.cancelCommentButton.addEventListener("click", hideCommentComposer);
elements.dismissCommentButton.addEventListener("click", hideCommentComposer);
elements.saveCommentButton.addEventListener("click", saveComment);
elements.commentText.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    saveComment();
  }
  if (event.key === "Escape") {
    event.preventDefault();
    hideCommentComposer();
    elements.noteContent.focus();
  }
});
elements.closeCommentPopoverButton.addEventListener("click", hideCommentPopover);
elements.deleteCommentButton.addEventListener("click", deleteActiveComment);
elements.noteContent.addEventListener("click", handleCommentAnchor);
elements.noteContentView.addEventListener("click", handleCommentAnchor);
elements.readingPanelContent.addEventListener("click", handleCommentAnchor);
elements.noteContentView.addEventListener("keydown", handleCommentAnchorKeydown);
elements.readingPanelContent.addEventListener("keydown", handleCommentAnchorKeydown);
elements.clearNoteFormat.addEventListener("mousedown", (event) => event.preventDefault());
elements.clearNoteFormat.addEventListener("click", () => applyEditorFormat("removeFormat"));
elements.noteContent.addEventListener("beforeinput", (event) => {
  if (!["insertParagraph", "insertLineBreak"].includes(event.inputType)) return;
  event.preventDefault();
  rememberEditorSelection();
  applyEditorFormat("insertText", "\n");
});
elements.noteContent.addEventListener("keyup", rememberEditorSelection);
elements.noteContent.addEventListener("mouseup", rememberEditorSelection);
elements.noteContent.addEventListener("input", () => {
  rememberEditorSelection();
  keepEditorCaretVisible();
});
document.addEventListener("selectionchange", rememberEditorSelection);
elements.noteContent.addEventListener("paste", (event) => {
  event.preventDefault();
  applyEditorFormat("insertText", event.clipboardData.getData("text/plain"));
});
elements.noteTitle.addEventListener("input", updateNoteDetailsSummary);
elements.noteCategory.addEventListener("change", updateNoteDetailsSummary);
elements.noteDate.addEventListener("change", updateNoteDetailsSummary);

elements.loginTab.addEventListener("click", () => setAuthMode("login"));
elements.signupTab.addEventListener("click", () => setAuthMode("signup"));
elements.authForm.addEventListener("submit", submitAuth);
elements.logoutButton.addEventListener("click", signOut);
elements.newNoteButton.addEventListener("click", openCreateDialog);
elements.emptyAddButton.addEventListener("click", openCreateDialog);
elements.manageCategoriesButton.addEventListener("click", openCategoryDialog);
elements.closeDialogButton.addEventListener("click", closeNoteDialog);
elements.cancelButton.addEventListener("click", closeNoteDialog);
elements.editNoteButton.addEventListener("click", enterEditMode);
elements.expandNoteButton.addEventListener("click", toggleExpandedView);
elements.closeReadingPanelButton.addEventListener("click", collapseExpandedView);
elements.editFromReadingPanelButton.addEventListener("click", enterEditMode);
elements.deleteNoteButton.addEventListener("click", deleteNote);
elements.noteForm.addEventListener("submit", saveNote);
elements.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderNotes();
});
elements.noteDialog.addEventListener("click", (event) => {
  if (event.target === elements.noteDialog && state.noteDialogMode === "view") {
    closeNoteDialog();
  }
});
elements.noteDialog.addEventListener("close", () => setExpandedView(false));
elements.noteForm.addEventListener("keydown", (event) => {
  if (
    state.noteDialogMode !== "view"
    && (event.ctrlKey || event.metaKey)
    && event.key === "Enter"
  ) {
    event.preventDefault();
    elements.noteForm.requestSubmit();
  }
});

elements.categoryForm.addEventListener("submit", createCategory);
elements.closeCategoryDialogButton.addEventListener("click", closeCategoryDialog);
elements.doneCategoryButton.addEventListener("click", closeCategoryDialog);
elements.categoryDialog.addEventListener("click", (event) => {
  if (event.target === elements.categoryDialog) closeCategoryDialog();
});

elements.soundToggleButton.addEventListener("click", toggleSound);
elements.themeToggleButton.addEventListener("click", toggleTheme);

elements.viewGridBtn.addEventListener("click", () => setViewMode("grid"));
elements.viewCorkboardBtn.addEventListener("click", () => setViewMode("corkboard"));
elements.viewCalendarBtn.addEventListener("click", () => setViewMode("calendar"));

elements.calendarPrevMonthBtn.addEventListener("click", () => {
  state.calendarDate.setMonth(state.calendarDate.getMonth() - 1);
  renderCalendar();
  playPaperSound("rustle");
});
elements.calendarNextMonthBtn.addEventListener("click", () => {
  state.calendarDate.setMonth(state.calendarDate.getMonth() + 1);
  renderCalendar();
  playPaperSound("rustle");
});

elements.filterAllBtn.addEventListener("click", () => setSystemFilter("all"));
elements.filterPinnedBtn.addEventListener("click", () => setSystemFilter("pinned"));
elements.filterArchivedBtn.addEventListener("click", () => setSystemFilter("archived"));
elements.filterTrashBtn.addEventListener("click", () => setSystemFilter("trash"));
elements.emptyTrashButton.addEventListener("click", emptyTrash);

elements.noteForm.querySelectorAll('input[name="color"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    updateNoteDialogStyle(radio.value, state.currentPattern);
    playPaperSound("rustle");
  });
});

elements.patternPicker.querySelectorAll('input[name="pattern"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    state.currentPattern = radio.value;
    const activeColor = elements.noteForm.querySelector('input[name="color"]:checked')?.value || "yellow";
    updateNoteDialogStyle(activeColor, radio.value);
    playPaperSound("rustle");
  });
});

elements.stickersSelector.querySelectorAll(".sticker-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.sticker;
    if (!type) return;
    if (!state.currentStickers) state.currentStickers = [];
    if (state.currentStickers.length >= 8) {
      showToast("Tối đa 8 sticker trên một mẩu giấy.");
      return;
    }
    state.currentStickers.push({ type, x: 0, y: 0, rotation: 0 });
    playPaperSound(type.startsWith("pin") ? "pin" : "rustle");
    showToast(`Đã dán ${btn.textContent}`);
  });
});
elements.clearStickersButton.addEventListener("click", () => {
  state.currentStickers = [];
  playPaperSound("tear");
  showToast("Đã gỡ tất cả sticker.");
});

elements.addChecklistButton.addEventListener("click", () => addChecklistItem());
elements.addChecklistItemBtn.addEventListener("click", () => addChecklistItem());

elements.openDoodleButton.addEventListener("click", openDoodleDialog);
elements.closeDoodleDialogBtn.addEventListener("click", () => elements.doodleDialog.close());
elements.cancelDoodleBtn.addEventListener("click", () => elements.doodleDialog.close());
elements.saveDoodleBtn.addEventListener("click", saveDoodle);
elements.removeDoodleButton.addEventListener("click", removeDoodle);
elements.doodlePenTool.addEventListener("click", () => {
  elements.doodlePenTool.classList.add("active");
  elements.doodleEraserTool.classList.remove("active");
});
elements.doodleEraserTool.addEventListener("click", () => {
  elements.doodleEraserTool.classList.add("active");
  elements.doodlePenTool.classList.remove("active");
});
elements.doodleUndoBtn.addEventListener("click", () => {
  if (doodleHistory.length > 0) {
    const last = doodleHistory.pop();
    doodleCtx.putImageData(last, 0, 0);
  }
});
elements.doodleClearBtn.addEventListener("click", () => {
  if (doodleCtx) {
    doodleHistory.push(doodleCtx.getImageData(0, 0, elements.doodleCanvas.width, elements.doodleCanvas.height));
    doodleCtx.clearRect(0, 0, elements.doodleCanvas.width, elements.doodleCanvas.height);
  }
});

elements.noteLockedCheckbox.addEventListener("change", () => {
  elements.notePinWrapper.hidden = !elements.noteLockedCheckbox.checked;
  if (elements.noteLockedCheckbox.checked) elements.notePinInput.focus();
});
elements.closePinPromptBtn.addEventListener("click", () => {
  elements.pinPromptDialog.close();
  state.pendingPinNote = null;
});
elements.cancelPinPromptBtn.addEventListener("click", () => {
  elements.pinPromptDialog.close();
  state.pendingPinNote = null;
});
elements.pinPromptForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const pin = elements.pinPromptInput.value.trim();
  if (!state.pendingPinNote) return;
  if (pin === state.pendingPinNote.pin_code) {
    state.unlockedNoteIds.add(state.pendingPinNote.id);
    const note = state.pendingPinNote;
    state.pendingPinNote = null;
    elements.pinPromptDialog.close();
    playPaperSound("pin");
    render();
    openViewDialog(note);
  } else {
    elements.pinPromptMessage.textContent = "Mã PIN không đúng!";
    elements.pinPromptInput.value = "";
    elements.pinPromptInput.focus();
    playPaperSound("tear");
  }
});

elements.closeExportDialogBtn.addEventListener("click", () => elements.exportDialog.close());
elements.cancelExportBtn.addEventListener("click", () => elements.exportDialog.close());
elements.confirmExportBtn.addEventListener("click", async () => {
  if (!state.exportingNote) return;
  const template = elements.exportTemplateSelector?.querySelector('input[name="exportTemplate"]:checked')?.value || "card";
  await downloadNoteAsPng(state.exportingNote, template);
  elements.exportDialog.close();
});
if (elements.exportTemplateSelector) {
  elements.exportTemplateSelector.addEventListener("click", (e) => {
    const option = e.target.closest(".export-template-option");
    if (!option) return;
    const radio = option.querySelector('input[name="exportTemplate"]');
    if (radio) {
      radio.checked = true;
      updateExportTemplateUI();
      renderExportPreview();
      playPaperSound("rustle");
    }
  });

  elements.exportTemplateSelector.querySelectorAll('input[name="exportTemplate"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      updateExportTemplateUI();
      renderExportPreview();
      playPaperSound("rustle");
    });
  });
}

elements.exportPngButton.addEventListener("click", () => {
  const noteId = elements.noteId.value;
  let note = state.notes.find((n) => String(n.id) === String(noteId));
  const selectedColor = elements.noteForm.querySelector('input[name="color"]:checked')?.value || (note?.color) || "yellow";
  const selectedPattern = elements.patternPicker.querySelector('input[name="pattern"]:checked')?.value || (note?.paper_pattern) || "blank";
  const currentTitle = elements.noteTitle.value.trim() || note?.title || "Mẩu Ghi Chú";
  const currentContent = (state.noteDialogMode === "view" ? elements.noteContentView.innerText : elements.noteContent.innerText).trim();

  const exportNote = {
    id: noteId || "preview",
    title: currentTitle,
    content: currentContent,
    color: selectedColor,
    paper_pattern: selectedPattern,
    category_id: elements.noteCategory.value || note?.category_id,
    note_date: elements.noteDate.value || note?.note_date,
    checklist: state.currentChecklist?.length ? state.currentChecklist : (note?.checklist || []),
    stickers: state.currentStickers?.length ? state.currentStickers : (note?.stickers || []),
    doodle: state.currentDoodle || note?.doodle || null,
  };
  openExportDialog(exportNote);
});
elements.shareNoteButton.addEventListener("click", () => {
  const noteId = elements.noteId.value;
  const note = state.notes.find((n) => String(n.id) === String(noteId));
  if (note) openShareDialog(note);
});
elements.closeShareLinkBtn.addEventListener("click", () => elements.shareLinkDialog.close());
elements.doneShareLinkBtn.addEventListener("click", () => elements.shareLinkDialog.close());
elements.copyShareLinkBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(elements.shareLinkInput.value);
  showToast("Đã chép đường link công khai.");
});
elements.unshareNoteBtn.addEventListener("click", () => {
  const noteId = elements.shareLinkDialog.dataset.noteId;
  if (noteId) unshareNote(noteId);
});

elements.archiveNoteButton.addEventListener("click", () => {
  const noteId = elements.noteId.value;
  const note = state.notes.find((n) => String(n.id) === String(noteId));
  if (note) toggleArchiveNote(note);
});
elements.restoreNoteButton.addEventListener("click", () => {
  const noteId = elements.noteId.value;
  const note = state.notes.find((n) => String(n.id) === String(noteId));
  if (note) restoreNote(note);
});

elements.closePublicNoteBtn.addEventListener("click", () => elements.publicNoteDialog.close());
elements.donePublicNoteBtn.addEventListener("click", () => elements.publicNoteDialog.close());

elements.openSettingsButton.addEventListener("click", () => {
  elements.changePasswordForm.reset();
  elements.changePasswordMessage.textContent = "";
  initTheme();
  updateSoundUI();
  elements.settingsDialog.showModal();
});
elements.closeSettingsDialogBtn.addEventListener("click", () => elements.settingsDialog.close());
elements.doneSettingsBtn.addEventListener("click", () => elements.settingsDialog.close());
elements.changePasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const current_password = elements.currentPasswordInput.value;
  const new_password = elements.newPasswordInput.value;
  elements.submitChangePasswordBtn.disabled = true;
  elements.changePasswordMessage.textContent = "";
  elements.changePasswordMessage.classList.remove("success");
  try {
    await request("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password, new_password }),
    });
    elements.changePasswordForm.reset();
    elements.changePasswordMessage.textContent = "Đổi mật khẩu thành công!";
    elements.changePasswordMessage.classList.add("success");
    playPaperSound("rustle");
    showToast("Đổi mật khẩu thành công.");
  } catch (err) {
    elements.changePasswordMessage.textContent = err.message;
  } finally {
    elements.submitChangePasswordBtn.disabled = false;
  }
});
elements.backupDataBtn.addEventListener("click", downloadBackup);
elements.restoreFileInput.addEventListener("change", (e) => {
  if (e.target.files?.[0]) uploadRestore(e.target.files[0]);
});

elements.forgotPasswordLink.addEventListener("click", (e) => {
  e.preventDefault();
  elements.resetPasswordForm.reset();
  elements.resetPasswordMessage.textContent = "";
  elements.resetPasswordDialog.showModal();
  requestAnimationFrame(() => elements.resetUsernameInput.focus());
});
elements.closeResetPasswordBtn.addEventListener("click", () => elements.resetPasswordDialog.close());
elements.cancelResetPasswordBtn.addEventListener("click", () => elements.resetPasswordDialog.close());
elements.resetPasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = elements.resetUsernameInput.value.trim();
  const recovery_key = elements.resetRecoveryKeyInput.value.trim();
  const new_password = elements.resetNewPasswordInput.value;
  elements.submitResetPasswordBtn.disabled = true;
  elements.resetPasswordMessage.textContent = "";
  try {
    await request("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ username, recovery_key, new_password }),
    });
    elements.resetPasswordDialog.close();
    showToast("Đặt lại mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới.");
    setAuthMode("login");
    elements.authUsername.value = username;
    elements.authPassword.value = "";
    elements.authPassword.focus();
  } catch (err) {
    elements.resetPasswordMessage.textContent = err.message;
  } finally {
    elements.submitResetPasswordBtn.disabled = false;
  }
});

elements.copyRecoveryKeyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(elements.recoveryKeyText.textContent);
  showToast("Đã chép mã khôi phục vào bộ nhớ tạm.");
});
elements.closeRecoveryNoticeBtn.addEventListener("click", () => elements.recoveryNoticeDialog.close());

bootstrap();
