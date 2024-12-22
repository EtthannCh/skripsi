
export async function POST({ cookies }) {
    try {
        cookies.delete("user", { path: "/" });
        console.log("tes");
        return new Response(null, {
            status: 303,
            headers: { Location: "/" }
        });
    } catch (error) {
        console.log(error);
        ;
    }
}