import { sessionManager } from "$lib/server/sessionManager";
import { supabase } from "$lib/supabaseClient";
import { fail } from "sveltekit-superforms";
import type { MajorDbSchema, UserCookiesSchema } from "./home/request-user-schema";

export const load = async ({ cookies }) => {
    const userResponse = (await sessionManager.getSession(cookies)).data;
    const user: UserCookiesSchema = userResponse
    const majorDbResponse = await supabase.from("major_db").select("*").eq("id", user.majorId);
    if (majorDbResponse.error) {
        console.log(majorDbResponse.error);
        throw fail(400);
    }

    const majorDb: MajorDbSchema = majorDbResponse.data[0];
    return {
        majorDb
    }
}