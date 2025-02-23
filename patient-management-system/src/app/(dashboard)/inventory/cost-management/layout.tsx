import React from 'react';
import TabsBar from "@/app/(dashboard)/inventory/cost-management/_components/TabBar";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: "PMS - Cost Management",
    description: "Manage and view cost management.",
};

const InventoryLayout = ({children}: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-none bg-white border-b border-primary-900/25 shadow z-10  py-2 px-4">
                <TabsBar/>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
                {children}
            </div>
        </div>
    );
};

export default InventoryLayout;