import { getPatients } from "@/app/lib/actions";

interface Patient {
  id: number;
  name: string;
  NIC: string | null;
  telephone: string;
}

async function fetchFilteredPatients(query: string) {
  const patients = await getPatients();
  
  return patients.filter((patient: Patient) =>
    patient.name.toLowerCase().includes(query.toLowerCase()) ||
    (patient.NIC && patient.NIC.includes(query)) ||
    (patient.telephone && patient.telephone.includes(query))
  );
}

export default async function PatientTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const patients = await fetchFilteredPatients(query);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-200 shadow-md rounded-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
            <th className="border border-gray-300 px-4 py-2 text-left">NIC</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Telephone</th>
          </tr>
        </thead>
        <tbody>
          {patients.length > 0 ? (
            patients.map((patient: Patient) => (
              <tr key={patient.id} className="border-t border-gray-300 hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">{patient.id}</td>
                <td className="border border-gray-300 px-4 py-2">{patient.name}</td>
                <td className="border border-gray-300 px-4 py-2">{patient.NIC || "N/A"}</td>
                <td className="border border-gray-300 px-4 py-2">{patient.telephone}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center py-4 text-gray-500">
                No patients found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
