import { RESEND_API_KEY } from "$env/static/private";
import { supabase } from "$lib/supabaseClient";
import { Resend } from "resend";
import type { RequestDbSchema } from "../../(app)/home/request-user-schema";

export async function GET() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const requestDataResponse = await supabase
        .from('request_db')
        .select('*')
        .eq('status', 'PENDING')
        .lt('created_at', oneHourAgo);

    const requestData: RequestDbSchema[] = JSON.parse(JSON.stringify(requestDataResponse.data));
    for (const request of requestData) {
        const resend = new Resend(RESEND_API_KEY);
        const response = await resend.emails.send({
            from: "no-reply@uph-academic-services.web.id",
            to: "kelvinrogue6@gmail.com",
            subject: 'Reminder: Form Needs Processing',
            text: `Form Request with Code ${request.request_code} has not been processed since ${new Date(request.created_at).toLocaleDateString("id-Id", { day: "2-digit", month: "long", year: "numeric" })}`
        })
        console.log(response.error);

    }

    
    
    return new Response('Reminders processed');
}