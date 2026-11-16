import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV !== "production") return "local-development-secret-not-for-production-use";
  throw new Error("AUTH_SECRET is missing or too short. Add it in Vercel → Settings → Environment Variables.");
}

const key = (purpose: string) => createHash("sha256").update(`${purpose}:${secret()}`).digest();

/* Passwords: scrypt with a random salt per user. */

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

function scryptAsync(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password.normalize("NFKC"), salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p }, (err, out) =>
      err ? reject(err) : resolve(out),
    ),
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt);
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltB64, hashB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64url");
  const actual = await scryptAsync(password, Buffer.from(saltB64, "base64url"));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/* Signed tokens (session cookie). */

export function sign(payload: object): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = createHmac("sha256", key("session")).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function verifySigned<T>(token: string | undefined): T | null {
  if (!token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = createHmac("sha256", key("session")).update(body).digest();
  const given = Buffer.from(mac, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

/* Encryption at rest for the user list (AES-256-GCM). */

export function encrypt(plain: string): Buffer {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key("users-file"), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return Buffer.concat([Buffer.from("BH1"), iv, cipher.getAuthTag(), data]);
}

export function decrypt(buf: Buffer): string {
  if (buf.subarray(0, 3).toString() !== "BH1") throw new Error("Unrecognised user file format.");
  const iv = buf.subarray(3, 15);
  const tag = buf.subarray(15, 31);
  const decipher = createDecipheriv("aes-256-gcm", key("users-file"), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(buf.subarray(31)), decipher.final()]).toString("utf8");
}

/** Constant-time comparison for codes typed by people (setup code). */
export function safeEqualText(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Readable temporary password, e.g. "plum-river-7342-sky". */
export function temporaryPassword(): string {
  const words = ["amber", "cedar", "delta", "ember", "fable", "grove", "haven", "ivory", "jade", "kite", "lumen", "maple", "noble", "onyx", "pearl", "quill", "river", "sable", "tiger", "umber", "velvet", "willow", "zephyr", "coral", "harbor", "meadow", "summit", "canyon"];
  const pick = () => words[randomBytes(1)[0] % words.length];
  const digits = (randomBytes(2).readUInt16BE(0) % 9000) + 1000;
  return `${pick()}-${pick()}-${digits}-${pick()}`;
}
