-- Novo status para reserva de Pix (~30 min). Em PG < 15, remova "IF NOT EXISTS" se der erro.
ALTER TYPE "ActivationCodeStatus" ADD VALUE IF NOT EXISTS 'reserved';

ALTER TABLE "ActivationCode" ADD COLUMN IF NOT EXISTS "reservedUntil" TIMESTAMP(3);
