import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().min(8, { message: "Email Min 8 Character " }).refine((e) => e.includes("uph.edu"), { message: "Please use University Email" }),
    password: z.string().min(8, { message: "Password Min 8 Character" })
})

export type LoginSchema = z.infer<typeof loginSchema>;