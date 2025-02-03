import React from 'react';
import {TableBody, TableCell, TableRow} from "@/components/ui/table";
import {Skeleton} from "@/components/ui/skeleton";

export default function Loading() {
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

export {LoadingRows};