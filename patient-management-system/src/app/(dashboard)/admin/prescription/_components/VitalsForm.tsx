import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Pencil, Trash2} from "lucide-react";
import {getAllVitals} from "@/app/lib/actions/prescriptions";
import IconSelectorDialog from "@/app/(dashboard)/admin/prescription/_components/IconSelectorDialog";
import AddVitalDialog from "@/app/(dashboard)/admin/prescription/_components/AddVitalDialog";

const VitalsForm = async () => {
    const vitals = await getAllVitals();
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vitals.map(vital => (
                <Card key={vital.id || vital.name} className="overflow-hidden">
                    <CardHeader className="bg-gray-50 flex flex-row items-center justify-between p-4">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{backgroundColor: vital.color}}
                            >
                                <span className="text-white">{vital.icon}</span>
                            </div>
                            <CardTitle className="text-lg">{vital.name}</CardTitle>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                }}
                            >
                                <Pencil className="w-4 h-4"/>
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                }}
                            >
                                <Trash2 className="w-4 h-4"/>
                            </Button>
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
                                <span className="font-medium">Numeric Only:</span> {vital.onlyNumber ? 'Yes' : 'No'}
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