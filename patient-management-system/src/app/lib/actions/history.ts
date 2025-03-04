'use server';

import {Prisma} from "@prisma/client";
import type {PatientHistoryType} from "@prisma/client";
import {prisma} from "@/app/lib/prisma";
import {verifySession} from "@/app/lib/sessions";
import {redirect} from "next/navigation";
import {myError} from "@/app/lib/definitions";
import {revalidatePath} from "next/cache";

export async function getHistory({
                                     filter = "all",
                                     query = "",
                                     patientID
                                 }: {
    filter?: string;
    query?: string;
    patientID: number;
}) {
    const session = await verifySession();

    if (session.role !== 'DOCTOR') redirect('/unauthorized');
    if (!patientID) throw new Error('No patient ID');

    const baseSearchCriteria: Prisma.PatientHistoryWhereInput = {
        OR: [
            {name: {contains: query, mode: "insensitive"}},
            {description: {contains: query, mode: "insensitive"}}
        ]
    };

    let typeFilter: object;

    switch (filter) {
        case 'medical':
            typeFilter = {type: 'MEDICAL'};
            break;
        case 'social':
            typeFilter = {type: 'SOCIAL'};
            break;
        case 'family':
            typeFilter = {type: 'FAMILY'};
            break;
        case 'allergy':
            typeFilter = {type: 'ALLERGY'};
            break;
        case 'all':
        default:
            typeFilter = {};
            break;
    }

    return await prisma.patientHistory.findMany({
        where: {
            patientId: patientID,
            ...typeFilter,
            ...baseSearchCriteria
        },
        orderBy: {
            time: 'desc'
        }
    });
}


export async function addHistory({patientID, name, description, type}: {
    patientID: number;
    name: string;
    description: string;
    type: PatientHistoryType
}): Promise<myError> {
    const session = await verifySession();
    if (session.role !== 'DOCTOR') {
        return {success: false, message: 'Unauthorized'};
    }

    try {
        await prisma.patientHistory.create({
            data: {
                patientId: patientID,
                name,
                description,
                type
            }
        });

        revalidatePath(`/patients/[id]/history`);
        return {success: true, message: 'History added successfully'};
    } catch (error) {
        console.log(error);
        return {success: false, message: 'Error adding history'};
    }
}