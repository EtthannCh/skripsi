import { supabase } from '$lib/supabaseClient.js';
import { fail } from '@sveltejs/kit';
import type { UserDetailSchema } from './user-detail-schema';

export const load = async ({ url }) => {
    const userPkey: string = url.pathname.split("/")[2];
    const requestFormId: string = url.pathname.split("/")[4];

    const userDataFromDb = await supabase.from("user_credentials").select("id, username, email").eq("id", userPkey);
    if (userDataFromDb.error) {
        console.log(userDataFromDb.error);
        return fail(400, { message: "Invalid Data" })
    }
    const userData: UserDetailSchema = userDataFromDb.data[0];
    return {
        userData
    }
}