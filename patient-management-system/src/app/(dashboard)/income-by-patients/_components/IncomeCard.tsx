import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IncomeCardProps {
  date: string;
  totalIncome: number;
  patientCount: number;
}

export default function IncomeCard({
  date,
  totalIncome,
  patientCount,
}: IncomeCardProps) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedIncome = new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
  }).format(totalIncome);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{formattedDate}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Income:</span>
            <span className="text-xl font-bold">{formattedIncome}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Patients:</span>
            <span className="text-lg">{patientCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Average per Patient:</span>
            <span className="text-lg">
              {new Intl.NumberFormat("en-LK", {
                style: "currency",
                currency: "LKR",
              }).format(totalIncome / patientCount)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
