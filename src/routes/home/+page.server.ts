import { supabase } from "$lib/supabaseClient";
import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";
import { userRequestSchema, type FormSchema, type RequestDbSchema, type UserCookiesSchema } from "./user-schema";
import { sessionManager } from "$lib/server/sessionManager";

export const load: PageServerLoad = async ({ cookies, url }) => {
    const user: UserCookiesSchema = (await sessionManager.getSession(await cookies)).data;
    if (!user) {
        throw redirect(304, "/login");
    }

    const filter = url.searchParams.get("filter") ?? "";
    const status = url.searchParams.get("status") ?? "";
    const startDate = url.searchParams.get("startDate") ?? "";
    const endDate = url.searchParams.get("endDate") ?? "";
    const filterQuery = filter.length > 0 ? `%${filter.toUpperCase()}%` : "";

    const form = await superValidate(zod(userRequestSchema));

    const formDbData = await supabase.from("form_db").select();
    const formSelection: FormSchema[] = JSON.parse(JSON.stringify(formDbData.data));
    let query = (supabase.from("request_db")
        .select(
            `id, status, user_id, form_id, 
            reason, created_by, created_at, form_db(code, name) ,user_credentials(email, user_pkey:id),form_url
            `
        ).order("created_at", { ascending: true })
    );
    if (filter.length > 0) {
        query = query.or(`created_by.ilike.${filterQuery}`)
    }
    if (status.length > 0) {
        query = query.eq(`status`, status)
    }
    if (startDate ) {
        query = query.lte("created_at", new Date(endDate).toISOString()).gte("created_at", new Date(startDate).toISOString())
    }
    
    const requestDbDataFromDb = (await query).data;
    let requestDbData: RequestDbSchema[] = JSON.parse(JSON.stringify(requestDbDataFromDb));
    if (user.roleId == 3 || !user.roleId) {
        requestDbData = [];
    };

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
            const { code } = JSON.parse(JSON.stringify((await supabase.from("form_db").select("code").eq("id", form.data.formId)).data))[0];
            const fileName = `${code}-${form.data.formId}-${userCookies.username}-${userCookies.userId}-${(new Date().toISOString())}`.toString();
            const { error } = await supabase.storage.from("request_form_files")
                .upload(fileName, buffer, { contentType: "application/pdf" });

            if (error) {
                return fail(400, { form, message: (error as Error).message })
            }
            const fileUrl = supabase.storage.from("request_form_files").getPublicUrl(fileName);

            const { error: errorInsertRequest } = await supabase.from("request_db").insert({
                status: "PENDING",
                user_id: userCookies.userId,
                form_id: form.data.formId,
                reason: "",
                created_by_id: userCookies.userId,
                created_by: userCookies.username,
                form_url: fileUrl.data.publicUrl
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