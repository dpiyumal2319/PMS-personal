import {queuePatients} from "@/app/lib/actions";
import {TableBody, TableRow, TableCell} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {verifySession} from "@/app/lib/sessions";
import React from "react";
import {calcAge} from "@/app/lib/utils";
import {
    RemoveFromQueue,
    IssueMedicine,
    PrescribeMedicine
} from "@/app/(dashboard)/queue/[id]/_components/TableButtons";
import {CustomBadge} from "@/app/(dashboard)/_components/CustomBadge";


async function AllPatientsContent({id}: { id: number }) {
    const patients = await queuePatients(id);
    const session = await verifySession();
    const role = session.role;

    const getStatus = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <CustomBadge text={'COMPLETED'} color={'green'}/>;
            case 'PENDING':
                return <CustomBadge text={'PENDING'} color={'yellow'}/>;
            case 'PRESCRIBED':
                return <CustomBadge text={'PRESCRIBED'} color={'blue'}/>;
            default:
                return <CustomBadge text={'UNKNOWN'} color={'gray'}/>;
        }
    };

    const filteredPatients = patients.filter((patient) => {
            if (role === 'DOCTOR') {
                return patient.status === 'PENDING';
            } else if (role === 'NURSE') {
                return patient.status !== 'COMPLETED';
            } else {
                return false;
            }
        }
    );

    const completedPatients = patients.filter((patient) => {
        if (role === 'DOCTOR') {
            return patient.status !== 'PENDING';
        } else if (role === 'NURSE') {
            return patient.status === 'COMPLETED';
        } else {
            return false;
        }
    });

    const getSex = (sex: string) => {
        switch (sex) {
            case 'MALE':
                return <CustomBadge text={'M'} color={'blue'}/>;
            case 'FEMALE':
                return <CustomBadge text={'F'} color={'pink'}/>;
            default:
                return <CustomBadge text={'UNKNOWN'} color={'gray'}/>;
        }
    }

    return (
        <TableBody>
            {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.token}</TableCell>
                    <TableCell>{getStatus(patient.status)}</TableCell>
                    <TableCell>
                        <Link href={`/patients/${patient.id}`} className={'text-blue-800 hover:underline'}>
                            {patient.patient.name}
                        </Link>
                    </TableCell>
                    <TableCell>{getSex(patient.patient.gender)}</TableCell>
                    {patient.patient.birthDate ? <TableCell>{calcAge(new Date(patient.patient.birthDate))}</TableCell> :
                        <TableCell>Unknown</TableCell>}
                    <TableCell>{new Date(patient.time).toLocaleTimeString()}</TableCell>
                    <TableCell className={'flex justify-start items-center gap-2'}>
                        {role === 'DOCTOR' && patient.status === 'PENDING' && <PrescribeMedicine id={patient.id}/>}
                        {role === 'NURSE' && patient.status === 'PRESCRIBED' && <IssueMedicine/>}
                        <RemoveFromQueue queueId={id} token={patient.token}/>
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
                    <TableCell>
                        <Link href={`/patients/${patient.id}`} className={'text-blue-800 hover:underline'}>
                            {patient.patient.name}
                        </Link>
                    </TableCell>
                    <TableCell>{getSex(patient.patient.gender)}</TableCell>
                    {patient.patient.birthDate ? <TableCell>{calcAge(new Date(patient.patient.birthDate))}</TableCell> :
                        <TableCell>Unknown</TableCell>}
                    <TableCell>{new Date(patient.time).toLocaleTimeString()}</TableCell>
                    <TableCell className={'flex justify-start items-center gap-2'}>
                        <Button asChild variant="default" size="sm">
                            <Link href={`/patients/${patient.id}`}>
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