import { sessionManager } from "$lib/server/sessionManager";
import { supabase } from "$lib/supabaseClient";
import { error, fail } from "@sveltejs/kit";
import type { ExcelTableSchema, FormSchema, UserCookiesSchema } from "../request-user-schema";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, cookies }) => {
    const filter: string = url.searchParams.get("filter")?.trim() ?? "";
    const startDate: string = url.searchParams.get("startDate") ?? "";
    const endDate: string = url.searchParams.get("endDate") ?? "";
    const formId: string = url.searchParams.get("form") ?? "";
    const status: string = url.searchParams.get("status") ?? "";
    const majorId: string = url.searchParams.get("major") ?? "";

    const userCookies: UserCookiesSchema = (await sessionManager.getSession(cookies)).data;
    if (userCookies.majorId != Number(majorId)) {
        throw error(401, "Unauthorized")
    }

    let query = supabase.rpc("export_to_excel_table", {
        start_date: startDate,
        end_date: endDate,
        major_id_param: userCookies.majorId,
        filter_param: filter
    }).limit(10);

    let formListQuery = supabase.from("form_db").select("*");
    if (status.length > 0) {
        query = query.eq("status", status);
    }
    if (formId.length > 0) {
        formListQuery = formListQuery.eq("id", formId)
        query = query.eq("form_id", formId);
    }

    const formListResponse = await formListQuery;
    if (formListResponse.error) {
        throw fail(400, { message: "Server Error" });
    }
    const formList: FormSchema[] = formListResponse.data;

    const exportTableData: ExcelTableSchema[] = (await query).data;
    return {
        exportTableData,
        formList
    }

}