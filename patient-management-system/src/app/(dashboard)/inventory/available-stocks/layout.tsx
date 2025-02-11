import React from "react";
import NextBreadcrumb from "./_components/BreadCrumb";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={'flex flex-col h-full'}>
            {children}
            <NextBreadcrumb
                    separator={<span> | </span>}
                    activeClasses='text-amber-500'
                    containerClasses='flex py-5 bg-gradient-to-r from-purple-600 to-blue-600'
                    listClasses='hover:underline mx-2 font-bold'
                    capitalizeLinks
                />
        </div>
    )
}