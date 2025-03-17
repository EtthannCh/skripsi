import { supabase } from "$lib/supabaseClient";
import type { ExcelTableSchema } from "../request-user-schema";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
    const filter: string = url.searchParams.get("filter") ?? "";
    const startDate: string = url.searchParams.get("startDate") ?? "";
    const endDate: string = url.searchParams.get("endDate") ?? "";
    const formId: string = url.searchParams.get("formId") ?? "";
    const status: string = url.searchParams.get("status") ?? "";

    let query = supabase.rpc("export_to_excel_table", {
        start_date: startDate,
        end_date: endDate
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

    const exportTableData : ExcelTableSchema[] = (await query).data;
    return {
        exportTableData
    }

}