import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nome inválido"),
  email: z.email("E-mail inválido").transform((value) => value.toLowerCase()),
  phone: z.string().min(10, "Telefone inválido").optional().or(z.literal("")),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
});

export const loginSchema = z.object({
  email: z.email("E-mail inválido").transform((value) => value.toLowerCase()),
  password: z.string().min(6, "Senha inválida"),
});

export const createOrderSchema = z.object({
  planId: z.string().min(1),
});

export const createPixSchema = z.object({
  orderId: z.string().min(1),
});

export const importCodesSchema = z.object({
  planId: z.string().min(1),
  codes: z.array(z.string().min(4)).min(1),
});
