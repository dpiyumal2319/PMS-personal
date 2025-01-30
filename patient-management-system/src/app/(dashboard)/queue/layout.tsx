import React from "react";

export default function Layout({
                                   children,
                               }: {
    children: React.ReactNode;
}) {
    return (
        <div className={'flex flex-col h-full'}>
            {/* Top Bar */}
            <div
                className="flex justify-between w-full bg-background-50 h-14 border-b border-primary-900/25 shadow items-center p-2">
                <p className="text-xl font-semibold">All Queues</p>
            </div>
            {children}
        </div>
    )
}