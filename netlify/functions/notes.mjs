import { getStore } from "@netlify/blobs";
import { getSessionUser } from "./auth-core.mjs";


const COLORS = new Set(["yellow", "blue", "pink", "green", "purple"]);
const PATTERNS = new Set(["blank", "lined", "grid", "dot"]);
const STICKER_TYPES = new Set(["tape-left", "tape-right", "pin-red", "pin-blue", "star", "heart"]);
const TEXT_SIZES = new Set(["small", "normal", "large", "xlarge"]);
const TEXT_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const NOTE_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STORE_NAME = "mau-ghi-chu";
const DEFAULT_CATEGORY_ID = "00000000-0000-4000-8000-000000000001";


class ValidationError extends Error {}


function cleanTags(value) {
  if (!value || !Array.isArray(value)) return [];
  const tags = new Set();
  for (const item of value) {
    const clean = cleanText(item).toLowerCase().replace(/^#+/, "").replace(/[^a-z0-9_À-ỹ-]/gu, "");
    if (clean && clean.length <= 30) {
      tags.add(clean);
      if (tags.size >= 20) break;
    }
  }
  return [...tags];
}


function cleanChecklist(value) {
  if (!value || !Array.isArray(value)) return [];
  const items = [];
  for (const item of value.slice(0, 100)) {
    if (!item || typeof item !== "object") continue;
    const text = cleanText(item.text).slice(0, 500);
    if (!text) continue;
    items.push({
      id: ID_PATTERN.test(String(item.id || "")) ? String(item.id) : crypto.randomUUID(),
      text,
      done: item.done === true,
    });
  }
  return items;
}


function cleanStickers(value) {
  if (!value || !Array.isArray(value)) return [];
  const stickers = [];
  for (const item of value.slice(0, 10)) {
    if (!item || typeof item !== "object") continue;
    const type = String(item.type || "");
    if (!STICKER_TYPES.has(type)) continue;
    stickers.push({
      id: ID_PATTERN.test(String(item.id || "")) ? String(item.id) : crypto.randomUUID(),
      type,
      x: typeof item.x === "number" ? Math.max(0, Math.min(100, item.x)) : 0,
      y: typeof item.y === "number" ? Math.max(0, Math.min(100, item.y)) : 0,
      rotation: typeof item.rotation === "number" ? Math.max(-45, Math.min(45, item.rotation)) : 0,
    });
  }
  return stickers;
}


function cleanDoodle(value) {
  if (!value || typeof value !== "string") return null;
  const str = value.trim();
  if (str.startsWith("data:image/") && str.length <= 120_000) {
    return str;
  }
  return null;
}


function cleanPinCode(value) {
  if (!value) return null;
  const str = String(value).trim();
  if (/^\d{4,6}$/.test(str)) return str;
  return null;
}


function openStore() {
  return getStore({ name: STORE_NAME, consistency: "strong" });
}


function json(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders,
    },
  });
}


function userPrefix(userId) {
  return `users/${encodeURIComponent(userId)}/`;
}


function notePrefix(userId) {
  return `${userPrefix(userId)}notes/`;
}


function categoryPrefix(userId) {
  return `${userPrefix(userId)}categories/`;
}


function noteKey(userId, id) {
  return `${notePrefix(userId)}${id}`;
}


function categoryKey(userId, id) {
  return `${categoryPrefix(userId)}${id}`;
}


function cleanText(value) {
  return value === null || value === undefined ? "" : String(value).trim();
}


function normalizeCategoryName(value) {
  return cleanText(value).replace(/\s+/g, " ").normalize("NFC").toLocaleLowerCase("vi");
}


function ensureObject(payload, message) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ValidationError(message);
  }
}


function cleanCategory(payload) {
  ensureObject(payload, "Dữ liệu nhóm ghi chú không hợp lệ.");
  const name = cleanText(payload.name).replace(/\s+/g, " ");

  if (!name) {
    throw new ValidationError("Hãy nhập tên nhóm ghi chú.");
  }
  if (name.length > 40) {
    throw new ValidationError("Tên nhóm không được dài quá 40 ký tự.");
  }
  if (normalizeCategoryName(name) === normalizeCategoryName("Tất cả")) {
    throw new ValidationError("Tên “Tất cả” được dành riêng cho bộ lọc.");
  }

  return { name };
}


