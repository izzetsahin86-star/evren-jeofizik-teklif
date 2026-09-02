const crypto = require("node:crypto");

const PASSWORD_HASH = "01972c9696c0048d238b6c77df3c2999d4dd227f0d6b12271e4044f1e51b92e4";
const COOKIE_NAME = "evren_sync_session";
const SESSION_SECONDS = 60 * 60 * 12;

function syncToken() {
  return String(process.env.GITHUB_SYNC_TOKEN || "").trim();
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.end(JSON.stringify(body));
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

function passwordDigest(password) {
  return crypto.createHash("sha256").update(String(password || ""), "utf8").digest("hex");
}

function safeEqualHex(a, b) {
  try {
    const left = Buffer.from(String(a), "hex");
    const right = Buffer.from(String(b), "hex");
    return left.length === right.length && crypto.timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

function signSession(expiresAt, token) {
  return crypto
    .createHmac("sha256", token)
    .update(`evren-sync-session:${expiresAt}`)
    .digest("base64url");
}

function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}

module.exports = async function handler(req, res) {
  if (!sameOrigin(req)) return json(res, 403, { ok: false, error: "origin_denied" });

  const token = syncToken();
  if (!token) {
    return json(res, 503, {
      ok: false,
      error: "setup_required",
      message: "Merkezi senkron için GITHUB_SYNC_TOKEN Vercel ortam değişkeni gerekli."
    });
  }

  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
    return json(res, 200, { ok: true });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, DELETE");
    return json(res, 405, { ok: false, error: "method_not_allowed" });
  }

  const body = parseBody(req);
  const digest = passwordDigest(body.password);
  if (!safeEqualHex(digest, PASSWORD_HASH)) {
    return json(res, 401, { ok: false, error: "invalid_credentials" });
  }

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const signature = signSession(expiresAt, token);
  const value = `${expiresAt}.${signature}`;
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`
  );
  return json(res, 200, { ok: true, expiresAt });
};
