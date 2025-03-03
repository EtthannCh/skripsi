import { sessionManager } from "$lib/server/sessionManager";
import { supabase } from "$lib/supabaseClient";
import { type Actions } from "@sveltejs/kit";
import { fail, message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { UserCookiesSchema } from "../home/request-user-schema";
import type { PageServerLoad } from "./$types";
import { updateRoleSchema, type EmailList, type RoleList } from "./change-role-schema";

export const load: PageServerLoad = async () => {

    const emailListResponse = await supabase.from("user_credentials").select("email, id").eq("role_id", "1");
    if (emailListResponse.error) {
        throw fail(400, { message: "Invalid Data" })
    }

    const roleListResponse = await supabase.from("role_db").select("id, name");
    if (roleListResponse.error) {
        throw fail(400, { message: "Invalid Data" })
    }
    const form = await superValidate(zod(updateRoleSchema));

    const emailList: EmailList[] = emailListResponse.data;
    const roleList: RoleList[] = roleListResponse.data;
    return {
        form,
        emailList,
        roleList
    }
}

export const actions = {
    submit: async ({ request, cookies }) => {
        const userCookies: UserCookiesSchema = (await sessionManager.getSession(cookies)).data;
        const form = await superValidate(request, zod(updateRoleSchema));
        if (userCookies.roleId != 6) {
            return fail(400, { data: form, message: "Invalid Role" })
        }
        if (!form.valid) {
            return fail(400, { data: form, message: "Invalid Form" })
        }

        const { error } = await supabase.from("user_credentials").update({
            role_id: form.data.roleId
        }).eq("id", form.data.email);
        if (error) {
            console.log(error);
            return fail(400, { data: form, message: "Update Failed.. Checked Again" });
        }
        return message(form, "Successfully Updated")
    }
} satisfies Actions