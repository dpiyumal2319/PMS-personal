import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDailyIncomes, getIncomeStats } from "@/app/lib/actions";
import IncomeCard from "@/app/(dashboard)/income-by-patients/_components/IncomeCard";
import IncomeHeader from "@/app/(dashboard)/income-by-patients/_components/IncomeHeader";
import { Suspense } from "react";

async function IncomeContent({
  start,
  end,
}: {
  start: string | undefined;
  end: string | undefined;
}) {
  // Default to today if no dates provided
  const startDate = start ? new Date(start) : new Date();
  const endDate = end ? new Date(end) : new Date();

  const dateRange = { startDate, endDate };
  const incomes = await getDailyIncomes(dateRange);
  const stats = await getIncomeStats(dateRange);

  return (
    <>
      {stats && (
        <Card className="w-full bg-primary/5">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat("en-LK", {
                    style: "currency",
                    currency: "LKR",
                  }).format(stats.totalIncome)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold">{stats.patientCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Average per Patient
                </p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat("en-LK", {
                    style: "currency",
                    currency: "LKR",
                  }).format(stats.averagePerPatient)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {incomes.map((income) => (
          <IncomeCard
            key={income.date}
            date={income.date}
            totalIncome={income.totalIncome}
            patientCount={income.patientCount}
          />
        ))}
      </div>
    </>
  );
}

interface PageProps {
  start: string;
  end: string;
}

export default async function PatientIncomePage({
  searchParams,
}: {
  searchParams: Promise<PageProps>;
}) {
  const resolvedParams = await searchParams;

  return (
    <div className="p-6 space-y-6">
      <IncomeHeader />
      <Suspense fallback={<div>Loading...</div>}>
        <IncomeContent
          start={resolvedParams.start?.toString()}
          end={resolvedParams.end?.toString()}
        />
      </Suspense>
    </div>
  );
}
