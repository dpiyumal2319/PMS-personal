import React from "react";
import { getDrugModelStats } from "@/app/lib/actions";
import StatCard from "@/app/(dashboard)/inventory/cost-management/_components/StatCard";

interface DrugModelStats {
  available: { quantity: number; value: number };
  sold: { quantity: number; value: number };
  expired: { quantity: number; value: number };
  trashed: { quantity: number; value: number };
}
export default async function DrugDeatailByModel({
  params,
}: {
  params: { id: string };
}) {
  const stats: DrugModelStats = await getDrugModelStats(parseInt(params.id));
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Drug Model Statistics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Available Stock"
          quantity={stats.available.quantity}
          value={stats.available.value}
          className="bg-green-400"
        />
        <StatCard
          title="Sold/Given"
          quantity={stats.sold.quantity}
          value={stats.sold.value}
          className="bg-blue-400"
        />
        <StatCard
          title="Expired"
          quantity={stats.expired.quantity}
          value={stats.expired.value}
          className="bg-orange-400"
        />
        <StatCard
          title="Trashed"
          quantity={stats.trashed.quantity}
          value={stats.trashed.value}
          className="bg-red-500"
        />
      </div>
    </div>
  );
}
