import { IoRedisSessionStore } from "@ethercorps/sveltekit-redis-session";
import Redis from "ioredis";
import { REDIS_KEY, REDIS_URL } from "$env/static/private";

const options = {
    redisClient: new Redis(REDIS_URL),
    secret: REDIS_KEY,
    cookieName: "session",
    prefix: 'sk-session',
    httpOnly: true,
    cookiesOptions: {
        maxAge: 5 * 60
    },
    path: "/"
}

export const sessionManager = new IoRedisSessionStore(options);