import { z } from "zod";

export const emailList = z.object({
    id: z.number(),
    email: z.string(),
    role_id: z.string(),
    username: z.string(),
    major_id: z.string(),
})

export type EmailList = z.infer<typeof emailList>;

export const roleList = z.object({
    id: z.number(),
    name: z.string(),
})

export type RoleList = z.infer<typeof roleList>;

export const updateRoleSchema = z.object({
    email: z.string().min(1, "Email Empty"),
    roleId: z.string().min(1, "Role Empty"),
    majorId: z.string().min(1, "Major Empty")
})

export type UpdateRoleSchema = z.infer<typeof updateRoleSchema>;

export const majorList = z.object({
    id: z.number(),
    name: z.string(),
})

export type MajorList = z.infer<typeof majorList>;