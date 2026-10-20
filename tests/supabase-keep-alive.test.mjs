import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { pingSupabase, config } from "../netlify/functions/supabase-keep-alive.mjs";

test("supabase keep-alive: báo thiếu biến môi trường nếu chưa cấu hình SUPABASE_URL", async () => {
  const result = await pingSupabase({
    supabaseUrl: undefined,
    pingUrl: undefined,
    logger: { warn: () => {} },
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, "missing_config");
  assert.equal(result.skipped, true);
  assert.ok(result.message.includes("SUPABASE_URL"));
});

test("supabase keep-alive: gửi đúng URL và headers khi có SUPABASE_URL và SUPABASE_ANON_KEY", async () => {
  let capturedUrl = "";
  let capturedOptions = {};

  const mockFetch = async (url, options) => {
    capturedUrl = url;
    capturedOptions = options;
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => JSON.stringify({ version: "1.0" }),
    };
  };

  const result = await pingSupabase({
    supabaseUrl: "https://myproject.supabase.co",
    supabaseKey: "test-anon-key-12345",
    fetchFn: mockFetch,
    logger: { log: () => {} },
  });

  assert.equal(result.ok, true);
  assert.equal(result.status, 200);
  assert.equal(capturedUrl, "https://myproject.supabase.co/rest/v1/");
  assert.equal(capturedOptions.headers.apikey, "test-anon-key-12345");
  assert.equal(capturedOptions.headers.Authorization, "Bearer test-anon-key-12345");
});

test("supabase keep-alive: truy vấn bảng khi có SUPABASE_TABLE", async () => {
  let capturedUrl = "";

  const mockFetch = async (url) => {
    capturedUrl = url;
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => "[]",
    };
  };

  const result = await pingSupabase({
    supabaseUrl: "https://myproject.supabase.co/",
    supabaseKey: "key-xyz",
    tableName: "notes",
    fetchFn: mockFetch,
    logger: { log: () => {} },
  });

  assert.equal(result.ok, true);
  assert.equal(capturedUrl, "https://myproject.supabase.co/rest/v1/notes?select=id&limit=1");
});

test("supabase keep-alive: ưu tiên SUPABASE_PING_URL khi có", async () => {
  let capturedUrl = "";

  const mockFetch = async (url) => {
    capturedUrl = url;
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => "OK",
    };
  };

  const result = await pingSupabase({
    pingUrl: "https://myproject.supabase.co/auth/v1/health",
    fetchFn: mockFetch,
    logger: { log: () => {} },
  });

  assert.equal(result.ok, true);
  assert.equal(capturedUrl, "https://myproject.supabase.co/auth/v1/health");
});

test("supabase keep-alive: bắt lỗi mạng an toàn", async () => {
  const mockFetch = async () => {
    throw new Error("getaddrinfo ENOTFOUND myproject.supabase.co");
  };

  const result = await pingSupabase({
    supabaseUrl: "https://myproject.supabase.co",
    fetchFn: mockFetch,
    logger: { error: () => {} },
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, "network_error");
  assert.ok(result.error.includes("ENOTFOUND"));
});

test("supabase keep-alive: cấu hình lịch chạy @daily và khai báo trong netlify.toml", async () => {
  assert.equal(config.schedule, "@daily");

  const netlifyToml = await fs.readFile("netlify.toml", "utf8");
  assert.ok(
    netlifyToml.includes('[functions."supabase-keep-alive"]'),
    "netlify.toml phải có cấu hình [functions.\"supabase-keep-alive\"]"
  );
  assert.ok(
    netlifyToml.includes('schedule = "@daily"'),
    "netlify.toml phải có lịch chạy schedule = \"@daily\""
  );
});
