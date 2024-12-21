import { query } from "$lib/db";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
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
        try {
            const user = await query(`select * from user_credentials where email = '${form.data.email}'`);
            if (user.length > 0) {
                return fail(400, { data: form })
            }
            const sql = `
            insert into user_credentials
            (user_id, username, email, password, created_at)
            values
            (gen_random_uuid(), '${form.data.username}', '${form.data.email}', '${form.data.password}', now())
            `;

            await query(sql);
        } catch (error) {
            console.error('Database error:', error);
            return fail(500, { error: 'Internal server error', form });
        }
        return form;
    }
} satisfies Actions;