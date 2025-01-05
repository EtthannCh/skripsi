import { supabase } from "$lib/supabaseClient";
import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ cookies }) => {
    const userCookies = cookies.get("username");
    if (!userCookies) {
        throw redirect(303, "/");
    }
    const user = JSON.parse(userCookies);
    return {
        user
    }
}

export const actions = {
    verify: async ({ cookies, request }) => {
        if (!cookies.get("username")) {
            throw redirect(304, "/");
        }
        const data = await request.formData();
        const otp = data.get("otp");

        const emailCookies = JSON.parse(cookies.get("email") ?? "");
        const verifyUserOtp = await supabase.auth.verifyOtp({
            email: emailCookies, token: `${otp}`, type: "email"
        })
        if (verifyUserOtp.error) {
            console.log(verifyUserOtp.error);
        }
        const usernameCookies = JSON.parse(cookies.get("username") ?? "");
        const passwordCookies = JSON.parse(cookies.get("password") ?? "");
        const { error } = await supabase.from("user_credentials")
            .insert({
                username: usernameCookies,
                email: emailCookies, password: passwordCookies
            });

        if (error) {
            console.log(error);
            return fail(400, { message: "Error" })
        }

        cookies.delete("username", { path: '/', domain: "localhost" });
        cookies.delete("password", { path: '/', domain: "localhost" });
        cookies.delete("email", { path: '/', domain: "localhost" });

        throw redirect(303, "/login")
    }
}