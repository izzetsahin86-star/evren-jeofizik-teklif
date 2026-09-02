const crypto = require("node:crypto");

const OWNER = "izzetsahin86-star";
const REPO = "evren-jeofizik-teklif";
const DATA_BRANCH = "sync-data";
const DATA_PATH = "sync/state.enc.json";
const COOKIE_NAME = "evren_sync_session";
const MAX_STATE_BYTES = 8 * 1024 * 1024;

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

function parseCookies(req) {
  const result = {};
  String(req.headers.cookie || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const index = part.indexOf("=");
      if (index <= 0) return;
      result[part.slice(0, index)] = part.slice(index + 1);
    });
  return result;
}

function signSession(expiresAt, token) {
  return crypto
    .createHmac("sha256", token)
    .update(`evren-sync-session:${expiresAt}`)
    .digest("base64url");
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
  return crypto
    .createHash("sha256")
    .update("evren-jeofizik-sync-state-v1\0", "utf8")
    .update(token, "utf8")
    .digest();
}

function encryptState(state, revision, token) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(token), iv);
  cipher.setAAD(Buffer.from(`${OWNER}/${REPO}:${DATA_BRANCH}:${DATA_PATH}:v1`, "utf8"));
  const plaintext = Buffer.from(JSON.stringify(state), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    schema: 1,
    initialized: true,
    revision,
    updatedAt: new Date().toISOString(),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    ciphertext: ciphertext.toString("base64")
  };
}

function decryptState(envelope, token) {
  if (!envelope?.initialized) return null;
  if (!envelope.iv || !envelope.tag || !envelope.ciphertext) throw new Error("encrypted_state_incomplete");
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    encryptionKey(token),
    Buffer.from(envelope.iv, "base64")
  );
  decipher.setAAD(Buffer.from(`${OWNER}/${REPO}:${DATA_BRANCH}:${DATA_PATH}:v1`, "utf8"));
  decipher.setAuthTag(Buffer.from(envelope.tag, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(envelope.ciphertext, "base64")),
    decipher.final()
  ]);
  return JSON.parse(plaintext.toString("utf8"));
}

function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}

function validateState(state) {
  if (!state || typeof state !== "object" || Array.isArray(state)) return false;
  if (!Array.isArray(state.quotes)) return false;
  if (!Array.isArray(state.customers)) return false;
  if (!Array.isArray(state.companies)) return false;
  if (!Array.isArray(state.services)) return false;
  if (!state.settings || typeof state.settings !== "object") return false;
  const bytes = Buffer.byteLength(JSON.stringify(state), "utf8");
  return bytes > 0 && bytes <= MAX_STATE_BYTES;
}

function githubHeaders(token) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "evren-jeofizik-sync",
    "X-GitHub-Api-Version": "2022-11-28"
  };
}

async function readBlobContent(token, sha) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/git/blobs/${encodeURIComponent(sha)}`;
  const response = await fetch(url, { headers: githubHeaders(token), cache: "no-store" });
  if (!response.ok) {
    const text = await response.text();
    const error = new Error(`github_blob_read_failed_${response.status}`);
    error.status = response.status;
    error.detail = text.slice(0, 400);
    throw error;
  }
  const payload = await response.json();
  return String(payload.content || "").replace(/\n/g, "");
}

async function readEnvelope(token) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${DATA_PATH}?ref=${encodeURIComponent(DATA_BRANCH)}`;
  const response = await fetch(url, { headers: githubHeaders(token), cache: "no-store" });
  if (response.status === 404) {
    return {
      sha: null,
      envelope: { schema: 1, initialized: false, revision: 0, updatedAt: null, iv: null, tag: null, ciphertext: null }
    };
  }
  if (!response.ok) {
    const text = await response.text();
    const error = new Error(`github_read_failed_${response.status}`);
    error.status = response.status;
    error.detail = text.slice(0, 400);
    throw error;
  }
  const payload = await response.json();
  if (!payload.sha) throw new Error("github_state_sha_missing");
  let encoded = String(payload.content || "").replace(/\n/g, "");
  if (!encoded) encoded = await readBlobContent(token, payload.sha);
  if (!encoded) throw new Error("github_state_content_missing");
  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  const envelope = JSON.parse(decoded);
  return { sha: payload.sha, envelope };
}

