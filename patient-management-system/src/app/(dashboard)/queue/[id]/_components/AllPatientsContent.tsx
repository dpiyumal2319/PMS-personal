import {queuePatients} from "@/app/lib/actions";
import {TableBody, TableRow, TableCell} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {Badge} from "@/components/ui/badge";
import {verifySession} from "@/app/lib/sessions";
import React from "react";
import {calcAge} from "@/app/lib/utils";
import {
    RemoveFromQueue,
    IssueMedicine,
    PrescribeMedicine,
    ViewProfile
} from "@/app/(dashboard)/queue/[id]/_components/TableButtons";


async function AllPatientsContent({id}: { id: number }) {
    const patients = await queuePatients(id);
    const session = await verifySession();
    const role = session.role;

    const getStatus = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge className={'bg-green-100 text-green-800 hover:bg-green-200'}>COMPLETED</Badge>;
            case 'PENDING':
                return <Badge className={'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}>PENDING</Badge>;
            case 'PRESCRIBED':
                return <Badge className={'bg-blue-100 text-blue-800 hover:bg-blue-200'}>PRESCRIBED</Badge>;
            default:
                return <Badge className={'bg-gray-100 text-gray-800 hover:bg-gray-200'}>UNKNOWN</Badge>;
        }
    };

    const filteredPatients = patients.filter((patient) => {
            if (role === 'DOCTOR') {
                // return patient.status === 'PENDING';
                return patient.status !== 'COMPLETED';
            } else if (role === 'NURSE') {
                return patient.status !== 'COMPLETED';
            } else {
                return false;
            }
        }
    );

    const completedPatients = patients.filter((patient) => {
        return (patient.status === 'COMPLETED');
    });

    const getSex = (sex: string) => {
        switch (sex) {
            case 'MALE':
                return <Badge className={'bg-blue-100 text-blue-800 hover:bg-blue-200'}>M</ Badge>;
            case 'FEMALE':
                return <Badge className={'bg-pink-100 text-pink-800 hover:bg-pink-200'}>F</Badge>;
            default:
                return <Badge className={'bg-gray-100 text-gray-800 hover:bg-gray-200'}>UNKNOWN</Badge>;
        }
    }


    return (
        <TableBody>
            {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.token}</TableCell>
                    <TableCell>{getStatus(patient.status)}</TableCell>
                    <TableCell>{patient.patient.name}</TableCell>
                    <TableCell>{getSex(patient.patient.gender)}</TableCell>
                    {patient.patient.birthDate ? <TableCell>{calcAge(new Date(patient.patient.birthDate))}</TableCell> :
                        <TableCell>Unknown</TableCell>}
                    <TableCell>{new Date(patient.time).toLocaleTimeString()}</TableCell>
                    <TableCell className={'flex justify-center items-center gap-2'}>
                            {role === 'DOCTOR' && patient.status === 'PENDING' && <PrescribeMedicine/>}
                            {role === 'NURSE' && patient.status === 'PRESCRIBED' && <IssueMedicine/>}
                            <RemoveFromQueue queueId={id} token={patient.token}/>
                            <ViewProfile id={patient.id}/>
                    </TableCell>
                </TableRow>
            ))}
            <TableRow className={'bg-gray-100 text-gray-800 font-medium'}>
                <TableCell colSpan={7} className="text-center">Total Completed Patients
                    : {completedPatients.length}</TableCell>
            </TableRow>
            {completedPatients.map((patient) => (
                <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.token}</TableCell>
                    <TableCell>{getStatus(patient.status)}</TableCell>
                    <TableCell>{patient.patient.name}</TableCell>
                    <TableCell>{getSex(patient.patient.gender)}</TableCell>
                    {patient.patient.birthDate ? <TableCell>{calcAge(new Date(patient.patient.birthDate))}</TableCell> :
                        <TableCell>Unknown</TableCell>}
                    <TableCell>{new Date(patient.time).toLocaleTimeString()}</TableCell>
                    <TableCell className={'flex justify-center items-center gap-2'}>
                        <Button asChild variant="default" size="sm">
                            <Link href={`/queue/${id}/patient/${patient.id}`}>
                                View Profile
                            </Link>
                        </Button>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    );
}

export default AllPatientsContent;