import { sessionManager } from '$lib/server/sessionManager';
import { redirect } from '@sveltejs/kit';
import type { UserCookiesSchema } from './routes/home/user-schema';

export async function handle({ event, resolve }) {
    const user: UserCookiesSchema = (await sessionManager.getSession(await event.cookies)).data;
    if ((!user && (event.url.pathname.startsWith("/home") || event.url.pathname.startsWith("/user")))) {
        throw redirect(303, "/login");
    }
    else if (user && (event.url.pathname.startsWith("/login") || event.url.pathname.startsWith("/register") || event.url.pathname === "/")) {
        throw redirect(303, "/home")
    }
    else if (user && event.url.pathname.startsWith("/logout")) {
        sessionManager.deleteSession(event.cookies);
        sessionManager.deleteCookie(event.cookies);
        throw redirect(303, "/");
    }
    return resolve(event);
}