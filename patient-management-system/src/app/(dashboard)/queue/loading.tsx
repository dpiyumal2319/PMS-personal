import React from 'react';
import {TableBody, TableCell, TableRow} from "@/components/ui/table";
import {Skeleton} from "@/components/ui/skeleton";

export function Loading() {
    return (
        //Random skeleton loading
        <Skeleton className={'w-3/4 h-4'}/>
    );
}

function LoadingRows({rows, cols}: { rows: number, cols: number }) {
    return (
        <TableBody>
            {[...Array(rows)].map((_, i) => (
                <TableRow key={i}>
                    {[...Array(cols)].map((_, j) => (
                        <TableCell key={j}>
                            <Skeleton className={'w-3/4 h-4'}/>
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </TableBody>
    );
}

function LoadingDef() {
    return (
        <div role="status" className="max-w-sm animate-pulse">
            <div className="h-2.5 bg-gray-200 rounded-full  w-48 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded-full  max-w-[360px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full  mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full  max-w-[330px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full  max-w-[300px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full  max-w-[360px]"></div>
            <span className="sr-only">Loading...</span>
        </div>
    );
}

export default LoadingDef;

export {LoadingRows};