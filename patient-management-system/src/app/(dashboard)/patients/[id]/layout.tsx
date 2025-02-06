import React from "react";
import TopCard from "@/app/(dashboard)/patients/[id]/_components/TopCard";

export default async function Layout({
                                         children, params
                                     }: {
    children: React.ReactNode,
    params: Promise<{ id: string }>
}) {
    const id = parseInt((await params).id);

    return (
        <div className={'flex flex-col p-4 min-h-full gap-4'}>
            <TopCard id={id}/>
            <div className={'flex flex-col gap-4 flex-grow h-full'}>
                {children}
            </div>
        </div>
    )
}