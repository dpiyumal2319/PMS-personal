'use client';

import Button from "@/app/_components/PrimaryButton";
import {usePathname, useSearchParams} from "next/navigation";
import {useRouter} from "next/navigation";
import {handleServerAction} from "@/app/lib/utils";
import {addQueue} from "@/app/lib/actions";

// Queue Button Component
const QueueButton = () => {

    const searchParams = useSearchParams();
    const {replace} = useRouter();
    const pathName = usePathname();

    const handleClick = async () => {
        const result = await handleServerAction(() => addQueue(), {
            loadingMessage: 'Creating Queue...'
        })

        if (!result.success) {
            return;
        }

        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        replace(`${pathName}?${params.toString()}`);
        console.log(`Queue Created Successfully, ${params.toString()}`);
    };

    return (
        <Button handleClick={handleClick} text={'Create A Queue'}/>
    );
};

export default QueueButton;