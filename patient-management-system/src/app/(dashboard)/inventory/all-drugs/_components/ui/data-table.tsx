// components/ui/data-table.tsx
"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { columns } from "@/app/(dashboard)/inventory/all-drugs/_components/Columns";
import { useRouter } from "next/navigation";


interface DataTableProps<TData> {
    data: TData[];
}

export function DataTable<TData>({
    data,
}: DataTableProps<TData>) {
    const table = useReactTable({
        data,
        columns: columns as ColumnDef<TData>[],
        getCoreRowModel: getCoreRowModel(),
    });

    const router = useRouter();

    const handleRowClick = (id: string) => {
        router.push(`/inventory/all-drugs/batch/${id}`);
    };


    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {table.getHeaderGroups().map((headerGroup) => (
                            headerGroup.headers.map((header) => (
                                <TableHead key={header.id} className="whitespace-nowrap">
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            ))
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                                onClick={() => handleRowClick((row.original as { id: string }).id)}
                                  >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}