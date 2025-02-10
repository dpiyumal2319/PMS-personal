import { AiOutlineUser, AiOutlineIdcard, AiOutlinePhone } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import Link from "next/link";


interface Patient {
    id: number;
    name: string;
    NIC: string | null;
    telephone: string;
}

export default function PatientsList({ patients }: { patients: Patient[] }) {
    return (

<div className="space-y-4">
    {patients.length > 0 ? (
        patients.map((patient) => (
            <div
                key={patient.id}
                className="flex justify-between items-center bg-white shadow-md rounded-2xl p-6 hover:shadow-xl transition cursor-pointer border border-gray-200 duration-300"
            >
                {/* Clickable area for navigation */}
                <Link
                    href={`/patients/${patient.id}`}
                    className="flex-1 flex justify-between items-center pr-6"
                >
                    {/* Patient Name */}
                    <div className="flex items-center gap-3 text-primary-600 font-semibold text-lg flex-1">
                        <AiOutlineUser className="w-5 h-5 text-gray-500" />
                        <span>{patient.name}</span>
                    </div>

                    {/* NIC */}
                    <div className="flex items-center gap-3 text-gray-700 text-sm justify-center flex-1">
                        <AiOutlineIdcard className="w-5 h-5 text-gray-500" />
                        <span className="font-medium tracking-wide">{patient.NIC}</span>
                    </div>

                    {/* Telephone */}
                    <div className="flex items-center gap-3 text-gray-700 text-sm justify-end flex-1">
                        <AiOutlinePhone className="w-5 h-5 text-gray-500" />
                        <span className="font-medium tracking-wide">{patient.telephone}</span>
                    </div>
                </Link>

                {/* Add to Active Queue Button */}
                <div className="ml-6">
                    <Button className="bg-green-600 text-white px-5 py-2.5 rounded-xl shadow-md hover:bg-green-700 transition-all duration-200 flex items-center gap-2">
                        <AiOutlineUser className="w-5 h-5 text-white" />
                        <span className="font-medium">Add to Queue</span>
                    </Button>
                </div>
            </div>
        ))
    ) : (
        <p className="text-gray-500">No patients found.</p>
    )}
</div>


    );
}
