import { getStore } from "@netlify/blobs";
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";


const STORE_NAME = "mau-ghi-chu";
const USERNAME_PREFIX = "auth/usernames/";
const USER_PREFIX = "auth/users/";
const SESSION_PREFIX = "auth/sessions/";
const SESSION_COOKIE = "mau_session";
const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1_000;
const scrypt = promisify(scryptCallback);


export class ValidationError extends Error {}
export class ConflictError extends Error {}
export class AuthenticationError extends Error {}


export function openStore() {
  return getStore({ name: STORE_NAME, consistency: "strong" });
}


export function normalizeUsername(value) {
  return String(value || "").trim().normalize("NFKC").toLocaleLowerCase("vi");
}


function usernameLookupKey(username) {
  const digest = createHash("sha256").update(normalizeUsername(username)).digest("hex");
  return `${USERNAME_PREFIX}${digest}`;
}


function userKey(id) {
  return `${USER_PREFIX}${id}`;
}


function sessionKey(token) {
  const digest = createHash("sha256").update(token).digest("hex");
  return `${SESSION_PREFIX}${digest}`;
}


export function validateCredentials(usernameValue, passwordValue) {
  const username = String(usernameValue || "").trim().normalize("NFKC");
  const normalizedUsername = normalizeUsername(username);
  const password = String(passwordValue || "");
  const usernameLength = Array.from(username).length;

  if (usernameLength < 3 || usernameLength > 32) {
    throw new ValidationError("Tên tài khoản phải có từ 3 đến 32 ký tự.");
  }
  if (!/^[\p{L}\p{N}._-]+$/u.test(username)) {
    throw new ValidationError("Tên tài khoản chỉ được dùng chữ, số, dấu chấm, gạch ngang hoặc gạch dưới.");
  }
  if (password.length < 8 || password.length > 128) {
    throw new ValidationError("Mật khẩu phải có từ 8 đến 128 ký tự.");
  }

  return { username, normalizedUsername, password };
}


async function hashPassword(password, salt) {
  const derived = await scrypt(password, salt, 64);
  return Buffer.from(derived).toString("hex");
}


export function generateRecoveryKey() {
  const bytes = randomBytes(8).toString("hex").toUpperCase();
  return `MGC-${bytes.slice(0, 4)}-${bytes.slice(4, 8)}-${bytes.slice(8, 12)}-${bytes.slice(12, 16)}`;
}


