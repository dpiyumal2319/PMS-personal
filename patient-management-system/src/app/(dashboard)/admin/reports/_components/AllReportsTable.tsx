import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {getFilteredReports} from "@/app/lib/actions";
import {badgeColorsType, CustomBadge} from "@/app/(dashboard)/_components/CustomBadge";

let lastSelectedIndex = 0;

const selectedColors: (keyof badgeColorsType)[] = [
    "blue",
    "green",
    "red",
    "yellow",
    "purple",
    "pink",
];

const getRandColor = (): keyof badgeColorsType => {
    let randIndex = Math.floor(Math.random() * selectedColors.length);
    if (randIndex === lastSelectedIndex) {
        randIndex = (randIndex + 1) % selectedColors.length;
    }

    lastSelectedIndex = randIndex;
    return selectedColors[randIndex];
};

const AllReportsTable = async ({currentPage, query}: {
    currentPage: number,
    query: string,
}) => {
    const reports = await getFilteredReports(currentPage, query);
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
                <Card key={report.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    {report.name} <CustomBadge text={'# ' + report.id.toString()} color={'gray'} />
                                </CardTitle>
                            </div>
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
                                    <CustomBadge key={param.id} text={`${param.name} (${param.units})`} color={getRandColor()} />
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