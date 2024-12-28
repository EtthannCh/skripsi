import { z } from "zod";

export const userDbSchema = z.object({
    id: z.number(),
    user_id: z.string(),
    username: z.string().max(100),
    password: z.string().max(200),
    email: z.string().max(200),
    role_id: z.number()
});

export type UserDbSchema = z.infer<typeof userDbSchema>;

export const userCookiesSchema = z.object({
    userId: z.string(),
    email: z.string(),
    username: z.string(),
    roleId: z.number()
})

export type UserCookiesSchema = z.infer<typeof userCookiesSchema>;


export const formSchema = z.object({
    id: z.number(),
    name: z.string(),
    code: z.string(),
    description: z.string().optional(),
    file: z.any(),
    mimeType: z.string()
})

export type FormSchema = z.infer<typeof formSchema>;

export const userRequestSchema = z.object({
    id: z.number(),
    userId: z.string(),
    formId: z.string(),
    formFile: z.instanceof(File, { message: "please Upload a file" }).optional()
})

export type UserRequestSchema = z.infer<typeof userRequestSchema>;

// const requestDbStatusEnum = [
//     {
//         value: "APPROVED",
//         label: "APPROVED"
//     },
//     {
//         value: "REJECTED",
//         label: "REJECTED"
//     }
// ];

export const requestDbSchema = z.object({
    id: z.number(),
    status: z.string(),
    user_id: z.string(),
    form_id: z.number(),
    reason: z.string().optional()
})
export type RequestDbSchema = z.infer<typeof requestDbSchema>;