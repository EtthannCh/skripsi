import { z } from "zod";

export const userSchema = z.object({
    id: z.number(),
    userid: z.string(),
    username: z.string().max(100),
    password: z.string().max(200),
    email: z.string().max(200)
});

export type UserSchema = z.infer<typeof userSchema>;

export const userCookiesSchema = z.object({
    userId: z.string(),
    email: z.string(),
    username: z.string(),
})

export type UserCookiesSchema = z.infer<typeof userCookiesSchema>;


export const formSchema = z.object({
    id: z.number(),
    name: z.string(),
    code: z.string(),
    description: z.string().optional()
})

export type FormSchema = z.infer<typeof formSchema>;

export const userRequestSchema = z.object({
    id: z.number(),
    userId: z.string(),
    formId: z.string(),
    formFile: z.instanceof(File, { message: "please Upload a file" })
})

export type UserRequestSchema = z.infer<typeof userRequestSchema>;