import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {getFilteredReports} from "@/app/lib/actions";
import {CustomBadge} from "@/app/(dashboard)/_components/CustomBadge";

const badgeColors = [
    "blue", "green", "red", "yellow", "purple", "pink", "rose", "cyan"
];

let lastSelectedIndex = 0;

const getRandColor = () => {
    let index = Math.floor(Math.random() * badgeColors.length);
    if (index === lastSelectedIndex) {
        index = (index + 1) % badgeColors.length;
    }
    lastSelectedIndex = index;
    return badgeColors[index];
}

const AllReportsTable = async ({currentPage, query, filter}: {
    currentPage: number,
    query: string,
    filter: string
}) => {
    const reports = await getFilteredReports(currentPage, query, filter);
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
                <Card key={report.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg font-bold text-gray-800">
                                    {report.name}
                                </CardTitle>
                                <p className="text-sm text-gray-500 mt-1">
                                    {report.abbreviation}
                                </p>
                            </div>
                            <CustomBadge text={'# ' + report.id.toString()} color={'gray'} />
                        </div>
                    </CardHeader>

                    <CardContent>
                        {report.description && (
                            <p className="text-gray-600 mb-4 text-sm line-clamp-2">{report.description}</p>
                        )}

                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-gray-700">Parameters</h3>
                            <div className="flex flex-wrap gap-2">
                                {report.parameters.map((param) => (
                                    <CustomBadge key={param.id} text={`${param.abbreviation || param.name} (${param.units})`} color={getRandColor()} />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default AllReportsTable;