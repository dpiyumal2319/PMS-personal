'use client';

import React from 'react';
import {useSidebar} from "@/components/ui/sidebar";
import CustomIconButton from "@/app/(dashboard)/_components/CustomIconButton";
import {PanelLeft} from "lucide-react";

const CustomSideBarTrigger = () => {
    const {toggleSidebar} = useSidebar();

    return (
        <CustomIconButton icon={PanelLeft} onClick={toggleSidebar} iconSize={18}/>
    );
};

export default CustomSideBarTrigger;