function normalizeRecoveryKey(key) {
  return String(key || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}


export async function createUser({ store, username, normalizedUsername, password, id, now }) {
  const lookupKey = usernameLookupKey(normalizedUsername);
  const existing = await store.get(lookupKey, { type: "json", consistency: "strong" });
  if (existing) throw new ConflictError("Tên tài khoản này đã được sử dụng.");

  const salt = randomBytes(16).toString("hex");
  const recoveryKey = generateRecoveryKey();
  const recoverySalt = randomBytes(16).toString("hex");
  const user = {
    id,
    username,
    normalized_username: normalizedUsername,
    password_hash: await hashPassword(password, salt),
    password_salt: salt,
    recovery_key_hash: await hashPassword(normalizeRecoveryKey(recoveryKey), recoverySalt),
    recovery_key_salt: recoverySalt,
    created_at: now,
  };
  const reserved = await store.setJSON(lookupKey, { user_id: id }, { onlyIfNew: true });
  if (reserved?.modified === false) throw new ConflictError("Tên tài khoản này đã được sử dụng.");

  try {
    const result = await store.setJSON(userKey(id), user, { onlyIfNew: true });
    if (result?.modified === false) throw new Error("Không thể tạo mã tài khoản mới.");
  } catch (error) {
    await store.delete(lookupKey);
    throw error;
  }
  return { id: user.id, username: user.username, recovery_key: recoveryKey };
}


export async function changePassword({ store, userId, currentPassword, newPassword, now }) {
  const user = await store.get(userKey(userId), { type: "json", consistency: "strong" });
  if (!user?.password_hash || !user?.password_salt) {
    throw new AuthenticationError("Tài khoản không tồn tại.");
  }

  const candidate = Buffer.from(await hashPassword(currentPassword, user.password_salt), "hex");
  const expected = Buffer.from(user.password_hash, "hex");
  if (candidate.length !== expected.length || !timingSafeEqual(candidate, expected)) {
    throw new AuthenticationError("Mật khẩu hiện tại không chính xác.");
  }

  const newSalt = randomBytes(16).toString("hex");
  user.password_hash = await hashPassword(newPassword, newSalt);
  user.password_salt = newSalt;
  user.updated_at = now;
  await store.setJSON(userKey(userId), user);
  return { success: true };
}


export async function resetPasswordWithRecoveryKey({ store, username, recoveryKey, newPassword, now }) {
  const normalized = normalizeUsername(username);
  const lookup = await store.get(usernameLookupKey(normalized), { type: "json", consistency: "strong" });
  if (!lookup?.user_id) throw new AuthenticationError("Tên tài khoản hoặc mã khôi phục không đúng.");

  const user = await store.get(userKey(lookup.user_id), { type: "json", consistency: "strong" });
  if (!user?.recovery_key_hash || !user?.recovery_key_salt) {
    throw new AuthenticationError("Tài khoản chưa có mã khôi phục.");
  }

  const normalizedKey = normalizeRecoveryKey(recoveryKey);
  const candidate = Buffer.from(await hashPassword(normalizedKey, user.recovery_key_salt), "hex");
  const expected = Buffer.from(user.recovery_key_hash, "hex");
  if (candidate.length !== expected.length || !timingSafeEqual(candidate, expected)) {
    throw new AuthenticationError("Tên tài khoản hoặc mã khôi phục không đúng.");
  }

  const newSalt = randomBytes(16).toString("hex");
  user.password_hash = await hashPassword(newPassword, newSalt);
  user.password_salt = newSalt;
  user.updated_at = now;
  await store.setJSON(userKey(user.id), user);
  return { id: user.id, username: user.username };
}


export async function authenticateCredentials(store, username, password) {
  const lookup = await store.get(usernameLookupKey(username), {
    type: "json",
    consistency: "strong",
  });
  if (!lookup?.user_id) throw new AuthenticationError("Tên tài khoản hoặc mật khẩu không đúng.");

  const user = await store.get(userKey(lookup.user_id), { type: "json", consistency: "strong" });
  if (!user?.password_hash || !user?.password_salt) {
    throw new AuthenticationError("Tên tài khoản hoặc mật khẩu không đúng.");
  }

  const candidate = Buffer.from(await hashPassword(password, user.password_salt), "hex");
  const expected = Buffer.from(user.password_hash, "hex");
  if (candidate.length !== expected.length || !timingSafeEqual(candidate, expected)) {
    throw new AuthenticationError("Tên tài khoản hoặc mật khẩu không đúng.");
  }
  return { id: user.id, username: user.username };
}


export async function createSession({ store, user, token, now }) {
  const expiresAt = new Date(new Date(now).getTime() + SESSION_LIFETIME_MS).toISOString();
  const result = await store.setJSON(sessionKey(token), {
    user_id: user.id,
    created_at: now,
    expires_at: expiresAt,
  }, { onlyIfNew: true });
  if (result?.modified === false) throw new Error("Không thể tạo phiên đăng nhập mới.");
}


function cookieValue(request, name) {
  const cookies = request.headers.get("cookie") || "";
  for (const part of cookies.split(";")) {
    const [cookieName, ...valueParts] = part.trim().split("=");
    if (cookieName === name) return valueParts.join("=");
  }
  return "";
}


export function sessionTokenFromRequest(request) {
  return cookieValue(request, SESSION_COOKIE);
}


export async function getSessionUser(request, store = openStore(), now = new Date().toISOString()) {
  const token = sessionTokenFromRequest(request);
  if (!/^[0-9a-f]{64}$/i.test(token)) return null;

  const key = sessionKey(token);
  const session = await store.get(key, { type: "json", consistency: "strong" });
  if (!session?.user_id) return null;
  if (!session.expires_at || session.expires_at <= now) {
    await store.delete(key);
    return null;
  }

  const user = await store.get(userKey(session.user_id), { type: "json", consistency: "strong" });
  return user?.id ? { id: user.id, username: user.username } : null;
}


export async function deleteSession(request, store = openStore()) {
  const token = sessionTokenFromRequest(request);
  if (/^[0-9a-f]{64}$/i.test(token)) await store.delete(sessionKey(token));
}


export function newSessionToken() {
  return randomBytes(32).toString("hex");
}


export function sessionCookie(request, token) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_LIFETIME_MS / 1_000}${secure}`;
}


export function clearSessionCookie(request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}


export function verifySameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    throw new AuthenticationError("Yêu cầu đăng nhập không hợp lệ. Hãy tải lại trang và thử lại.");
  }
}
