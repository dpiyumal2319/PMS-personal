'use client';

import {useCallback, useState, useEffect} from 'react';
import {MedicalCertificate} from '@/app/lib/definitions';
import {MedicalCertificateCard} from './MedicalCertificateCard';
import {getMedicalCertificates} from '@/app/lib/actions';
import {Skeleton} from '@/components/ui/skeleton';
import {Card, CardContent, CardHeader} from "@/components/ui/card";

interface MedicalCertificateListProps {
    patientId: number;
}

export function MedicalCertificateList({patientId}: MedicalCertificateListProps) {
    const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCertificates = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getMedicalCertificates(patientId);
            console.log(data);
            setCertificates(data);
        } catch (error) {
            console.error("Failed to fetch certificates:", error);
        } finally {
            setLoading(false);
        }
    }, [patientId, setCertificates, setLoading]);

    useEffect(() => {
        fetchCertificates().then();
    }, [fetchCertificates]);

    if (loading) {
        return <MedicalCertificateSkeleton/>;
    }

    if (!loading && certificates.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">No medical certificates found.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((certificate) => (
                <MedicalCertificateCard
                    key={certificate.id}
                    certificate={certificate}
                    action={fetchCertificates}
                />
            ))}
        </div>
    );
}

function MedicalCertificateSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, index) => (
                <Card key={index} className="flex flex-col gap-2">
                    <CardHeader className={'pb-2'}>
                        <div className="flex justify-between items-center mb-2">
                            <Skeleton className="h-6 w-40"/>
                            <Skeleton className="h-6 w-6 rounded-full"/>
                        </div>
                    </CardHeader>
                    <CardContent className={'space-y-2'}>
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-24 mb-2"/>
                            <Skeleton className="h-4 w-16 rounded-lg"/>
                        </div>
                        <Skeleton className="h-4 w-32 mb-2"/>
                        <Skeleton className="h-4 w-20"/>
                    </CardContent>
                </Card>
            ))}

        </div>
    )
        ;
}
