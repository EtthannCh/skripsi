import { query } from "$lib/db";
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { UserSchema } from "../home/user-schema";
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
            const response = await query(`select id, user_id userId, username, password, email from user_credentials where email = '${form.data.email}'`)
            const user: UserSchema = JSON.parse(JSON.stringify(response[0]));

            if ((form.data.email == user.email && form.data.password != user.password) || !user) {
                return fail(400, { data: form })
            }
            else if (form.data.email == user.email && form.data.password == user.password) {
                cookies.set("user", JSON.stringify({ userId: user.userid, email: user.email, username: user.username }), {
                    path: "/",
                    httpOnly: true,
                    maxAge: 60 * 60 * 5
                });
                return form;
            }

        } catch (error) {
            console.error('Database error:', error);
            return fail(500, { error: 'Internal server error', form });
        }
    }
}