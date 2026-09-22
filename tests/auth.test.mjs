import assert from "node:assert/strict";
import test from "node:test";

import { createAuthHandler } from "../netlify/functions/auth.mjs";


const USER_ID = "123e4567-e89b-42d3-a456-426614174000";
const FIRST_TOKEN = "a".repeat(64);
const SECOND_TOKEN = "b".repeat(64);


class MemoryStore {
  constructor() {
    this.entries = new Map();
  }

  async get(key) {
    const value = this.entries.get(key);
    return value === undefined ? null : structuredClone(value);
  }

  async setJSON(key, value, options = {}) {
    if (options.onlyIfNew && this.entries.has(key)) return { modified: false };
    this.entries.set(key, structuredClone(value));
    return { modified: true };
  }

  async delete(key) {
    this.entries.delete(key);
  }
}


function makeRequest(path, method = "GET", payload, cookie = "") {
  const headers = {};
  if (payload !== undefined) {
    headers["Content-Type"] = "application/json";
    headers.Origin = "https://example.netlify.app";
  }
  if (cookie) headers.Cookie = cookie;
  return new Request(`https://example.netlify.app${path}`, {
    method,
    headers,
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
}


async function readJson(response) {
  return JSON.parse(await response.text());
}


test("tạo tài khoản, đăng nhập, xem phiên và đăng xuất", async () => {
  const store = new MemoryStore();
  const tokens = [FIRST_TOKEN, SECOND_TOKEN];
  const handler = createAuthHandler({
    storeFactory: () => store,
    idFactory: () => USER_ID,
    tokenFactory: () => tokens.shift(),
    nowFactory: () => "2026-09-10T01:00:00.000Z",
    logger: { error() {} },
  });

  const signup = await handler(makeRequest("/api/auth/signup", "POST", {
    username: "Minh.Nguyen",
    password: "mat-khau-an-toan",
  }));
  assert.equal(signup.status, 201);
  assert.deepEqual((await readJson(signup)).user, { id: USER_ID, username: "Minh.Nguyen" });
  assert.match(signup.headers.get("set-cookie"), /mau_session=a{64}/);

  const storedUser = [...store.entries.entries()].find(([key]) => key.startsWith("auth/users/"))[1];
  assert.notEqual(storedUser.password_hash, "mat-khau-an-toan");
  assert.equal(storedUser.password, undefined);

  const session = await handler(makeRequest(
    "/api/auth/session",
    "GET",
    undefined,
    `mau_session=${FIRST_TOKEN}`,
  ));
  assert.deepEqual((await readJson(session)).user, { id: USER_ID, username: "Minh.Nguyen" });

  const login = await handler(makeRequest("/api/auth/login", "POST", {
    username: "minh.nguyen",
    password: "mat-khau-an-toan",
  }));
  assert.equal(login.status, 200);
  assert.match(login.headers.get("set-cookie"), /mau_session=b{64}/);

  const logout = await handler(makeRequest(
    "/api/auth/logout",
    "POST",
    {},
    `mau_session=${SECOND_TOKEN}`,
  ));
  assert.equal(logout.status, 200);
  assert.match(logout.headers.get("set-cookie"), /Max-Age=0/);
});


test("từ chối tài khoản trùng và thông tin đăng nhập sai", async () => {
  const store = new MemoryStore();
  const handler = createAuthHandler({
    storeFactory: () => store,
    idFactory: () => USER_ID,
    tokenFactory: () => FIRST_TOKEN,
    logger: { error() {} },
  });

  await handler(makeRequest("/api/auth/signup", "POST", {
    username: "TaiKhoan",
    password: "mat-khau-an-toan",
  }));
  const duplicate = await handler(makeRequest("/api/auth/signup", "POST", {
    username: "taikhoan",
    password: "mat-khau-khac",
  }));
  assert.equal(duplicate.status, 409);

  const badLogin = await handler(makeRequest("/api/auth/login", "POST", {
    username: "TaiKhoan",
    password: "mat-khau-sai",
  }));
  assert.equal(badLogin.status, 401);

  const invalidUsername = await handler(makeRequest("/api/auth/signup", "POST", {
    username: "a b",
    password: "mat-khau-an-toan",
  }));
  assert.equal(invalidUsername.status, 400);
});


test("đổi mật khẩu và khôi phục mật khẩu bằng mã dự phòng", async () => {
  const store = new MemoryStore();
  const tokens = ["1".repeat(64), "2".repeat(64), "3".repeat(64), "4".repeat(64)];
  const handler = createAuthHandler({
    storeFactory: () => store,
    idFactory: () => USER_ID,
    tokenFactory: () => tokens.shift(),
    nowFactory: () => "2026-09-10T01:00:00.000Z",
    logger: { error() {} },
  });

  const signup = await handler(makeRequest("/api/auth/signup", "POST", {
    username: "NguoiDungMoi",
    password: "mat-khau-ban-dau",
  }));
  assert.equal(signup.status, 201);
  const signupBody = await readJson(signup);
  assert.ok(signupBody.recovery_key);
  const recoveryKey = signupBody.recovery_key;

  // Đổi mật khẩu
  const change = await handler(makeRequest(
    "/api/auth/change-password",
    "POST",
    { current_password: "mat-khau-ban-dau", new_password: "mat-khau-da-doi" },
    `mau_session=${"1".repeat(64)}`,
  ));
  assert.equal(change.status, 200);

  // Đăng nhập bằng mật khẩu mới
  const loginNew = await handler(makeRequest("/api/auth/login", "POST", {
    username: "nguoidungmoi",
    password: "mat-khau-da-doi",
  }));
  assert.equal(loginNew.status, 200);

  // Đặt lại mật khẩu bằng recovery key
  const reset = await handler(makeRequest("/api/auth/reset-password", "POST", {
    username: "nguoidungmoi",
    recovery_key: recoveryKey,
    new_password: "mat-khau-sau-reset",
  }));
  assert.equal(reset.status, 200);

  // Đăng nhập bằng mật khẩu sau reset
  const loginReset = await handler(makeRequest("/api/auth/login", "POST", {
    username: "nguoidungmoi",
    password: "mat-khau-sau-reset",
  }));
  assert.equal(loginReset.status, 200);
});
