import assert from "node:assert/strict";
import test from "node:test";

import { createHandler } from "../netlify/functions/notes.mjs";


const DEFAULT_CATEGORY_ID = "00000000-0000-4000-8000-000000000001";
const CATEGORY_ID = "223e4567-e89b-42d3-a456-426614174000";
const LEGACY_CATEGORY_ID = "323e4567-e89b-42d3-a456-426614174000";
const NOTE_ID = "123e4567-e89b-42d3-a456-426614174000";
const COMMENT_ID = "423e4567-e89b-42d3-a456-426614174000";
const TEST_USER_ID = "test-user";
const TEST_NOTE_PREFIX = `users/${TEST_USER_ID}/notes/`;


function createAuthenticatedHandler(options = {}) {
  return createHandler({
    getUserFn: async () => ({ id: TEST_USER_ID, email: "test@example.com" }),
    ...options,
  });
}


class MemoryStore {
  constructor(entries = []) {
    this.entries = new Map(entries);
  }

  async list({ prefix = "" } = {}) {
    return {
      blobs: [...this.entries.keys()]
        .filter((key) => key.startsWith(prefix))
        .map((key) => ({ key, etag: `etag-${key}` })),
      directories: [],
    };
  }

  async get(key) {
    const value = this.entries.get(key);
    return value === undefined ? null : structuredClone(value);
  }

  async setJSON(key, value, options = {}) {
    if (options.onlyIfNew && this.entries.has(key)) return { modified: false };
    this.entries.set(key, structuredClone(value));
    return { modified: true, etag: `etag-${key}` };
  }

  async delete(key) {
    this.entries.delete(key);
  }
}


