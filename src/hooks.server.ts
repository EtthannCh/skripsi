import { redirect } from '@sveltejs/kit';

export async function handle({ event, resolve }) {
    const user = event.cookies.get("user");
    if (!user && event.url.pathname.startsWith("/home")) {
        throw redirect(303, "/login");
    }
    else if (user && (event.url.pathname.startsWith("/login") || event.url.pathname.startsWith("/register"))) {
        throw redirect(303, "/home")
    }
    else if (user && event.url.pathname.startsWith("/logout")) {
        event.cookies.delete("user", { path: "/" })
        throw redirect(303, "/");
    }
    return resolve(event);
}