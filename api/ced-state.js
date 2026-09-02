const crypto = require("node:crypto");

const OWNER = "izzetsahin86-star";
const REPO = "evren-jeofizik-teklif";
const DATA_BRANCH = "sync-data";
const DATA_PATH = "sync/ced-state.enc.json";
const COOKIE_NAME = "evren_sync_session";
const MAX_STATE_BYTES = 4 * 1024 * 1024;

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
  try { return new URL(origin).host === req.headers.host; } catch { return false; }
}

function parseCookies(req) {
  const result = {};
  String(req.headers.cookie || "").split(";").map((part) => part.trim()).filter(Boolean).forEach((part) => {
    const index = part.indexOf("=");
    if (index > 0) result[part.slice(0, index)] = part.slice(index + 1);
  });
  return result;
}

function signSession(expiresAt, token) {
  return crypto.createHmac("sha256", token).update(`evren-sync-session:${expiresAt}`).digest("base64url");
}

function safeEqualText(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function hasValidSession(req, token) {
  const value = parseCookies(req)[COOKIE_NAME];
  if (!value) return false;
  const dot = value.indexOf(".");
  if (dot <= 0) return false;
  const expiresAt = Number(value.slice(0, dot));
  const signature = value.slice(dot + 1);
  if (!Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return false;
  return safeEqualText(signature, signSession(expiresAt, token));
}

function encryptionKey(token) {
  return crypto.createHash("sha256").update("evren-jeofizik-ced-sync-v1\0", "utf8").update(token, "utf8").digest();
}

function encryptState(state, revision, token) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(token), iv);
  cipher.setAAD(Buffer.from(`${OWNER}/${REPO}:${DATA_BRANCH}:${DATA_PATH}:v1`, "utf8"));
  const ciphertext = Buffer.concat([cipher.update(Buffer.from(JSON.stringify(state), "utf8")), cipher.final()]);
  return {
    schema: 1,
    initialized: true,
    revision,
    updatedAt: new Date().toISOString(),
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    ciphertext: ciphertext.toString("base64")
  };
}

function decryptState(envelope, token) {
  if (!envelope?.initialized) return null;
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(token), Buffer.from(envelope.iv, "base64"));
  decipher.setAAD(Buffer.from(`${OWNER}/${REPO}:${DATA_BRANCH}:${DATA_PATH}:v1`, "utf8"));
  decipher.setAuthTag(Buffer.from(envelope.tag, "base64"));
  return JSON.parse(Buffer.concat([
    decipher.update(Buffer.from(envelope.ciphertext, "base64")),
    decipher.final()
  ]).toString("utf8"));
}

function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}

function validateState(state) {
  if (!Array.isArray(state)) return false;
  if (state.some((item) => !item || typeof item !== "object" || Array.isArray(item))) return false;
  const bytes = Buffer.byteLength(JSON.stringify(state), "utf8");
  return bytes <= MAX_STATE_BYTES;
}

function githubHeaders(token) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "evren-jeofizik-ced-sync",
    "X-GitHub-Api-Version": "2022-11-28"
  };
}

async function readEnvelope(token) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${DATA_PATH}?ref=${encodeURIComponent(DATA_BRANCH)}`;
  const response = await fetch(url, { headers: githubHeaders(token), cache: "no-store" });
  if (response.status === 404) {
    return { sha: null, envelope: { schema: 1, initialized: false, revision: 0, updatedAt: null } };
  }
  if (!response.ok) {
    const error = new Error(`github_read_failed_${response.status}`);
    error.status = response.status;
    throw error;
  }
  const payload = await response.json();
  const decoded = Buffer.from(String(payload.content || "").replace(/\n/g, ""), "base64").toString("utf8");
  return { sha: payload.sha || null, envelope: JSON.parse(decoded) };
}

async function writeEnvelope(token, sha, envelope) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${DATA_PATH}`;
  const body = {
    message: `ced sync: revision ${Number(envelope.revision || 0)}`,
    content: Buffer.from(`${JSON.stringify(envelope, null, 2)}\n`, "utf8").toString("base64"),
    branch: DATA_BRANCH
  };
  if (sha) body.sha = sha;
  const response = await fetch(url, { method: "PUT", headers: githubHeaders(token), body: JSON.stringify(body) });
  if (!response.ok) {
    const error = new Error(`github_write_failed_${response.status}`);
    error.status = response.status;
    throw error;
  }
}

function payloadFrom(envelope, token) {
  if (!envelope?.initialized) {
    return { initialized: false, revision: Number(envelope?.revision || 0), updatedAt: envelope?.updatedAt || null, state: null };
  }
  return {
    initialized: true,
    revision: Number(envelope.revision || 0),
    updatedAt: envelope.updatedAt || null,
    state: decryptState(envelope, token)
  };
}

module.exports = async function handler(req, res) {
  if (!sameOrigin(req)) return json(res, 403, { ok: false, error: "origin_denied" });
  const token = syncToken();
  if (!token) return json(res, 503, { ok: false, error: "setup_required" });
  if (!hasValidSession(req, token)) return json(res, 401, { ok: false, error: "sync_session_required" });

  try {
    const current = await readEnvelope(token);
    if (req.method === "GET") return json(res, 200, { ok: true, ...payloadFrom(current.envelope, token) });
    if (req.method !== "PUT" && req.method !== "POST") {
      res.setHeader("Allow", "GET, PUT, POST");
      return json(res, 405, { ok: false, error: "method_not_allowed" });
    }

    const body = parseBody(req);
    if (!validateState(body.state)) return json(res, 400, { ok: false, error: "invalid_or_oversized_state" });

    const currentRevision = Number(current.envelope?.revision || 0);
    const initialized = Boolean(current.envelope?.initialized);
    if (initialized) {
      const baseRevision = Number(body.baseRevision);
      if (!Number.isFinite(baseRevision) || baseRevision !== currentRevision) {
        return json(res, 409, { ok: false, error: "revision_conflict", ...payloadFrom(current.envelope, token) });
      }
    } else if (!body.initialize) {
      return json(res, 409, { ok: false, error: "not_initialized", initialized: false, revision: currentRevision });
    }

    const nextRevision = currentRevision + 1;
    const envelope = encryptState(body.state, nextRevision, token);
    try {
      await writeEnvelope(token, current.sha, envelope);
    } catch (error) {
      if (error?.status === 409 || error?.status === 422) {
        const latest = await readEnvelope(token);
        return json(res, 409, { ok: false, error: "revision_conflict", ...payloadFrom(latest.envelope, token) });
      }
      throw error;
    }

    return json(res, 200, { ok: true, initialized: true, revision: nextRevision, updatedAt: envelope.updatedAt });
  } catch (error) {
    console.error("ÇED merkezi senkron hatası:", error?.message || error);
    if (error?.status === 401 || error?.status === 403) return json(res, 503, { ok: false, error: "github_token_permission_denied" });
    return json(res, 500, { ok: false, error: "sync_server_error" });
  }
};
