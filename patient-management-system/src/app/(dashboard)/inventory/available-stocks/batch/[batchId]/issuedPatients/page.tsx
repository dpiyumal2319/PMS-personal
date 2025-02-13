import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import React from 'react';

function Page() {
  const issuedPatients = [
    { id: 1, issuedDate: '2025-02-01', patientName: 'John Doe', issuedAmount: 10 },
    { id: 2, issuedDate: '2025-02-05', patientName: 'Jane Smith', issuedAmount: 5 },
  ];

  return (
    <div className="container mx-auto p-4">
      <Card className="mt-6 shadow-lg border border-gray-200 dark:border-gray-800 rounded-xl">
      <CardHeader className="bg-gray-100 dark:bg-gray-900 rounded-t-xl p-4">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">Issued Patients</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
          <Table className="w-full border-collapse">
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              <TableRow>
                <TableHead className="p-4 text-left text-gray-700 dark:text-gray-300">Patient Name</TableHead>
                <TableHead className="p-4 text-left text-gray-700 dark:text-gray-300">Issued Amount</TableHead>
                <TableHead className="p-4 text-left text-gray-700 dark:text-gray-300">Issued Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issuedPatients.length > 0 ? (
                issuedPatients.map((patient) => (
                  <TableRow key={patient.id} className="border-b hover:bg-gray-100 dark:hover:bg-gray-900">
                    <TableCell className="p-4 text-gray-900 dark:text-white font-medium">{patient.patientName}</TableCell>
                    <TableCell className="p-4 text-gray-700 dark:text-gray-300">{patient.issuedAmount}</TableCell>
                    <TableCell className="p-4 text-gray-600 dark:text-gray-400">{patient.issuedDate}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No issued patients found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}

export default Page;