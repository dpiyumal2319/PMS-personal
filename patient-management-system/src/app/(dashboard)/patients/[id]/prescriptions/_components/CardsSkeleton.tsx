import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {Card} from "@/components/ui/card";  // Assuming you have a Skeleton component in your UI kit

const PrescriptionListSkeleton = () => {
    return (
        <div className="grid grid-cols-2 gap-4">
            {/* First Card Skeleton */}
            <Card className="p-4 cursor-pointer hover:shadow-lg transition h-full">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-1/3 h-6" />
                            <Skeleton className="w-12 h-6" />
                        </div>
                        <Skeleton className="w-24 h-4" />
                    </div>
                    <Skeleton className="w-full h-6" />
                    <div className="grid grid-cols-2 gap-2">
                        <Skeleton className="w-24 h-4" />
                        <Skeleton className="w-24 h-4" />
                        <Skeleton className="w-24 h-4" />
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                        <Skeleton className="w-24 h-4" />
                        <Skeleton className="w-24 h-4" />
                    </div>
                </div>
            </Card>

            {/* Second Card Skeleton */}
            <Card className="p-4 cursor-pointer hover:shadow-lg transition h-full">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-1/3 h-6" />
                            <Skeleton className="w-12 h-6" />
                        </div>
                        <Skeleton className="w-24 h-4" />
                    </div>
                    <Skeleton className="w-full h-6" />
                    <div className="grid grid-cols-2 gap-2">
                        <Skeleton className="w-24 h-4" />
                        <Skeleton className="w-24 h-4" />
                        <Skeleton className="w-24 h-4" />
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                        <Skeleton className="w-24 h-4" />
                        <Skeleton className="w-24 h-4" />
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PrescriptionListSkeleton;
