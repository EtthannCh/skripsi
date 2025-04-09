import { RESEND_API_KEY } from "$env/static/private";
import { OtpSessionManager, sessionManager } from "$lib/server/sessionManager";
import { supabase } from "$lib/supabaseClient";
import { fail, redirect } from "@sveltejs/kit";
import { Resend } from "resend";
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

            //TODO: ganti email dengan email user (userCookies.email)
            const resend = new Resend(RESEND_API_KEY);
            const response = await resend.emails.send({
                from: "no-reply@uph-academic-services.web.id",
                to: "kelvinrogue6@gmail.com",
                subject: "Confirm Registration",
                html: `<p>Complete your Registration with Given Code. \n OTP : ${otp1}</p>`
            })
            console.log(response.error);
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

