interface StockData {
  id: number;
  name: string;
  totalPrice: number;
  unitPrice?: number;
  remainingQuantity?: number;
}
import { LucidePackagePlus } from "lucide-react";
import { AiOutlineDollar, AiOutlineNumber } from "react-icons/ai";

export default function PriceListByBatch({ items }: { items: StockData[] }) {
  return (
    <div className="space-y-4">
      {items.length > 0 ? (
        items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center bg-white shadow-md rounded-2xl p-6 hover:shadow-xl transition border border-gray-200"
          >
            <div className="flex-1 flex justify-between items-center">
              {/* Batch Info */}
              <div className="flex items-center gap-3 text-primary-600 font-semibold text-lg flex-1">
                <LucidePackagePlus className="w-5 h-5 text-gray-500" />
                <span>{item.name}</span>
              </div>

              {/* Unit Price */}
              <div className="flex items-center gap-3 text-gray-700 text-lg justify-center flex-1">
                <AiOutlineNumber className="w-5 h-5 text-gray-500" />
                <span className="font-medium">
                  Rs. {item.unitPrice?.toFixed(2)} per unit
                </span>
              </div>

              {/* Total Price */}
              <div className="flex items-center gap-3 text-gray-700 text-lg justify-end flex-1">
                <AiOutlineDollar className="w-5 h-5 text-gray-500" />
                <span className="font-medium">
                  Rs. {item.totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No batches found.</p>
      )}
    </div>
  );
}
