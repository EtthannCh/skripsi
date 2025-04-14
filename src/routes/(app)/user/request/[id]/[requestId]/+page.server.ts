import { supabase } from "$lib/supabaseClient.js";
import { error, fail } from "@sveltejs/kit";
import type { RequestHistorySchema } from "../../../[id]/detail/[id]/user-detail-schema.js";
import { sessionManager } from "$lib/server/sessionManager.js";
import type { UserCookiesSchema } from "../../../../home/request-user-schema.js";

export const load = async ({ params, cookies }) => {
    const userCookies: UserCookiesSchema = (await sessionManager.getSession(cookies)).data;
    if (userCookies.roleId != 3) {
        throw error(401, "Unauthorized");
    }

    const id: number = +params.requestId
    const userRequestHistoryResponse = await supabase.from("request_history_db").select("*").eq("request_id", id);
    if (userRequestHistoryResponse.error) {
        console.log(userRequestHistoryResponse.error);
        throw fail(400);
    }
    const userApprovalOrRejectFileResponse = await supabase.from("request_db").select("completion_file_url, reason, status, request_code").eq("id", id);
    if (userApprovalOrRejectFileResponse.error) {
        throw fail(400, { message: "Error Fetch" })
    }

    const userRequestHistoryFromDb: RequestHistorySchema[] = JSON.parse(JSON.stringify(userRequestHistoryResponse.data));
    const userApprovalOrRejectFileUrl = JSON.parse(JSON.stringify(userApprovalOrRejectFileResponse.data[0]));
    return {
        userRequestHistory: userRequestHistoryFromDb,
        userApprovalOrRejectFileUrl,
    }
}