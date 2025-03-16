'use client';

import React, {useEffect, useState} from 'react';
import dynamic from "next/dynamic";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {FileText, ChevronLeft} from "lucide-react";
import IssueFromInventory from "./IssueFromInventory";
import {IssuingStrategy, MEAL, Vitals} from "@prisma/client";
import type {DrugType} from "@prisma/client";
import AddOffRecordDrugs from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/AddOffRecordDrugs";
import {getTextColorClass, handleServerAction} from "@/app/lib/utils";
import {addPrescription} from "@/app/lib/actions/prescriptions";
import {
    OffRecordMedsListProps, PrescriptionIssuesListProps,
} from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/PrescriptionIssuesList";
import {FaHeadSideCough, FaMoneyBill} from "react-icons/fa";
import {useRouter} from "next/navigation";
import {Textarea} from "@/components/ui/textarea";
import DynamicIcon from "@/app/(dashboard)/_components/DynamicIcon";
import {IconName} from "@/app/lib/iconMapping";
import {BasicColorType} from "@/app/(dashboard)/_components/CustomBadge";
import {Separator} from "@/components/ui/separator";
import {RiDiscountPercentFill} from "react-icons/ri";
import {toast} from "react-toastify";
import {
    DiscountSubmitButtonProps
} from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/DiscountSubmitButton";

const DiscountSubmitButton = dynamic<DiscountSubmitButtonProps>(
    () => import('@/app/(dashboard)/patients/[id]/prescriptions/add/_components/DiscountSubmitButton').then(mod => mod.DiscountSubmitButton),
    {ssr: false}
);

const PrescriptionIssuesList = dynamic<PrescriptionIssuesListProps>(
    () => import('@/app/(dashboard)/patients/[id]/prescriptions/add/_components/PrescriptionIssuesList').then(mod => mod.PrescriptionIssuesList),
    {ssr: false}
);

const OffRecordMedsList = dynamic<OffRecordMedsListProps>(
    () => import('@/app/(dashboard)/patients/[id]/prescriptions/add/_components/PrescriptionIssuesList').then(mod => mod.OffRecordMedsList),
    {ssr: false}
);

export interface IssueInForm {
    drugId: number;
    drugName: string;
    details: string | null;
    brandId: number;
    brandName: string;
    meal: MEAL | null;
    dose: number;
    forDays: number | null;
    forTimes: number | null;
    strategy: IssuingStrategy;
    quantity: number;
    drugType: DrugType;
    concentration: number | string;
    concentrationID: number;
}

export interface OffRecordMeds {
    name: string;
    description?: string;
}

export interface VitalInForm extends Vitals {
    value: string;
}

export interface PrescriptionFormData {
    presentingSymptoms: string;
    description: string;
    extraDoctorCharges: number;
    discount: number;
    issues: IssueInForm[];
    offRecordMeds: OffRecordMeds[];
    vitals: VitalInForm[];
}

