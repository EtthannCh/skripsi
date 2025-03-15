import { supabase } from '$lib/supabaseClient';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    const { filter, startDate, endDate, formId, status } = await request.json();

    let query = supabase.rpc("export_to_excel_table", {
        start_date: startDate,
        end_date: endDate
    });
    if (filter.length > 0) {
        query = query.or(`created_by.ilike.${filter},request_code.ilike.${filter}`);
    }
    if (status.length > 0) {
        query = query.eq("status", status);
    }
    if (formId.length > 0) {
        query = query.eq("form_id", formId);
    }

    const data = (await query).data;
    return json(data);

}