import { loginSchema } from "./login-schema"
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { message } from 'sveltekit-superforms';
import { fail } from '@sveltejs/kit';

export const load = async () => {
    const form = await superValidate(zod(loginSchema))
    return {
        form
    }
}
export const actions = {
    default: async ({ request }) => {
        const form = await superValidate(request, zod(loginSchema));
        if (!form.valid) {
            return fail(400, { form })
        }
        return message(form, 'Form posted successfully!');
    }
}