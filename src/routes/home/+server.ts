import { fail, json, type RequestHandler } from "@sveltejs/kit";
import type { UserCookiesSchema } from "./user-schema";
import { supabase } from "$lib/supabaseClient";

export const POST: RequestHandler = async ({ cookies, request }) => {
    const user: UserCookiesSchema = JSON.parse(cookies.get("user") ?? "");
    const { status, id } = await request.json();
    if (!user || user.roleId == 3) {
        throw fail(400);
    }
    if (user.roleId == 1) {
        const { error } = await supabase.from("request_db").update(
            {
                status: status, id: id,
                first_approver_id: user.userId,
                first_approver_name: user.username,
                first_approved_at: new Date().toLocaleDateString()
            }).eq("id", id);
        if (error) {
            console.log(error);
            throw fail(400, { message: "Update Unsuccessfull" })
        }
    }
    else if (user.roleId == 2) {
        const { error } = await supabase.from("request_db").update(
            {
                status: status, id: id,
                second_approver_id: user.userId,
                second_approver_name: user.username,
                second_approved_at: new Date().toLocaleDateString()
            }).eq("id", id);
        if (error) {
            console.log(error);
            throw fail(400, { message: "Update Unsuccessfull" })
        }
    }
    return json({ message: "Successfully Updated", status: "200" })
}