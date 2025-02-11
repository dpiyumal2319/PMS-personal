// app/inventory/layout.tsx
import TabsBar from "@/app/(dashboard)/inventory/cost-management/_components/TabBar";

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <TabsBar />
      <div>{children}</div>
    </div>
  );
}
