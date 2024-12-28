import { fail, json, type RequestHandler } from "@sveltejs/kit";
import type { UserCookiesSchema } from "./user-schema";
import { supabase } from "$lib/supabaseClient";

export const POST: RequestHandler = async ({ cookies, request }) => {
    const user: UserCookiesSchema = JSON.parse(cookies.get("user") ?? "");
    const { status, id } = await request.json();
    if (!user || user.roleId == 3) {
        throw fail(400);
    }
    const { error } = await supabase.from("request_db").update({ status: status, id: id });
    if (error) {
        console.log(error);
        throw fail(400, { message: "Update Unsuccessfull" })
    }
    return json({ message: "Successfully Updated" })
}