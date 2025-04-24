import { RESEND_API_KEY } from "$env/static/private";
import { sessionManager } from '$lib/server/sessionManager';
import { supabase } from '$lib/supabaseClient.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { Resend } from 'resend';
import { zod } from 'sveltekit-superforms/adapters';
import { message, superValidate, type SuperValidated } from 'sveltekit-superforms/server';
import type { RequestDbSchema, UserCookiesSchema } from '../../../../home/request-user-schema';
import type { PageServerLoad } from './$types.js';
import type { ApproveRejectSchema, RequestHistorySchema, UserDetailSchema } from './user-detail-schema';
import { approveRejectSchema } from './user-detail-schema';

export const load: PageServerLoad = async ({ url, cookies }) => {
    const user: UserCookiesSchema = (await sessionManager.getSession(await cookies)).data;
    const validRole = ['HOD', 'ADM'];
    if (!validRole.includes(user.roleCode)) {
        throw error(401, "Unauthorized")
    }

    const userPkey: string = url.pathname.split("/")[2];
    const requestFormId: string = url.pathname.split("/")[4];

    const userDataFromDb = await supabase.from("user_credentials").select("id, username, email").eq("id", userPkey);
    const requestDataFromDb = await supabase.from("request_db").select("*").eq("id", requestFormId);
    const requestHistoryDataFromDb = await supabase.from("request_history_db").select("*").eq("request_id", requestFormId);

    if (userDataFromDb.error || userDataFromDb == undefined) {
        console.log(userDataFromDb.error);
        throw fail(400, { message: "Invalid User Data" })
    }

    if (requestDataFromDb.error || requestDataFromDb == undefined) {
        console.log(requestDataFromDb.error);
        throw fail(400, { message: "Invalid Request Data" })
    }


    if (requestHistoryDataFromDb.error || requestHistoryDataFromDb == undefined) {
        console.log(requestHistoryDataFromDb.error);
        throw fail(400, { message: "Invalid Request History Data" })
    }

    const userData: UserDetailSchema = userDataFromDb.data[0];
    const requestData: RequestDbSchema = requestDataFromDb.data[0];
    const requetsHistoryData: RequestHistorySchema[] = requestHistoryDataFromDb.data;

    const form: SuperValidated<ApproveRejectSchema> = await superValidate({ requestId: requestData.id, status: requestData.status, studentId: userData.id }, zod(approveRejectSchema))
    return {
        userData,
        requestData,
        form,
        requetsHistoryData
    }
}