function cleanNoteDate(value) {
  const noteDate = cleanText(value);
  if (!noteDate) return "";

  const match = noteDate.match(NOTE_DATE_PATTERN);
  if (!match) throw new ValidationError("Ngày của ghi chú không hợp lệ.");

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    year < 1000
    || parsed.getUTCFullYear() !== year
    || parsed.getUTCMonth() !== month - 1
    || parsed.getUTCDate() !== day
  ) {
    throw new ValidationError("Ngày của ghi chú không hợp lệ.");
  }

  return noteDate;
}


function sameRichStyle(left, right) {
  return left.bold === right.bold
    && left.underline === right.underline
    && left.size === right.size
    && left.color === right.color
    && left.highlight === right.highlight
    && left.comment_id === right.comment_id;
}


function cleanComments(value) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > 200) {
    throw new ValidationError("Danh sách chú thích không hợp lệ.");
  }

  const comments = [];
  const ids = new Set();
  value.forEach((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new ValidationError("Chú thích không hợp lệ.");
    }
    const id = cleanText(item.id);
    const text = cleanText(item.text);
    if (!ID_PATTERN.test(id) || ids.has(id) || !text || text.length > 1_000) {
      throw new ValidationError("Chú thích không hợp lệ.");
    }
    ids.add(id);
    comments.push({ id, text });
  });
  return comments;
}


function cleanRichContent(value, fallbackContent, commentIds = new Set()) {
  if (value === undefined || value === null) {
    return fallbackContent ? [{ text: fallbackContent, size: "normal" }] : [];
  }
  if (!Array.isArray(value) || value.length > 2_000) {
    throw new ValidationError("Định dạng nội dung ghi chú không hợp lệ.");
  }

  const runs = [];
  let totalLength = 0;
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item) || typeof item.text !== "string") {
      throw new ValidationError("Định dạng nội dung ghi chú không hợp lệ.");
    }
    const text = item.text.replace(/\u200b/g, "");
    totalLength += text.length;
    if (totalLength > 20_000) {
      throw new ValidationError("Nội dung không được dài quá 20.000 ký tự.");
    }
    if (!text) continue;

    const run = {
      text,
      size: TEXT_SIZES.has(item.size) ? item.size : "normal",
    };
    if (item.bold === true) run.bold = true;
    if (item.underline === true) run.underline = true;
    if (TEXT_COLOR_PATTERN.test(String(item.color || ""))) run.color = item.color.toLowerCase();
    if (TEXT_COLOR_PATTERN.test(String(item.highlight || ""))) {
      run.highlight = item.highlight.toLowerCase();
    }
    if (ID_PATTERN.test(String(item.comment_id || "")) && commentIds.has(item.comment_id)) {
      run.comment_id = item.comment_id;
    }

    const previous = runs.at(-1);
    if (previous && sameRichStyle(previous, run)) previous.text += run.text;
    else runs.push(run);
  }

  while (runs.length && !runs[0].text) runs.shift();
  while (runs.length && !runs.at(-1).text) runs.pop();
  return runs.filter((run) => run.text);
}


