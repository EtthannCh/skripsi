import { z } from "zod";

export const userSchema = z.object({
    id: z.number(),
    userId: z.string(),
    username: z.string().max(100),
    password: z.string().max(200),
    email: z.string().max(200)
});

export type UserSchema = z.infer<typeof userSchema>;

export const formSchema = z.object({
    id: z.number(),
    name: z.string(),
    code: z.string(),
    description: z.string().optional()
})

export type FormSchema = z.infer<typeof formSchema>;