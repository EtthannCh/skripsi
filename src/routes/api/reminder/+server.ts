import { RESEND_API_KEY } from "$env/static/private";
import { supabase } from "$lib/supabaseClient";
import { Resend } from "resend";
import type { RequestDbSchema } from "../../(app)/home/request-user-schema";

export async function GET() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const requestPendingDataResponse = await supabase
        .from('request_db')
        .select('*')
        .eq('status', 'PENDING')
        .lt('created_at', oneHourAgo);

    const requestPendingData: RequestDbSchema[] = JSON.parse(JSON.stringify(requestPendingDataResponse.data));
    for (const request of requestPendingData) {
        // resend to head of department respectively
        const findKaprodiResponse = await supabase.from("user_credentials").select("email")
            .eq("major_id", request.major_id)
            .eq("role_id", 1);
        if (findKaprodiResponse.error || findKaprodiResponse.data.length == 0) {
            console.log("Kaprodi Not Found");
            continue;
        }
        const kaprodi = findKaprodiResponse.data[0].email;

        const resend = new Resend(RESEND_API_KEY);
        const response = await resend.emails.send({
            from: "no-reply@uph-academic-services.web.id",
            to: "kelvinrogue6@gmail.com",
            subject: 'Reminder: Form Needs Approval',
            text: `From : ${kaprodi}... Form Request with Code ${request.request_code} has not been approved since ${new Date(request.created_at).toLocaleDateString("id-Id", { day: "2-digit", month: "long", year: "numeric" })}`
        })
        console.log(response.error);
    }

    const requestOngoingProcessingDataResponse = await supabase
        .from('request_db')
        .select('*')
        .in('status', ["ONGOING", "PROCESSING"])
        .lt('created_at', oneHourAgo);

    const requestOngoingProcessingData: RequestDbSchema[] = JSON.parse(JSON.stringify(requestOngoingProcessingDataResponse.data));
    for (const request of requestOngoingProcessingData) {
        // resend to admin respectively
        const findAdminResponse = await supabase.from("user_credentials").select("email")
            .eq("major_id", request.major_id)
            .eq("role_id", 2);
        if (findAdminResponse.error || findAdminResponse.data.length == 0) {
            console.log("Kaprodi Not Found");
            continue;
        }
        const admin = findAdminResponse.data[0].email;

        const resend = new Resend(RESEND_API_KEY);
        const response = await resend.emails.send({
            from: "no-reply@uph-academic-services.web.id",
            to: "kelvinrogue6@gmail.com",
            subject: 'Reminder: Form Needs Processing',
            text: `From : ${admin}... Form Request with Code ${request.request_code} has not been processed since ${new Date(request.created_at).toLocaleDateString("id-Id", { day: "2-digit", month: "long", year: "numeric" })}`
        })
        console.log(response.error);
    }

    return new Response('Reminders processed');
}