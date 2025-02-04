import { getFilteredPatients } from "@/app/lib/actions";
import PatientsList from "./PatientsList";




export default async function PatientTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {

  const filteredPatients = await getFilteredPatients(query, currentPage);

  //2 seconds delay
  await new Promise((resolve) => setTimeout(resolve, 2000));


  return (
    <div>
      <PatientsList patients={filteredPatients} />
    </div>
  );
}
