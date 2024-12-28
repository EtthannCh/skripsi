import { supabase } from "$lib/supabaseClient";
import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";
import { userRequestSchema, type FormSchema, type RequestDbSchema, type UserCookiesSchema } from "./user-schema";

export const load: PageServerLoad = async ({ cookies }) => {
    const user: UserCookiesSchema = JSON.parse(cookies.get("user") ?? "");
    if (!user) {
        throw redirect(304, "/login");
    }

    const form = await superValidate(zod(userRequestSchema));
    const formDbData = await supabase.from("form_db").select();
    const formSelection: FormSchema[] = JSON.parse(JSON.stringify(formDbData.data));
    const requestDbDataFromDb = await supabase.from("request_db").select().filter("status", "in", '("PENDING", "AWAITING_APPROVAL)');
    let requestDbData: RequestDbSchema[] = JSON.parse(JSON.stringify(requestDbDataFromDb));
    if (user.roleId == 3) {
        requestDbData = [];
    }
    return {
        form,
        user,
        formSelection,
        requestDbData
    };
}

export const actions = {
    submit: async ({ request, cookies }) => {
        const form = await superValidate(request, zod(userRequestSchema));
        if (!form.valid) {
            return fail(400, { form });
        }
        try {
            const file = form.data.formFile as File;
            if (!file) {
                return fail(400, { form })
            }
            const buffer = Buffer.from(await file.arrayBuffer());

            const userCookies: UserCookiesSchema = JSON.parse(cookies.get("user") ?? "");
            const fileName = `${new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "2-digit",
                year: "numeric"
            })}-${userCookies.userId}-${form.data.formId}-${userCookies.username}`;
            const { error } = await supabase.storage.from("request_form_files")
                .upload(fileName, buffer, { contentType: "application/pdf" });

            const { error: errorInsertRequest } = await supabase.from("request_db").insert({
                status: "PENDING",
                user_id: userCookies.userId,
                form_id: form.data.formId,
                reason: "",
                created_by_id: userCookies.userId,
                created_by: userCookies.username
            })
            if (error && errorInsertRequest) {
                console.log(error, errorInsertRequest);
                return fail(400)
            }
            return {
                success: true,
                message: "Form Uploaded Successfully"
            };
        } catch (error) {
            console.error('Database error:', error);
            return fail(500, { error: 'Internal server error', form });
        }

    },
}