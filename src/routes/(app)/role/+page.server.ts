import { sessionManager } from "$lib/server/sessionManager";
import { supabase } from "$lib/supabaseClient";
import { error, redirect, type Actions } from "@sveltejs/kit";
import { fail, message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { UserCookiesSchema } from "../home/request-user-schema";
import type { PageServerLoad } from "./$types";
import { updateRoleSchema, type EmailList, type MajorList, type RoleList } from "./change-role-schema";

export const load: PageServerLoad = async ({ cookies }) => {
    const user: UserCookiesSchema = (await sessionManager.getSession(await cookies)).data;
    if (user.roleId != 6) {
        throw error(401, "Unauthorized");
    }

    const emailListResponse = await supabase.from("user_credentials").select("email, id, role_id, username, major_id")
        .in("role_id", ["1", "2", "5"]).order("email", { ascending: true });
    if (emailListResponse.error) {
        throw redirect(304, "/error")
    }

    const roleListResponse = await supabase.from("role_db").select("id, name")
        .in("id", ["1", "2", "5"]).order("name", { ascending: true });
    if (roleListResponse.error) {
        throw fail(400, { message: "Invalid Data" })
    }
    const form = await superValidate(zod(updateRoleSchema));

    const majorListResponse = await supabase.from("major_db").select("id, name").order("name", { ascending: true }).limit(6);
    if (majorListResponse.error) {
        throw redirect(304, "/error");
    }

    const emailList: EmailList[] = emailListResponse.data;
    const roleList: RoleList[] = roleListResponse.data;
    const majorList: MajorList[] = majorListResponse.data;
    return {
        form,
        emailList,
        roleList,
        majorList
    }
}

export const actions = {
    submit: async ({ request, cookies }) => {
        if (!cookies) {
            throw redirect(304, "/login");
        }

        const form = await superValidate(request, zod(updateRoleSchema));
        if (!form.valid) {
            return fail(400, { data: form, message: "Invalid Form" })
        }

        const userCookies: UserCookiesSchema = (await sessionManager.getSession(cookies)).data;
        if (userCookies.roleId != 6) {
            return fail(400, { data: form, message: "Invalid Role" })
        }

        if (["1", "2"].includes(form.data.roleId)) {
            const existingUser = await supabase.from("user_credentials").select("id")
                .eq("major_id", form.data.majorId)
                .eq("role_id", form.data.roleId)
            if (existingUser.error) {
                return fail(400, { data: form, message: "Server Error... Please try again later" })
            }

            if (existingUser.data.length > 0) {
                return fail(400, { data: form, message: "User with Selected Major / Role Already exists" })
            }
        }

        const { error } = await supabase.from("user_credentials").update({
            role_id: form.data.roleId,
            major_id: form.data.majorId
        }).eq("id", form.data.email);
        if (error) {
            console.log(error);
            return fail(400, { data: form, message: "Update Failed.. Checked Again" });
        }

        return message(form, "Successfully Updated")
    }
} satisfies Actions