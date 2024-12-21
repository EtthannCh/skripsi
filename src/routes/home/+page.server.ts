import axios from "axios";
import type { PageServerLoad } from "./$types";
import type { FormSchema } from "./user-schema";

export const load: PageServerLoad = async () => {
    const response = await axios.get("http:localhost:5173/api/users");
    const data : FormSchema[] = response.data;
    return {
        data:data
    };
}