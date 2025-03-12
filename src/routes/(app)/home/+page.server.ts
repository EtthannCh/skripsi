import { GOOGLE_EMAIL, GOOGLE_PASSWORD } from "$env/static/private";
import { sessionManager } from "$lib/server/sessionManager";
import { supabase } from "$lib/supabaseClient";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import nodemailer from "nodemailer";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";
import { userRequestSchema, type FormSchema, type MajorDbSchema, type RequestDbSchema, type SequenceSchema, type UserCookiesSchema } from "./request-user-schema";

export const load: PageServerLoad = async ({ cookies, url }) => {
    const user: UserCookiesSchema = (await sessionManager.getSession(await cookies)).data;
    if (!user) {
        throw redirect(304, "/login");
    }

    const date = new Date();
    const defaultStartDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const defaultEndDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    defaultStartDate.setDate(defaultStartDate.getDate() + 1);
    defaultEndDate.setDate(defaultEndDate.getDate() + 1)
    const filter = url.searchParams.get("filter") ?? "";
    const status = url.searchParams.get("status") ?? "";

    const startDate = url.searchParams.get("startDate") ?? defaultStartDate.toISOString().split("T")[0];
    const endDate = url.searchParams.get("endDate") ?? defaultEndDate.toISOString().split("T")[0];;
    const formFilter = url.searchParams.get("form") ?? "";
    const filterQuery = filter.length > 0 ? `%${filter.toUpperCase()}%` : "";
    const pages = Number(url.searchParams.get("pages") ?? 0);

    const form = await superValidate(zod(userRequestSchema));

    const formDbData = await supabase.from("form_db").select("*");
    const formSelection: FormSchema[] = JSON.parse(JSON.stringify(formDbData.data));

    let requestDbData: RequestDbSchema[] = [];
    let totalCount = 0;
    if ([1, 2, 6].includes(user.roleId)) {
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
        let totalCountQuery = supabase.from("request_db")
            .select(
                `id, status, user_id, form_id, request_code,
                reason, created_by, created_at, form_db(code, name) ,user_credentials(email, user_pkey:id),form_url, completion_file_url
                `, { count: "exact" }
            ).order("created_at", { ascending: true })
            .eq("major_id", user.majorId);
        if (filter.length > 0) {
            query = query.or(`created_by.ilike.${filterQuery},request_code.ilike.${filterQuery}`)
            totalCountQuery = totalCountQuery.or(`created_by.ilike.${filterQuery},request_code.ilike.${filterQuery}`)
        }
        if (status.length > 0) {
            query = query.eq(`status`, status)
            totalCountQuery = totalCountQuery.eq(`status`, status)
        }
        if (startDate) {
            const newEndDate = new Date(endDate);
            newEndDate.setDate(newEndDate.getDate() + 1);
            query = query.lte("created_at", newEndDate.toISOString()).gte("created_at", new Date(startDate).toISOString())
            totalCountQuery = totalCountQuery.lte("created_at", newEndDate.toISOString()).gte("created_at", new Date(startDate).toISOString());
        }
        if (formFilter.length > 0) {
            query = query.eq("form_id", formFilter);
            totalCountQuery = totalCountQuery.eq("form_id", formFilter);
        }
        if (user.roleId == 1) {
            query = query.in("status", ["PENDING", "COMPLETED", "REJECTED"]);
        }
        else if (user.roleId == 2) {
            query = query.in("status", ["ONGOING", "PROCESSING", "COMPLETED", "REJECTED"])
        }

        const requestDbDataFromDb = (await query).data;
        const totalCountFromDb = (await totalCountQuery);
        if ((totalCountFromDb).error) {
            throw fail(400, { message: "Error Fetch" });
        }
        requestDbData = JSON.parse(JSON.stringify(requestDbDataFromDb));
        totalCount = Number(totalCountFromDb.count);
    }
    if (user.roleId == 3 || !user.roleId) {
        requestDbData = [];
    };

    return {
        form,
        user,
        formSelection,
        requestDbData,
        totalCount: totalCount
    };
}

