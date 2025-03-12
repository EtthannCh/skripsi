import { GOOGLE_EMAIL, GOOGLE_PASSWORD } from "$env/static/private";
import { OtpSessionManager, sessionManager } from "$lib/server/sessionManager";
import { supabase } from "$lib/supabaseClient";
import { fail, redirect } from "@sveltejs/kit";
import nodemailer from "nodemailer";
import type { UserRegistration } from "../register/register-schema";

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
    verify: async ({ cookies, request }) => {
        if (!cookies.get("otpSession")) {
            throw redirect(304, "/");
        }
        const data = await request.formData();

        const otp = data.get("otp");
        const reverify = data.get("action");


        const userCookies: UserRegistration = (await OtpSessionManager.getSession(await cookies)).data;
        if (reverify == "reverify") {
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
        if (otp != userCookies.otp) {
            return fail(400, { message: "Invalid OTP" });
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