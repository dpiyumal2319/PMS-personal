import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {getAllVitals} from "@/app/lib/actions/prescriptions";
import AddVitalDialog from "@/app/(dashboard)/admin/prescription/_components/AddVitalDialog";
import {DynamicIcon, IconName} from "lucide-react/dynamic";
import EditVitalDialog from "@/app/(dashboard)/admin/prescription/_components/EditVitalDialog";
import {BasicColorType} from "@/app/(dashboard)/_components/CustomBadge";
import DeleteVitalDialog from "@/app/(dashboard)/admin/prescription/_components/DeleteVital";
import {getTextColorClass} from "@/app/lib/utils";

const VitalsForm = async () => {
    const vitals = await getAllVitals();
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vitals.map(vital => (
                <Card key={vital.id || vital.name}>
                    <CardHeader className="flex flex-row items-center justify-between p-4">
                        <div className="flex items-center gap-2">
                            <DynamicIcon name={vital.icon as IconName} size={20}
                                         className={`${getTextColorClass(vital.color as keyof BasicColorType)}`}/>
                            <CardTitle className="text-lg">{vital.name}</CardTitle>
                        </div>
                        <div className={"flex gap-2"}>
                            <EditVitalDialog initialData={
                                {
                                    id: vital.id,
                                    color: vital.color as keyof BasicColorType,
                                    name: vital.name,
                                    icon: vital.icon as IconName,
                                    type: vital.type,
                                    forGender: vital.forGender,
                                    placeholder: vital.placeholder
                                }
                            }/>
                            <DeleteVitalDialog id={vital.id}/>
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
                                <span
                                    className="font-medium">Type:</span> {vital.type === 'TEXT' ? 'Text' : vital.type === 'NUMBER' ? 'Number' : vital.type === 'DATE' ? 'Date' : 'unknown'}
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