export const actions = {
    submit: async ({ request, cookies }) => {
        if (!cookies) {
            throw redirect(304, "/login");
        }
        const user: UserCookiesSchema = (await sessionManager.getSession(await cookies)).data;

        const form = await superValidate(request, zod(approveRejectSchema));
        if (!form.valid) {
            return message(form, { type: "failure", message: "Invalid Form" })
        }

        const requestDataFromDb = await supabase.from("request_db").select("*").eq("id", form.data.requestId);
        if (requestDataFromDb.error || requestDataFromDb == undefined) {
            console.log(requestDataFromDb.error);
            return fail(400, { message: "Server Error... Please Refresh" })
        }

        const requestData: RequestDbSchema = requestDataFromDb.data[0];

        let currentStatus = "";
        if (form.data.status == "PENDING" && user.roleCode != 'HOD') {
            return fail(400, { message: "Permission not Allowed... Please Refresh or Login Again" })
        }
        else if (form.data.status == "ONGOING" && user.roleCode != 'ADM') {
            return fail(400, { message: "Permission not Allowed... Please Refresh or Login Again" })
        }

        let nextRoleCode = '';
        let emailSubject = "";
        let emailBody = "";

        if (form.data.process == "REJECT" && user.roleCode == 'ADM' &&
            (form.data.status == requestData.status)) {
            nextRoleCode = 'STD';
            currentStatus = "REJECTED";
            emailSubject = `Your Request with Number ${requestData.request_code} has Been Rejected.`;
            emailBody = "Please Check Again at Academic Service Website.";
        }
        else if (form.data.status == requestData.status && user.roleCode == 'HOD' && form.data.process == "REJECT") {
            nextRoleCode = 'STD';
            currentStatus = "REJECTED";
            emailSubject = `Your Request with Number ${requestData.request_code} has Been Rejected.`;
            emailBody = "Please Check Again at Academic Service Website.";
        }
        else if (form.data.status == "PENDING" && user.roleCode == 'HOD' && requestData.status == "PENDING") {
            nextRoleCode = 'ADM';
            currentStatus = "ONGOING";
            emailSubject = "This Request has Been Approved.";
            emailBody = `Request with Number ${requestData.request_code} Has Been Approved... Please Proceed to the Next Step`;
        }
        else if (form.data.status == "ONGOING" && user.roleCode == 'ADM' && requestData.status == "ONGOING") {
            currentStatus = "PROCESSING";
        }
        else if (form.data.status == "PROCESSING" && user.roleCode == 'ADM' && requestData.status == "PROCESSING") {
            nextRoleCode = 'STD';
            currentStatus = "COMPLETED";
            emailSubject = `Your Request with Number ${requestData.request_code} Has Been Processed`;
            emailBody = "Please Open Academic Service Website to View Your Request.";
        }
        else {
            return fail(400, { message: "Please Refresh to Retrieve Latest Data" });
        }

        const nextRoleResponse = (await supabase.from("role_db").select("id").eq("code", nextRoleCode));
        if(nextRoleResponse.error){
            return fail(400, {message:"Next Role Not Found... Please Check Role Master Data"});
        }

        let nextEmailResponse = supabase.from("user_credentials").select("email");
        if (nextRoleCode == 'ADM') {
            nextEmailResponse = nextEmailResponse.eq("role_id", nextRoleResponse.data[0].id).eq("major_id", user.majorId);
        } else if (nextRoleCode == 'STD') {
            nextEmailResponse = nextEmailResponse.eq("id", form.data.studentId);
        }

        const nextEmail = await nextEmailResponse;
        if (nextEmail.error) {
            return fail(400, { message: "Failed to fetch Data... Please Try Again" });
        }

        if (nextEmail.data.length == 0) {
            return fail(400, { message: "Head of Department / Admin not found... Please Contact Administrator" })
        }

        const sentToEmail = nextEmail.data[0].email;
        let fileUrl: string | File = "";
        let reason: string = form.data.reason;
        let approveFileOrReject: File | undefined = undefined;
        if (form.data.approvalFile || form.data.rejectFile) {
            if (form.data.approvalFile) {
                approveFileOrReject = form.data.approvalFile;
                reason = "";
            } else {
                approveFileOrReject = form.data.rejectFile;
            }

            const file = approveFileOrReject as File;
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileName = `${form.data.requestId}-${currentStatus}-${new Date().toISOString()}`.toString();
            const { error } = await supabase.storage.from("request_form_files")
                .upload(fileName, buffer, { contentType: "application/pdf" });

            if (error) {
                console.log(error);
                return fail(400, { message: "Server Error... Please Refresh and Try Again" })
            }

            fileUrl = supabase.storage.from("request_form_files").getPublicUrl(fileName).data.publicUrl;

        }

        const { data, error } = await supabase.rpc("update_request_with_history", {
            completion_file_url_param: fileUrl,
            created_by_id_param: user.userId,
            created_by_param: user.username,
            last_updated_by_id_param: user.userId,
            last_updated_by_param: user.username,
            reason_param: reason,
            request_id_param: form.data.requestId,
            status_param: currentStatus
        });

        if (error || !data) {
            console.log(error);

            console.error("Transaction failed:", error?.message);
            return fail(400, { message: "Server Error... Please Refresh and Try Again" });
        }

        // change the to email to sentToEmail variable
        if (currentStatus == "REJECTED" || currentStatus == "COMPLETED" || currentStatus == "ONGOING") {
            const resend = new Resend(RESEND_API_KEY);
            const response = await resend.emails.send({
                from: "no-reply@uph-academic-services.web.id",
                to: "kelvinrogue6@gmail.com",
                subject: emailSubject,
                html: `<p>${emailBody}</p>`
            })
            console.log(response.error);
        }
        return message(form, "Form Updated Successfully");
    }
}