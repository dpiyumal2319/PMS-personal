import React from 'react';

const StatusCard = ({icon, text, number}: { icon: string, text: string, number: number }) => {
    return (
        <div className={'bg-white py-6 px-4 rounded-md shadow-md flex justify-start gap-5 w-full'}>
            <div className={'bg-background-100 text-3xl shadow-xl p-2.5 rounded-md'}>
                {icon}
            </div>
            <div className={'flex flex-col'}>
                <span className={'text-md font-semibold text-gray-800'}>{text}</span>
                <span className={'text-gray-900 text-lg font-bold'}>{number}</span>
            </div>
        </div>
    )
        ;
};

export default StatusCard;