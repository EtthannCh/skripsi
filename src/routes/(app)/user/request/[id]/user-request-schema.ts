import { z } from "zod";
import { requestDbStatusEnum } from "../../../home/request-user-schema";

export const tableDataType = z.object({
    id:z.number(),
    requestCode: z.string(),
    status: z.enum(Object.keys(requestDbStatusEnum) as [keyof typeof requestDbStatusEnum, ...Array<keyof typeof requestDbStatusEnum>]),
    formCode: z.string(),
    formName: z.string(),
    submissionDate: z.string(),
});

export type TableDataType = z.infer<typeof tableDataType>;