export const actions = {
    submit: async ({ request, cookies }) => {
        if (!cookies) {
            throw redirect(304, "/login");
        }
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

        if (formName?.split("-").length != 5) {
            return fail(400, { message: "Invalid File Name... Please Make Sure Again" })
        }

        const userCookies: UserCookiesSchema = (await sessionManager.getSession(await cookies)).data;
        const { code } = JSON.parse(JSON.stringify((await supabase.from("form_db").select("code").eq("id", form.data.formId)).data))[0];

        const findKaprodiResponse = await supabase.from("user_credentials").select("email")
            .eq("major_id", userCookies.majorId)
            .eq("role_id", 1);
        if(findKaprodiResponse.error){
            return fail(400, {message:"Head of Department not Found... Please Contact Administrator"});
        }
        const kaprodi = findKaprodiResponse.data[0].email; // TODO: pake const ini

        const splittedField: string[] = formName.split("-");
        const formCode = splittedField[0] + "_" + splittedField[1];
        if (formCode != code) {
            return fail(400, { message: "Form does not Match with Selected File.. Please Rename or Choose the Correct Form" })
        }

        if (
            (!splittedField[2].startsWith("03") || splittedField[2].length != 11) || (!splittedField[2].startsWith("03") && splittedField[2].length != 11)
            || splittedField[4].split("@")[0] != userCookies.email.split("@")[0]
        ) {
            return fail(400, { message: "Invalid Student Number" })
        }

        const majorDataResponse = await supabase.from("major_db").select("*").eq("code", splittedField[3])
        if (majorDataResponse.error || majorDataResponse.data.length == 0) {
            console.log(majorDataResponse.error);
            return fail(400, { message: "Major Not Found" });
        }
        const majorDbData: MajorDbSchema = majorDataResponse.data[0];
        if (majorDbData.id != userCookies.majorId) {
            return fail(400, { message: "Invalid Major... Please Check Again" });
        }
        if (splittedField[4].trim() != userCookies.email.trim() && userCookies.roleId == 3) {
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
            console.log(sequenceDbResponse.error);
            return message(form, (sequenceDbResponse.error as Error).message);
        }
        const sequence: SequenceSchema = sequenceDbResponse.data[0];

        let currentNumber: string = sequence.current_number + 1;
        let currentYear = sequence.current_year;
        const year = new Date().getFullYear();

        if (Number(currentYear) != year) {
            currentNumber = "1";
            currentYear = year.toString();
        }

        const format = sequence.format;
        const numberFormat = format.slice(1, -1).split('/')[1]
        const newNumberFormat = (numberFormat.slice(currentNumber.toString().length) + currentNumber).replaceAll('#', '0');
        const newFormat = `${majorDbData.code}/${newNumberFormat}/MDN/${currentYear}`

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
            console.log(errorInsertRequest);
            return message(form, { message: "Please Check Again", type: "failure" });
        }

        const updateSequenceDbResponse = await supabase.from("sequence_db").update({
            current_number: currentNumber,
            current_year: currentYear,
        }).eq("major_id", userCookies.majorId)
        if (updateSequenceDbResponse.error) {
            console.log(updateSequenceDbResponse.error);
            return message(form, { type: "failure", message: "Sequence Error" });
        }


        // TODO: send email ke kaprodi
        if (userCookies.roleId == 3) {
            sendEmail("kelvinrogue6@gmail.com", "A Request has been Received", `Form Request for student with Email : ${userCookies.email}.. Please Check Academic Service Website to Process Request`)
        }

        return message(form, "Form Uploaded Successfully");
    }

} satisfies Actions;

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: GOOGLE_EMAIL,
        pass: GOOGLE_PASSWORD
    }
})

const sendEmail = async (to: string, subject: string, text: string) => {
    const mailOptions = {
        from: GOOGLE_EMAIL,
        to,
        subject,
        text
    }
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email Sent", info.response);
    } catch (error) {
        console.log(error);
    }
}