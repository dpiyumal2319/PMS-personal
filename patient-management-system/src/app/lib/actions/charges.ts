'use server'

import {myError} from "@/app/lib/definitions";
import {prisma} from "@/app/lib/prisma";
import {ChargeType, Prisma} from "@prisma/client";

export async function updateCharges({
                                        charge,
                                        value,
                                    }: {
    charge: ChargeType;
    value: number;
}): Promise<myError> {
    try {
        await prisma.charge.upsert({
            where: {name: charge},
            update: {value},
            create: {name: charge, value},
        });

        return {
            success: true,
            message: `Charge for ${charge} updated successfully`,
        };
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            console.error(e);
        }

        return {
            success: false,
            message: "An error occurred while updating charge",
        };
    }
}


export async function getCharges() {
    return prisma.charge.findMany({
        where: {
            OR: [{name: ChargeType.DISPENSARY}, {name: ChargeType.DOCTOR}],
        },
    });
}