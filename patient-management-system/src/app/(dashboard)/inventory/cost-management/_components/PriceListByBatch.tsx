import { LucidePackagePlus } from "lucide-react";
import { AiOutlineDollar, AiOutlineNumber } from "react-icons/ai";
import { Card } from "@/components/ui/card";

interface StockData {
  id: number;
  name: string;
  totalPrice: number;
  unitPrice?: number;
  remainingQuantity?: number;
}

export default function PriceListByBatch({ items }: { items: StockData[] }) {
  return (
    <div className="flex flex-col gap-4">
      {items.length > 0 ? (
        items.map((item) => (
          <Card
            key={item.id}
            className="flex items-center justify-between p-5 hover:bg-gray-50 hover:shadow-md transition-all duration-300"
          >
            {/* Batch Info */}
            <div className="flex items-center gap-4 font-semibold text-md flex-1 text-primary-600">
              <LucidePackagePlus className="w-5 h-5 text-gray-500" />
              <span>{item.name}</span>
            </div>

            {/* Unit Price */}
            <div className="flex items-center gap-3 text-gray-700 text-md justify-center flex-1">
              <AiOutlineNumber className="w-5 h-5 text-gray-500" />
              <span className="font-medium">
                Rs. {item.unitPrice?.toFixed(2)} per unit
              </span>
            </div>

            {/* Total Price */}
            <div className="flex items-center gap-3 text-gray-700 text-md justify-end flex-1">
              <AiOutlineDollar className="w-5 h-5 text-gray-500" />
              <span className="font-medium">
                Rs. {item.totalPrice.toFixed(2)}
              </span>
            </div>
          </Card>
        ))
      ) : (
        <p className="text-gray-500">No batches found.</p>
      )}
    </div>
  );
}
