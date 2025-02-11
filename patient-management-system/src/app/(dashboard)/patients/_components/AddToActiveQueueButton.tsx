'use client';

import React from 'react';
import {AiOutlineUser} from "react-icons/ai";
import {Button} from "@/components/ui/button";

const AddToActiveQueueButton = () => {
    return (
        <Button
            onClick={() => console.log('Add to Queue')}
            className="bg-green-600 text-white px-5 py-2.5 rounded-xl shadow-md hover:bg-green-700 transition-all duration-200 flex items-center gap-2">
            <AiOutlineUser className="w-5 h-5 text-white"/>
            <span className="font-medium">Add to Queue</span>
        </Button>
    );
};

export default AddToActiveQueueButton;