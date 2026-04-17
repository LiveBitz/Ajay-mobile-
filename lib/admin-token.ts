/**
 * Admin session token — HMAC-SHA256 signed, expiry-checked.
 * Uses Web Crypto API so it runs in both Edge (middleware) and Node.js (server actions).
 *
 * Token format: <timestamp>.<nonce>.<hex-signature>
 *   - timestamp : ms since epoch (for expiry check)
 *   - nonce     : random UUID (prevents replay)
 *   - signature : HMAC-SHA256(timestamp.nonce, ADMIN_TOKEN_SECRET)
 */

const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function hexToUint8Array(hex: string): Uint8Array<ArrayBuffer> {
  const buf = new ArrayBuffer(hex.length % 2 !== 0 ? 0 : hex.length / 2);
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function uint8ArrayToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getHmacKey(usage: KeyUsage[]): Promise<CryptoKey> {
  const secret = process.env.ADMIN_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_TOKEN_SECRET must be set and at least 32 characters. " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usage
  );
}

/** Generate a signed admin session token. Call on successful passcode verification. */
export async function generateAdminToken(): Promise<string> {
  const key = await getHmacKey(["sign"]);
  const timestamp = Date.now().toString();
  const nonce = crypto.randomUUID();
  const payload = `${timestamp}.${nonce}`;
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${uint8ArrayToHex(sigBuf)}`;
}

/**
 * Verify a token from the admin_access cookie.
 * Returns true only if the signature is valid AND the token has not expired.
 */
export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    if (!token) return false;

    // Split off the trailing hex signature (64 hex chars = 32 bytes)
    const lastDot = token.lastIndexOf(".");
    if (lastDot === -1) return false;

    const payload = token.substring(0, lastDot);
    const sigHex = token.substring(lastDot + 1);
    if (!payload || sigHex.length !== 64) return false;

    // Expiry check — timestamp is the first segment
    const timestamp = parseInt(payload.split(".")[0], 10);
    if (isNaN(timestamp) || Date.now() - timestamp > EXPIRY_MS) return false;

    // Constant-time HMAC verification
    const key = await getHmacKey(["verify"]);
    return await crypto.subtle.verify(
      "HMAC",
      key,
      hexToUint8Array(sigHex),
      new TextEncoder().encode(payload)
    );
  } catch {
    return false;
  }
}
