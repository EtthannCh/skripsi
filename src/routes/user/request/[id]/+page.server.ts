import { sessionManager } from '$lib/server/sessionManager'
import { supabase } from '$lib/supabaseClient';
import type { RequestDbSchema, UserCookiesSchema } from '../../../home/user-schema'

export const load = async ({ cookies }) => {
    const userCookies: UserCookiesSchema = (await sessionManager.getSession(cookies)).data;
    const userRequestResponse = await supabase.from("request_db").select("*").eq("user_id", userCookies.userId);
    const userRequestFromDb: RequestDbSchema[] = userRequestResponse.data ?? [];

    return {
        data: userRequestFromDb
    }
}