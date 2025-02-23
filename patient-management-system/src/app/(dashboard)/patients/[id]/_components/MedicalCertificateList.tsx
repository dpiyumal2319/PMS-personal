'use client';

import { useCallback, useState, useEffect } from 'react';
import { MedicalCertificate } from '@/app/lib/definitions';
import { MedicalCertificateCard } from './MedicalCertificateCard';
import { getMedicalCertificates } from '@/app/lib/actions';

interface MedicalCertificateListProps {
    patientId: number;
}

export function MedicalCertificateList({ patientId }: MedicalCertificateListProps) {
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
        fetchCertificates();
    }, [fetchCertificates]);


    if (loading) {
        return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-lg" />
            ))}
        </div>;
    }

    if (certificates.length === 0) {
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
                    fetchCertificates={fetchCertificates}
                />
            ))}
        </div>
    );
}