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
        <div className={'flex flex-col p-4'}>
            <TopCard id={id}/>
            {children}
        </div>
    )
}