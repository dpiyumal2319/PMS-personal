import {Column} from "@tanstack/react-table";
import {ArrowUpDown} from "lucide-react";

import {Button} from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

interface DataTableColumnHeaderProps<TData, TValue> {
    column: Column<TData, TValue>;
    title: string;
}

export function DataTableColumnHeader<TData, TValue>({
                                                         title,
                                                     }: DataTableColumnHeaderProps<TData, TValue>) {
    return (
        <div className="flex items-center space-x-2 justify-center">
            <span>{title}</span>
            <span className="inline-flex">
        <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            aria-label={`Sort by ${title}`}
            style={{height: "20px"}}
        >
          <ArrowUpDown className="h-3.5 w-3.5 text-gray-400"/>
        </Button>
      </span>
        </div>
    );
}