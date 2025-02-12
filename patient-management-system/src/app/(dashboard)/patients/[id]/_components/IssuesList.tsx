'use client'

import React from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Card} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {Toggle} from "@/components/ui/toggle";
import PopOverSelect from "@/app/(dashboard)/_components/PopOverSelect";


const IssuesList = () => {


    return (
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
    );
};

export default IssuesList;