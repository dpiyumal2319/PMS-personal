'use client';

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Toggle } from "@/components/ui/toggle";

const PrescriptionForm = () => {
    const [formData, setFormData] = useState({
        presentingSymptoms: '',
        bloodPressure: '',
        pulse: '',
        cardiovascular: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <div className="flex items-center space-x-4">
                <Label className="w-1/3">Presenting Symptoms</Label>
                <Input type="text" name="presentingSymptoms" value={formData.presentingSymptoms} onChange={handleChange} required />
            </div>
            <div className="flex items-center space-x-4">
                <Label className="w-1/3">Blood Pressure</Label>
                <Input type="text" name="bloodPressure" value={formData.bloodPressure} onChange={handleChange} />
            </div>
            <div className="flex items-center space-x-4">
                <Label className="w-1/3">Pulse</Label>
                <Input type="text" name="pulse" value={formData.pulse} onChange={handleChange} />
            </div>
            <div className="flex items-center space-x-4">
                <Label className="w-1/3">Cardiovascular</Label>
                <Input type="text" name="cardiovascular" value={formData.cardiovascular} onChange={handleChange} />
            </div>
            <Button type="submit" className="w-full">Submit</Button>

            <Dialog>
                <DialogTrigger asChild>
                    <Card className="border-dashed border-2 p-4 flex justify-center items-center cursor-pointer">
                        + Add Drug
                    </Card>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Issue</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input type="text" placeholder="Drug" />
                        <Input type="text" placeholder="Brand" />
                        <Tabs defaultValue="MEAL">
                            <TabsList>
                                <TabsTrigger value="MEAL">Meal</TabsTrigger>
                                <TabsTrigger value="WHEN_NEEDED">When Needed</TabsTrigger>
                                <TabsTrigger value="PERIODIC">Periodic</TabsTrigger>
                                <TabsTrigger value="OFF_RECORD">Off Record</TabsTrigger>
                                <TabsTrigger value="OTHER">Other</TabsTrigger>
                            </TabsList>
                            <TabsContent value="MEAL">
                                <div className="flex flex-col space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox defaultChecked /> <Label>Breakfast</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox defaultChecked /> <Label>Lunch</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox defaultChecked /> <Label>Dinner</Label>
                                    </div>
                                    <Input type="number" placeholder="Quantity per meal" />
                                    <Toggle>Before / After Meal</Toggle>
                                    <Input type="number" placeholder="Minutes before/after meal" />
                                </div>
                            </TabsContent>
                            <TabsContent value="WHEN_NEEDED">
                                <Input type="text" placeholder="When needed details" />
                            </TabsContent>
                            <TabsContent value="PERIODIC">
                                <Input type="text" placeholder="Periodic details" />
                            </TabsContent>
                            <TabsContent value="OFF_RECORD">
                                <Input type="text" placeholder="Off record details" />
                            </TabsContent>
                            <TabsContent value="OTHER">
                                <Input type="text" placeholder="Other details" />
                            </TabsContent>
                        </Tabs>
                    </div>
                </DialogContent>
            </Dialog>
        </form>
    );
};

export default PrescriptionForm;
