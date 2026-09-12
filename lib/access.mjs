import { createHmac, timingSafeEqual } from "node:crypto";

export const cookieName = "knowledge-access";
export const sessionSeconds = 60 * 60 * 24 * 7;

export function equal(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function makeSession(password, now = Date.now()) {
  const expires = String(Math.floor(now / 1000) + sessionSeconds);
  const signature = createHmac("sha256", password)
    .update(`knowledge-access:${expires}`)
    .digest("hex");
  return `${expires}.${signature}`;
}

export function validSession(value, password, now = Date.now()) {
  if (!value || !password) return false;
  const [expires, signature, extra] = value.split(".");
  if (
    extra ||
    !/^\d+$/.test(expires) ||
    !signature ||
    Number(expires) <= now / 1000
  )
    return false;
  const expected = createHmac("sha256", password)
    .update(`knowledge-access:${expires}`)
    .digest("hex");
  return equal(signature, expected);
}
