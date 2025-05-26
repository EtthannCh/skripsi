import { z } from "zod";

// schema disini seperti tipe datanya, karena menggunakan typescript jadi harus menyediakan tipe datanya seperti apa
export const registerSchema = z.object({
    username: z.string().min(3, { message: "Username min 3 Character" }).max(250, {message:"Username Have Reached Maximum Length"}),
    email: z.string().min(8, { message: "Email Min 8 Character " }).max(250, {message:"Email Have Reached Maximum Length"}).refine((e) => e.includes("uph.edu"), { message: "Not Campus Email" }),
    password: z.string().min(8, { message: "Password Min 8 Character" }),
    confirmPassword: z.string().min(8, { message: "Password Min 8 Character" })
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