import { supabase } from "$lib/supabaseClient";
import { json } from "@sveltejs/kit";
import type { RequestDbSchema } from "../../(app)/home/request-user-schema";

export async function GET({ url }) {
    const majorCode = url.searchParams.get("majorCode") ?? "";
    const roleCode = url.searchParams.get("roleCode") ?? "";
    console.log(majorCode, roleCode);

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const majorDataResponse = await supabase.from("major_db").select("id").eq("code", majorCode)
    if (majorDataResponse.error || majorDataResponse.data.length == 0) {
        console.log(majorDataResponse.error);
        return json({ "message": "major not found" });
    }
    const majorId = majorDataResponse.data[0].id;

    // const roleIdResponse = (await supabase.from("role_db").select("id").eq("code", 'HOD'));
    // if (roleIdResponse.error) {
    //     return json({ "message": "Role Not Found... Please Check Role Master Data" });
    // }


    const requestPendingDataResponse = await supabase
        .from('request_db')
        .select(
            `id, status, user_id, form_id, request_code, major_id,
            reason, created_by, created_at, form_db(code, name) ,user_credentials(email, user_pkey:id),form_url
            `
        )
        .eq('status', 'PENDING')
        .eq("major_id", majorId);
        // .lt('created_at', oneHourAgo);


    const requestPendingData: RequestDbSchema[] = JSON.parse(JSON.stringify(requestPendingDataResponse.data));
    // for (const request of requestPendingData) {
    //     // resend to head of department respectively
    //     const findKaprodiResponse = await supabase.from("user_credentials").select("email")
    //         .eq("major_id", majorId)
    //         .eq("role_id", roleId);
    //     if (findKaprodiResponse.error || findKaprodiResponse.data.length == 0) {
    //         console.log("Kaprodi Not Found");
    //         continue;
    //     }
    //     const kaprodi = findKaprodiResponse.data[0].email;

    //     const resend = new Resend(RESEND_API_KEY);
    //     const response = await resend.emails.send({
    //         from: "no-reply@uph-academic-services.web.id",
    //         to: "kelvinrogue6@gmail.com",
    //         subject: 'Reminder: Form Needs Approval',
    //         text: `From : ${kaprodi}... Form Request with Code ${request.request_code} has not been approved since ${new Date(request.created_at).toLocaleDateString("id-Id", { day: "2-digit", month: "long", year: "numeric" })}`
    //     })
    //     console.log(response.error);
    // }

    const requestOngoingProcessingDataResponse = await supabase
        .from('request_db')
        .select(
            `id, status, user_id, form_id, request_code, major_id,
            reason, created_by, created_at, form_db(code, name) ,user_credentials(email, user_pkey:id),form_url
            `
        )
        .eq("major_id", majorId)
        .in('status', ["ONGOING", "PROCESSING"]);
        // .lt('created_at', oneHourAgo);

    const requestOngoingProcessingData: RequestDbSchema[] = JSON.parse(JSON.stringify(requestOngoingProcessingDataResponse.data));
    // for (const request of requestOngoingProcessingData) {
    //     // resend to admin respectively
    //     const findAdminResponse = await supabase.from("user_credentials").select("email")
    //         .eq("major_id", request.major_id)
    //         .eq("role_id", 2);
    //     if (findAdminResponse.error || findAdminResponse.data.length == 0) {
    //         console.log("Kaprodi Not Found");
    //         continue;
    //     }
    //     const admin = findAdminResponse.data[0].email;

    //     const resend = new Resend(RESEND_API_KEY);
    //     const response = await resend.emails.send({
    //         from: "no-reply@uph-academic-services.web.id",
    //         to: "kelvinrogue6@gmail.com",
    //         subject: 'Reminder: Form Needs Processing',
    //         text: `From : ${admin}... Form Request with Code ${request.request_code} has not been processed since ${new Date(request.created_at).toLocaleDateString("id-Id", { day: "2-digit", month: "long", year: "numeric" })}`
    //     })
    //     console.log(response.error);
    // }

    if (roleCode == 'HOD') {
        return json({ pendingData: requestPendingData })
    }
    else if (roleCode == 'ADM') {
        return json({ pendingData: requestOngoingProcessingData })
    }
}