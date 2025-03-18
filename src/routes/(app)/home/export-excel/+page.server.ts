import { sessionManager } from "$lib/server/sessionManager";
import { supabase } from "$lib/supabaseClient";
import { redirect } from "@sveltejs/kit";
import type { ExcelTableSchema, UserCookiesSchema } from "../request-user-schema";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, cookies }) => {
    const filter: string = url.searchParams.get("filter") ?? "";
    const startDate: string = url.searchParams.get("startDate") ?? "";
    const endDate: string = url.searchParams.get("endDate") ?? "";
    const formId: string = url.searchParams.get("formId") ?? "";
    const status: string = url.searchParams.get("status") ?? "";
    const majorId: string = url.searchParams.get("major") ?? "";

    const userCookies: UserCookiesSchema = (await sessionManager.getSession(cookies)).data;
    if (userCookies.majorId != Number(majorId)) {
        throw redirect(307, "/error/unauthorized")
    }

    let query = supabase.rpc("export_to_excel_table", {
        start_date: startDate,
        end_date: endDate,
        major_id_param:userCookies.majorId
    }).limit(10);
    
    if (filter.length > 0) {
        query = query.or(`created_by.ilike.${filter},request_code.ilike.${filter}`);
    }
    if (status.length > 0) {
        query = query.eq("status", status);
    }
    if (formId.length > 0) {
        query = query.eq("form_id", formId);
    }

    const exportTableData: ExcelTableSchema[] = (await query).data;
    return {
        exportTableData
    }

}