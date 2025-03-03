import { z } from "zod";

export const userDbSchema = z.object({
    id: z.number(),
    user_id: z.string(),
    username: z.string().max(100),
    password: z.string().max(200),
    email: z.string().max(200),
    role_id: z.number(),
    major_id: z.number(),
});

export type UserDbSchema = z.infer<typeof userDbSchema>;

export const userCookiesSchema = z.object({
    id: z.number(),
    userId: z.string(),
    email: z.string(),
    username: z.string(),
    roleId: z.number(),
    majorId: z.number()
})

export type UserCookiesSchema = z.infer<typeof userCookiesSchema>;

export const formSchema = z.object({
    id: z.number(),
    name: z.string(),
    code: z.string(),
    description: z.string().optional(),
    form_url: z.string(),
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
    ONGOING: "ONGOING",
    PROCESSING: "PROCESSING",
    COMPLETED: "COMPLETED",
    AWAITING_FINALIZED: "AWAITING FINALIZED",
    FINALIZED: "FINALIZED"
};

export const requestEnumColor = {
    PENDING: 'bg-gray-300 text-gray-900',
    APPROVED: 'bg-blue-500 text-white',
    REJECTED: 'bg-red-500 text-white',
    ONGOING: 'bg-yellow-300 text-yellow-800',
    PROCESSING: '',
    COMPLETED: 'bg-green-500 text-white',
    AWAITING_FINALIZED: 'bg-teal-500 text-teal-900',
    FINALIZED: 'bg-green-500 text-green-900'
};

export const requestDbStatusCombobox = [
    {
        label: "Pending",
        value: "PENDING",
    },
    {
        label: "Rejected",
        value: "REJECTED",
    },
    {
        label: "Ongoing",
        value: "ONGOING"
    },
    {
        label: "Processing",
        value: "PROCESSING",
    },
    {
        label: "Completed",
        value: "COMPLETED",
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
        code: z.string(),
        name: z.string(),
    }),
    user_credentials: z.object({
        email: z.string(),
        user_pkey: z.string(),
    }),
    form_url: z.string(),
    request_code: z.string(),
    completion_file_url: z.string(),
})
export type RequestDbSchema = z.infer<typeof requestDbSchema>;

export const majorDbSchema = z.object({
    id: z.number(),
    code: z.string(),
    name: z.string(),
})

export type MajorDbSchema = z.infer<typeof majorDbSchema>;

export const sequenceSchema = z.object({
    id: z.string(),
    major_id: z.number(),
    current_number: z.string(),
    reset_condition: z.string(),
    created_at: z.string(),
    format: z.string(),
    current_year: z.string(),
})

export type SequenceSchema = z.infer<typeof sequenceSchema>;
