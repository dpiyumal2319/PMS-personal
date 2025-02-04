import { getFilteredPatients } from "@/app/lib/actions";
import PatientsList from "./PatientsList";


interface Patient {
  id: number;
  name: string;
  NIC: string | null;
  telephone: string;
}

export default async function PatientTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {

  const filteredPatients = await getFilteredPatients(query, currentPage);

  const totalPages = Math.ceil(filteredPatients.length);

  return (
    <div>
      <PatientsList patients={filteredPatients} />
    </div>
  );
}
