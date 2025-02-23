// page.tsx
import { MedicalCertificateExport } from '../_components/MedicalCertificateExport';
import { MedicalCertificateList } from '../_components/MedicalCertificateList';

export default async function PatientPage({ params }: { params: Promise< { id: string } > }) {
    const awaitedParams = await params; // Await params
    return (
        <div className="container mx-auto  ">
            <div className="flex justify-between items-center mb-6 mt-2">
                <h1 className="text-2xl font-bold">Medical Certificates</h1>

                <MedicalCertificateExport patientId={parseInt(awaitedParams.id)} />
            </div>
            <MedicalCertificateList patientId={parseInt(awaitedParams.id)} />
        </div>
    );
}