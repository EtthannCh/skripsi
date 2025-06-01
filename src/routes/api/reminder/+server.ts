import { supabase } from "$lib/supabaseClient";
import { json } from "@sveltejs/kit";
import type { RequestDbSchema } from "../../(app)/home/request-user-schema";

export async function GET({ url }) {
    const majorCode = url.searchParams.get("majorCode") ?? "";
    const roleCode = url.searchParams.get("roleCode") ?? "";

    const majorDataResponse = await supabase.from("major_db").select("id").eq("code", majorCode)
    if (majorDataResponse.error || majorDataResponse.data.length == 0) {
        console.log(majorDataResponse.error);
        return json({ "message": "major not found" });
    }
    const majorId = majorDataResponse.data[0].id;

    const requestPendingDataResponse = await supabase
        .from('request_db')
        .select(
            `id, status, user_id, form_id, request_code, major_id,
            reason, created_by, created_at, form_db(code, name) ,user_credentials(email, user_pkey:id),form_url
            `
        )
        .eq('status', 'PENDING')
        .eq("major_id", majorId)
        .order("created_at" ,{ascending:true})
        ;

    const requestPendingData: RequestDbSchema[] = JSON.parse(JSON.stringify(requestPendingDataResponse.data));

    const requestOngoingProcessingDataResponse = await supabase
        .from('request_db')
        .select(
            `id, status, user_id, form_id, request_code, major_id,
            reason, created_by, created_at, form_db(code, name) ,user_credentials(email, user_pkey:id),form_url
            `
        )
        .eq("major_id", majorId)
        .order("created_at" ,{ascending:true})
        .in('status', ["ONGOING", "PROCESSING"]);

    const requestOngoingProcessingData: RequestDbSchema[] = JSON.parse(JSON.stringify(requestOngoingProcessingDataResponse.data));

    if (roleCode == 'HOD') {
        return json({ pendingData: requestPendingData })
    }
    else if (roleCode == 'ADM') {
        return json({ pendingData: requestOngoingProcessingData })
    } else {
        return json({})
    }
}