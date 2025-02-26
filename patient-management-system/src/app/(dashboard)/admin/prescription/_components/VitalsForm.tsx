import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {getAllVitals} from "@/app/lib/actions/prescriptions";
import AddVitalDialog from "@/app/(dashboard)/admin/prescription/_components/AddVitalDialog";
import {IconName} from "@/app/lib/iconMapping";
import DynamicIcon from "@/app/(dashboard)/_components/LazyDynamicIcon";
import EditVitalDialog from "@/app/(dashboard)/admin/prescription/_components/EditVitalDialog";
import {BasicColorType} from "@/app/(dashboard)/_components/CustomBadge";
import DeleteVitalDialog from "@/app/(dashboard)/admin/prescription/_components/DeleteVital";
import {getTextColorClass} from "@/app/lib/utils";

const VitalsForm = async () => {
    const vitals = await getAllVitals();
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vitals.map(vital => (
                <Card key={vital.id || vital.name} className="relative overflow-hidden">
                    {/* Background Icon */}
                    <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-1/4 translate-y-1/4">
                        <DynamicIcon
                            icon={vital.icon as IconName}
                            className={`text-8xl`}
                        />
                    </div>

                    <CardHeader className="flex flex-row items-center justify-between p-4 relative z-10">
                        <div className="flex items-center gap-2">
                            <DynamicIcon icon={vital.icon as IconName}
                                         className={`text-2xl ${getTextColorClass(vital.color as keyof BasicColorType)}`}/>
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
                    <CardContent className="p-4 relative z-10">
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