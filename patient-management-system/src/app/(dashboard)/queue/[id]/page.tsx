import {Suspense} from "react";
import CardWrapper from "@/app/(dashboard)/queue/[id]/_components/CardWrapper";
import {CardSet} from "@/app/(dashboard)/queue/[id]/_components/Skeletons";
import AddPatientButton from "@/app/(dashboard)/queue/[id]/_components/AddPatinetButton";
import AllPatientsTable from "@/app/(dashboard)/queue/[id]/AllPatientsTable";

export const metadata = {
    title: "Queue - Patient Management System",
    description: "per queue page",
}

export default async function page(
    {params}: { params: Promise<{ id: string }> }
) {
    const id = parseInt((await params).id);

    // Set metadata
    metadata.title = `Queue ${id} - Patient Management System`;
    metadata.description = `Queue ${id} page`;

    return (
        <div className={'flex-grow p-2 flex flex-col items-center justify-between'}>
            <div className={'w-4/5 pt-4'}>
                <div>
                    <Suspense fallback={<CardSet number={3} />}>
                        <CardWrapper id={id}/>
                    </Suspense>
                </div>
                <div className={'flex justify-end mt-5 w-full'}>
                    <AddPatientButton id={id} />
                </div>
                <div className={'mt-5'}>
                    <AllPatientsTable id={id}/>
                </div>
            </div>
        </div>
    );
}