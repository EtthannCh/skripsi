import { z } from "zod";

export const userDetailSchema = z.object({
    id: z.number(),
    username: z.string(),
    email: z.string()
})

export type UserDetailSchema = z.infer<typeof userDetailSchema>;