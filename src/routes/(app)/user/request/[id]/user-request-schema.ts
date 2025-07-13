import { z } from "zod";
import { requestDbStatusEnum } from "../../../home/request-user-schema";
import { requestHistorySchema } from "../../[id]/detail/[id]/user-detail-schema";

export const tableDataType = z.object({
    id: z.number(),
    requestCode: z.string(),
    status: z.enum(Object.keys(requestDbStatusEnum) as [keyof typeof requestDbStatusEnum, ...Array<keyof typeof requestDbStatusEnum>]),
    formCode: z.string(),
    formName: z.string(),
    submissionDate: z.string(),
});

export type TableDataType = z.infer<typeof tableDataType>;

export const userApprovalOrRejectFileUrlType = z.object({
    id: z.number(),
    request_id: z.number(),
    status: z.enum(Object.keys(requestDbStatusEnum) as [keyof typeof requestDbStatusEnum, ...Array<keyof typeof requestDbStatusEnum>]),
    completion_file_url: z.string(),
    created_by_id: z.string(),
})

export const userRequestHistoryType = z.object({
    userRequestHistory: requestHistorySchema.array(),
    userApprovalOrRejectFileUrl: userApprovalOrRejectFileUrlType,
})

export type UserRequestHistoryType = z.infer<typeof userRequestHistoryType>;