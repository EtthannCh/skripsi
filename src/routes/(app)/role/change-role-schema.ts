import { z } from "zod";

export const emailList = z.object({
    id: z.number(),
    email: z.string(),
})

export type EmailList = z.infer<typeof emailList>;

export const roleList = z.object({
    id: z.number(),
    name: z.string(),
})

export type RoleList = z.infer<typeof roleList>;

export const updateRoleSchema = z.object({
    email: z.string(),
    roleId: z.string()
})

export type UpdateRoleSchema = z.infer<typeof updateRoleSchema>;