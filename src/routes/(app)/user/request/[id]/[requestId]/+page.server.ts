import { supabase } from "$lib/supabaseClient.js";
import { fail } from "@sveltejs/kit";
import type { RequestHistorySchema } from "../../../[id]/detail/[id]/user-detail-schema.js";

export const load = async ({ params }) => {
    const id: number = +params.requestId
    const userRequestHistoryResponse = await supabase.from("request_history_db").select("*").eq("request_id", id);
    if (userRequestHistoryResponse.error) {
        console.log(userRequestHistoryResponse.error);
        throw fail(400);
    }
    const userApprovalOrRejectFileResponse = await supabase.from("request_db").select("completion_file_url,status").eq("id", id);
    if(userApprovalOrRejectFileResponse.error){
        throw fail(400, {message:"Error Fetch"})
    }
    const userRequestHistoryFromDb: RequestHistorySchema[] = JSON.parse(JSON.stringify(userRequestHistoryResponse.data));
    const userApprovalOrRejectFileUrl = JSON.parse(JSON.stringify(userApprovalOrRejectFileResponse.data[0]));
    return {
        userRequestHistory: userRequestHistoryFromDb,
        userApprovalOrRejectFileUrl
    }
}