import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {getDailyIncomes, getIncomeStats} from "@/app/lib/actions/dailyIncomes";
import IncomeCard from "@/app/(dashboard)/income-by-patients/_components/IncomeCard";
import IncomeHeader from "@/app/(dashboard)/income-by-patients/_components/IncomeHeader";
import {Suspense} from "react";
import {FaClipboardList} from "react-icons/fa";
import {IoIosPeople} from "react-icons/io";
import {FaRegMoneyBillAlt} from "react-icons/fa";
import {AiOutlineUser} from "react-icons/ai";

async function IncomeContent({start, end}: { start: Date; end: Date }) {
    const dateRange = {startDate: start, endDate: end};
    const incomes = await getDailyIncomes(dateRange);
    const stats = await getIncomeStats(dateRange);

    return (
        <>
            {stats && (
                <Card className="w-full bg-primary/5">
                    <CardHeader>
                        <CardTitle>
                            Summary
                            <FaClipboardList className="inline-block ml-2"/>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <FaRegMoneyBillAlt className="text-lg"/> Total Income
                                </p>
                                <p className="text-xl font-bold">
                                    {new Intl.NumberFormat("en-LK", {
                                        style: "currency",
                                        currency: "LKR",
                                    }).format(stats.totalIncome)}
                                </p>
                            </div>
                            <div>
                                <div>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <IoIosPeople className="text-lg"/> Total Patients
                                    </p>
                                </div>
                                <p className="text-xl font-bold">{stats.patientCount}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <AiOutlineUser className="text-lg"/> Average per Patient
                                </p>
                                <p className="text-xl font-bold">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {incomes.map((income) => (
                    <IncomeCard
                        key={income.date.toISOString()}
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

    // Set end date to tomorrow at 00:01:00
    const end = new Date();
    end.setDate(end.getDate() + 1);

    // Set start date to 7 days before end date
    const start = new Date(end);
    start.setDate(start.getDate() - 7);
    // Start date also at 00:01:00
    start.setHours(0, 1, 0, 0);

    // If search params are provided, use them instead
    const startDate = resolvedParams.start ? new Date(resolvedParams.start) : start;
    const endDate = resolvedParams.end ? new Date(resolvedParams.end) : end;
    startDate.setHours(0, 1, 0, 0);
    endDate.setHours(0, 1, 0, 0);

    return (
        <div className="p-6 space-y-6">
            <IncomeHeader start={start} end={end}/>
            <Suspense fallback={<div>Loading...</div>}>
                <IncomeContent start={start} end={end}/>
            </Suspense>
        </div>
    );
}
