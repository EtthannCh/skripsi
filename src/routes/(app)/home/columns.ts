import type { ColumnDef } from "@tanstack/table-core";import type { RequestDbSchema } from "./user-schema";
;

export const defaultColumns: ColumnDef<RequestDbSchema>[] = [
    {
        accessorKey: 'id',
        cell: (info) => info.getValue()
    },
    {
        header: () => 'Status Permohonan',
        accessorKey: 'status',
        cell: (info) => info.getValue()
    },
    {
        header: () => 'User ID',
        accessorKey: 'userId',
        cell: (info) => info.getValue()
    },
    {
        header: () => 'Form ID',
        accessorKey: 'formId',
        cell: (info) => info.getValue()
    },
    {
        header: () => 'Alasan',
        accessorKey: 'reason',
        cell: (info) => info.getValue()
    }
];