import React from "react";
import BatchTopBar from "../../_components/BatchTopBar";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={'flex flex-col h-full'}>
            <BatchTopBar
            batchId= {5}
            />
            {children}
        </div>
    )
}