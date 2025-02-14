import { supabase } from "$lib/supabaseClient";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";
import { userRequestSchema, type FormSchema, type MajorDbSchema, type RequestDbSchema, type SequenceSchema, type UserCookiesSchema } from "./request-user-schema";
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
    const formFilter = url.searchParams.get("form") ?? "";
    const filterQuery = filter.length > 0 ? `%${filter.toUpperCase()}%` : "";
    let pages = Number(url.searchParams.get("pages") ?? 0);

    if (pages % 10 == 0) {
        pages = Math.floor(pages) / 10;
    } else {
        pages = (Math.floor(pages) / 10) + 1;
    }

    const form = await superValidate(zod(userRequestSchema));

    const formDbData = await supabase.from("form_db").select("*");
    const formSelection: FormSchema[] = JSON.parse(JSON.stringify(formDbData.data));
    let query = (supabase.from("request_db")
        .select(
            `id, status, user_id, form_id, request_code,
            reason, created_by, created_at, form_db(code, name) ,user_credentials(email, user_pkey:id),form_url
            `
        ).order("created_at", { ascending: true })
        .eq("major_id", user.majorId)
        .range(pages * 10, (pages + 1) * 10)
        .limit(10)
    );
    if (filter.length > 0) {
        query = query.or(`created_by.ilike.${filterQuery},request_code.ilike.${filterQuery}`)
    }
    if (status.length > 0) {
        query = query.eq(`status`, status)
    }
    if (startDate) {
        query = query.lte("created_at", new Date(endDate).toISOString()).gte("created_at", new Date(startDate).toISOString())
    }
    if (formFilter.length > 0) {
        query = query.eq("form_id", formFilter);
    }

    const totalCountResponse = await supabase.from("request_db")
        .select(
            `id, status, user_id, form_id, request_code,
            reason, created_by, created_at, form_db(code, name) ,user_credentials(email, user_pkey:id),form_url
            `, {count:"exact"}
        ).order("created_at", { ascending: true })
        .eq("major_id", user.majorId);
    if((totalCountResponse).error){
        throw fail(400, {message:"Error Fetch"});
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
        requestDbData,
        totalCount:totalCountResponse.count
    };
}

export const actions = {
    submit: async ({ request, cookies }) => {
        const form = await superValidate(request, zod(userRequestSchema));
        if (!form.valid) {
            return message(form, { type: "failure", message: "Invalid Form" });
        }
        const file = form.data.formFile as File;
        if (!file) {
            return fail(400, { data: form, message: "Please Check again uploaded File" })
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        const formName = form.data.formFile?.name.slice(0, - 4);

        if (formName?.split("-").length != 4) {
            return fail(400, { data: form, message: "Invalid File Name... Please Make Sure Again" })
        }

        const userCookies: UserCookiesSchema = (await sessionManager.getSession(await cookies)).data;
        const { code } = JSON.parse(JSON.stringify((await supabase.from("form_db").select("code").eq("id", form.data.formId)).data))[0];

        const splittedField: string[] = formName.split("-");
        if (splittedField[0] != code) {
            return fail(400, { message: "Form does not Match with Selected File.. Please Rename or Choose the Correct Form" })
        }

        if (
            (!splittedField[1].startsWith("0308") || splittedField[1].length != 11) || (!splittedField[1].startsWith("0308") && splittedField[1].length != 11)
            || splittedField[1] != userCookies.email.split("@")[0]
        ) {
            return fail(400, { message: "Invalid Student Number" })
        }

        const majorDataResponse = await supabase.from("major_db").select("*").eq("code", splittedField[2])
        if (majorDataResponse.error || majorDataResponse.data.length == 0) {
            console.log(majorDataResponse.error);
            return fail(400, { message: "Major Not Found" });
        }
        const majorDbData: MajorDbSchema = majorDataResponse.data[0];
        if (majorDbData.id != userCookies.majorId) {
            return fail(400, { message: "Invalid Major... Please Check Again" });
        }
        if (splittedField[3] != userCookies.email && userCookies.roleId == 3) {
            return fail(400, { message: "Invalid Student Email.. Please Use your Student Account" });
        }

        const fileName = `${code}-${form.data.formId}-${userCookies.username}-${userCookies.userId}-${(new Date().toISOString())}`.toString();
        const { error } = await supabase.storage.from("request_form_files")
            .upload(fileName, buffer, { contentType: "application/pdf" });

        if (error) {
            return message(form, (error as Error).message)
        }
        const fileUrl = supabase.storage.from("request_form_files").getPublicUrl(fileName);

        const sequenceDbResponse = await supabase.from("sequence_db").select("*").eq("major_id", userCookies.majorId);
        if (sequenceDbResponse.error) {
            return message(form, (sequenceDbResponse.error as Error).message);
        }
        const sequence: SequenceSchema = sequenceDbResponse.data[0];
        const currentNumber: string = sequence.current_number + 1;
        const format = sequence.format;
        const numberFormat = format.slice(1, -1).split('/')[1]
        const newNumberFormat = (numberFormat.slice(currentNumber.toString().length) + currentNumber).replaceAll('#', '0');
        const year = new Date().getFullYear();
        const newFormat = `${majorDbData.code}/${newNumberFormat}/MDN/${year}`

        const { error: errorInsertRequest } = await supabase.from("request_db").insert({
            status: "PENDING",
            user_id: userCookies.userId,
            form_id: form.data.formId,
            reason: "",
            created_by_id: userCookies.userId,
            created_by: userCookies.username,
            form_url: fileUrl.data.publicUrl,
            major_id: userCookies.majorId,
            request_code: newFormat
        })
        if (error || errorInsertRequest) {
            return message(form, "Please Check Again");
        }

        const updateSequenceDbResponse = await supabase.from("sequence_db").update({
            current_number: currentNumber
        }).eq("major_id", userCookies.majorId)
        if (updateSequenceDbResponse.error) {
            return message(form, { type: "failure", message: "Sequence Error" });
        }
        return message(form, "Form Uploaded Successfully");
    }

} satisfies Actions;