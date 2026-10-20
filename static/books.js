// Shared memory books live beside private notes and use the same signed-in session.
(() => {
  const dialog = document.querySelector('#booksDialog');
  const $ = (selector) => dialog.querySelector(selector);
  const ui = {
    list: $('#booksList'), welcome: $('#booksWelcome'), main: $('#activeBookArea'),
    title: $('#activeBookTitle'), names: $('#bookMemberNames'), members: $('#bookMembersList'),
    invite: $('#bookInviteRow'), code: $('#bookInviteCode'), entries: $('#bookEntries'),
    count: $('#bookEntryCount'), form: $('#bookEntryForm'), formTitle: $('#bookEntryFormHeading'),
    id: $('#bookEntryId'), titleInput: $('#bookEntryTitle'), date: $('#bookEntryDate'),
    content: $('#bookEntryContent'), file: $('#bookEntryPhoto'),
    photoPreview: $('#bookPhotoPreview'), removePhoto: $('#removeBookPhotoButton'),
  };
  const data = { books: [], book: null, entries: [], photo: null, poll: null, loading: null, selecting: 0 };
  const inviteKey = 'book-invite';
  const linkedInvite = () => new URLSearchParams(location.hash.slice(1)).get(inviteKey);
  const joinCode = (value) => {
    const text = value.trim();
    try {
      const url = new URL(text);
      return new URLSearchParams(url.hash.slice(1)).get(inviteKey) || text;
    } catch { return text; }
  };
  const hasDraft = () => {
    const title = ui.titleInput.value.trim();
    const content = ui.content.value.trim();
    const saved = data.entries.find((entry) => entry.id === ui.id.value);
    if (ui.id.value) return !saved || title !== saved.title.trim() || content !== (saved.content || '').trim() ||
      ui.date.value !== (saved.note_date || '') || data.photo !== (saved.photo || null);
    return Boolean(title || content || data.photo);
  };
  const canDiscardDraft = () => !hasDraft() || window.confirm('Bạn có nội dung chưa lưu trong trang này. Bỏ thay đổi?');
  const node = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  const notify = (message) => {
    const toast = document.querySelector('#toast');
    if (toast) {
      toast.textContent = message;
      toast.classList.add('visible', 'show');
      setTimeout(() => toast.classList.remove('visible', 'show'), 4500);
    } else window.alert(message);
  };
  const api = async (url, method = 'GET', body) => {
    const response = await fetch(url, {
      method, credentials: 'same-origin', cache: 'no-store',
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || `Lỗi ${response.status}`);
    return result;
  };
  const action = (handler) => async (event) => {
    try { await handler(event); }
    catch (error) { notify(error.message || 'Có lỗi khi thao tác với sổ chung.'); }
  };
  const bookUrl = () => `/api/books/${encodeURIComponent(data.book.id)}`;

  function resetEntry() {
    ui.form.reset();
    delete ui.form.dataset.revision;
    ui.id.value = '';
    ui.date.value = new Date().toLocaleDateString('en-CA');
    ui.formTitle.textContent = 'Viết một kỷ niệm';
    setPhoto(null);
  }
  function setPhoto(photo) {
    data.photo = photo;
    ui.photoPreview.hidden = !photo;
    ui.removePhoto.hidden = !photo;
    if (photo) ui.photoPreview.src = photo;
    else ui.photoPreview.removeAttribute('src');
    ui.file.value = '';
  }
  function renderBooks() {
    ui.list.replaceChildren();
    if (!data.books.length) ui.list.append(node('p', 'Chưa có sổ chung.'));
    data.books.forEach((book) => {
      const button = node('button', book.title, 'book-library-item');
      button.type = 'button';
      button.classList.toggle('active', data.book?.id === book.id);
      button.addEventListener('click', action(() => selectBook(book.id)));
      ui.list.append(button);
    });
    ui.main.hidden = !data.book;
    ui.welcome.hidden = !!data.book;
  }
  function renderEntries() {
    ui.entries.replaceChildren();
    ui.count.textContent = `(${data.entries.length})`;
    if (!data.entries.length) ui.entries.append(node('p', 'Chưa có trang nào. Hãy viết kỷ niệm đầu tiên!'));
    data.entries.forEach((entry) => {
      const card = node('article', undefined, 'book-entry-card');
      card.append(node('time', entry.note_date || '', 'book-entry-date'));
      card.append(node('h4', entry.title));
      card.append(node('p', `Viết bởi ${entry.author_name || 'Thành viên'}`, 'book-entry-author'));
      if (entry.photo && /^data:image\/(png|jpeg|webp);base64,/.test(entry.photo)) {
        const image = node('img');
        image.src = entry.photo;
        image.loading = 'lazy';
        image.alt = `Ảnh kỷ niệm: ${entry.title}`;
        card.append(image);
      }
      if (entry.content) card.append(node('p', entry.content, 'book-entry-text'));
      const buttons = node('div', undefined, 'book-entry-buttons');
      const edit = node('button', 'Sửa', 'ghost-button');
      edit.type = 'button';
      edit.addEventListener('click', () => {
        if (!canDiscardDraft()) return;
        ui.id.value = entry.id;
        ui.form.dataset.revision = String(entry.revision || 1);
        ui.titleInput.value = entry.title;
        ui.date.value = entry.note_date || '';
        ui.content.value = entry.content || '';
        ui.formTitle.textContent = `Sửa: ${entry.title}`;
        setPhoto(entry.photo || null);
        ui.form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        ui.titleInput.focus({ preventScroll: true });
      });
      const remove = node('button', 'Xóa', 'ghost-button');
      remove.type = 'button';
      remove.addEventListener('click', action(async () => {
        if (!window.confirm('Xóa trang kỷ niệm này khỏi sổ chung?')) return;
        await api(`${bookUrl()}/entries/${entry.id}`, 'DELETE');
        if (ui.id.value === entry.id) resetEntry();
        await refreshBook();
      }));
      buttons.append(edit, remove);
      card.append(buttons);
      ui.entries.append(card);
    });
  }
  function renderBook() {
    renderBooks();
    if (!data.book) return;
    ui.title.textContent = data.book.title;
    const members = data.book.members || [];
    ui.names.textContent = `${members.length} người cùng viết`;
    ui.invite.hidden = !data.book.invite_code;
    ui.code.value = data.book.invite_code || '';
    ui.members.replaceChildren();
    members.forEach((member) => {
      const item = node('span', `${member.username || 'Thành viên'}${member.id === data.book.owner_id ? ' (chủ sổ)' : ''}`, 'book-member');
      if (data.book.invite_code && member.id !== data.book.owner_id) {
        const kick = node('button', '×', 'book-member-remove');
        kick.type = 'button';
        kick.title = `Xóa ${member.username || 'thành viên'} khỏi sổ`;
        kick.setAttribute('aria-label', kick.title);
        kick.addEventListener('click', action(async () => {
          if (!window.confirm(`Thu hồi quyền truy cập của ${member.username || 'thành viên'}?`)) return;
          await api(`${bookUrl()}/remove-member`, 'POST', { member_id: member.id });
          await refreshBook();
        }));
        item.append(kick);
      }
      ui.members.append(item);
    });
    renderEntries();
  }
  async function loadBooks() {
    data.books = (await api('/api/books')).books;
    if (data.book && !data.books.some((book) => book.id === data.book.id)) {
      data.book = null;
      data.entries = [];
      resetEntry();
    }
    $('#booksSetupPanel').open = !data.books.length;
    renderBooks();
  }
  async function selectBook(id, confirmed = false) {
    if (data.book?.id === id) return refreshBook();
    if (!confirmed && !canDiscardDraft()) return;
    const selection = ++data.selecting;
    const [book, entries] = await Promise.all([api(`/api/books/${id}`), api(`/api/books/${id}/entries`)]);
    if (selection !== data.selecting) return;
    data.book = book.book;
    data.entries = entries.entries;
    $('#booksSetupPanel').open = false;
    resetEntry();
    renderBook();
  }
  async function refreshBook() {
    if (!data.book) return;
    const id = data.book.id;
    if (data.loading?.id === id) return data.loading.promise;
    const loading = (async () => {
      const [book, entries] = await Promise.all([api(`/api/books/${id}`), api(`/api/books/${id}/entries`)]);
      if (data.book?.id !== id) return;
      const nextBook = book.book;
      const nextEntries = entries.entries;
      const bookChanged = data.book.invite_code !== nextBook.invite_code ||
        JSON.stringify(data.book.members) !== JSON.stringify(nextBook.members);
      const entriesChanged = data.entries.length !== nextEntries.length || nextEntries.some((entry, index) =>
        entry.id !== data.entries[index].id || entry.updated_at !== data.entries[index].updated_at);
      data.book = book.book;
      data.entries = nextEntries;
      if (bookChanged) renderBook();
      else if (entriesChanged) renderEntries();
    })();
    data.loading = { id, promise: loading };
    try { await loading; }
    finally { if (data.loading?.promise === loading) data.loading = null; }
  }

  // Resize large phone photos locally so an ordinary photo can fit within the stored entry limit.
  async function photoFromFile(file) {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('Chỉ nhận ảnh PNG, JPEG hoặc WebP.');
    if (file.size > 15 * 1024 * 1024) throw new Error('Ảnh gốc cần nhỏ hơn 15 MB.');
    const objectUrl = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = objectUrl;
      await image.decode();
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 1100 / Math.max(image.naturalWidth, image.naturalHeight));
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.85, 0.72, 0.55, 0.4]) {
        const photo = canvas.toDataURL('image/jpeg', quality);
        if (photo.length < 440000) return photo;
      }
      throw new Error('Ảnh quá nhiều chi tiết. Hãy chọn ảnh khác hoặc giảm kích thước ảnh.');
    } finally { URL.revokeObjectURL(objectUrl); }
  }

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  function scrapbookHtml() {
    if (!data.book) throw new Error('Hãy chọn sổ trước khi xuất.');
    const title = escapeHtml(data.book.title);
    const people = escapeHtml((data.book.members || []).map((member) => member.username).join(' · '));
    const orderedEntries = [...data.entries].sort((a, b) =>
      String(a.note_date || a.created_at).localeCompare(String(b.note_date || b.created_at)) ||
      String(a.created_at).localeCompare(String(b.created_at)));
    const pages = orderedEntries.map((entry, index) => `<section class="page memory">
      <div class="tape"></div><small>TRANG KỶ NIỆM ${index + 1} · ${escapeHtml(entry.note_date)}</small>
      <h2>${escapeHtml(entry.title)}</h2>${entry.photo && /^data:image\/(png|jpeg|webp);base64,/.test(entry.photo) ? `<img src="${entry.photo}" alt="Ảnh kỷ niệm">` : ''}
      <p class="letter">${escapeHtml(entry.content)}</p><footer>Viết bởi ${escapeHtml(entry.author_name)}</footer>
    </section>`).join('\n');
    return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title} — Scrapbook</title>
    <style>*{box-sizing:border-box}body{margin:0;background:#eee6dd;color:#3b3034;font-family:Georgia,serif}.page{position:relative;background:#fff9ef;max-width:210mm;min-height:297mm;margin:16px auto;padding:24mm 22mm;box-shadow:0 5px 25px #aaa;border:2px solid #e3b8c3;break-after:page;page-break-after:always}.cover{display:flex;flex-direction:column;justify-content:center;text-align:center;background:linear-gradient(155deg,#ffdfeb,#fdf5e6)}.cover h1{font-size:3.1rem;overflow-wrap:anywhere}.cover p{font-style:italic;font-size:1.3rem}.memory h2{font-size:2rem;overflow-wrap:anywhere}.memory small,.memory footer{color:#926273;letter-spacing:.09em}.memory img{display:block;max-width:100%;max-height:110mm;margin:20px auto;padding:9px;background:white;border:1px solid #dbc8b9;object-fit:contain;transform:rotate(-1deg);break-inside:avoid}.letter{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.75;font-size:1.15rem}.memory footer{margin-top:20mm;text-align:right}.tape{position:absolute;top:12mm;left:42%;width:16%;height:12mm;background:#eee0b0;opacity:.8;transform:rotate(-3deg)}@media print{@page{size:A4;margin:0}body{background:white;print-color-adjust:exact;-webkit-print-color-adjust:exact}.page{width:210mm;min-height:297mm;height:auto;margin:0;box-shadow:none;break-after:page;page-break-after:always;overflow:visible}.cover{height:297mm}.page:last-child{break-after:auto}}@media(max-width:750px){.page{padding:35px 24px;min-height:100vh}.cover h1{font-size:2rem}}</style>
    </head><body><section class="page cover"><p>♥ NHỮNG NGÀY BÊN NHAU ♥</p><h1>${title}</h1><p>${people}</p><p>${orderedEntries.length} trang kỷ niệm</p></section>${pages}</body></html>`;
  }

  async function openBooks() {
    if (dialog.open) return;
    dialog.showModal();
    await loadBooks();
    if (data.books.length) await selectBook(data.book && data.books.some((b) => b.id === data.book.id) ? data.book.id : data.books[0].id);
    if (linkedInvite()) {
      $('#bookJoinCode').value = linkedInvite();
      $('#booksSetupPanel').open = true;
      $('#bookJoinCode').focus({ preventScroll: true });
    }
    clearInterval(data.poll);
    data.poll = setInterval(() => {
      if (dialog.open) refreshBook().catch((error) => notify(error.message));
    }, 20000);
  }
  document.querySelector('#openBooksButton').addEventListener('click', action(openBooks));
  window.addEventListener('animated-note:ready', () => {
    if (!linkedInvite()) return;
    const recovery = document.querySelector('#recoveryNoticeDialog');
    if (recovery.open) recovery.addEventListener('close', () => openBooks().catch((error) => notify(error.message)), { once: true });
    else openBooks().catch((error) => notify(error.message));
  });
  const close = () => { clearInterval(data.poll); data.poll = null; };
  $('#closeBooksButton').addEventListener('click', () => { if (canDiscardDraft()) dialog.close(); });
  dialog.addEventListener('cancel', (event) => { if (!canDiscardDraft()) event.preventDefault(); });
  dialog.addEventListener('close', close);
  $('#createBookForm').addEventListener('submit', action(async (event) => {
    event.preventDefault();
    if (!canDiscardDraft()) return;
    const created = await api('/api/books', 'POST', { title: $('#newBookTitle').value.trim() });
    $('#createBookForm').reset();
    await loadBooks();
    await selectBook(created.book.id, true);
    notify('Đã tạo sổ chung. Gửi mã mời để cùng viết!');
  }));
  $('#joinBookForm').addEventListener('submit', action(async (event) => {
    event.preventDefault();
    if (!canDiscardDraft()) return;
    const joined = await api('/api/books/join', 'POST', { code: joinCode($('#bookJoinCode').value) });
    $('#joinBookForm').reset();
    await loadBooks();
    await selectBook(joined.book.id, true);
    if (linkedInvite()) history.replaceState(history.state, '', `${location.pathname}${location.search}`);
    notify('Đã tham gia sổ chung!');
  }));
  $('#refreshBookButton').addEventListener('click', action(refreshBook));
  $('#copyBookInviteButton').addEventListener('click', action(async () => {
    await navigator.clipboard.writeText(ui.code.value);
    notify('Đã sao chép mã mời.');
  }));
  $('#copyBookInviteLinkButton').addEventListener('click', action(async () => {
    const url = new URL(location.pathname, location.origin);
    url.hash = new URLSearchParams({ [inviteKey]: ui.code.value }).toString();
    await navigator.clipboard.writeText(url.href);
    notify('Đã sao chép liên kết. Gửi cho người bạn muốn cùng viết nhé!');
  }));
  $('#rotateBookInviteButton').addEventListener('click', action(async () => {
    if (!window.confirm('Mã mời hiện tại sẽ hết hiệu lực. Tiếp tục?')) return;
    await api(`${bookUrl()}/invite`, 'POST');
    await refreshBook();
  }));
  $('#newBookEntryButton').addEventListener('click', () => { if (canDiscardDraft()) resetEntry(); });
  ui.removePhoto.addEventListener('click', () => setPhoto(null));
  ui.file.addEventListener('change', action(async () => {
    if (ui.file.files[0]) setPhoto(await photoFromFile(ui.file.files[0]));
  }));
  ui.form.addEventListener('submit', action(async (event) => {
    event.preventDefault();
    if (!data.book) return;
    const entryId = ui.id.value;
    const payload = { title: ui.titleInput.value.trim(), note_date: ui.date.value, content: ui.content.value.trim(), photo: data.photo };
    if (entryId) payload.expected_revision = Number(ui.form.dataset.revision);
    await api(`${bookUrl()}/entries${entryId ? `/${entryId}` : ''}`, entryId ? 'PUT' : 'POST', payload);
    resetEntry();
    await refreshBook();
    notify('Đã lưu kỷ niệm vào sổ chung.');
  }));
  $('#downloadBookButton').addEventListener('click', action(async () => {
    await refreshBook();
    const url = URL.createObjectURL(new Blob([scrapbookHtml()], { type: 'text/html;charset=utf-8' }));
    const a = node('a');
    a.href = url;
    a.download = `scrapbook-${data.book.id}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }));
  $('#printBookButton').addEventListener('click', action(async () => {
    const popup = window.open('', '_blank');
    if (!popup) throw new Error('Trình duyệt chặn cửa sổ in. Hãy cho phép popup rồi thử lại.');
    try {
      await refreshBook();
      popup.document.open();
      popup.document.write(scrapbookHtml());
      popup.document.close();
      Promise.all(Array.from(popup.document.images, (img) => img.decode().catch(() => {})))
        .then(() => { if (!popup.closed) { popup.focus(); popup.print(); } });
    } catch (error) { popup.close(); throw error; }
  }));
})();
