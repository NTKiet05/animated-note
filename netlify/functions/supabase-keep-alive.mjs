/**
 * Netlify Scheduled Function: Duy trì Supabase (Keep-Alive)
 * Chạy tự động mỗi ngày (@daily vào 00:00 UTC) để gửi request tới Supabase REST API,
 * ngăn chặn dự án Supabase gói Free bị tạm ngưng (pause) do không có hoạt động trong 7 ngày.
 */

export async function pingSupabase({
  supabaseUrl = process.env.SUPABASE_URL,
  supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
  pingUrl = process.env.SUPABASE_PING_URL,
  tableName = process.env.SUPABASE_TABLE,
  pingPath = process.env.SUPABASE_PING_PATH,
  fetchFn = globalThis.fetch,
  logger = console,
} = {}) {
  const timestamp = new Date().toISOString();

  // 1. Xác định URL đích
  let targetUrl = "";
  if (pingUrl && typeof pingUrl === "string" && pingUrl.trim()) {
    targetUrl = pingUrl.trim();
  } else if (supabaseUrl && typeof supabaseUrl === "string" && supabaseUrl.trim()) {
    const cleanBase = supabaseUrl.trim().replace(/\/+$/, "");
    if (tableName && typeof tableName === "string" && tableName.trim()) {
      targetUrl = `${cleanBase}/rest/v1/${encodeURIComponent(tableName.trim())}?select=id&limit=1`;
    } else if (pingPath && typeof pingPath === "string" && pingPath.trim()) {
      const cleanPath = pingPath.trim().startsWith("/") ? pingPath.trim() : `/${pingPath.trim()}`;
      targetUrl = `${cleanBase}${cleanPath}`;
    } else {
      // Endpoint REST API gốc kết nối trực tiếp PostgREST & Postgres
      targetUrl = `${cleanBase}/rest/v1/`;
    }
  } else {
    const message = "Chưa cấu hình biến môi trường SUPABASE_URL (hoặc SUPABASE_PING_URL) trên Netlify.";
    logger.warn?.(`[Supabase Keep-Alive] ${message}`);
    return {
      ok: false,
      skipped: true,
      status: "missing_config",
      message,
      help: "Vào Netlify Dashboard > Site configuration > Environment variables và thêm SUPABASE_URL cùng SUPABASE_ANON_KEY.",
      timestamp,
    };
  }

  // 2. Thiết lập Headers xác thực với Supabase
  const headers = {
    Accept: "application/json",
    "User-Agent": "Netlify-Supabase-KeepAlive/1.0",
  };
  if (supabaseKey && typeof supabaseKey === "string" && supabaseKey.trim()) {
    const key = supabaseKey.trim();
    headers["apikey"] = key;
    headers["Authorization"] = `Bearer ${key}`;
  }

  // 3. Thực hiện gửi ping
  const startTime = Date.now();
  try {
    const response = await fetchFn(targetUrl, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(15000), // Timeout 15 giây
    });
    const durationMs = Date.now() - startTime;

    let preview = null;
    try {
      const text = await response.text();
      if (text) {
        preview = text.length > 200 ? text.slice(0, 200) + "..." : text;
      }
    } catch {
      // Bỏ qua nếu không đọc được body
    }

    const result = {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      target: targetUrl,
      durationMs,
      timestamp: new Date().toISOString(),
      preview,
    };

    logger.log?.(
      `[Supabase Keep-Alive] Ping thành công tới ${targetUrl} — HTTP ${response.status} (${durationMs}ms)`
    );

    return result;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logger.error?.(`[Supabase Keep-Alive] Lỗi kết nối tới ${targetUrl}:`, error.message);
    return {
      ok: false,
      status: "network_error",
      error: error.message,
      target: targetUrl,
      durationMs,
      timestamp: new Date().toISOString(),
    };
  }
}

// Netlify Functions v2 handler
export default async function handler(req) {
  const result = await pingSupabase();
  return new Response(JSON.stringify(result, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Netlify-Scheduled": "true",
    },
  });
}

// Netlify Functions v1 fallback handler
export const scheduledHandler = async function (event, context) {
  const result = await pingSupabase();
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(result, null, 2),
  };
};

// Cấu hình chạy định kỳ mỗi ngày lúc 00:00 UTC
export const config = {
  schedule: "@daily",
};
