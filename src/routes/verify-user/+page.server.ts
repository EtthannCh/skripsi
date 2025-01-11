import { OtpSessionManager, sessionManager } from "$lib/server/sessionManager";
import { supabase } from "$lib/supabaseClient";
import { fail, redirect } from "@sveltejs/kit";
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
        if (!cookies.get("session")) {
            throw redirect(304, "/");
        }
        const data = await request.formData();
        const otp = data.get("otp");

        const userCookies: UserRegistration = (await OtpSessionManager.getSession(await cookies)).data;
        if (otp != userCookies.otp) {
            return fail(400, { message: "Invalid OTP" });
        }
        const { error } = await supabase.from("user_credentials")
            .insert({
                username: userCookies.username,
                email: userCookies.email,
                password: userCookies.password
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