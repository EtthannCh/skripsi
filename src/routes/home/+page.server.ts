import axios from "axios";
import type { PageServerLoad } from "./$types";
import type { UserSchema } from "./user-schema";

export const load: PageServerLoad = async () => {
    const response = await axios.get("http:localhost:5173/api/users");
    const data : UserSchema[] = response.data;
    return {
        data:data
    };
}