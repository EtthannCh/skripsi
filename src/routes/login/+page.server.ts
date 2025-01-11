import { sessionManager } from "$lib/server/sessionManager";
import { supabase } from "$lib/supabaseClient";
import { fail } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { UserCookiesSchema, UserDbSchema } from "../home/user-schema";
import { loginSchema } from "./login-schema";

export const load = async () => {
    const form = await superValidate(zod(loginSchema))
    return {
        form
    }
}

export const actions = {
    login: async ({ request, cookies }) => {
        const form = await superValidate(request, zod(loginSchema));
        if (!form.valid) {
            return fail(400, { form })
        }
        try {
            const { data, error } = await supabase.from("user_credentials")
                .select('*')
                .eq("email", form.data.email); // where email = form.data.email
            const user: UserDbSchema = JSON.parse(JSON.stringify(data))[0];
            if (!user) {
                console.log(error);
                return fail(400);
            }

            const matchPassword = await bcrypt.compare(form.data.password.toString(), user.password);
            const userSession: UserCookiesSchema = {
                id: user.id,
                userId: user.user_id,
                email: user.email,
                username: user.username,
                roleId: user.role_id,
            }
            if ((form.data.email == user.email && !matchPassword)) {
                return fail(400, { data: form })
            }
            else if (form.data.email == user.email && matchPassword) {
                const { error, message } = await sessionManager.createSession(cookies, userSession, user.user_id);
                if (error) {
                    return fail(400, {
                        message
                    })
                }
                return form;
            }
        } catch (error) {
            console.error('Database error:', error);
            return fail(500, { error: 'Internal server error', form });
        }
    }
}