import { access, readFile } from "node:fs/promises";


const requiredFiles = [
  "static/index.html",
  "static/styles.css",
  "static/app.js",
  "static/favicon.png",
  "netlify/functions/auth-core.mjs",
  "netlify/functions/auth.mjs",
  "netlify/functions/notes.mjs",
];

const fontFiles = [
  "static/assets/fonts/nunito-latin-wght-normal.woff2",
  "static/assets/fonts/nunito-vietnamese-wght-normal.woff2",
  "static/assets/fonts/mali-latin-400-normal.woff2",
  "static/assets/fonts/mali-vietnamese-400-normal.woff2",
  "static/assets/fonts/mali-latin-600-normal.woff2",
  "static/assets/fonts/mali-vietnamese-600-normal.woff2",
  "static/assets/fonts/mali-latin-700-normal.woff2",
  "static/assets/fonts/mali-vietnamese-700-normal.woff2",
];

await Promise.all([...requiredFiles, ...fontFiles].map((file) => access(file)));

const [html, app, api] = await Promise.all([
  readFile("static/index.html", "utf8"),
  readFile("static/app.js", "utf8"),
  readFile("netlify/functions/notes.mjs", "utf8"),
]);
for (const reference of ["/styles.css", "/app.js"]) {
  if (!html.includes(reference)) {
    throw new Error(`Thiếu tài nguyên ${reference} trong static/index.html`);
  }
}

if (!html.includes('/favicon.png')) {
  throw new Error("Trang chưa khai báo favicon.");
}

const referencedIds = [...app.matchAll(/querySelector\("#([^"\s]+)"\)/g)].map((match) => match[1]);
for (const id of referencedIds) {
  if (!html.includes(`id="${id}"`)) {
    throw new Error(`Giao diện thiếu phần tử #${id} mà app.js đang sử dụng.`);
  }
}

const allIds = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = [...new Set(allIds.filter((id, index) => allIds.indexOf(id) !== index))];
if (duplicateIds.length > 0) {
  throw new Error(`Giao diện có id bị lặp: ${duplicateIds.join(", ")}`);
}

for (const route of ["/api/notes", "/api/categories"]) {
  if (!api.includes(route)) {
    throw new Error(`API thiếu đường dẫn ${route}.`);
  }
}

const css = await readFile("static/styles.css", "utf8");
for (const fontFile of fontFiles) {
  const publicPath = `/${fontFile.replace("static/", "")}`;
  if (!css.includes(publicPath)) {
    throw new Error(`Font chưa được khai báo trong CSS: ${publicPath}`);
  }
}

if (!css.includes("scrollbar-gutter: stable")) {
  throw new Error("Cửa sổ ghi chú chưa chừa khoảng riêng cho thanh cuộn.");
}


for (const feature of ["expandNoteButton", "note-reading-panel", "reading-panel-in"]) {
  if (!html.includes(feature) && !css.includes(feature)) {
    throw new Error(`Thiếu thành phần panel đọc ghi chú: ${feature}`);
  }
}

for (const authFeature of ["authForm", "logoutButton", "/api/auth/session"]) {
  if (!html.includes(authFeature) && !app.includes(authFeature)) {
    throw new Error(`Thiếu thành phần đăng nhập: ${authFeature}`);
  }
}

for (const richTextFeature of ["noteFormatToolbar", "noteFontSize", "noteHighlightColor", "applyTextColorButton", "applyHighlightButton", "clearNoteFormat"]) {
  if (!html.includes(richTextFeature) && !app.includes(richTextFeature)) {
    throw new Error(`Thiếu công cụ định dạng ghi chú: ${richTextFeature}`);
  }
}

for (const dateFeature of ["noteDate", "readingPanelDate", "note_date"]) {
  if (!html.includes(dateFeature) && !app.includes(dateFeature) && !api.includes(dateFeature)) {
    throw new Error(`Thiếu thành phần ngày của ghi chú: ${dateFeature}`);
  }
}

for (const commentFeature of ["addCommentButton", "commentComposer", "commentPopover", "comment_id", "comments"]) {
  if (!html.includes(commentFeature) && !app.includes(commentFeature) && !api.includes(commentFeature)) {
    throw new Error(`Thiếu thành phần chú thích: ${commentFeature}`);
  }
}

console.log("Cấu trúc triển khai Netlify hợp lệ.");
