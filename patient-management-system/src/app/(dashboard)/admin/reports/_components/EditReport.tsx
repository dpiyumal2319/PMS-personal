'use client'

import React, {useActionState, useState} from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addReportType } from "@/app/lib/actions";
import {handleServerAction} from "@/app/lib/utils";
import {Parameter, ReportForm} from "@/app/lib/definitions";


const ReportFormPopup: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState<ReportForm>({
        name: "",
        description: "",
        parameters: [],
    });
    const [errors, setErrors] = useState<{ name?: string; abbreviation?: string }>({});

    const validateForm = () => {
        const newErrors: { name?: string; abbreviation?: string } = {};
        if (!form.name) newErrors.name = "Name is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const addParameter = () => {
        setForm({ ...form, parameters: [...form.parameters, { name: "", units: ""}] });
    };

    const removeParameter = (index: number) => {
        const newParameters = form.parameters.filter((_, i) => i !== index);
        setForm({ ...form, parameters: newParameters });
    };

    const handleParameterChange = (index: number, field: keyof Parameter, value: string) => {
        const newParameters = [...form.parameters];
        newParameters[index][field] = value;
        setForm({ ...form, parameters: newParameters });
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        const result = await handleServerAction(() => addReportType(form), {
            loadingMessage: "Adding report type...",
        });

        if (result.success) {
            setIsOpen(false);
            setForm({ name: "", description: "", parameters: [] });
            return;
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button onClick={() => setIsOpen(true)}>Add Report</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Report Type</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="block">Name *</label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block">Description</label>
                            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div>
                            <label className="block">Parameters</label>
                            {form.parameters.map((param, index) => (
                                <div key={index} className="flex gap-2 mt-2 items-center">
                                    <Input placeholder="Name" value={param.name} onChange={(e) => handleParameterChange(index, "name", e.target.value)} />
                                    <Input placeholder="Units" value={param.units} onChange={(e) => handleParameterChange(index, "units", e.target.value)} />
                                    <Button variant="destructive" onClick={() => removeParameter(index)}>Remove</Button>
                                </div>
                            ))}
                            <Button className="mt-2" onClick={addParameter}>Add Parameter</Button>
                        </div>
                        <Button className="w-full mt-4" onClick={handleSubmit}>Submit</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ReportFormPopup;
