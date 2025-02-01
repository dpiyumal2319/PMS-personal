import React, { Suspense } from 'react';
import {
    Table,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { LoadingRows } from "@/app/(dashboard)/queue/Loading";
import TableContents from "@/app/(dashboard)/queue/_components/TableContents";

// Main Table Component
export default function QueueTable({ currentPage, size }: { currentPage: number, size: number }) {
    return (
        <div className="rounded-lg border bg-card shadow-md overflow-hidden">
            <Table>
                <TableHeader className={'bg-primary-100'}>
                    <TableRow>
                        <TableHead className={'text-gray-800'}>Queue #</TableHead>
                        <TableHead className={'text-gray-800'}>Status</TableHead>
                        <TableHead className={'text-gray-800'}>Created</TableHead>
                        <TableHead className={'text-gray-800'}>Patients</TableHead>
                        <TableHead className={'text-gray-800'}>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <Suspense key={currentPage} fallback={<LoadingRows rows={size} cols={5} />}>
                    <TableContents currentPage={currentPage} size={size} />
                </Suspense>
            </Table>
        </div>
    );
}