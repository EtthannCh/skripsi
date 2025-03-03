import { IoRedisSessionStore } from "@ethercorps/sveltekit-redis-session";
import Redis from "ioredis";
import { REDIS_KEY, REDIS_URL } from "$env/static/private";

const options = (maxAge: number, prefix: string, cookieName: string) => {
    return {
        redisClient: new Redis(REDIS_URL),
        secret: REDIS_KEY,
        cookieName,
        prefix,
        httpOnly: true,
        cookiesOptions: {
            maxAge: maxAge * 60
        },
        path: "/"

    }
}
export const OtpSessionManager = new IoRedisSessionStore(options(5, "otpSession", "otpSession"))
export const sessionManager = new IoRedisSessionStore(options(60, "session", "userSession"));