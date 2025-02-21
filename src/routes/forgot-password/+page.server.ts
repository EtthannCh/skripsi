import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { Actions } from "./$types";
import { forgotPasswordSchema } from "./forgot-password-schema";
import { OtpSessionManager } from "$lib/server/sessionManager";
import { GOOGLE_EMAIL, GOOGLE_PASSWORD } from "$env/static/private";
import nodemailer from "nodemailer";

export const load = async () => {
    const form = await superValidate(zod(forgotPasswordSchema))
    return {
        form
    }
}

export const actions: Actions = {
    forgot: async ({ request, cookies }) => {
        const form = await superValidate(request, zod(forgotPasswordSchema));
        if (!form.valid) {
            return fail(400, { data: form})
        }

        const otp: number = Math.floor(Math.random() * (999999 - 100000) + 100000);
        const otpResponse = await OtpSessionManager.createSession(cookies, {
            otp: otp,
            email: form.data.email
        }, form.data.email.toString());
        if (otpResponse.error) {
            console.log(otpResponse.message);
            return fail(400, { data: form });
        }
        sendEmail("kelvinrogue6@gmail.com", "Reset Password OTP Code", `Complete Your Reset Password Process. \n OTP : ${otp}`);
        return redirect(303, "/forgot-password/verify")
    }
}

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: GOOGLE_EMAIL,
        pass: GOOGLE_PASSWORD
    }
})

const sendEmail = async (to: string, subject: string, text: string) => {
    const mailOptions = {
        from: GOOGLE_EMAIL,
        to,
        subject,
        text
    }
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email Sent", info.response);
    } catch (error) {
        console.log(error);
    }
}