import { sessionManager } from "$lib/server/sessionManager.js";
import { supabase } from "$lib/supabaseClient.js";
import { fail } from "@sveltejs/kit";
import type { MajorDbSchema, UserCookiesSchema } from "./home/request-user-schema.js";

export const load = async ({ cookies }) => {
    const user = (await sessionManager.getSession(cookies))?.data;
    const isLoggedIn = !!user;
    let loggedInUser: UserCookiesSchema | undefined = undefined;
    if (user) {
        loggedInUser = user ?? "";
    }
    let majorDb: MajorDbSchema | undefined = undefined;
    if (loggedInUser) {
        const majorDbResponse = await supabase.from("major_db").select("*").eq("id", loggedInUser?.majorId);
        if (majorDbResponse.error) {
            console.log(majorDbResponse.error);
            throw fail(400);
        }

        majorDb = majorDbResponse.data[0];
    }
    return {
        isLoggedIn,
        user: loggedInUser,
        majorDb
    }
}