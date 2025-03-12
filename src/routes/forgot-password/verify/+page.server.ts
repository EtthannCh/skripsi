import { GOOGLE_EMAIL, GOOGLE_PASSWORD } from "$env/static/private";
import { OtpSessionManager, sessionManager } from "$lib/server/sessionManager";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import nodemailer from "nodemailer";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { UserRegistration } from "../../register/register-schema";
import { otpInputSchema } from "../forgot-password-schema";

export const load = async ({ cookies }) => {
    const userCookies: UserRegistration = (await OtpSessionManager.getSession(await cookies)).data;
    if (!userCookies) {
        throw redirect(303, "/home");
    }

    const form = await superValidate(zod(otpInputSchema));

    return {
        userCookies,
        form
    }
}

export const actions = {
    verify: async ({ request, cookies }) => {
        const form = await superValidate(request, zod(otpInputSchema));
        const userCookies = (await OtpSessionManager.getSession(await cookies)).data;
        if (!form.valid) {
            return fail(400, { data: form, message: "Please Input Valid OTP (6 Number)!" })
        }

        if (!userCookies) {
            return fail(400, { data: form, message: "OTP Session Timeout... Please Try Again" });
        }

        if (form.data.process == "reverify") {
            const otp1: number = Math.floor(Math.random() * (999999 - 100000) + 100000);
            await sessionManager.deleteSession(cookies);
            await sessionManager.deleteCookie(cookies);
            const otpResponse = await OtpSessionManager.createSession(cookies, {
                otp: otp1,
                email: userCookies.email
            }, userCookies.email);
            if (otpResponse.error) {
                console.log(otpResponse.message);
                return fail(400);
            }

            // TODO: ganti email dengan email user
            sendEmail("kelvinrogue6@gmail.com", "Reset Password OTP Code", `Complete Your Reset Password Process \n OTP : ${otp1}`);
            return message(form, "Successfully Sent... Please Check Your Email")
        }

        const otpInput = form.data.otp;
        if (otpInput == userCookies.otp) {
            return redirect(303, "/forgot-password/reset-password");
        } else if (otpInput != userCookies.otp) {
            return fail(400, { data: form, message: "Invalid OTP!!! Please Check Your Email and Try Again" })
        }
        
        return fail(400, { data: form, message: "Please Input Valid OTP (6 Number)!" })
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