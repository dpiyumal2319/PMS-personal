// components/drugs/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Drug } from "../lib/types";
import { DataTableColumnHeader } from "./ui/data-table-column-header";

export const columns: ColumnDef<Drug>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Drug Name" />
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "brand",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Brand" />
    ),
  },
  {
    accessorKey: "supplier",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Supplier" />
    ),
  },
  {
    accessorKey: "batchNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Batch No." />
    ),
  },
  {
    accessorKey: "stockDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock Date" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("stockDate"));
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "expiryDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Expiry Date" />
    ),
    cell: ({ row }) => {
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
    accessorKey: "drugModel",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Model" />
    ),
    cell: ({ row }) => (
      <div>{row.getValue("drugModel")}</div>
    ),
  },
  {
    accessorKey: "batchStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("batchStatus") as string;
      
      const badgeVariants: Record<string, string> = {
        available: "bg-green-100 text-green-800",
        completed: "bg-blue-100 text-blue-800",
        expired: "bg-red-100 text-red-800",
        disposed: "bg-gray-100 text-gray-800",
        "quality failed": "bg-amber-100 text-amber-800",
      };
      
      return (
        <Badge className={badgeVariants[status.toLowerCase()] || ""}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "fullAmount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Full Amount" />
    ),
  },
  {
    accessorKey: "remainingAmount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Remaining" />
    ),
    cell: ({ row }) => {
      const fullAmount = row.getValue("fullAmount") as number;
      const remainingAmount = row.getValue("remainingAmount") as number;
      const percentage = (remainingAmount / fullAmount) * 100;
      
      return (
        <div className="flex items-center gap-2">
          <span>{remainingAmount}</span>
          <div className="w-16 h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-blue-500 rounded-full" 
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "unitConcentration",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Concentration" />
    ),
  },
];

