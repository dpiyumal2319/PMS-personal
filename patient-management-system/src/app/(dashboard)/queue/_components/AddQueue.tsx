'use client';

import { addQueue} from "@/app/lib/actions";
import Button from "@/app/_components/PrimaryButton";
import { toast } from 'react-toastify';
import {usePathname, useSearchParams} from "next/navigation";
import { useRouter } from "next/navigation";

// Queue Button Component
const QueueButton = () => {

    const searchParams = useSearchParams();
    const { replace } = useRouter();
    const pathName = usePathname();

    const handleClick = async () => {
        try {
            await toast.promise(
                addQueue(),
                {
                    pending: 'Creating Queue...',
                    success: 'Queue Created Successfully',
                    error: {
                        render({ data }) {
                            return data instanceof Error ? data.message : 'An error occurred';
                        }
                    }
                },
                {
                    position: 'bottom-right',
                    className: 'ring ring-gray-500/25',
                },
            )

            const params = new URLSearchParams(searchParams);
            params.set('page', '1');

            replace(`${pathName}?${params.toString()}`);

            console.log(`Queue Created Successfully, ${params.toString()}`);
        } catch (e) {
            console.error(e)
        }
    };

    return (
            <Button handleClick={handleClick} text={'Create A Queue'}/>
    );
};

export default QueueButton;