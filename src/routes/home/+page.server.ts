import axios from "axios";
import type { PageServerLoad } from "./$types";
import { userRequestSchema, type FormSchema, type UserCookiesSchema } from "./user-schema";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { fail, redirect } from "@sveltejs/kit";
import { query } from "$lib/db";

export const load: PageServerLoad = async ({ cookies }) => {
    const response = await axios.get("http:localhost:5173/api/users");
    const form = await superValidate(zod(userRequestSchema));
    const data: FormSchema[] = response.data;
    const formSelectionResponse = await query("select * from form_db");
    const formSelection: FormSchema[] = JSON.parse(JSON.stringify(formSelectionResponse));

    const user: UserCookiesSchema = JSON.parse(cookies.get("user") ?? "");

    if (!user) {
        throw redirect(304, "/login");
    }
    return {
        data,
        form,
        user,
        formSelection
    };
}

export const actions = {
    submit: async ({ request, cookies }) => {
        const form = await superValidate(request, zod(userRequestSchema));
        if (!form.valid) {
            return fail(400, { form });
        }
    }
}