function cleanNote(payload) {
  ensureObject(payload, "Dữ liệu ghi chú không hợp lệ.");

  let title = cleanText(payload.title);
  const comments = cleanComments(payload.comments);
  const commentIds = new Set(comments.map((comment) => comment.id));
  const fallbackContent = payload.content === null || payload.content === undefined
    ? ""
    : String(payload.content).replace(/\u200b/g, "");
  const contentRich = cleanRichContent(payload.content_rich, fallbackContent, commentIds);
  const content = contentRich.map((run) => run.text).join("");
  const usedCommentIds = new Set(contentRich.map((run) => run.comment_id).filter(Boolean));
  const requestedColor = cleanText(payload.color).toLowerCase();
  const color = COLORS.has(requestedColor) ? requestedColor : "yellow";

  if (!title && !content.trim()) {
    throw new ValidationError("Hãy nhập tiêu đề hoặc nội dung ghi chú.");
  }
  if (!title) title = "Ghi chú không tiêu đề";
  if (title.length > 120) {
    throw new ValidationError("Tiêu đề không được dài quá 120 ký tự.");
  }
  if (content.length > 20_000) {
    throw new ValidationError("Nội dung không được dài quá 20.000 ký tự.");
  }

  const paperPattern = PATTERNS.has(payload.paper_pattern) ? payload.paper_pattern : "blank";
  const tags = cleanTags(payload.tags);
  const checklist = cleanChecklist(payload.checklist);
  const stickers = cleanStickers(payload.stickers);
  const doodle = cleanDoodle(payload.doodle);
  const isArchived = payload.is_archived === true;
  const isTrashed = payload.is_trashed === true;
  const trashedAt = isTrashed ? (payload.trashed_at ? String(payload.trashed_at) : new Date().toISOString()) : null;
  const isLocked = payload.is_locked === true;
  const pinCode = cleanPinCode(payload.pin_code);
  const shareToken = payload.share_token && ID_PATTERN.test(String(payload.share_token)) ? String(payload.share_token) : null;

  return {
    title,
    content,
    content_rich: contentRich,
    comments: comments.filter((comment) => usedCommentIds.has(comment.id)),
    note_date: cleanNoteDate(payload.note_date),
    category_id: cleanText(payload.category_id),
    legacy_category: cleanText(payload.category),
    color,
    is_pinned: payload.is_pinned === true,
    paper_pattern: paperPattern,
    tags,
    checklist,
    stickers,
    doodle,
    is_archived: isArchived,
    is_trashed: isTrashed,
    trashed_at: trashedAt,
    is_locked: isLocked,
    pin_code: pinCode,
    share_token: shareToken,
  };
}


async function parseBody(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new ValidationError("Yêu cầu phải sử dụng dữ liệu JSON.");
  }

  const rawBody = await request.text();
  if (!rawBody || new TextEncoder().encode(rawBody).byteLength > 1_000_000) {
    throw new ValidationError("Dữ liệu gửi lên trống hoặc quá lớn.");
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new ValidationError("Dữ liệu JSON không hợp lệ.");
  }
}


async function listRecords(store, prefix) {
  const { blobs } = await store.list({ prefix });
  const records = await Promise.all(
    blobs.map(({ key }) => store.get(key, { type: "json", consistency: "strong" })),
  );
  return records.filter((record) => record && typeof record === "object");
}


function sortNotes(notes) {
  return notes.sort((left, right) => {
    const pinDifference = Number(right.is_pinned) - Number(left.is_pinned);
    if (pinDifference !== 0) return pinDifference;
    return String(right.updated_at || "").localeCompare(String(left.updated_at || ""));
  });
}


function sortCategories(categories) {
  return categories.sort((left, right) => {
    const defaultDifference = Number(right.is_default) - Number(left.is_default);
    if (defaultDifference !== 0) return defaultDifference;
    return left.name.localeCompare(right.name, "vi");
  });
}


async function createCategoryRecord({
  store,
  userId,
  name,
  idFactory,
  nowFactory,
  isDefault = false,
  preferredId = null,
}) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const id = preferredId || idFactory();
    if (!ID_PATTERN.test(id)) {
      throw new Error("Trình tạo mã nhóm trả về giá trị không hợp lệ.");
    }

    const now = nowFactory();
    const category = {
      id,
      name,
      is_default: isDefault,
      created_at: now,
      updated_at: now,
    };
    const result = await store.setJSON(categoryKey(userId, id), category, { onlyIfNew: true });
    if (result?.modified !== false) return category;

    if (preferredId) {
      const existing = await store.get(categoryKey(userId, id), { type: "json", consistency: "strong" });
      if (existing) return existing;
      break;
    }
  }

  throw new Error("Không thể tạo mã nhóm ghi chú mới.");
}


