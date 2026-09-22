import {
  authenticateCredentials,
  AuthenticationError,
  changePassword,
  clearSessionCookie,
  ConflictError,
  createSession,
  createUser,
  deleteSession,
  getSessionUser,
  newSessionToken,
  openStore,
  resetPasswordWithRecoveryKey,
  sessionCookie,
  validateCredentials,
  ValidationError,
  verifySameOrigin,
} from "./auth-core.mjs";


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


async function parseCredentials(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new ValidationError("Yêu cầu phải sử dụng dữ liệu JSON.");
  }
  const rawBody = await request.text();
  if (!rawBody || new TextEncoder().encode(rawBody).byteLength > 20_000) {
    throw new ValidationError("Dữ liệu đăng nhập trống hoặc quá lớn.");
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    throw new ValidationError("Dữ liệu JSON không hợp lệ.");
  }
  return validateCredentials(payload?.username, payload?.password);
}


async function parseJsonBody(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new ValidationError("Yêu cầu phải sử dụng dữ liệu JSON.");
  }
  const rawBody = await request.text();
  if (!rawBody || new TextEncoder().encode(rawBody).byteLength > 20_000) {
    throw new ValidationError("Dữ liệu trống hoặc quá lớn.");
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new ValidationError("Dữ liệu JSON không hợp lệ.");
  }
}


export function createAuthHandler({
  storeFactory = openStore,
  idFactory = () => crypto.randomUUID(),
  tokenFactory = newSessionToken,
  nowFactory = () => new Date().toISOString(),
  verifyOriginFn = verifySameOrigin,
  logger = console,
} = {}) {
  return async function handler(request) {
    const action = new URL(request.url).pathname.split("/").filter(Boolean).at(-1);
    const method = request.method.toUpperCase();

    try {
      const store = storeFactory();
      if (action === "session" && method === "GET") {
        return json({ user: await getSessionUser(request, store, nowFactory()) });
      }
      if (method !== "POST" || !["login", "signup", "logout", "change-password", "reset-password"].includes(action)) {
        return json({ error: "Đường dẫn hoặc phương thức không được hỗ trợ." }, 404);
      }

      verifyOriginFn(request);
      if (action === "logout") {
        await deleteSession(request, store);
        return json({ logged_out: true }, 200, { "Set-Cookie": clearSessionCookie(request) });
      }

      if (action === "change-password") {
        const currentUser = await getSessionUser(request, store, nowFactory());
        if (!currentUser?.id) {
          return json({ error: "Bạn cần đăng nhập để đổi mật khẩu." }, 401);
        }
        const body = await parseJsonBody(request);
        const currentPassword = String(body?.current_password || "");
        const newPassword = String(body?.new_password || "");
        if (!currentPassword) {
          throw new ValidationError("Hãy nhập mật khẩu hiện tại.");
        }
        if (newPassword.length < 8 || newPassword.length > 128) {
          throw new ValidationError("Mật khẩu mới phải có từ 8 đến 128 ký tự.");
        }
        await changePassword({
          store,
          userId: currentUser.id,
          currentPassword,
          newPassword,
          now: nowFactory(),
        });
        return json({ success: true, message: "Đã đổi mật khẩu thành công." });
      }

      if (action === "reset-password") {
        const body = await parseJsonBody(request);
        const username = String(body?.username || "").trim();
        const recoveryKey = String(body?.recovery_key || "").trim();
        const newPassword = String(body?.new_password || "");
        if (!username || !recoveryKey) {
          throw new ValidationError("Hãy nhập tên tài khoản và mã khôi phục.");
        }
        if (newPassword.length < 8 || newPassword.length > 128) {
          throw new ValidationError("Mật khẩu mới phải có từ 8 đến 128 ký tự.");
        }
        const user = await resetPasswordWithRecoveryKey({
          store,
          username,
          recoveryKey,
          newPassword,
          now: nowFactory(),
        });
        const token = tokenFactory();
        await createSession({ store, user, token, now: nowFactory() });
        return json({ user, message: "Đặt lại mật khẩu thành công." }, 200, {
          "Set-Cookie": sessionCookie(request, token),
        });
      }

      const credentials = await parseCredentials(request);
      const now = nowFactory();
      const user = action === "signup"
        ? await createUser({
            store,
            username: credentials.username,
            normalizedUsername: credentials.normalizedUsername,
            password: credentials.password,
            id: idFactory(),
            now,
          })
        : await authenticateCredentials(store, credentials.normalizedUsername, credentials.password);
      const token = tokenFactory();
      if (!/^[0-9a-f]{64}$/i.test(token)) throw new Error("Mã phiên đăng nhập không hợp lệ.");
      await createSession({ store, user, token, now });

      const responsePayload = { user: { id: user.id, username: user.username } };
      if (action === "signup" && user.recovery_key) {
        responsePayload.recovery_key = user.recovery_key;
      }

      return json(
        responsePayload,
        action === "signup" ? 201 : 200,
        { "Set-Cookie": sessionCookie(request, token) },
      );
    } catch (error) {
      if (error instanceof ValidationError) return json({ error: error.message }, 400);
      if (error instanceof ConflictError) return json({ error: error.message }, 409);
      if (error instanceof AuthenticationError) return json({ error: error.message }, 401);
      logger.error?.("Authentication request failed", { action, error });
      return json({ error: "Dịch vụ đăng nhập tạm thời không khả dụng. Hãy thử lại sau." }, 500);
    }
  };
}


export default createAuthHandler();


export const config = {
  path: [
    "/api/auth/session",
    "/api/auth/login",
    "/api/auth/signup",
    "/api/auth/logout",
    "/api/auth/change-password",
    "/api/auth/reset-password",
  ],
};
