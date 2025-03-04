"use client";

import React, {useState} from 'react';
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import * as z from "zod";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Textarea} from "@/components/ui/textarea";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter} from "@/components/ui/dialog";
import {PlusCircle, Loader2, Stethoscope, Cross, Users, HeartPulse, AlertCircle} from "lucide-react";
import {PatientHistoryType} from "@prisma/client";
import {toast} from "react-toastify";

// Form schema
const formSchema = z.object({
    patientId: z.number(),
    description: z.string().min(3, {
        message: "Description must be at least 3 characters.",
    }),
    type: z.nativeEnum(PatientHistoryType, {
        required_error: "Please select a history type.",
    }),
});

const AddHistoryForm = ({patientID}: { patientID: number }) => {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<PatientHistoryType>(PatientHistoryType.MEDICAL);

    // Initialize form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            patientId: patientID,
            description: "",
            type: PatientHistoryType.MEDICAL,
        },
    });

    // Update form value when tab changes
    const handleTabChange = (value: string) => {
        setActiveTab(value as PatientHistoryType);
        form.setValue("type", value as PatientHistoryType);
    };

    // Submit handler
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);

        // Add console log to track submission
        console.log("Submitting history entry:", values);

        try {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            console.log("History entry submitted successfully");
        } catch (error) {
            console.error("Error submitting history:", error);
            toast.error("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    }

    // Tab configuration with icons and colors
    const tabConfig = [
        {
            value: PatientHistoryType.MEDICAL,
            label: "Medical",
            icon: <Stethoscope className="h-4 w-4 mr-2"/>,
            color: "text-blue-500"
        },
        {
            value: PatientHistoryType.SURGICAL,
            label: "Surgical",
            icon: <Cross className="h-4 w-4 mr-2"/>,
            color: "text-purple-500"
        },
        {
            value: PatientHistoryType.FAMILY,
            label: "Family",
            icon: <Users className="h-4 w-4 mr-2"/>,
            color: "text-green-500"
        },
        {
            value: PatientHistoryType.SOCIAL,
            label: "Social",
            icon: <HeartPulse className="h-4 w-4 mr-2"/>,
            color: "text-amber-500"
        },
        {
            value: PatientHistoryType.ALLERGY,
            label: "Allergy",
            icon: <AlertCircle className="h-4 w-4 mr-2"/>,
            color: "text-red-500"
        }
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center w-full justify-center gap-2" variant="outline">
                    <PlusCircle className="h-5 w-5"/>
                    Add New History Entry
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl flex flex-col">
                <DialogHeader>
                    <DialogTitle>Add Patient History</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <Tabs
                            defaultValue={PatientHistoryType.MEDICAL}
                            value={activeTab}
                            onValueChange={handleTabChange}
                            className="w-full"
                        >
                            <TabsList className="grid grid-cols-5 mb-4">
                                {tabConfig.map((tab) => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        className={`flex items-center justify-center ${activeTab === tab.value ? tab.color : ''}`}
                                    >
                                        {tab.icon}
                                        <span className="hidden sm:inline">{tab.label}</span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {tabConfig.map((tab) => (
                                <TabsContent key={tab.value} value={tab.value} className="mt-0">
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder={`Enter ${tab.label.toLowerCase()} history details...`}
                                                        className="resize-none"
                                                        rows={5}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>
                            ))}
                        </Tabs>

                        <input type="hidden" name="patientId" value={patientID}/>
                        <input type="hidden" name="type" value={activeTab}/>

                        <DialogFooter className="mt-6">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                        Saving...
                                    </>
                                ) : (
                                    "Save History"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default AddHistoryForm;