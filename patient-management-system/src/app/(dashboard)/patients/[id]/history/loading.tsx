import React from 'react';
import {HistoryListSkeleton} from "@/app/(dashboard)/patients/[id]/history/_components/HistoryList";
import {Skeleton} from "@/components/ui/skeleton";

const Loading = () => {
    return (
        <div className={'flex flex-col gap-4 h-full'}>
            <div className={'flex w-full gap-4'}>
                <Skeleton className={'w-full h-8'}/>
                <Skeleton className={'w-40 h-8'}/>
            </div>
            <HistoryListSkeleton/>
        </div>
    );
};

export default Loading;