async function ensureCategoryCatalog(store, userId, idFactory, nowFactory) {
  const [storedCategories, storedNotes] = await Promise.all([
    listRecords(store, categoryPrefix(userId)),
    listRecords(store, notePrefix(userId)),
  ]);
  const categories = storedCategories.filter(
    (category) => ID_PATTERN.test(String(category.id || "")) && cleanText(category.name),
  );
  const notes = storedNotes.filter((note) => ID_PATTERN.test(String(note.id || "")));

  let defaultCategory = categories.find((category) => category.is_default === true);
  if (!defaultCategory) {
    const existingCommon = categories.find(
      (category) => normalizeCategoryName(category.name) === normalizeCategoryName("Chung"),
    );

    if (existingCommon) {
      defaultCategory = { ...existingCommon, is_default: true, updated_at: nowFactory() };
      await store.setJSON(categoryKey(userId, defaultCategory.id), defaultCategory);
      categories[categories.findIndex((category) => category.id === defaultCategory.id)] = defaultCategory;
    } else {
      defaultCategory = await createCategoryRecord({
        store,
        userId,
        name: "Chung",
        idFactory,
        nowFactory,
        isDefault: true,
        preferredId: DEFAULT_CATEGORY_ID,
      });
      categories.push(defaultCategory);
    }
  }

  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const categoriesByName = new Map(
    categories.map((category) => [normalizeCategoryName(category.name), category]),
  );

  for (let index = 0; index < notes.length; index += 1) {
    const note = notes[index];
    let category = categoriesById.get(cleanText(note.category_id));

    if (!category) {
      let legacyName = cleanText(note.category) || defaultCategory.name;
      if (normalizeCategoryName(legacyName) === normalizeCategoryName("Tất cả")) {
        legacyName = defaultCategory.name;
      }
      category = categoriesByName.get(normalizeCategoryName(legacyName));

      if (!category) {
        category = await createCategoryRecord({
          store,
          userId,
          name: legacyName,
          idFactory,
          nowFactory,
        });
        categories.push(category);
        categoriesById.set(category.id, category);
        categoriesByName.set(normalizeCategoryName(category.name), category);
      }
    }

    if (note.category_id !== category.id || note.category !== category.name) {
      const migratedNote = { ...note, category_id: category.id, category: category.name };
      await store.setJSON(noteKey(userId, note.id), migratedNote);
      notes[index] = migratedNote;
    }
  }

  return {
    categories: sortCategories(categories),
    notes,
    defaultCategory,
  };
}


function resolveNoteCategory(input, catalog) {
  if (input.category_id) {
    if (!ID_PATTERN.test(input.category_id)) {
      throw new ValidationError("Mã nhóm ghi chú không hợp lệ.");
    }
    const category = catalog.categories.find((item) => item.id === input.category_id);
    if (!category) {
      throw new ValidationError("Nhóm ghi chú đã chọn không còn tồn tại.");
    }
    return category;
  }

  if (input.legacy_category) {
    const category = catalog.categories.find(
      (item) => normalizeCategoryName(item.name) === normalizeCategoryName(input.legacy_category),
    );
    if (category) return category;
    throw new ValidationError("Hãy chọn một nhóm ghi chú đã được tạo.");
  }

  return catalog.defaultCategory;
}


function parseRoute(request) {
  const segments = new URL(request.url).pathname.split("/").filter(Boolean);
  if (segments[0] !== "api" || segments.length < 2 || segments.length > 4) return null;
  const resource = segments[1];
  if (!["notes", "categories", "trash", "backup", "restore", "share"].includes(resource)) return null;

  if (resource === "trash") return { resource: "trash", id: null };
  if (resource === "backup") return { resource: "backup", id: null };
  if (resource === "restore") return { resource: "restore", id: null };
  if (resource === "share") return { resource: "share", id: segments[2] || null };
  if (resource === "categories") return { resource: "categories", id: segments[2] || null };
  if (resource === "notes") {
    return { resource: "notes", id: segments[2] || null, subAction: segments[3] || null };
  }
  return null;
}


