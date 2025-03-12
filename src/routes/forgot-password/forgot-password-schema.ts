import { z } from "zod";

export const forgotPasswordSchema = z.object({
    email: z.string().email()
})

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const otpInputSchema = z.object({
    otp: z.string().min(6).max(6).optional(),
    process: z.string(),
})

export type OtpInputSchema = z.infer<typeof otpInputSchema>;