import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const ACCESS_COOKIE = "lnp_access_token";
const REFRESH_COOKIE = "lnp_refresh_token";

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 15 * 60,
};

type TokenPayload = {
  userId: string;
  email: string;
  isAdmin: boolean;
};

const DEV_JWT_FALLBACK = "dev-only-jwt-secret-min-32-chars!!";

function jwtSecretBytes(): Uint8Array {
  const raw = process.env.JWT_SECRET?.trim();
  if (raw && raw.length >= 32) {
    return new TextEncoder().encode(raw);
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET é obrigatório em produção e deve ter pelo menos 32 caracteres.",
    );
  }
  if (typeof console !== "undefined") {
    console.warn(
      "[auth] JWT_SECRET ausente ou curto — usando segredo de desenvolvimento inseguro.",
    );
  }
  return new TextEncoder().encode(DEV_JWT_FALLBACK);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createAccessToken(payload: TokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(jwtSecretBytes());
}

export async function createRefreshToken(payload: TokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(jwtSecretBytes());
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, jwtSecretBytes());
  return payload as TokenPayload;
}

export async function createSessionCookies(payload: TokenPayload) {
  const accessToken = await createAccessToken(payload);
  const refreshToken = await createRefreshToken(payload);

  await prisma.session.create({
    data: {
      userId: payload.userId,
      refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, accessToken, ACCESS_COOKIE_OPTIONS);
  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function clearSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

/**
 * Quando o access token (15m) expira, renova só o cookie de access usando o refresh
 * válido na tabela Session — evita "Não autenticado" em telas admin abertas por mais tempo.
 */
async function tryRenewAccessFromRefresh(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const refresh = cookieStore.get(REFRESH_COOKIE)?.value;
  if (!refresh) return null;

  let payload: TokenPayload;
  try {
    payload = await verifyToken(refresh);
  } catch {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { refreshToken: refresh },
  });
  if (!session || session.expiresAt <= new Date()) {
    return null;
  }

  const accessToken = await createAccessToken(payload);
  cookieStore.set(ACCESS_COOKIE, accessToken, ACCESS_COOKIE_OPTIONS);
  return payload;
}

export async function getAuthUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  if (accessToken) {
    try {
      return await verifyToken(accessToken);
    } catch {
      /* access expirado ou inválido */
    }
  }

  return tryRenewAccessFromRefresh();
}

export async function requireUser() {
  const authUser = await getAuthUser();
  if (!authUser) {
    throw new Error("Não autenticado");
  }
  return authUser;
}

export async function requireAdmin() {
  const authUser = await requireUser();
  if (!authUser.isAdmin) {
    throw new Error("Acesso negado");
  }
  return authUser;
}
