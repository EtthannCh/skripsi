
export async function POST() {
    try {
        return new Response(null, {
            status: 303,
            headers: { Location: "/" }
        });
    } catch (error) {
        console.log(error);
        ;
    }
}