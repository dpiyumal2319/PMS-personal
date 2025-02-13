import React from "react";
import NextBreadcrumb from "./_components/BreadCrumb";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={'flex flex-col h-full'}>
            <div className="flex flex-grow">
                {children}
            </div>
            <NextBreadcrumb
                separator={<span className="text-gray-400 text-xs"> &gt; </span>}
                activeClasses="text-blue-500 font-semibold text-sm"
                containerClasses="flex items-center space-x-1 py-2 px-4 bg-white shadow-md sticky bottom-0 text-sm"
                listClasses="text-gray-600 hover:text-blue-500 transition-colors duration-200 last:font-bold last:text-black text-xs"
                capitalizeLinks
            />



        </div>
    )
}