import { z } from "zod";
export const roleCodeEnum = {
    HOD: "HOD", // Kaprodi
    ADM: "ADM", // Admin
    STD: "STD", // Student
    STF: "STF", // Staff
    HUPHM: "HUPHM" // Head of UPH Medan
};

export const majorCodeEnum = {
    INF: "INF",
    IS: "IS",
    MGT: "MGT",
    HOS: "HOS",
    LAW: "LAW",
    ACC: "ACC",
    UNV: "UNV"
};

export const userDbSchema = z.object({
    id: z.number(),
    user_id: z.string(),
    username: z.string().max(100),
    password: z.string().max(200),
    email: z.string().max(200),
    role_id: z.number(),
    major_id: z.number(),
    major_db: z.object({
        code: z.enum(Object.keys(majorCodeEnum) as [keyof typeof majorCodeEnum, ...Array<keyof typeof majorCodeEnum>]),
    }),
    role_db: z.object({
        code: z.enum(Object.keys(roleCodeEnum) as [keyof typeof roleCodeEnum, ...Array<keyof typeof roleCodeEnum>])
    })
});

export type UserDbSchema = z.infer<typeof userDbSchema>;



export const userCookiesSchema = z.object({
    id: z.number(),
    userId: z.string(),
    email: z.string(),
    username: z.string(),
    roleId: z.number(),
    roleCode: z.enum(Object.keys(roleCodeEnum) as [keyof typeof roleCodeEnum, ...Array<keyof typeof roleCodeEnum>]),
    majorId: z.number(),
    majorCode: z.enum(Object.keys(majorCodeEnum) as [keyof typeof majorCodeEnum, ...Array<keyof typeof majorCodeEnum>])
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
    formId: z.string().min(1, "Please Select a Form to Continue"),
    formFile: z.instanceof(File, { message: "please Upload a file" }).refine((f) => f.size < 5 * 1024 * 1024, "Max 5 mb upload size.").optional(),
})

export type UserRequestSchema = z.infer<typeof userRequestSchema>;

export const requestDbStatusEnum = {
    PENDING: "PENDING",
    REJECTED: "REJECTED",
    ONGOING: "ONGOING",
    PROCESSING: "PROCESSING",
    COMPLETED: "COMPLETED",
};

export const requestEnumColor = {
    PENDING: 'bg-gray-300 text-gray-900',
    REJECTED: 'bg-red-500 text-white',
    ONGOING: 'bg-yellow-300 text-yellow-800',
    PROCESSING: 'bg-orange-500 text-white',
    COMPLETED: 'bg-green-500 text-white',
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
    major_id: z.number(),
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

export const excelTableSchema = z.object({
    request_id: z.number(),
    request_code: z.string(),
    status: z.enum(Object.keys(requestDbStatusEnum) as [keyof typeof requestDbStatusEnum, ...Array<keyof typeof requestDbStatusEnum>]),
    nim: z.string(),
    username: z.string(),
    email: z.string(),
    form_id: z.number(),
    form_code: z.string(),
    form_name: z.string(),
    pending: z.string(),
    ongoing: z.string(),
    processing: z.string(),
    completed: z.string(),
    uploaded_file_url: z.string(),
    completion_file_url: z.string(),
    reason: z.string(),
})

export type ExcelTableSchema = z.infer<typeof excelTableSchema>;