export function createHandler({
  storeFactory = openStore,
  getUserFn = getSessionUser,
  idFactory = () => crypto.randomUUID(),
  nowFactory = () => new Date().toISOString(),
  logger = console,
} = {}) {
  return async function handler(request) {
    const route = parseRoute(request);
    if (!route) return json({ error: "Đường dẫn không tồn tại." }, 404);

    const { resource, id, subAction } = route;
    const method = request.method.toUpperCase();

    if (id && !ID_PATTERN.test(id)) {
      return json(
        { error: resource === "notes" ? "Mã ghi chú không hợp lệ." : "Mã không hợp lệ." },
        400,
      );
    }

    try {
      const store = storeFactory();

      if (resource === "share" && method === "GET" && id) {
        const lookup = await store.get(`share/tokens/${id}`, { type: "json", consistency: "strong" });
        if (!lookup?.user_id || !lookup?.note_id) {
          return json({ error: "Liên kết chia sẻ không tồn tại hoặc đã hết hạn." }, 404);
        }
        const note = await store.get(noteKey(lookup.user_id, lookup.note_id), { type: "json", consistency: "strong" });
        if (!note || note.is_trashed) {
          return json({ error: "Ghi chú này không còn khả dụng." }, 404);
        }
        return json({
          note: {
            title: note.title,
            content: note.content,
            content_rich: note.content_rich,
            note_date: note.note_date,
            color: note.color,
            category: note.category,
            paper_pattern: note.paper_pattern || "blank",
            stickers: note.stickers || [],
            doodle: note.doodle || null,
            checklist: note.checklist || [],
            updated_at: note.updated_at,
          },
        });
      }

      const user = await getUserFn(request, store, nowFactory());
      if (!user?.id) {
        return json({ error: "Bạn cần đăng nhập để xem và chỉnh sửa ghi chú." }, 401);
      }
      const userId = String(user.id);

      if (resource === "trash") {
        if (method === "DELETE") {
          const catalog = await ensureCategoryCatalog(store, userId, idFactory, nowFactory);
          const trashedNotes = catalog.notes.filter((note) => note.is_trashed === true);
          await Promise.all(
            trashedNotes.map(async (note) => {
              if (note.share_token) await store.delete(`share/tokens/${note.share_token}`);
              await store.delete(noteKey(userId, note.id));
            }),
          );
          return json({ emptied: true, deleted_count: trashedNotes.length });
        }
        if (method === "GET") {
          const catalog = await ensureCategoryCatalog(store, userId, idFactory, nowFactory);
          return json({ notes: sortNotes(catalog.notes.filter((note) => note.is_trashed === true)) });
        }
        return json({ error: "Phương thức không được hỗ trợ." }, 405);
      }

      if (resource === "backup" && method === "GET") {
        const catalog = await ensureCategoryCatalog(store, userId, idFactory, nowFactory);
        return json({
          version: "2.7.0",
          exported_at: nowFactory(),
          categories: catalog.categories,
          notes: catalog.notes,
        });
      }

      if (resource === "restore" && method === "POST") {
        const body = await parseBody(request);
        ensureObject(body, "Dữ liệu sao lưu không hợp lệ.");
        const importedCategories = Array.isArray(body.categories) ? body.categories : [];
        const importedNotes = Array.isArray(body.notes) ? body.notes : [];

        for (const cat of importedCategories) {
          if (cat && typeof cat === "object" && ID_PATTERN.test(String(cat.id || "")) && cleanText(cat.name)) {
            await store.setJSON(categoryKey(userId, cat.id), {
              id: cat.id,
              name: cleanText(cat.name),
              is_default: cat.is_default === true,
              created_at: cat.created_at || nowFactory(),
              updated_at: nowFactory(),
            });
          }
        }

        for (const rawNote of importedNotes) {
          if (rawNote && typeof rawNote === "object") {
            try {
              const cleaned = cleanNote(rawNote);
              const noteId = ID_PATTERN.test(String(rawNote.id || "")) ? rawNote.id : idFactory();
              await store.setJSON(noteKey(userId, noteId), {
                ...cleaned,
                id: noteId,
                created_at: rawNote.created_at || nowFactory(),
                updated_at: nowFactory(),
              });
            } catch {}
          }
        }

        const refreshed = await ensureCategoryCatalog(store, userId, idFactory, nowFactory);
        return json({
          success: true,
          categories_count: refreshed.categories.length,
          notes_count: refreshed.notes.length,
        });
      }

      if (resource === "categories") {
        if (method === "GET" && !id) {
          const catalog = await ensureCategoryCatalog(store, userId, idFactory, nowFactory);
          return json({ categories: catalog.categories });
        }

        if (method === "POST" && !id) {
          const input = cleanCategory(await parseBody(request));
          const catalog = await ensureCategoryCatalog(store, userId, idFactory, nowFactory);
          const duplicate = catalog.categories.some(
            (category) => normalizeCategoryName(category.name) === normalizeCategoryName(input.name),
          );
          if (duplicate) return json({ error: "Tên nhóm này đã tồn tại." }, 409);

          const category = await createCategoryRecord({
            store,
            userId,
            name: input.name,
            idFactory,
            nowFactory,
          });
          return json(category, 201);
        }

        if (method === "PUT" && id) {
          const existing = await store.get(categoryKey(userId, id), { type: "json", consistency: "strong" });
          if (!existing) return json({ error: "Nhóm ghi chú không còn tồn tại." }, 404);

          const input = cleanCategory(await parseBody(request));
          const catalog = await ensureCategoryCatalog(store, userId, idFactory, nowFactory);
          const duplicate = catalog.categories.some(
            (category) => category.id !== id &&
              normalizeCategoryName(category.name) === normalizeCategoryName(input.name),
          );
          if (duplicate) return json({ error: "Tên nhóm này đã tồn tại." }, 409);

          const category = { ...existing, name: input.name, updated_at: nowFactory() };
          await store.setJSON(categoryKey(userId, id), category);

          const affectedNotes = catalog.notes.filter((note) => note.category_id === id);
          await Promise.all(affectedNotes.map((note) => store.setJSON(noteKey(userId, note.id), {
            ...note,
            category_id: id,
            category: category.name,
          })));

          return json({ category, updated_notes: affectedNotes.length });
        }

        if (method === "DELETE" && id) {
          const catalog = await ensureCategoryCatalog(store, userId, idFactory, nowFactory);
          const existing = catalog.categories.find((category) => category.id === id);
          if (!existing) return json({ error: "Nhóm ghi chú không còn tồn tại." }, 404);
          if (existing.is_default) {
            return json({ error: "Nhóm mặc định không thể xóa." }, 409);
          }

          const affectedNotes = catalog.notes.filter((note) => note.category_id === id);
          await Promise.all(affectedNotes.map((note) => store.setJSON(noteKey(userId, note.id), {
            ...note,
            category_id: catalog.defaultCategory.id,
            category: catalog.defaultCategory.name,
          })));
          await store.delete(categoryKey(userId, id));

          return json({
            deleted: true,
            moved_notes: affectedNotes.length,
            fallback_category: catalog.defaultCategory,
          });
        }

        return json(
          { error: "Phương thức không được hỗ trợ." },
          405,
          { Allow: "GET, POST, PUT, DELETE" },
        );
      }

      if (resource === "notes" && id && subAction) {
        const existing = await store.get(noteKey(userId, id), { type: "json", consistency: "strong" });
        if (!existing) return json({ error: "Ghi chú không còn tồn tại." }, 404);

        if (subAction === "archive") {
          existing.is_archived = true;
          existing.updated_at = nowFactory();
          await store.setJSON(noteKey(userId, id), existing);
          return json(existing);
        }
        if (subAction === "unarchive") {
          existing.is_archived = false;
          existing.updated_at = nowFactory();
          await store.setJSON(noteKey(userId, id), existing);
          return json(existing);
        }
        if (subAction === "trash") {
          existing.is_trashed = true;
          existing.trashed_at = nowFactory();
          existing.updated_at = nowFactory();
          await store.setJSON(noteKey(userId, id), existing);
          return json(existing);
        }
        if (subAction === "restore") {
          existing.is_trashed = false;
          existing.trashed_at = null;
          existing.updated_at = nowFactory();
          await store.setJSON(noteKey(userId, id), existing);
          return json(existing);
        }
        if (subAction === "share") {
          const body = await parseBody(request).catch(() => ({}));
          if (body?.unshare === true) {
            if (existing.share_token) {
              await store.delete(`share/tokens/${existing.share_token}`);
            }
            existing.share_token = null;
            existing.updated_at = nowFactory();
            await store.setJSON(noteKey(userId, id), existing);
            return json({ shared: false });
          }

          const token = existing.share_token || idFactory();
          existing.share_token = token;
          existing.updated_at = nowFactory();
          await store.setJSON(noteKey(userId, id), existing);
          await store.setJSON(`share/tokens/${token}`, { user_id: userId, note_id: id });
          return json({ shared: true, share_token: token });
        }

        return json({ error: "Thao tác không được hỗ trợ." }, 404);
      }

      if (method === "GET" && !id) {
        const catalog = await ensureCategoryCatalog(store, userId, idFactory, nowFactory);
        const url = new URL(request.url);
        const showTrashed = url.searchParams.get("trashed") === "true";
        const showAll = url.searchParams.get("all") === "true";

        let notesList = catalog.notes;
        if (!showAll) {
          if (showTrashed) {
            notesList = notesList.filter((note) => note.is_trashed === true);
          } else {
            notesList = notesList.filter((note) => note.is_trashed !== true);
          }
        }
        return json({ notes: sortNotes(notesList) });
      }

      if (method === "POST" && !id) {
        const input = cleanNote(await parseBody(request));
        const catalog = await ensureCategoryCatalog(store, userId, idFactory, nowFactory);
        const category = resolveNoteCategory(input, catalog);
        const noteId = idFactory();
        if (!ID_PATTERN.test(noteId)) throw new Error("Trình tạo mã ghi chú trả về giá trị không hợp lệ.");

        const now = nowFactory();
        const note = {
          id: noteId,
          title: input.title,
          content: input.content,
          content_rich: input.content_rich,
          comments: input.comments,
          note_date: input.note_date,
          category_id: category.id,
          category: category.name,
          color: input.color,
          is_pinned: input.is_pinned,
          paper_pattern: input.paper_pattern,
          tags: input.tags,
          checklist: input.checklist,
          stickers: input.stickers,
          doodle: input.doodle,
          is_archived: input.is_archived,
          is_trashed: input.is_trashed,
          trashed_at: input.trashed_at,
          is_locked: input.is_locked,
          pin_code: input.pin_code,
          share_token: input.share_token,
          created_at: now,
          updated_at: now,
        };
        const result = await store.setJSON(noteKey(userId, noteId), note, { onlyIfNew: true });
        if (result?.modified === false) {
          return json({ error: "Không thể tạo mã ghi chú mới. Hãy thử lại." }, 409);
        }
        return json(note, 201);
      }

      if (method === "PUT" && id) {
        const existing = await store.get(noteKey(userId, id), { type: "json", consistency: "strong" });
        if (!existing) return json({ error: "Ghi chú không còn tồn tại." }, 404);

        const input = cleanNote(await parseBody(request));
        const catalog = await ensureCategoryCatalog(store, userId, idFactory, nowFactory);
        const category = resolveNoteCategory(input, catalog);
        const note = {
          ...existing,
          id,
          title: input.title,
          content: input.content,
          content_rich: input.content_rich,
          comments: input.comments,
          note_date: input.note_date,
          category_id: category.id,
          category: category.name,
          color: input.color,
          is_pinned: input.is_pinned,
          paper_pattern: input.paper_pattern,
          tags: input.tags,
          checklist: input.checklist,
          stickers: input.stickers,
          doodle: input.doodle,
          is_archived: input.is_archived,
          is_trashed: input.is_trashed,
          trashed_at: input.trashed_at,
          is_locked: input.is_locked,
          pin_code: input.pin_code,
          share_token: input.share_token,
          created_at: existing.created_at,
          updated_at: nowFactory(),
        };
        await store.setJSON(noteKey(userId, id), note);
        return json(note);
      }

      if (method === "DELETE" && id) {
        const existing = await store.get(noteKey(userId, id), { type: "json", consistency: "strong" });
        if (!existing) return json({ error: "Ghi chú không còn tồn tại." }, 404);
        if (existing.share_token) {
          await store.delete(`share/tokens/${existing.share_token}`);
        }
        await store.delete(noteKey(userId, id));
        return json({ deleted: true });
      }

      return json(
        { error: "Phương thức không được hỗ trợ." },
        405,
        { Allow: "GET, POST, PUT, DELETE" },
      );
    } catch (error) {
      if (error instanceof ValidationError) {
        return json({ error: error.message }, 400);
      }

      logger.error("Notes function failed", error);
      return json(
        { error: "Kho dữ liệu đang tạm thời không khả dụng. Dữ liệu trên màn hình vẫn được giữ; hãy thử lại." },
        500,
      );
    }
  };
}


export default createHandler();


export const config = {
  path: [
    "/api/notes",
    "/api/notes/:id",
    "/api/notes/:id/:action",
    "/api/categories",
    "/api/categories/:id",
    "/api/trash",
    "/api/backup",
    "/api/restore",
    "/api/share/:token",
  ],
};
