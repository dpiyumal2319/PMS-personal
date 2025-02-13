'use client';

import {Card} from '@/components/ui/card';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import React, {useState} from 'react';
import {Input} from '@/components/ui/input';
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import type {OffRecordMeds} from "@/app/(dashboard)/patients/[id]/_components/prescribe_components/PrescriptionForm";

interface AddRecordProps {
    addRecord: (offRecordDrug: OffRecordMeds) => void
}

const AddOffRecordDrugs = ({addRecord}: AddRecordProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [offRecordMed, setOffRecordMed] = useState<OffRecordMeds>({
        name: "",
        description: ""
    })
    const [error, setError] = useState<string | null>(null)

    const handleAdd = () => {
        if (!offRecordMed.name) {
            setError("Medication name is required")
            return
        }

        addRecord(offRecordMed)
    }


    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Card className="border-dashed border-2 p-4 flex justify-center items-center cursor-pointer">
                    + Add Drug
                </Card>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Off-Record Medication</DialogTitle>
                </DialogHeader>
                {error && <div className="text-red-500">{error}</div>}
                <div className="space-y-4">
                    <Input placeholder="Medication Name" value={offRecordMed.name}
                           onChange={(e) => setOffRecordMed({...offRecordMed, name: e.target.value})}/>
                    <Textarea placeholder="Description" value={offRecordMed.description}
                              onChange={(e) => setOffRecordMed({...offRecordMed, description: e.target.value})}/>
                </div>
                <DialogFooter>
                    <Button onClick={handleAdd}>Add</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddOffRecordDrugs;