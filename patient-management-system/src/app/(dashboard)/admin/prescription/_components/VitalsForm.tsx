'use client';

import React, {useState} from 'react';
import IconSelectorDialog from "@/app/(dashboard)/admin/prescription/_components/IconSelectorDialog";

const VitalsForm = () => {
    const [vitalsLoading, setVitalsLoading] = useState()

    return (
        <div>
            <IconSelectorDialog onSelect={(icon) => console.log(icon)}/>
        </div>
    );
};

export default VitalsForm;