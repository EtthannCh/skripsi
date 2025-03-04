import { OtpSessionManager } from "$lib/server/sessionManager";
import { supabase } from "$lib/supabaseClient";
import { error, fail } from "@sveltejs/kit";
import bcrypt from "bcryptjs";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { Actions } from "./$types";
import { resetPasswordSchema } from "./reset-password-schema";

export const load = async () => {
    const form = await superValidate(zod(resetPasswordSchema))
    return {
        form
    }
}

export const actions: Actions = {
    resetpass: async ({ request, cookies }) => {
        const form = await superValidate(request, zod(resetPasswordSchema));
        if (!form.valid) {
            return fail(400, { data: form })
        }

        const userCookies = (await OtpSessionManager.getSession(await cookies)).data;

        const userFromDb = await supabase.from("user_credentials").select("email").eq("email", userCookies.email);
        if (userFromDb.error || userFromDb.data.length == 0) {
            console.log(error);
            throw fail(400, { data: form, message: "User Not Found" })
        }

        const pass = await bcrypt.hash(form.data.password, 15)
        const userDbResponse = await supabase.from("user_credentials").update({
            password: pass
        }).eq("email", userCookies.email);
        if (userDbResponse.error) {
            console.log(userDbResponse.error);
            throw fail(400);
        }

        return message(form, "Successfully Updated")
    }
}