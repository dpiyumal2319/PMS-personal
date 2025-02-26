import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {getAllVitals} from "@/app/lib/actions/prescriptions";
import AddVitalDialog from "@/app/(dashboard)/admin/prescription/_components/AddVitalDialog";
import EditVitalDialog from "@/app/(dashboard)/admin/prescription/_components/EditVitalDialog";
import DeleteVitalDialog from "@/app/(dashboard)/admin/prescription/_components/DeleteVital";
import {CustomBadge} from "@/app/(dashboard)/_components/CustomBadge";
import {VitalType} from "@prisma/client";

const VitalsForm = async () => {
    const vitals = await getAllVitals();

    const getCustomBadge = (vitalType: VitalType) => {
        switch (vitalType) {
            case 'TEXT':
                return <CustomBadge text={'Text'} color={'blue'}/>;
            case 'NUMBER':
                return <CustomBadge text={'Number'} color={'green'}/>;
            case 'DATE':
                return <CustomBadge text={'Date'} color={'yellow'}/>;
            default:
                return <CustomBadge text={'Unknown'} color={'gray'}/>;
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vitals.map(vital => (
                <Card key={vital.id || vital.name}>
                    <CardHeader className="pb-2">
                        <div className={"flex justify-between items-center"}>
                            <CardTitle className="text-lg">{vital.name}</CardTitle>
                            <div className={"flex gap-2 items-center"}>
                                <EditVitalDialog initialData={
                                    {
                                        id: vital.id,
                                        name: vital.name,
                                        type: vital.type,
                                        forGender: vital.forGender,
                                        placeholder: vital.placeholder
                                    }
                                }/>
                                <DeleteVitalDialog id={vital.id}/>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="font-medium">Placeholder:</span> {vital.placeholder}
                            </div>
                            <div>
                                <span className="font-medium">For Gender:</span> {vital.forGender || 'All'}
                            </div>
                            <div>
                                <span className="font-medium">Type : </span> {getCustomBadge(vital.type)}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
            <AddVitalDialog/>
        </div>
    );
};

export default VitalsForm;