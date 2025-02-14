import { query } from "$lib/db";

export async function GET() {
    try {
        const rows = await query("SELECT * FROM form_db");
        return new Response(JSON.stringify(rows), {
            headers: {
                'Content-Type': "application/json"
            }
        })

    } catch (error) {
        console.log(error);
        ;
    }
}