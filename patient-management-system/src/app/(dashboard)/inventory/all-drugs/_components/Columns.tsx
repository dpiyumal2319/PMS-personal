// components/drugs/columns.tsx
import {ColumnDef} from "@tanstack/react-table";
import {Drug} from "../lib/types";
import {DataTableColumnHeader} from "./ui/data-table-column-header";
import {BatchStatus} from "@prisma/client";
import {BasicColorType, CustomBadge} from "@/app/(dashboard)/_components/CustomBadge";

export const columns: ColumnDef<Drug>[] = [
    {
        accessorKey: "name",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Drug Name"/>
        ),
        cell: ({row}) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "brandName",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Brand"/>
        ),
        // cell: ({ row }) => <div className="font-medium">{row.getValue("brand_name")}</div>,
    },
    {
        accessorKey: "supplierName",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Supplier"/>
        ),
    },
    {
        accessorKey: "batchNumber",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Batch No."/>
        ),
    },
    {
        accessorKey: "stockDate",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Stock Date"/>
        ),
        cell: ({row}) => {
            const date = new Date(row.getValue("stockDate"));
            return <div>{date.toLocaleDateString()}</div>;
        },
    },
    {
        accessorKey: "expiryDate",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Expiry Date"/>
        ),
        cell: ({row}) => {
            const date = new Date(row.getValue("expiryDate"));
            const now = new Date();
            const isExpiringSoon = date < new Date(now.setMonth(now.getMonth() + 3)) && date > now;

            return (
                <div className={isExpiringSoon ? "text-amber-500 font-medium" : ""}>
                    {date.toLocaleDateString()}
                </div>
            );
        },
    },
    {
        accessorKey: "drugType",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Type"/>
        ),
        cell: ({row}) => (
            <div>{row.getValue("drugType")}</div>
        ),
    },
    {
        accessorKey: "batchStatus",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Status"/>
        ),
        cell: ({row}) => {
            const status = row.getValue("batchStatus") as string;
            const badgeColors: Record<BatchStatus, keyof BasicColorType> = {
                AVAILABLE: 'green',
                COMPLETED: 'blue',
                EXPIRED: 'yellow',
                QUALITY_FAILED: "violet",
                DISPOSED: 'red'
            }

            return (
                <CustomBadge text={status} color={badgeColors[status as BatchStatus]}/>
            );
        },
    },
    {
        accessorKey: "fullAmount",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Full Amount"/>
        ),
    },
    {
        accessorKey: "remainingQuantity",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Remaining"/>
        ),
        cell: ({row}) => {
            const fullAmount = row.getValue("fullAmount") as number;
            const remainingAmount = row.getValue("remainingQuantity") as number;
            const percentage = (remainingAmount / fullAmount) * 100;

            return (
                <div className="flex items-center gap-2">
                    <span>{remainingAmount}</span>
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{width: `${percentage}%`}}
                        />
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "unitConcentration",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Concentration"/>
        ),
    },
];

