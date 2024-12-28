import { query } from "$lib/db";
import { supabase } from "$lib/supabaseClient";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { registerSchema } from "./register-schema";
import bcrypt from 'bcryptjs';

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
        try {
            const user = await query(`select * from user_credentials where email = '${form.data.email}'`);
            if (user.length > 0) {
                return fail(400, { data: form })
            }
            const { error } = await supabase.from("user_credentials")
                .insert({
                    username: form.data.username,
                    email: form.data.email, password: await bcrypt.hash(form.data.password, 10)
                });
            if (error) {
                console.log(error);
                
                return fail(400, { message: "Error" })
            }
        } catch (error) {
            console.error('Database error:', error);
            return fail(500, { error: 'Internal server error', form });
        }
        return form;
    }
} satisfies Actions;