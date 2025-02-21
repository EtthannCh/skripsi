import { z } from "zod";

export const resetPasswordSchema = z.object({
    password: z.string().min(8, "Min 8 Character")
})

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;