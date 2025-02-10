import {AiOutlineUser, AiOutlineIdcard, AiOutlinePhone} from "react-icons/ai";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {calcAge, getInitials} from "@/app/lib/utils";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";


interface Patient {
    id: number;
    name: string;
    NIC: string | null;
    telephone: string;
    birthDate: Date;
    gender: string;
}

export default function PatientsList({patients}: { patients: Patient[] }) {

    const getAvatarColor = (gender: string) => {
        if (gender === 'MALE') return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
        if (gender === 'FEMALE') return 'bg-pink-100 text-pink-800 hover:bg-pink-200';
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    };

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
                            <div className={`flex items-center gap-4 font-semibold text-md flex-1 ${patient.gender === 'MALE' ? 'text-primary-600' : 'text-pink-600'}`}>
                                <Avatar className="size-10 flex-shrink-0 shadow font-bold">
                                    <AvatarFallback className={`text-sm ${getAvatarColor(patient.gender)}`}>
                                        {getInitials(patient.name)}
                                    </AvatarFallback>
                                </Avatar>
                                    <span>{patient.name} - {calcAge(patient.birthDate)} yrs</span>
                            </div>

                            {/* NIC */}
                            <div className="flex items-center gap-3 text-gray-700 text-sm justify-center flex-1">
                                <AiOutlineIdcard className="w-5 h-5 text-gray-500"/>
                                <span className="font-medium tracking-wide">{patient.NIC}</span>
                            </div>

                            {/* Telephone */}
                            <div className="flex items-center gap-3 text-gray-700 text-sm justify-end flex-1">
                                <AiOutlinePhone className="w-5 h-5 text-gray-500"/>
                                <span className="font-medium tracking-wide">{patient.telephone}</span>
                            </div>
                        </Link>

                        {/* Add to Active Queue Button */}
                        <div className="ml-6">
                            <Button
                                className="bg-green-600 text-white px-5 py-2.5 rounded-xl shadow-md hover:bg-green-700 transition-all duration-200 flex items-center gap-2">
                                <AiOutlineUser className="w-5 h-5 text-white"/>
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
