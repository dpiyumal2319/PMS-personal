interface StockData {
  id: number;
  name: string;
  totalPrice: number;
  unitPrice?: number;
  remainingQuantity?: number;
}

// PriceListByBrand.tsx
import { AiOutlineShop, AiOutlineDollar } from "react-icons/ai";

export default function PriceListByBrand({ items }: { items: StockData[] }) {
  return (
    <div className="space-y-4">
      {items.length > 0 ? (
        items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center bg-white shadow-md rounded-2xl p-6 hover:shadow-xl transition border border-gray-200"
          >
            <div className="flex-1 flex justify-between items-center">
              {/* Brand Name */}
              <div className="flex items-center gap-3 text-primary-600 font-semibold text-lg flex-1">
                <AiOutlineShop className="w-5 h-5 text-gray-500" />
                <span>{item.name}</span>
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
        <p className="text-gray-500">No brands found.</p>
      )}
    </div>
  );
}
