import { z } from "zod";

export const registerSchema = z.object({
    username: z.string().min(3, { message: "Username min 3 Character" }),
    email: z.string(),
    // .refine((e) => e.includes("uph.edu"), { message: "Not Campus Email" }),
    password: z.string().min(8, { message: "Password Min 8 Character" }),
    confirmPassword: z.string()
}).superRefine((data, ctx) => {
    if (data.confirmPassword != data.password) {
        ctx.addIssue({
            path: ['confirmPassword'],
            code: "custom",
            message: "Password do not Match!!!"
        });
    }
});

export type RegisterSchema = z.infer<typeof registerSchema>;

export type UserRegistration = {
    email: string;
    username: string;
    password: string;
    otp: string;
    majorId: number;
    roleId: number;
}