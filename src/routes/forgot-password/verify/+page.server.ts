import { RESEND_API_KEY } from "$env/static/private";
import { OtpSessionManager, sessionManager } from "$lib/server/sessionManager";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import { Resend } from "resend";
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
            const resend = new Resend(RESEND_API_KEY);
            const response = await resend.emails.send({
                from: "no-reply@uph-academic-services.web.id",
                to: "kelvinrogue6@gmail.com",
                subject: "Reset Password OTP Code",
                html: `<p>Complete Your Reset Password Process \n OTP : ${otp1}</p>`
            })
            console.log(response.error);
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