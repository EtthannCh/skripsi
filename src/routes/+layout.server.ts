import { sessionManager } from "$lib/server/sessionManager.js";
import type { UserCookiesSchema } from "./home/user-schema.js";

export const load = async ({ cookies }) => {
    const user = (await sessionManager.getSession(cookies))?.data;
    const isLoggedIn = !!user;
    let loggedInUser: UserCookiesSchema | undefined = undefined;
    if (user) {
        loggedInUser = user ?? "";
    }
    return {
        isLoggedIn,
        user: loggedInUser
    }
}