import { query } from "$lib/db";
import { supabase } from "$lib/supabaseClient";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import bcrypt from 'bcryptjs';
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { registerSchema } from "./register-schema";

export const load = async () => {
    const form = await superValidate(zod(registerSchema))
    return {
        form
    }
}

export const actions: Actions = {
    register: async (event) => {
        const form = await superValidate(event, zod(registerSchema));
        if (!form.valid) {
            return fail(400, {
                form,
            })
        }

        const user = await query(`select * from user_credentials where email = '${form.data.email}'`);
        if (user.length > 0) {
            return fail(400, { data: form })
        }

        const signInWithOtpData = await supabase.auth.signInWithOtp({
            email: form.data.email
        })
        if (signInWithOtpData.error) {
            console.log("OTP Error", signInWithOtpData.error);
        }

        event.cookies.set("username", JSON.stringify(form.data.username), {
            path: "/",
            httpOnly: true,
            maxAge: 60 * 5 // cookies max 5 menit
        });
        event.cookies.set("email", JSON.stringify(form.data.email), {
            path: "/",
            httpOnly: true,
            maxAge: 60 * 5 // cookies max 5 menit
        });
        event.cookies.set("password", JSON.stringify(await bcrypt.hash(form.data.password, 15)), {
            path: "/",
            httpOnly: true,
            maxAge: 60 * 5 // cookies max 5 menit
        });
        return form;

    }
} satisfies Actions;
