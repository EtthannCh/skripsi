import { z } from "zod";

export const userDetailSchema = z.object({
    id: z.number(),
    username: z.string(),
    email: z.string()
})

export type UserDetailSchema = z.infer<typeof userDetailSchema>;

export const approveRejectSchema = z.object({
    approvalFile: z.instanceof(File, { message: "please Upload a file" }).refine((f) => f.size < 5 * 1024 * 1024, "Max 5 mb upload size.").optional(),
    reason: z.string().optional()
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