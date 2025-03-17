// page.tsx
import {MedicalCertificateExport} from '../_components/MedicalCertificateExport';
import {MedicalCertificateList} from '../_components/MedicalCertificateList';
import {Metadata} from "next";
import { USSReferralExport } from '../_components/USSReferralExport';
import { ReferralLetterExport } from '../_components/ReferralLetterExport';

export const metadata: Metadata = {
    title: "PMS - Medical Certificates",
    description: "View all patient's medical certificates",
};

export default async function PatientPage({params}: { params: Promise<{ id: string }> }) {
    const awaitedParams = await params; // Await params
    return (
        <div className="container mx-auto  ">
            <div className="flex justify-between items-center mb-6 mt-2">
                <h1 className="text-2xl font-bold">Medical Certificates</h1>
                <MedicalCertificateExport patientId={parseInt(awaitedParams.id)}/>
                <USSReferralExport patientId={parseInt(awaitedParams.id)}/>
                <ReferralLetterExport patientId={parseInt(awaitedParams.id)}/>
            </div>
            <MedicalCertificateList patientId={parseInt(awaitedParams.id)}/>
        </div>
    );
}