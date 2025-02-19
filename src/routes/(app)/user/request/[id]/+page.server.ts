import { sessionManager } from '$lib/server/sessionManager';
import { supabase } from '$lib/supabaseClient';
import type { UserCookiesSchema } from '../../../home/request-user-schema';
import type { RequestHistorySchema, UserRequestSchema } from '../../[id]/detail/[id]/user-detail-schema';

export const load = async ({ cookies, url }) => {
    const userCookies: UserCookiesSchema = (await sessionManager.getSession(cookies)).data;
    const pages = Number(url.searchParams.get("pages") ?? 0);
    const status = url.searchParams.get("status") ?? "";

    let userRequestResponse = supabase.from("request_db").select(
        `
        id, status, form_db!inner(code, name), reason, form_url, last_updated_by, request_code, created_at
        `
    )
        .eq("user_id", userCookies.userId)
        .order("request_code", { ascending: true })
        .range(pages * 6, (pages + 1) * 6)
        .limit(6);
    let totalRequestDbPerUserResponse = (supabase.from("request_db").select(`
            id, status, form_db!inner(code, name), reason, form_url, last_updated_by, request_code, created_at
            `, { count: 'exact' }).eq("user_id", userCookies.userId));
    if (status != "") {
        userRequestResponse = userRequestResponse.eq("status", status)
        totalRequestDbPerUserResponse = totalRequestDbPerUserResponse.eq("status", status);
    }

    const userRequest = await userRequestResponse;
    const totalRequest = (await totalRequestDbPerUserResponse).count;
    const userRequestFromDb: UserRequestSchema[] = JSON.parse(JSON.stringify(userRequest.data));
    const requestIdArray = userRequestFromDb.map((v) => v.id);


    const userRequestHistoryResponse = await supabase.from("request_history_db").select(
        `id, request_id, created_by, created_by_id, created_at, file_url`
    ).in("request_id", requestIdArray).order("request_id", { ascending: true });
    const userRequestHistoryFromDb: RequestHistorySchema[] = JSON.parse(JSON.stringify(userRequestHistoryResponse.data));

    return {
        data: {
            userRequestHistoryFromDb,
            userRequestFromDb,
            totalCount: totalRequest
        }
    }
}