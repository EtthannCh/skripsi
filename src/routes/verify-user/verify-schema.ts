import { z } from "zod";

export const verifyUserSchema = z.object({
    username: z.string(),
    password: z.string(),
    email: z.string(),
})

export type VerifyUserSchema = z.infer<typeof verifyUserSchema>;