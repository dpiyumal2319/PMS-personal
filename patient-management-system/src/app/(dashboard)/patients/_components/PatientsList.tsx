import { AiOutlineUser, AiOutlineIdcard, AiOutlinePhone } from "react-icons/ai";

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
                        className="flex justify-between items-center bg-white shadow-md rounded-2xl p-6 hover:shadow-xl transition cursor-pointer border border-gray-200"
                    >
                        {/* Patient Name */}
                        <div className="flex items-center gap-3 text-primary-600 font-semibold text-lg flex-1">
                            <AiOutlineUser className="w-5 h-5 text-gray-500" />
                            <span>{patient.name}</span>
                        </div>

                        {/* NIC */}
                        <div className="flex items-center gap-3 text-gray-700 text-sm flex-1 justify-center">
                            <AiOutlineIdcard className="w-5 h-5 text-gray-500" />
                            <span className="font-medium tracking-wide">{patient.NIC}</span>
                        </div>

                        {/* Telephone */}
                        <div className="flex items-center gap-3 text-gray-700 text-sm flex-1 justify-end">
                            <AiOutlinePhone className="w-5 h-5 text-gray-500" />
                            <span className="font-medium tracking-wide">{patient.telephone}</span>
                        </div>
                    </div>

                ))
            ) : (
                <p className="text-gray-500">No patients found.</p>
            )}
        </div>
    );
}
