import { z } from "zod";

export const registerSchema = z.object({
    username: z.string().min(3, { message: "Username min 3 Character" }),
    email: z.string(),
    // .refine((e) => e.includes("uph.edu"), { message: "Not Campus Email" }),
    password: z.string().min(8, { message: "Password Min 8 Character" })
})

export type RegisterSchema = z.infer<typeof registerSchema>;

export type UserRegistration = {
    email: string;
    username: string;
    password: string;
    otp: string;
}