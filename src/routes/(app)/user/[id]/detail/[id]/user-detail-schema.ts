import { z } from "zod";
import { requestDbStatusEnum } from "../../../../home/request-user-schema";

export const userDetailSchema = z.object({
    id: z.number(),
    username: z.string(),
    email: z.string()
})

export type UserDetailSchema = z.infer<typeof userDetailSchema>;

export const approveRejectSchema = z.object({
    requestId: z.number(),
    status: z.enum(Object.keys(requestDbStatusEnum) as [keyof typeof requestDbStatusEnum, ...Array<keyof typeof requestDbStatusEnum>]),
    process: z.string(),
    approvalFile: z.instanceof(File, { message: "please Upload a file" }).refine((f) => f.size < 5 * 1024 * 1024, "Max 5 mb upload size.").optional(),
    rejectFile: z.instanceof(File, { message: "please Upload a file" }).refine((f) => f.size < 5 * 1024 * 1024, "Max 5 mb upload size.").optional(),
    reason: z.string(),
    studentId: z.number()
})

export type ApproveRejectSchema = z.infer<typeof approveRejectSchema>;


export const requestHistorySchema = z.object({
    id: z.number(),
    request_id: z.number(),
    created_by_id: z.string(),
    created_by: z.string(),
    created_at: z.string(),
    file_url: z.string().optional()
})

export type RequestHistorySchema = z.infer<typeof requestHistorySchema>;

export const userRequestSchema = z.object({
    id: z.number(),
    status: z.enum(Object.keys(requestDbStatusEnum) as [keyof typeof requestDbStatusEnum, ...Array<keyof typeof requestDbStatusEnum>]),
    form_db: z.object({
        code: z.string(),
        name: z.string(),
    }),
    reason: z.string(),
    form_url: z.string(),
    last_updated_by: z.string(),
    request_code: z.string(),
    created_at: z.string()
})

export type UserRequestSchema = z.infer<typeof userRequestSchema>;