const PrescriptionForm = ({patientID, vitals}: { patientID: number, vitals: VitalInForm[] }) => {
    console.log('Hi from PrescriptionForm');
    const [formData, setFormData] = useState<PrescriptionFormData>((): PrescriptionFormData => {
        if (typeof window !== 'undefined') {
            const savedForm = localStorage.getItem(`prescription-form-${patientID}`);
            if (savedForm) {
                return JSON.parse(savedForm) as PrescriptionFormData;
            }
        }
        return {
            presentingSymptoms: '',
            description: '',
            extraDoctorCharges: 0,
            issues: [],
            offRecordMeds: [],
            vitals: vitals,
            discount: 0
        };
    });
    const router = useRouter();

    // Save to localStorage whenever formData changes
    useEffect(() => {
        localStorage.setItem(`prescription-form-${patientID}`, JSON.stringify(formData));
    }, [formData, patientID]);

    function formReset() {
        setFormData({
            presentingSymptoms: '',
            description: '',
            extraDoctorCharges: 0,
            issues: [],
            discount: 0,
            offRecordMeds: [],
            vitals: vitals
        });
        localStorage.removeItem(`prescription-form-${patientID}`);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleVitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        const index = Number(name.split('-')[1]);
        setFormData((prevData) => ({
            ...prevData,
            vitals: prevData.vitals.map((vital, i) => {
                if (i === index) {
                    return {
                        ...vital,
                        value: value
                    };
                }
                return vital;
            })
        }));
    }

    const handleAddIssue = (issue: IssueInForm) => {
        setFormData((prevData) => ({
            ...prevData,
            issues: [...prevData.issues, issue]
        }));
    };

    const handleAddOffRecordMed = (offRecordMed: OffRecordMeds) => {
        setFormData((prevData) => ({
            ...prevData,
            offRecordMeds: [...prevData.offRecordMeds, offRecordMed]
        }));
    };

    const handleSubmit = async () => {
        // Check for over 100 and below 0 discount
        if (formData.discount > 100 || formData.discount < 0) {
            toast.error('Discount should be between 0 and 100', {position: 'bottom-right'});
            return;
        }

        if (formData.issues.length === 0) {
            toast.error('Please add at least one issue', {position: "bottom-right"});
            return;
        }

        try {
            const result = await handleServerAction(() => addPrescription({
                prescriptionForm: formData,
                patientID: patientID
            }), {
                loadingMessage: 'Submitting prescription...',
            });

            console.log(result);
            if (result.success) {
                formReset(); // This will also clear localStorage
            }
        } catch (error) {
            console.error('Error submitting prescription:', error);
        }
    };

    const handleBack = () => {
        // Don't reset the form when going back, to preserve the state
        router.push(`/patients/${patientID}/prescriptions`);
    };

    return (
        <form onSubmit={handleSubmit} className={'w-full'}>
            <Card className={'flex flex-col p-4 space-y-4'}>
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        {/* Back Button */}
                        <div className="flex items-center hover:bg-gray-100 p-1 rounded-md cursor-pointer"
                             onClick={handleBack}>
                            <ChevronLeft/>
                        </div>
                        <h1 className="text-2xl font-semibold">Prescribe Medication</h1>
                    </div>
                    <span onClick={formReset} className="text-red-500 cursor-pointer text-sm hover:underline">
                    X Clear (Refetch recent vitals)
                </span>
                </div>
                <Card className="bg-slate-100 p-4 transition-shadow duration-300">
                    <div className="space-y-2.5">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <FaHeadSideCough className="h-4 w-4 text-cyan-500"/>
                                <Label>Presenting Complaint<span className="text-red-500">*</span></Label>
                            </div>
                            <Input
                                type="text"
                                name="presentingSymptoms"
                                value={formData.presentingSymptoms}
                                onChange={handleChange}
                                required
                                className="w-full"
                                placeholder="Enter symptoms e.g., headache, fever"
                            />
                        </div>

                        <Separator/>

                        <h2 className="text-md font-semibold">Patient Vitals</h2>

                        {/* Grid for Vitals */}
                        {(vitals.length === 0) && (
                            <div className={'text-sm'}>No vitals found. Please click {' '}
                                <span onClick={formReset} className="text-blue-500 hover:underline cursor-pointer">
                                    here
                                </span>
                                {' '} to refetch vitals if you have added any.
                                If you are an admin, you can create vitals {' '}
                                <a href={'/admin/prescription'}
                                   className="text-blue-500 hover:underline">here</a> before
                                prescribing medication.</div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.vitals.map((vital, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <DynamicIcon icon={vital.icon as IconName}
                                                     className={`text-lg ${getTextColorClass(vital.color as keyof BasicColorType)}`}/>
                                        <Label>{vital.name}</Label>
                                    </div>
                                    <Input
                                        name={`vital-${index}`}
                                        value={vital.value}
                                        type={vital.type === 'NUMBER' ? 'number' : vital.type === 'DATE' ? 'date' : 'text'}
                                        onChange={handleVitalChange}
                                        placeholder={vital.placeholder}
                                    />
                                </div>
                            ))}
                        </div>

                        <Separator/>
                        <h2 className="text-md font-semibold">Additional Details</h2>

                        {/* Description Section - Moved Outside */}
                        <div className={'grid grid-cols-1 md:grid-cols-2 gap-4'}>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-gray-500"/>
                                    <Label>Description</Label>
                                </div>
                                <Textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full p-2 rounded-md"
                                    placeholder="Additional details..."
                                />
                            </div>

                            {/* Extra Doctor Charges Section - Moved Outside */}
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <FaMoneyBill className="h-4 w-4 text-orange-500"/>
                                    <Label>Extra Doctor Charges</Label>
                                </div>
                                <Input
                                    type="number"
                                    name="extraDoctorCharges"
                                    min={0}
                                    value={formData.extraDoctorCharges}
                                    onChange={handleChange}
                                    placeholder="Enter extra charges..."
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <RiDiscountPercentFill className="h-4 w-4 text-emerald-500"/>
                                    <Label>Discount</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        type="number"
                                        name="discount"
                                        min={0}
                                        max={100}
                                        value={formData.discount}
                                        onChange={handleChange}
                                        placeholder="Enter discount..."
                                    />
                                    <h2>%</h2>
                                    <Button
                                        variant={"outline"}
                                        size={'sm'}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setFormData((prevData) => ({
                                                ...prevData,
                                                discount: 100
                                            }));
                                        }}
                                    >
                                        100%
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className='bg-slate-100 p-4 transition-shadow duration-300'>
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold">Medications</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium">Issue from Inventory</h3>
                            </div>
                            <PrescriptionIssuesList
                                issues={formData.issues}
                                onRemove={(index) => {
                                    setFormData((prevData) => ({
                                        ...prevData,
                                        issues: prevData.issues.filter((_, i) => i !== index)
                                    }));
                                }}
                            />
                            <IssueFromInventory onAddIssue={handleAddIssue}/>
                        </div>

                        <div className="space-y-4 pt-6 border-t">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium">Off-Record Medications</h3>
                            </div>
                            <OffRecordMedsList
                                meds={formData.offRecordMeds}
                                onRemove={(index) => {
                                    setFormData((prevData) => ({
                                        ...prevData,
                                        offRecordMeds: prevData.offRecordMeds.filter((_, i) => i !== index)
                                    }));
                                }}
                            />
                            <AddOffRecordDrugs addRecord={handleAddOffRecordMed}/>
                        </div>
                    </div>
                </Card>

                <div className="flex items-end h-full">
                    <DiscountSubmitButton discount={formData.discount} onSubmit={handleSubmit} onDiscountRemove={() => {
                        setFormData((prevData) => ({
                            ...prevData,
                            discount: 0
                        }));
                    }}/>
                </div>
            </Card>
        </form>
    );
};

export default PrescriptionForm;