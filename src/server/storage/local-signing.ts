import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_EXPIRES_SECONDS = 3600;

function getSigningSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters");
  }
  return secret;
}

function signPayload(payload: string): string {
  return createHmac("sha256", getSigningSecret()).update(payload).digest("hex");
}

export function createLocalDownloadSignature(
  key: string,
  expiresAtMs: number
): string {
  return signPayload(`${key}:${expiresAtMs}`);
}

export function verifyLocalDownloadSignature(
  key: string,
  expiresAtMs: number,
  signature: string
): boolean {
  if (!signature || Date.now() > expiresAtMs) return false;
  const expected = createLocalDownloadSignature(key, expiresAtMs);
  try {
    return timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

export function buildLocalSignedDownloadUrl(
  key: string,
  expiresInSeconds: number = DEFAULT_EXPIRES_SECONDS
): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  const expiresAtMs = Date.now() + expiresInSeconds * 1000;
  const signature = createLocalDownloadSignature(key, expiresAtMs);
  const params = new URLSearchParams({
    key,
    expires: String(expiresAtMs),
    sig: signature,
  });
  return `${base}/api/v1/storage/local?${params.toString()}`;
}
