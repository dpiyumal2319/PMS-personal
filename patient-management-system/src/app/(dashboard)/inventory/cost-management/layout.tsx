import React from 'react';
import TabsBar from "@/app/(dashboard)/inventory/cost-management/_components/TabBar";

const InventoryLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-none bg-white border-b border-primary-900/25 shadow z-10">
                <div className="h-14 flex items-center justify-between py-3 px-4">
                    <TabsBar />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
                {children}
            </div>
        </div>
    );
};

export default InventoryLayout;