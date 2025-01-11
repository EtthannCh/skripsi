import { GOOGLE_EMAIL, GOOGLE_PASSWORD } from '$env/static/private';
import { query } from "$lib/db";
import { OtpSessionManager } from '$lib/server/sessionManager';
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { registerSchema, type UserRegistration } from "./register-schema";

export const load = async () => {
    const form = await superValidate(zod(registerSchema))
    return {
        form
    }
}

export const actions: Actions = {
    register: async ({ request, cookies }) => {
        const reqForm = await request.formData();
        const form = await superValidate(reqForm, zod(registerSchema));
        if (!form.valid) {
            return fail(400, {
                form,
            })
        }

        const user = await query(`select * from user_credentials where email = '${form.data.email}'`);
        if (user.length > 0) {
            return fail(400, { data: form })
        }

        const otp: number = Math.floor(Math.random() * (999999 - 100000) + 100000);

        try {
            const pass = await bcrypt.hash(form.data.password, 15)
            const userRegistration: UserRegistration = {
                email: form.data.email,
                username: form.data.username,
                password: pass,
                otp: otp.toString()
            }
            const { error, message } = await OtpSessionManager.createSession(cookies, userRegistration, form.data.email.toString());
            if (error) {
                console.log(message);
                return fail(400, {
                    message
                })
            }
            sendEmail(form.data.email, "Confirm Registration", `Complete your Registration with Given Code. \n OTP : ${otp}`);
        } catch (e) {
            console.log(e);
            return fail(400);
        }
        return message(form, "Complete Your Registration");
    }
} satisfies Actions;

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