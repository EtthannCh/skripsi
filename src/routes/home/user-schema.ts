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
    id:z.number(),
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
    formFile: z.instanceof(File, { message: "please Upload a file" }).refine((f) => f.size < 5 * 1024 * 1024, "Max 5 mb upload size.").optional(),
})

export type UserRequestSchema = z.infer<typeof userRequestSchema>;

export const requestDbStatusEnum = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    AWAITING_APPROVAL: "AWAITING_APPROVAL"
};

export const requestDbStatusCombobox = [
    {
        label: "Pending",
        value: "PENDING",
    },
    {
        label: "Approved",
        value: "APPROVED",
    },
    {
        label: "Rejected",
        value: "REJECTED",
    },
    {
        label: "Awaiting Approval",
        value: "AWAITING_APPROVAL",
    }
]

export const requestDbSchema = z.object({
    id: z.number(),
    status: z.enum(Object.keys(requestDbStatusEnum) as [keyof typeof requestDbStatusEnum, ...Array<keyof typeof requestDbStatusEnum>]),
    user_id: z.string(),
    form_id: z.number(),
    reason: z.string().optional(),
    created_by: z.string(),
    created_at: z.string(),
    form_db: z.object({
        code: z.string()
    }),
    user_credentials: z.object({
        email: z.string(),
    }),
    first_approver_name: z.string(),
    second_approver_name: z.string(),
    form_url: z.string(),
})
export type RequestDbSchema = z.infer<typeof requestDbSchema>;