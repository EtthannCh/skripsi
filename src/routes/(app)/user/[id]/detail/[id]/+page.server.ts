import { sessionManager } from '$lib/server/sessionManager';
import { supabase } from '$lib/supabaseClient.js';
import { fail } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { message, superValidate, type SuperValidated } from 'sveltekit-superforms/server';
import type { RequestDbSchema, UserCookiesSchema } from '../../../../home/request-user-schema';
import type { PageServerLoad } from './$types.js';
import type { ApproveRejectSchema, RequestHistorySchema, UserDetailSchema } from './user-detail-schema';
import { approveRejectSchema } from './user-detail-schema';

export const load: PageServerLoad = async ({ url }) => {
    const userPkey: string = url.pathname.split("/")[2];
    const requestFormId: string = url.pathname.split("/")[4];

    const form: SuperValidated<ApproveRejectSchema> = await superValidate(zod(approveRejectSchema))

    const userDataFromDb = await supabase.from("user_credentials").select("id, username, email").eq("id", userPkey);
    const requestDataFromDb = await supabase.from("request_db").select("*").eq("id", requestFormId);
    const requestHistoryDataFromDb = await supabase.from("request_history_db").select("*").eq("request_id", requestFormId);

    if (userDataFromDb.error || userDataFromDb == undefined) {
        console.log(userDataFromDb.error);
        return fail(400, { message: "Invalid User Data" })
    }
    if (requestDataFromDb.error || requestDataFromDb == undefined) {
        console.log(requestDataFromDb.error);
        return fail(400, { message: "Invalid Request Data" })
    }
    if (requestHistoryDataFromDb.error || requestHistoryDataFromDb == undefined) {
        console.log(requestHistoryDataFromDb.error);
        return fail(400, { message: "Invalid Request History Data" })
    }

    const userData: UserDetailSchema = userDataFromDb.data[0];
    const requestData: RequestDbSchema = requestDataFromDb.data[0];
    const requetsHistoryData: RequestHistorySchema[] = requestHistoryDataFromDb.data;
    return {
        userData,
        requestData,
        form,
        requetsHistoryData
    }
}

export const actions = {
    submit: async ({ request, cookies }) => {
        const user: UserCookiesSchema = (await sessionManager.getSession(await cookies)).data;
        const form = await superValidate(request, zod(approveRejectSchema));
        if (!form.valid) {
            return message(form, { type: "failure", message: "Invalid Form" })
        }

        let currentStatus = "";
        if (form.data.status == "PENDING" && user.roleId != 1) {
            throw fail(400, { message: "Permission not Allowed" })
        }
        else if (form.data.status == "ONGOING" && user.roleId != 2) {
            throw fail(400, { message: "Permission not Allowed" })
        }
        else if (form.data.status == "APPROVED" && user.roleId != 4) {
            throw fail(400, { message: "Permission not Allowed" })
        }

        if (form.data.status == "PENDING" && user.roleId == 1) {
            currentStatus = "ONGOING";
        }
        else if (form.data.status == "ONGOING" && user.roleId == 2) {
            currentStatus = "PROCESSING";
        }
        else if (form.data.status == "PROCESSING" && user.roleId == 2) {
            currentStatus = "COMPLETED";
        }
        else if (form.data.status == "REJECTED") {
            currentStatus = "REJECTED"
        }

        if (form.data.process == "REJECT") {
            currentStatus = "REJECTED";
        }

        let fileUrl: string | File = "";
        let reason : string = "";
        let approveFileOrReject: File | undefined = undefined;
        if (form.data.approvalFile || form.data.rejectFile) {
            if (form.data.approvalFile) {
                approveFileOrReject = form.data.approvalFile;
                reason = "";
            } else {
                approveFileOrReject = form.data.rejectFile;
                reason = form.data.reason;
            }
            const file = approveFileOrReject as File;
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileName = `${form.data.requestId}-${currentStatus}-${new Date().toISOString()}`.toString();
            const { error } = await supabase.storage.from("request_form_files")
                .upload(fileName, buffer, { contentType: "application/pdf" });

            if (error) {
                return message(form, (error as Error).message)
            }
            fileUrl = supabase.storage.from("request_form_files").getPublicUrl(fileName).data.publicUrl;

        }
        const { error: errorInsertRequest } = await supabase.from("request_db").update({
            status: currentStatus,
            last_updated_by_id: user.userId,
            last_updated_by: user.username,
            reason: reason,
            completion_file_url: fileUrl
        }).eq("id", form.data.requestId);
        if (errorInsertRequest) {
            console.log(errorInsertRequest.message);
            throw fail(400, { message: "Failed to Update Request Status" })
        }

        const insertRequestHistoryDb = await supabase.from("request_history_db").insert({
            request_id: form.data.requestId,
            created_by_id: user.userId,
            created_by: user.username,
            file_url: fileUrl
        })
        if (insertRequestHistoryDb.error) {
            console.log(insertRequestHistoryDb.error);
            throw fail(400, { message: "Failed Insert to Request History Database" });
        }

        return message(form, { type: "success", message: "Form Updated Successfully" });
    }
}
