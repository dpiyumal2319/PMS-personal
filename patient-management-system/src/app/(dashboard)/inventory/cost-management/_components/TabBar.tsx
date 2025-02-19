"use client";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { PiChartDonutFill } from "react-icons/pi";
import { FaStoreAlt } from "react-icons/fa";
import Link from "next/link";

export default function TabsBar() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("analysis");

  useEffect(() => {
    if (pathname.includes("analysis")) {
      setActiveTab("analysis");
    } else {
      setActiveTab("stock");
    }
  }, [pathname]);

  return (
    <Tabs defaultValue={activeTab} className="w-full h-10">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="stock" asChild>
          <Link href="/inventory/cost-management/stocks">
            <span className="mr-2">Stock</span>
            <FaStoreAlt />
          </Link>
        </TabsTrigger>
        <TabsTrigger value="analysis" asChild>
          <Link href="/inventory/cost-management/analysis">
            <span className="mr-2">Analysis</span>
            <PiChartDonutFill />
          </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
