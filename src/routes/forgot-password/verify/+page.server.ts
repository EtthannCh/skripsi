import { OtpSessionManager, sessionManager } from "$lib/server/sessionManager";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { UserRegistration } from "../../register/register-schema";
import { GOOGLE_EMAIL, GOOGLE_PASSWORD } from "$env/static/private";
import nodemailer from "nodemailer";

export const load = async ({ cookies }) => {
    const userCookies: UserRegistration = (await OtpSessionManager.getSession(await cookies)).data;
    if (!userCookies) {
        throw redirect(303, "/");
    }

    return {
        userCookies
    }
}

export const actions = {
    verify: async ({ request, cookies }) => {
        const form = await request.formData();
        const action = form.get("action");
        const userCookies = (await OtpSessionManager.getSession(await cookies)).data;
        if (action == "reverify") {
            const otp1: number = Math.floor(Math.random() * (999999 - 100000) + 100000);
            await sessionManager.deleteSession(cookies);
            await sessionManager.deleteCookie(cookies);
            const otpResponse = await OtpSessionManager.createSession(cookies, otp1, userCookies.email);
            if (otpResponse.error) {
                console.log(otpResponse.message);
                return fail(400);
            }

            sendEmail("kelvinrogue6@gmail.com", "Confirm Registration", `Complete your Registration with Given Code. \n OTP : ${otp1}`);
            throw redirect(304, "/forgot-password/verify")
        }

        const otpInput = form.get("otp");
        if (otpInput == userCookies.otp) {
            return redirect(303, "/forgot-password/reset-password");
        }
        return fail(400);
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