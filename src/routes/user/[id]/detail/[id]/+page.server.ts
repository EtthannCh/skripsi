import { supabase } from '$lib/supabaseClient.js';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { RequestDbSchema } from '../../../../home/request-user-schema';
import type { RequestHistorySchema, UserDetailSchema } from './user-detail-schema';
import { approveRejectSchema } from './user-detail-schema';

export const load = async ({ url }) => {
    const userPkey: string = url.pathname.split("/")[2];
    const requestFormId: string = url.pathname.split("/")[4];

    const userDataFromDb = await supabase.from("user_credentials").select("id, username, email").eq("id", userPkey);
    const requestDataFromDb = await supabase.from("request_db").select("*").eq("id", requestFormId);
    const requestHistoryDataFromDb = await supabase.from("request_history_db").select("*").eq("request_id", requestFormId);
    const form = await superValidate(zod(approveRejectSchema));
    if (userDataFromDb.error) {
        console.log(userDataFromDb.error);
        return fail(400, { message: "Invalid User Data" })
    }
    if (requestDataFromDb.error) {
        console.log(requestDataFromDb.error);
        return fail(400, { message: "Invalid Request Data" })
    }
    if (requestHistoryDataFromDb.error) {
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