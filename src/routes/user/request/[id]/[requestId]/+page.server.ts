import { supabase } from "$lib/supabaseClient"
import { fail } from "@sveltejs/kit";
import type { RequestHistorySchema } from "../../../[id]/detail/[id]/user-detail-schema.js";

export const load = async ({ params }) => {
    const id: number = +params.requestId
    const userRequestHistoryResponse = await supabase.from("request_history_db").select("*").eq("request_id", id);
    if (userRequestHistoryResponse.error) {
        console.log(userRequestHistoryResponse.error);
        throw fail(400);
    }
    const userRequestHistoryFromDb : RequestHistorySchema[] = userRequestHistoryResponse.data;
    return {
        userRequestHistory:userRequestHistoryFromDb
    }
}