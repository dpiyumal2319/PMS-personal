import { getPatients } from "@/app/lib/actions";

export default async function PatientsList() {
    const patients = await getPatients();

    return (
        <div className="space-y-4">
            {patients.length > 0 ? (
                patients.map((patient) => (
                    <div
                        key={patient.id}
                        className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
                    >
                        <h2 className="text-xl font-montserrat font-bold text-primary-600">
                            {patient.name}
                        </h2>
                        <p className="text-gray-600">NIC: {patient.NIC}</p>
                        <p className="text-gray-600">Tel: {patient.telephone}</p>
                    </div>
                ))
            ) : (
                <p className="text-gray-500">No patients found.</p>
            )}
        </div>
    );
}
