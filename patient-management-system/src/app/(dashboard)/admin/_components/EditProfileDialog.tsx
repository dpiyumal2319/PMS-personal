'use client';

import React from 'react';
import {Button} from "@/components/ui/button";
import {Edit} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {useForm} from "react-hook-form";
import {Gender} from "@prisma/client";

export interface EditProfileFormData {
    name: string;
    email: string;
    id: number;
    telephone: string;
    gender: Gender;
}

interface EditProfileDialogProps {
    id: number;
    name: string;
    email: string;
    telephone: string;
    gender: Gender;
}

const EditProfileDialog = ({name, email, telephone, gender, id}: EditProfileDialogProps) => {
    const form = useForm<EditProfileFormData>({
        defaultValues: {
            name,
            email,
            id,
            telephone,
            gender,
        },
    });

    const onSubmit = (data: EditProfileFormData) => {
        console.log('Form submitted:', data);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost">
                    <Edit/>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="telephone"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Telephone</FormLabel>
                                    <FormControl>
                                        <Input type="tel" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="gender"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Gender</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={Gender.MALE}>Male</SelectItem>
                                            <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3">
                            <DialogTrigger asChild>
                                <Button type="button">Cancel</Button>
                            </DialogTrigger>
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default EditProfileDialog;