function makeRequest(path, method = "GET", payload) {
  return new Request(`https://example.netlify.app${path}`, {
    method,
    headers: payload === undefined ? undefined : { "Content-Type": "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
}


async function readJson(response) {
  return JSON.parse(await response.text());
}


test("quản lý danh mục và gán ghi chú vào nhóm đã tạo", async () => {
  const store = new MemoryStore();
  const ids = [CATEGORY_ID, NOTE_ID];
  let now = "2026-09-09T01:00:00.000Z";
  const handler = createAuthenticatedHandler({
    storeFactory: () => store,
    idFactory: () => ids.shift(),
    nowFactory: () => now,
    logger: { error() {} },
  });

  const initialCategoriesResponse = await handler(makeRequest("/api/categories"));
  assert.equal(initialCategoriesResponse.status, 200);
  const initialCategories = await readJson(initialCategoriesResponse);
  assert.equal(initialCategories.categories.length, 1);
  assert.equal(initialCategories.categories[0].id, DEFAULT_CATEGORY_ID);
  assert.equal(initialCategories.categories[0].is_default, true);

  const categoryResponse = await handler(
    makeRequest("/api/categories", "POST", { name: "Học tập" }),
  );
  assert.equal(categoryResponse.status, 201);
  const category = await readJson(categoryResponse);
  assert.equal(category.id, CATEGORY_ID);
  assert.equal(category.name, "Học tập");

  const createResponse = await handler(
    makeRequest("/api/notes", "POST", {
      title: "Ôn bài",
      content: "Ôn lại bài trước thứ Sáu.",
      content_rich: [
        { text: "Ôn lại ", bold: true, color: "#6c63a8", size: "large" },
        { text: "bài trước thứ Sáu.", underline: true, highlight: "#fff1a9", size: "normal", comment_id: COMMENT_ID },
      ],
      comments: [{ id: COMMENT_ID, text: "Xem lại chương 3 trước khi ôn." }],
      note_date: "2026-09-12",
      category_id: CATEGORY_ID,
      color: "blue",
      is_pinned: true,
    }),
  );
  assert.equal(createResponse.status, 201);
  const created = await readJson(createResponse);
  assert.equal(created.id, NOTE_ID);
  assert.equal(created.category_id, CATEGORY_ID);
  assert.equal(created.category, "Học tập");
  assert.equal(created.content, "Ôn lại bài trước thứ Sáu.");
  assert.equal(created.content_rich[0].bold, true);
  assert.equal(created.content_rich[1].underline, true);
  assert.equal(created.content_rich[1].comment_id, COMMENT_ID);
  assert.deepEqual(created.comments, [
    { id: COMMENT_ID, text: "Xem lại chương 3 trước khi ôn." },
  ]);
  assert.equal(created.note_date, "2026-09-12");

  now = "2026-09-09T02:00:00.000Z";
  const renameResponse = await handler(
    makeRequest(`/api/categories/${CATEGORY_ID}`, "PUT", { name: "Học tập & thi cử" }),
  );
  assert.equal(renameResponse.status, 200);
  const renamed = await readJson(renameResponse);
  assert.equal(renamed.updated_notes, 1);

  const renamedNotesResponse = await handler(makeRequest("/api/notes"));
  const renamedNotes = await readJson(renamedNotesResponse);
  assert.equal(renamedNotes.notes[0].category, "Học tập & thi cử");
  assert.equal(renamedNotes.notes[0].note_date, "2026-09-12");
  assert.deepEqual(renamedNotes.notes[0].content_rich, [
    { text: "Ôn lại ", bold: true, color: "#6c63a8", size: "large" },
    { text: "bài trước thứ Sáu.", underline: true, highlight: "#fff1a9", size: "normal", comment_id: COMMENT_ID },
  ]);

  const deleteCategoryResponse = await handler(
    makeRequest(`/api/categories/${CATEGORY_ID}`, "DELETE"),
  );
  assert.equal(deleteCategoryResponse.status, 200);
  const deletion = await readJson(deleteCategoryResponse);
  assert.equal(deletion.moved_notes, 1);
  assert.equal(deletion.fallback_category.id, DEFAULT_CATEGORY_ID);

  const movedNotesResponse = await handler(makeRequest("/api/notes"));
  const movedNotes = await readJson(movedNotesResponse);
  assert.equal(movedNotes.notes[0].category_id, DEFAULT_CATEGORY_ID);
  assert.equal(movedNotes.notes[0].category, "Chung");

  now = "2026-09-09T03:00:00.000Z";
  const updateResponse = await handler(
    makeRequest(`/api/notes/${NOTE_ID}`, "PUT", {
      title: "Đã ôn xong",
      content: "Nội dung\n\n\nmới.\n\n",
      content_rich: [
        { text: "Nội dung\n\n\n", highlight: "#d8f3dc", size: "normal", comment_id: COMMENT_ID },
        { text: "mới.\n\n", bold: true, underline: true, color: "#9d174d", size: "xlarge" },
      ],
      comments: [{ id: COMMENT_ID, text: "Chú thích đã được cập nhật." }],
      note_date: "2026-10-05",
      category_id: DEFAULT_CATEGORY_ID,
      color: "green",
      is_pinned: false,
    }),
  );
  assert.equal(updateResponse.status, 200);
  const updated = await readJson(updateResponse);
  assert.equal(updated.title, "Đã ôn xong");
  assert.equal(updated.updated_at, now);
  assert.equal(updated.created_at, created.created_at);
  assert.equal(updated.content, "Nội dung\n\n\nmới.\n\n");
  assert.equal(updated.note_date, "2026-10-05");
  assert.deepEqual(updated.content_rich, [
    { text: "Nội dung\n\n\n", size: "normal", highlight: "#d8f3dc", comment_id: COMMENT_ID },
    { text: "mới.\n\n", size: "xlarge", bold: true, underline: true, color: "#9d174d" },
  ]);
  assert.deepEqual(updated.comments, [
    { id: COMMENT_ID, text: "Chú thích đã được cập nhật." },
  ]);

  const reopenedResponse = await handler(makeRequest("/api/notes"));
  const reopened = await readJson(reopenedResponse);
  assert.deepEqual(reopened.notes[0].content_rich, updated.content_rich);
  assert.deepEqual(reopened.notes[0].comments, updated.comments);

  const deleteNoteResponse = await handler(
    makeRequest(`/api/notes/${NOTE_ID}`, "DELETE"),
  );
  assert.equal(deleteNoteResponse.status, 200);
  assert.deepEqual(await readJson(deleteNoteResponse), { deleted: true });

  const finalResponse = await handler(makeRequest("/api/notes"));
  assert.deepEqual(await readJson(finalResponse), { notes: [] });
});


test("tự chuyển nhóm dạng chữ của ghi chú cũ thành danh mục", async () => {
  const legacyNote = {
    id: NOTE_ID,
    title: "Ghi chú cũ",
    content: "Dữ liệu đã tạo ở phiên bản trước.",
    category: "Nhắc nhở cuộc sống",
    color: "yellow",
    is_pinned: false,
    created_at: "2026-09-08T01:00:00.000Z",
    updated_at: "2026-09-08T01:00:00.000Z",
  };
  const store = new MemoryStore([[`${TEST_NOTE_PREFIX}${NOTE_ID}`, legacyNote]]);
  const handler = createAuthenticatedHandler({
    storeFactory: () => store,
    idFactory: () => LEGACY_CATEGORY_ID,
    nowFactory: () => "2026-09-09T01:00:00.000Z",
    logger: { error() {} },
  });

  const categoriesResponse = await handler(makeRequest("/api/categories"));
  assert.equal(categoriesResponse.status, 200);
  const categories = (await readJson(categoriesResponse)).categories;
  assert.equal(categories.length, 2);
  const migratedCategory = categories.find((category) => category.name === "Nhắc nhở cuộc sống");
  assert.equal(migratedCategory.id, LEGACY_CATEGORY_ID);

  const migratedNote = await store.get(`${TEST_NOTE_PREFIX}${NOTE_ID}`);
  assert.equal(migratedNote.category_id, LEGACY_CATEGORY_ID);
  assert.equal(migratedNote.category, "Nhắc nhở cuộc sống");
});


test("từ chối dữ liệu trống, nhóm trùng và mã không hợp lệ", async () => {
  const store = new MemoryStore();
  const handler = createAuthenticatedHandler({
    storeFactory: () => store,
    idFactory: () => CATEGORY_ID,
    logger: { error() {} },
  });

  await handler(makeRequest("/api/categories"));

  const emptyCategoryResponse = await handler(
    makeRequest("/api/categories", "POST", { name: "" }),
  );
  assert.equal(emptyCategoryResponse.status, 400);

  const reservedCategoryResponse = await handler(
    makeRequest("/api/categories", "POST", { name: "Tất cả" }),
  );
  assert.equal(reservedCategoryResponse.status, 400);

  const firstCategoryResponse = await handler(
    makeRequest("/api/categories", "POST", { name: "Công việc" }),
  );
  assert.equal(firstCategoryResponse.status, 201);

  const duplicateCategoryResponse = await handler(
    makeRequest("/api/categories", "POST", { name: "  công   việc  " }),
  );
  assert.equal(duplicateCategoryResponse.status, 409);

  const emptyNoteResponse = await handler(
    makeRequest("/api/notes", "POST", { title: "", content: "" }),
  );
  assert.equal(emptyNoteResponse.status, 400);

  const invalidRichContentResponse = await handler(
    makeRequest("/api/notes", "POST", {
      title: "Định dạng lỗi",
      content_rich: [{ text: 123, color: "javascript:alert(1)" }],
    }),
  );
  assert.equal(invalidRichContentResponse.status, 400);

  const invalidCommentResponse = await handler(
    makeRequest("/api/notes", "POST", {
      title: "Chú thích lỗi",
      content_rich: [{ text: "Đoạn chữ", comment_id: "not-a-uuid" }],
      comments: [{ id: "not-a-uuid", text: "Không hợp lệ" }],
    }),
  );
  assert.equal(invalidCommentResponse.status, 400);

  const invalidNoteDateResponse = await handler(
    makeRequest("/api/notes", "POST", {
      title: "Ngày lỗi",
      note_date: "2026-02-31",
    }),
  );
  assert.equal(invalidNoteDateResponse.status, 400);

  const missingCategoryResponse = await handler(
    makeRequest("/api/notes", "POST", {
      title: "Có nội dung",
      category_id: LEGACY_CATEGORY_ID,
    }),
  );
  assert.equal(missingCategoryResponse.status, 400);

  const invalidIdResponse = await handler(
    makeRequest("/api/notes/not-valid", "DELETE"),
  );
  assert.equal(invalidIdResponse.status, 400);

  const deleteDefaultResponse = await handler(
    makeRequest(`/api/categories/${DEFAULT_CATEGORY_ID}`, "DELETE"),
  );
  assert.equal(deleteDefaultResponse.status, 409);
});


test("yêu cầu đăng nhập và tách dữ liệu giữa các tài khoản", async () => {
  const store = new MemoryStore();
  const unauthorizedHandler = createHandler({
    storeFactory: () => store,
    getUserFn: async () => null,
    logger: { error() {} },
  });
  const unauthorized = await unauthorizedHandler(makeRequest("/api/notes"));
  assert.equal(unauthorized.status, 401);

  const firstHandler = createHandler({
    storeFactory: () => store,
    getUserFn: async () => ({ id: "first-user" }),
    logger: { error() {} },
  });
  const secondHandler = createHandler({
    storeFactory: () => store,
    getUserFn: async () => ({ id: "second-user" }),
    logger: { error() {} },
  });

  await firstHandler(makeRequest("/api/categories"));
  const secondCategories = await secondHandler(makeRequest("/api/categories"));
  assert.equal(secondCategories.status, 200);
  assert.ok(store.entries.has("users/first-user/categories/00000000-0000-4000-8000-000000000001"));
  assert.ok(store.entries.has("users/second-user/categories/00000000-0000-4000-8000-000000000001"));
});


test("quản lý thùng rác, lưu trữ, thẻ tags, checklist, vân giấy, sao lưu và chia sẻ", async () => {
  const store = new MemoryStore();
  const SHARE_TOKEN = "99999999-8888-4777-8666-555555555555";
  const ids = [NOTE_ID, SHARE_TOKEN];
  const notesHandler = createAuthenticatedHandler({
    storeFactory: () => store,
    idFactory: () => ids.shift(),
    nowFactory: () => "2026-09-12T10:00:00.000Z",
    logger: { error() {} },
  });

  const createRes = await notesHandler(makeRequest("/api/notes", "POST", {
    title: "Danh sách mua sắm",
    content: "Cần mua bút chì và thước kẻ",
    checklist: [
      { text: "Bút chì 2B", done: false },
      { text: "Thước kẻ gỗ", done: true },
    ],
    tags: ["muasam", "hoc-tap"],
    paper_pattern: "lined",
    stickers: [{ type: "tape-left", x: 10, y: 5, rotation: -5 }],
    color: "pink",
    is_pinned: true,
  }));
  assert.equal(createRes.status, 201);
  const createdNote = await readJson(createRes);
  assert.equal(createdNote.id, NOTE_ID);
  assert.equal(createdNote.paper_pattern, "lined");
  assert.deepEqual(createdNote.tags, ["muasam", "hoc-tap"]);
  assert.equal(createdNote.checklist.length, 2);
  assert.equal(createdNote.checklist[0].text, "Bút chì 2B");
  assert.equal(createdNote.checklist[1].done, true);
  assert.equal(createdNote.stickers[0].type, "tape-left");

  // Lưu trữ ghi chú
  const archiveRes = await notesHandler(makeRequest(`/api/notes/${NOTE_ID}/archive`, "POST"));
  assert.equal(archiveRes.status, 200);
  const archivedNote = await readJson(archiveRes);
  assert.equal(archivedNote.is_archived, true);

  // Bỏ lưu trữ
  const unarchiveRes = await notesHandler(makeRequest(`/api/notes/${NOTE_ID}/unarchive`, "POST"));
  assert.equal(unarchiveRes.status, 200);
  assert.equal((await readJson(unarchiveRes)).is_archived, false);

  // Chia sẻ công khai
  const shareRes = await notesHandler(makeRequest(`/api/notes/${NOTE_ID}/share`, "POST"));
  assert.equal(shareRes.status, 200);
  const shareData = await readJson(shareRes);
  assert.equal(shareData.shared, true);
  const token = shareData.share_token;

  // Đọc công khai không cần đăng nhập
  const publicHandler = createHandler({
    storeFactory: () => store,
    getUserFn: async () => null,
    logger: { error() {} },
  });
  const publicRes = await publicHandler(makeRequest(`/api/share/${token}`));
  assert.equal(publicRes.status, 200);
  const publicData = await readJson(publicRes);
  assert.equal(publicData.note.title, "Danh sách mua sắm");
  assert.equal(publicData.note.paper_pattern, "lined");
  assert.equal(publicData.note.checklist.length, 2);

  // Bỏ vào thùng rác (soft delete)
  const trashRes = await notesHandler(makeRequest(`/api/notes/${NOTE_ID}/trash`, "POST"));
  assert.equal(trashRes.status, 200);
  assert.equal((await readJson(trashRes)).is_trashed, true);

  // Xem danh sách ghi chú thường (không chứa ghi chú đã chuyển thùng rác)
  const activeNotesRes = await notesHandler(makeRequest("/api/notes"));
  assert.equal((await readJson(activeNotesRes)).notes.length, 0);

  // Xem thùng rác
  const trashedNotesRes = await notesHandler(makeRequest("/api/trash"));
  assert.equal((await readJson(trashedNotesRes)).notes.length, 1);

  // Khôi phục từ thùng rác
  const restoreRes = await notesHandler(makeRequest(`/api/notes/${NOTE_ID}/restore`, "POST"));
  assert.equal(restoreRes.status, 200);
  assert.equal((await readJson(restoreRes)).is_trashed, false);

  // Sao lưu
  const backupRes = await notesHandler(makeRequest("/api/backup"));
  assert.equal(backupRes.status, 200);
  const backupData = await readJson(backupRes);
  assert.equal(backupData.notes.length, 1);

  // Xóa sạch thùng rác
  await notesHandler(makeRequest(`/api/notes/${NOTE_ID}/trash`, "POST"));
  const emptyTrashRes = await notesHandler(makeRequest("/api/trash", "DELETE"));
  assert.equal(emptyTrashRes.status, 200);
  const emptiedData = await readJson(emptyTrashRes);
  assert.equal(emptiedData.emptied, true);
  assert.equal(emptiedData.deleted_count, 1);
});
