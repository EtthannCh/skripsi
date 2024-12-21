export const load = async ({ cookies }) => {
    const user = cookies.get("user");
    const isLoggedIn = !!user;

    return {
        isLoggedIn
    }
}