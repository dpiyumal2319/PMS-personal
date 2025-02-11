import React from "react";
import DatePicker from "@/app/(dashboard)/_components/DatePicker";

export default function StockChartComponent() {
  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      <h3 className="text-lg font-semibold  text-primary-700 font-montserrat">
        Select the duration
      </h3>

      <DatePicker />
    </div>
  );
}
