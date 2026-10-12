import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

test("kiểm tra 8 mẫu xuất ảnh ghi chú đa dạng trong HTML và JS", async () => {
  const html = await fs.readFile("static/index.html", "utf8");
  const js = await fs.readFile("static/app.js", "utf8");

  const expectedTemplates = [
    "card",
    "journal",
    "polaroid",
    "scrapbook",
    "minimal",
    "postcard",
    "chalkboard",
    "checklist",
  ];

  // 1. Kiểm tra HTML có đủ 8 radio inputs cho các mẫu
  for (const tpl of expectedTemplates) {
    const radioPattern = new RegExp(`name="exportTemplate"\\s+value="${tpl}"`, "i");
    assert.match(
      html,
      radioPattern,
      `static/index.html phải có radio option cho template: ${tpl}`
    );
  }

  // 2. Kiểm tra JS xử lý đủ cả 8 mẫu trong drawNoteExportCanvas
  for (const tpl of expectedTemplates) {
    assert.ok(
      js.includes(`template === "${tpl}"`),
      `static/app.js phải xử lý vẽ canvas cho template: ${tpl}`
    );
  }

  // 3. Đảm bảo các phần tử cốt lõi của dialog xuất ảnh đều tồn tại
  assert.ok(html.includes('id="exportDialog"'));
  assert.ok(html.includes('id="exportPreviewCanvas"'));
  assert.ok(html.includes('id="confirmExportBtn"'));
  assert.ok(html.includes('id="cancelExportBtn"'));
});
