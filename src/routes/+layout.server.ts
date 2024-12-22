import type { UserCookiesSchema } from "./home/user-schema.js";

export const load = async ({ cookies }) => {
    const user = cookies.get("user");
    const isLoggedIn = !!user;
    let loggedInUser: UserCookiesSchema | undefined = undefined;
    if (user) {
        loggedInUser = JSON.parse(user ?? "");
    }
    return {
        isLoggedIn,
        user: loggedInUser
    }
}