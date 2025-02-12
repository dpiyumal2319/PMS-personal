// app/inventory/layout.tsx
import TabsBar from "@/app/(dashboard)/inventory/cost-management/_components/TabBar";

export default function InventoryLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className={'h-14 bg-white flex items-center justify-between py-3 px-4 border-b border-primary-900/25 shadow sticky top-0'}>
                <TabsBar/>
            </div>
            <div>
                {children}
            </div>
        </div>
    );
}
