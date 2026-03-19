import crypto from "crypto";

/** PEM da chave pública Woovi/OpenPix (documentação oficial) — valida `x-webhook-signature` (RSA). */
const WOOVI_PUBLIC_KEY_PEM = Buffer.from(
  "LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlHZk1BMEdDU3FHU0liM0RRRUJBUVVBQTRHTkFEQ0JpUUtCZ1FDLytOdElranpldnZxRCtJM01NdjNiTFhEdApwdnhCalk0QnNSclNkY2EzcnRBd01jUllZdnhTbmQ3amFnVkxwY3RNaU94UU84aWVVQ0tMU1dIcHNNQWpPL3paCldNS2Jxb0c4TU5waS91M2ZwNnp6MG1jSENPU3FZc1BVVUcxOWJ1VzhiaXM1WloySVpnQk9iV1NwVHZKMGNuajYKSEtCQUE4MkpsbitsR3dTMU13SURBUUFCCi0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQo=",
  "base64",
).toString("utf8");

/**
 * HMAC-SHA256 do corpo em hexadecimal (header comum: x-woovi-signature).
 */
export function verifyHmacSha256Hex(
  rawBody: string,
  secret: string,
  headerSignature: string | null,
): boolean {
  if (!headerSignature) return false;
  const sig = headerSignature.trim().replace(/^sha256=/i, "");
  if (!/^[0-9a-fA-F]{64}$/.test(sig)) return false;
  const digestHex = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    const a = Buffer.from(digestHex, "hex");
    const b = Buffer.from(sig, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * HMAC-SHA1 do corpo em base64 (header: X-OpenPix-Signature, método HMAC da Woovi).
 */
export function verifyHmacSha1Base64(
  rawBody: string,
  secret: string,
  headerSignature: string | null,
): boolean {
  if (!headerSignature) return false;
  const expected = crypto.createHmac("sha1", secret).update(rawBody).digest("base64");
  const sig = headerSignature.trim();
  try {
    const a = Buffer.from(expected, "base64");
    const b = Buffer.from(sig, "base64");
    if (a.length !== b.length || a.length === 0) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Valida assinatura RSA `x-webhook-signature` (recomendado pela Woovi).
 */
export function verifyWooviWebhookRsa(rawBody: string, signatureBase64: string | null): boolean {
  if (!signatureBase64?.trim()) return false;
  try {
    const signature = Buffer.from(signatureBase64.trim(), "base64");
    const verify = crypto.createVerify("RSA-SHA256");
    verify.update(rawBody);
    verify.end();
    return verify.verify(WOOVI_PUBLIC_KEY_PEM, signature);
  } catch {
    return false;
  }
}

/**
 * Exige `WOOVI_WEBHOOK_SECRET` definido e valida pelo menos um método suportado.
 */
export function isValidWooviWebhookRequest(rawBody: string, request: Request): boolean {
  const secret = process.env.WOOVI_WEBHOOK_SECRET?.trim();
  if (!secret) return false;

  const rsaSig = request.headers.get("x-webhook-signature");
  if (rsaSig && verifyWooviWebhookRsa(rawBody, rsaSig)) return true;

  const hmac256 = request.headers.get("x-woovi-signature");
  if (verifyHmacSha256Hex(rawBody, secret, hmac256)) return true;

  const openPix =
    request.headers.get("X-OpenPix-Signature") ?? request.headers.get("x-openpix-signature");
  if (verifyHmacSha1Base64(rawBody, secret, openPix)) return true;

  return false;
}
