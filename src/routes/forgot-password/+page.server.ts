import { RESEND_API_KEY } from "$env/static/private";
import { OtpSessionManager } from "$lib/server/sessionManager";
import { fail, redirect } from "@sveltejs/kit";
import { Resend } from "resend";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { Actions } from "./$types";
import { forgotPasswordSchema } from "./forgot-password-schema";

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
            return fail(400, { data: form })
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

        // ganti email dengan email dari form
        const resend = new Resend(RESEND_API_KEY);
        const response = await resend.emails.send({
            from: "no-reply@uph-academic-services.web.id",
            to: "kelvinrogue6@gmail.com",
            subject: "Reset Password OTP Code",
            html: `<p>Complete Your Reset Password Process. \n OTP : ${otp}</p>`
        })
        console.log(response.error);

        return redirect(303, "/forgot-password/verify")
    }
}