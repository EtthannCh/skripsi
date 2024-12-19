import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const userSchema = z.object({
    id: z.number(),
    name: z.string().max(50),
    code: z.string().max(50),
    description: z.string().optional()
});

export type UserSchema = z.infer<typeof userSchema>;

export const formSchema = z.object({
    id: z.number(),
    name: z.string(),
    code: z.string(),
    description: z.string().optional()
})

export type FormSchema = z.infer<typeof formSchema>;