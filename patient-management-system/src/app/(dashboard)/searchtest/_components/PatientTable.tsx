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
  //assign patients to the array using getFilteredPatients function
  const filteredPatients = await getFilteredPatients(query, 2);

  return (
    <div>
      <PatientsList patients={filteredPatients} />


    </div>
  );
}
