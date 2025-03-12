import { GOOGLE_EMAIL, GOOGLE_PASSWORD } from "$env/static/private";
import { OtpSessionManager, sessionManager } from "$lib/server/sessionManager";
import { supabase } from "$lib/supabaseClient";
import { fail, redirect } from "@sveltejs/kit";
import nodemailer from "nodemailer";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { otpInputSchema } from "../forgot-password/forgot-password-schema";
import type { UserRegistration } from "../register/register-schema";

export const load = async ({ cookies }) => {
    const userCookies: UserRegistration = (await OtpSessionManager.getSession(await cookies)).data;
    if (!userCookies) {
        throw redirect(303, "/");
    }

    const form = await superValidate(zod(otpInputSchema));

    return {
        userCookies,
        form
    }
}

export const actions = {
    verify: async ({ cookies, request }) => {
        const userCookies: UserRegistration = (await OtpSessionManager.getSession(await cookies)).data;
        
        const form = await superValidate(request, zod(otpInputSchema));
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
            const userRegistration: UserRegistration = {
                email: userCookies.email,
                username: userCookies.username,
                password: userCookies.password,
                otp: otp1.toString(),
                majorId: userCookies.majorId,
                roleId: userCookies.roleId
            }
            const otpResponse = await OtpSessionManager.createSession(cookies, userRegistration, userCookies.email.toString());
            if (otpResponse.error) {
                console.log(otpResponse.message);
                return fail(400);
            }

            //TODO: ganti email dengan email user
            sendEmail("kelvinrogue6@gmail.com", "Confirm Registration", `Complete your Registration with Given Code. \n OTP : ${otp1}`);
            throw redirect(304, "/verify-user")
        }
        if (form.data.otp != userCookies.otp) {
            return fail(400, { message: "Invalid OTP!!! Please Check Your Email and Try Again" });
        }

        const { error } = await supabase.from("user_credentials")
            .insert({
                username: userCookies.username,
                email: userCookies.email,
                password: userCookies.password,
                major_id: userCookies.majorId,
                role_id: userCookies.roleId
            });

        if (error) {
            console.log(error);
            return fail(400, { message: "Error" })
        }
        await sessionManager.deleteSession(cookies);
        await sessionManager.deleteCookie(cookies);

        throw redirect(303, "/login")
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
