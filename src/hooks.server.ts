import { sessionManager } from '$lib/server/sessionManager';
import { redirect } from '@sveltejs/kit';
import type { UserCookiesSchema } from './routes/(app)/home/request-user-schema';

export async function handle({ event, resolve }) {
    const userResponse = await sessionManager.getSession(await event.cookies);
    if (userResponse.error) {
        console.log(userResponse.message);
    }

    const user: UserCookiesSchema = userResponse.data;

    if ((!user && (event.url.pathname.startsWith("/home") || event.url.pathname.startsWith("/user") || event.url.pathname.startsWith("/role")))) {
        throw redirect(303, "/login");
    }

    if (user && (event.url.pathname.startsWith("/login") || event.url.pathname.startsWith("/register") || event.url.pathname === "/")) {
        throw redirect(303, "/home")
    }
    else if (user && event.url.pathname.startsWith("/logout")) {
        sessionManager.deleteCookie(event.cookies);
        sessionManager.deleteSession(event.cookies);
        throw redirect(303, "/");
    }
    return await resolve(event);
}