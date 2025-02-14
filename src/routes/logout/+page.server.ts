import { redirect } from '@sveltejs/kit';

export const load = async ({cookies}) => {
    const user = cookies.get("user");
    if(user){
        await cookies.delete("user", {path:"/home"})
        return redirect(303, "/login")
    }
}