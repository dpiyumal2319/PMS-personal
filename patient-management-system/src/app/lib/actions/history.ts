'use server';

import {Prisma} from "@prisma/client";
import {prisma} from "@/app/lib/prisma";
import {verifySession} from "@/app/lib/sessions";
import {redirect} from "next/navigation";

export async function getHistory({filter = "all", query = "", patientID}: {
    filter?: string;
    query?: string,
    patientID: number
}) {
    let where: Prisma.PatientHistoryWhereInput = {}

    const session = await verifySession();
    if (session.role !== 'DOCTOR') redirect('/unauthorized');
    if (!patientID) throw new Error('No patient ID');


    if (filter) {
        switch (filter) {
            case 'all': {
                where = {
                    name: {
                        contains: query,
                        mode: "insensitive"
                    }
                };
                break;
            }
            case 'medical': {
                where = {
                    type: 'MEDICAL',
                    name: {
                        contains: query,
                        mode: "insensitive"
                    }
                };
                break;
            }
            case 'social': {
                where = {
                    type: 'SOCIAL',
                    name: {
                        contains: query,
                        mode: "insensitive"
                    }
                };
                break;
            }
            case 'family': {
                where = {
                    type: 'FAMILY',
                    name: {
                        contains: query,
                        mode: "insensitive"
                    }
                };
                break;
            }
            case 'allergy': {
                where = {
                    type: 'ALLERGY',
                    name: {
                        contains: query,
                        mode: "insensitive"
                    }
                };
                break;
            }
            default:
                break;
        }
    }

    return await prisma.patientHistory.findMany({
        where: {
            patientId: patientID,
            ...where
        },
        orderBy: {
            time: 'desc'
        }
    });
}