async function writeEnvelope(token, sha, envelope) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${DATA_PATH}`;
  const body = {
    message: `sync: revision ${Number(envelope.revision || 0)}`,
    content: Buffer.from(`${JSON.stringify(envelope, null, 2)}\n`, "utf8").toString("base64"),
    branch: DATA_BRANCH
  };
  if (sha) body.sha = sha;

  const response = await fetch(url, {
    method: "PUT",
    headers: githubHeaders(token),
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const text = await response.text();
    const error = new Error(`github_write_failed_${response.status}`);
    error.status = response.status;
    error.detail = text.slice(0, 400);
    throw error;
  }
  return response.json();
}

async function latestPayload(token) {
  const { envelope } = await readEnvelope(token);
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
  if (!token) {
    return json(res, 503, {
      ok: false,
      error: "setup_required",
      message: "Merkezi senkron için GITHUB_SYNC_TOKEN Vercel ortam değişkeni gerekli."
    });
  }

  if (!hasValidSession(req, token)) {
    return json(res, 401, { ok: false, error: "sync_session_required" });
  }

  try {
    if (req.method === "GET") {
      const latest = await latestPayload(token);
      return json(res, 200, { ok: true, ...latest });
    }

    if (req.method !== "PUT" && req.method !== "POST") {
      res.setHeader("Allow", "GET, PUT, POST");
      return json(res, 405, { ok: false, error: "method_not_allowed" });
    }

    const body = parseBody(req);
    const state = body.state;
    if (!validateState(state)) {
      return json(res, 400, { ok: false, error: "invalid_or_oversized_state" });
    }

    const current = await readEnvelope(token);
    const currentRevision = Number(current.envelope?.revision || 0);
    const initialized = Boolean(current.envelope?.initialized);

    if (!initialized) {
      if (!body.initialize) {
        return json(res, 409, { ok: false, error: "not_initialized", initialized: false, revision: currentRevision });
      }
      if (body.source !== "mobile") {
        return json(res, 409, {
          ok: false,
          error: "mobile_master_required",
          initialized: false,
          revision: currentRevision
        });
      }
    } else {
      const baseRevision = Number(body.baseRevision);
      if (!Number.isFinite(baseRevision) || baseRevision !== currentRevision) {
        const latest = {
          initialized: true,
          revision: currentRevision,
          updatedAt: current.envelope.updatedAt || null,
          state: decryptState(current.envelope, token)
        };
        return json(res, 409, { ok: false, error: "revision_conflict", ...latest });
      }
    }

    const nextRevision = currentRevision + 1;
    const envelope = encryptState(state, nextRevision, token);

    try {
      await writeEnvelope(token, current.sha, envelope);
    } catch (error) {
      if (error?.status === 409 || error?.status === 422) {
        const latest = await latestPayload(token);
        return json(res, 409, { ok: false, error: "revision_conflict", ...latest });
      }
      throw error;
    }

    return json(res, 200, {
      ok: true,
      initialized: true,
      revision: nextRevision,
      updatedAt: envelope.updatedAt
    });
  } catch (error) {
    console.error("Evren merkezi senkron hatası:", error?.message || error);
    const code = String(error?.message || "");
    if (code.includes("Unsupported state") || code.includes("authenticate") || code.includes("bad decrypt")) {
      return json(res, 500, { ok: false, error: "state_decryption_failed" });
    }
    if (error?.status === 401 || error?.status === 403) {
      return json(res, 503, { ok: false, error: "github_token_permission_denied" });
    }
    return json(res, 500, { ok: false, error: "sync_server_error" });
  }
};
