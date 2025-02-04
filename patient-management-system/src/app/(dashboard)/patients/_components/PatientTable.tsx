import { getFilteredPatients } from "@/app/lib/actions";
import PatientsList from "./PatientsList";




export default async function PatientTable({
  query,
  currentPage,
  filter,
}: {
  query: string;
  currentPage: number;
  filter: string;
}) {

  const filteredPatients = await getFilteredPatients(query, currentPage, filter);

  return (
    <div>
      <PatientsList patients={filteredPatients} />
      <div className="flex justify-center items-center gap-4 mt-4 bg-red-500 h-screen w-5">
        hhh
        </div>
    </div>
  );
}
