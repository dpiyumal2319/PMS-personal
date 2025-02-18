"use client";

import { useState } from "react";
import DatePicker from "@/app/(dashboard)/inventory/cost-management/_components/DatePickerCM";
import { DateRange } from "@/app/lib/definitions";
import { useRouter, useSearchParams } from "next/navigation";

export default function IncomeHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize with current URL params or today's date
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: searchParams.get("start")
      ? new Date(searchParams.get("start")!)
      : new Date(),
    endDate: searchParams.get("end")
      ? new Date(searchParams.get("end")!)
      : new Date(),
  });

  const handleDateChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
    // Format dates for URL
    const start = newDateRange.startDate.toISOString().split("T")[0];
    const end = newDateRange.endDate.toISOString().split("T")[0];
    router.push(`/income-by-patients?start=${start}&end=${end}`);
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-primary-500">
        Income by Patients
      </h1>
      <DatePicker
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        action={handleDateChange}
      />
    </div>
  );
}
