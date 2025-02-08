import React from 'react';
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import {formatDistanceToNow} from 'date-fns';
import {getPatientReports} from "@/app/lib/actions";
import {CustomBadge} from "@/app/(dashboard)/_components/CustomBadge";

const AllPatientReports = async ({currentPage, query, range, id}: {
    currentPage: number;
    query: string;
    range: string;
    id: number;
}) => {
    const reports = await getPatientReports(query, range, id, currentPage);

    if (!reports || reports.length === 0) {
        return <Card className={'text-center'}>
            <CardHeader>
                <CardTitle>No Reports</CardTitle>
            </CardHeader>
        </Card>
    }

    return (
        <div className="flex flex-col gap-4">
            {reports.map((report) => (
                <Card key={report.id} className="w-full">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>{report.reportType.name}</span>
                            <span
                                className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(report.time), {addSuffix: true})}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-2">
                            {report.parameters.map((param) => (
                                <div key={param.reportParameter.name} className="flex justify-start items-center gap-4">
                                <span className="text-muted-foreground text-sm">
                                    {param.reportParameter.name}
                                    {param.reportParameter.units ? ` (${param.reportParameter.units})` : ''} :
                                </span>
                                    {param.attention ? <CustomBadge text={param.value} color={'red'} className={'text-sm'}/>
                                        : <span className="font-semibold text-sm">{param.value}</span>}

                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default AllPatientReports;