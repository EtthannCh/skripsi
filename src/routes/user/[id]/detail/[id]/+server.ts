import { sessionManager } from "$lib/server/sessionManager";
import { supabase } from "$lib/supabaseClient";
import { fail, json, type RequestHandler } from "@sveltejs/kit";
import type { UserCookiesSchema } from "../../../../home/user-schema";

export const POST: RequestHandler = async ({ cookies, request }) => {
    const user: UserCookiesSchema = (await sessionManager.getSession(await cookies)).data;
    const { status, requestId} = await request.json();
    if (!user || user.roleId == 3) {
        throw fail(400);
    }
    const userDataFromDb = await supabase.from("user_credentials").select("*").eq("user_id", user.userId);
    if (userDataFromDb.error || userDataFromDb.data.length == 0) {
        throw fail(400, { message: "User not Found" });
    }
    let levelApproval = "";

    switch (status) {
        case "PENDING":
            levelApproval = "FIRST_APPROVAL";
            break;
        case "AWAITING_APPROVAL":
            levelApproval = "SECOND_APPROVAL";
            break;
        case "APPROVED":
            levelApproval = "THRID_APPROVAL";
            break;
        default:
            break;
    }
    let currentStatus = "";
    if (status == "PENDING" && user.roleId != 1) {
        throw fail(400, { message: "Permission not Allowed" })
    }
    else if (status == "AWAITING_APPROVAL" && user.roleId != 2) {
        throw fail(400, { message: "Permission not Allowed" })
    }
    else if (status == "APPROVED" && user.roleId != 4) {
        throw fail(400, { message: "Permission not Allowed" })
    }
    if (status == "PENDING" && user.roleId == 1) {
        currentStatus = "AWAITING_APPROVAL";
    }
    else if(status == "AWAITING_APPROVAL" && user.roleId == 2){
        currentStatus = "APPROVED";
    }

    const insertApprovalToDb = await supabase.from("approval_db").insert({
        request_id: requestId,
        type: levelApproval,
        created_by_id: user.userId,
        created_by: user.username,
    })
    if (insertApprovalToDb.error) {
        console.log(insertApprovalToDb.error);
        throw fail(400, { message: "Failed Insert to Approval Database" });
    }

    const insertRequestHistoryDb = await supabase.from("request_history_db").insert({
        request_id: requestId,
        created_by_id: user.userId,
        created_by: user.username,
    })
    if (insertRequestHistoryDb.error) {
        console.log(insertRequestHistoryDb.error);
        await supabase.from("approval_db").delete().eq("request_id", requestId);
        throw fail(400, { message: "Failed Insert to Request History Database" });
    }

    const updateRequestStatus = await supabase.from("request_db").update({
        status: currentStatus,
        last_updated_by_id: user.userId,
        last_updated_by: user.username
    }).eq("id", requestId);
    if (updateRequestStatus.error) {
        console.log(updateRequestStatus.error);
        throw fail(400, { message: "Failed to Update Request Status" })
    }

    return json({ message: "Successfully Updated", status: "200" })
}